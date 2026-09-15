/**
 * The two ways one glyph becomes another, as pure functions of time. Nothing
 * here touches the DOM or a clock: `planTransition` does the per-pair work
 * once (sampling, shift alignment, warping), and `frameAt(plan, t)` returns what to draw at
 * linear time `t` in [0, 1]. The animated component, the progress scrubber and
 * the tests all read the same frames.
 *
 * - `morph` is a true tween. Every point of the source outline travels to its
 *   partner on the target on the brand's large-move curve. Three things keep
 *   the in-betweens intentional when the silhouettes have nothing in common
 *   (a cog into an arch): the pairing warps locally (geometry `correspond`),
 *   so features grow out of and fold into their neighbours instead of
 *   crossing the body as spikes; the outline softens toward the midpoint and
 *   sharpens again on arrival, which melts what folding is left; and the body
 *   dips a few percent at the midpoint, so no in-between reads bigger than
 *   either end. The eyes trail the body a beat (overlapping action), the same
 *   way they trail it in a cut.
 * - `cut` is the hard cut. The frame starts moving first, the body swaps to
 *   the target's authored drawing held in its `entry` pose, then settles to
 *   rest in two held steps with no in-between drawings; the eyes trail the
 *   body by a beat.
 */

// Relative, not `@/lib/motion`: vitest resolves no tsconfig paths, and this
// module is under test.
import { DURATION, EASE } from "../../../lib/motion";

import {
  buildOutline,
  lerp,
  lerpBox,
  lerpPoints,
  lerpRect,
  correspond,
  polygonToPath,
  resample,
  SAMPLE_COUNT,
  smoothClosed,
  type BBox,
  type Outline,
  type Point,
} from "./geometry";
import type { EntryPose, EyeRect, GlyphShape } from "./types";

export type Choreography = "morph" | "cut";

export const CHOREOGRAPHIES: readonly Choreography[] = ["morph", "cut"];

/* ---------------------------------------------------------------- easing */

/** A cubic-bezier easing as a function, for the pure frame maths (motion's
    own curves need its runtime; these need to run in node). */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    // Newton-Raphson, then bisection if the slope is too flat to trust.
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = sampleX(t) - x;
      if (Math.abs(err) < 1e-6) return sampleY(t);
      const slope = slopeX(t);
      if (Math.abs(slope) < 1e-6) break;
      t -= err / slope;
    }
    let lo = 0;
    let hi = 1;
    t = x;
    for (let i = 0; i < 30; i++) {
      const v = sampleX(t);
      if (Math.abs(v - x) < 1e-6) break;
      if (v < x) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return sampleY(t);
  };
}

const bezier = (curve: readonly number[]) => cubicBezier(curve[0], curve[1], curve[2], curve[3]);

/** `--ease-out-quint`, brand.css's curve for large transform moves. */
const easeBody = bezier(EASE.outQuint);
/** `--ease-out-quart`: the eyes are small and travel little. */
const easeEyes = bezier(EASE.outQuart);

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/* --------------------------------------------------------------- timings */

/** `--duration-slide` (480ms): the token for large transform moves. Both
    choreographies last this long so the stage frame moves the same way under
    either. */
export const TRANSITION_MS = DURATION.slide * 1000;

/** How much smaller the body gets at the middle of a morph. Three percent is
    under the threshold of reading as a "pop" but enough that a crumpled
    in-between never looks bigger than the shapes on either side of it. */
export const MORPH_DIP = 0.03;
/** Rounds of neighbour averaging at the middle of a morph (σ ≈ 3.5 sample
    points, about one module on a typical outline). Fewer leaves jagged
    overlaps where warped points bunch up; more turns every in-between into
    the same ball. The amount
    applied follows sin(π·progress): nothing at either end, all of it at the
    midpoint. */
export const MORPH_SMOOTH_PASSES = 24;
/** The eyes wait this fraction of the morph before they move, then catch up
    by the end. */
export const EYE_TRAIL = 0.125;

/** The cut lands 60ms into the frame move, so the swap happens while the
    corners are already travelling (the reference's timing). */
export const CUT_AT_MS = 60;
/** The entry pose holds this long after the cut... */
export const CUT_HOLD_MS = 160;
/** ...then a small remainder of it holds this long before rest. */
export const CUT_SETTLE_MS = 120;
/** What is left of the entry pose on the second held step. */
export const CUT_SETTLE_WEIGHT = 0.15;
/** The eyes stay where they were for this long after the body cuts. */
export const CUT_EYE_LAG_MS = 80;

/** Blinks flatten each eye to this fraction of its height, instantly. */
export const BLINK_SCALE = 0.23;
/** A blink lasts 80-120ms; alternate the two ends. */
export const BLINK_MS = [80, 120] as const;

/* ------------------------------------------------------------ per shape */

const outlines = new WeakMap<GlyphShape, Outline>();

/** The sampled outline of a shape, computed once per shape object. */
export function glyphOutline(shape: GlyphShape): Outline {
  let outline = outlines.get(shape);
  if (!outline) {
    outline = buildOutline(shape.body);
    outlines.set(shape, outline);
  }
  return outline;
}

/* ----------------------------------------------------------------- plan */

/** What is on screen, enough to start a transition from it. */
export type GlyphSnapshot = {
  shape: GlyphShape;
  /** The drawn polygon when caught mid-morph; `null` means the authored body. */
  points: Point[] | null;
  eyes: readonly [EyeRect, EyeRect];
  box: BBox;
};

export function restSnapshot(shape: GlyphShape): GlyphSnapshot {
  return { shape, points: null, eyes: shape.eyes, box: glyphOutline(shape).bbox };
}

export type TransitionPlan = {
  choreography: Choreography;
  from: GlyphSnapshot;
  to: GlyphShape;
  /** The source outline, resampled along the pairing. */
  fromPoints: Point[];
  /** The target outline; index i is where `fromPoints[i]` goes. */
  toPoints: Point[];
  toBox: BBox;
  durationMs: number;
};

export function planTransition(
  from: GlyphSnapshot,
  to: GlyphShape,
  choreography: Choreography,
): TransitionPlan {
  const target = glyphOutline(to);
  const source = from.points ?? glyphOutline(from.shape).samples;
  const pairs =
    choreography === "morph"
      ? correspond(source.length === SAMPLE_COUNT ? source : resample(source, SAMPLE_COUNT), target.samples)
      : { from: source, to: target.samples };
  return {
    choreography,
    from,
    to,
    fromPoints: pairs.from,
    toPoints: pairs.to,
    toBox: target.bbox,
    durationMs: TRANSITION_MS,
  };
}

/* ---------------------------------------------------------------- frame */

export type GlyphFrame = {
  /** Path data for the body. */
  d: string;
  /** SVG transform for the body (the cut's entry pose), or `null`. */
  transform: string | null;
  eyes: readonly [EyeRect, EyeRect];
  /** Where the stage frame's corners are heading, eased. */
  box: BBox;
  /** The in-between polygon when the body is mid-morph, else `null`. */
  points: Point[] | null;
  /** The body is the target's authored drawing at rest. */
  settled: boolean;
};

export function restFrame(shape: GlyphShape): GlyphFrame {
  return {
    d: shape.body,
    transform: null,
    eyes: shape.eyes,
    box: glyphOutline(shape).bbox,
    points: null,
    settled: true,
  };
}

function snapshotBody(snapshot: GlyphSnapshot) {
  return snapshot.points ? polygonToPath(snapshot.points) : snapshot.shape.body;
}

function lerpEyes(a: readonly [EyeRect, EyeRect], b: readonly [EyeRect, EyeRect], t: number) {
  return [lerpRect(a[0], b[0], t), lerpRect(a[1], b[1], t)] as const;
}

/** The entry pose scaled by `weight`, about the centre of `box`. */
export function entryTransform(pose: EntryPose | undefined, box: BBox, weight: number): string | null {
  if (!pose || weight <= 0) return null;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const tx = (pose.translateX ?? 0) * weight;
  const ty = (pose.translateY ?? 0) * weight;
  const r = (pose.rotate ?? 0) * weight;
  const sx = lerp(1, pose.scaleX ?? 1, weight);
  const sy = lerp(1, pose.scaleY ?? 1, weight);
  if (tx === 0 && ty === 0 && r === 0 && sx === 1 && sy === 1) return null;
  const f = (v: number) => Math.round(v * 1000) / 1000;
  return `translate(${f(cx + tx)} ${f(cy + ty)}) rotate(${f(r)}) scale(${f(sx)} ${f(sy)}) translate(${f(-cx)} ${f(-cy)})`;
}

/** What to draw at linear time `t` (0 = the snapshot, 1 = the target at rest). */
export function frameAt(plan: TransitionPlan, t: number): GlyphFrame {
  const time = clamp01(t);
  if (time >= 1) return restFrame(plan.to);
  const box = lerpBox(plan.from.box, plan.toBox, easeBody(time));
  const ms = time * plan.durationMs;

  if (plan.choreography === "cut") {
    if (ms < CUT_AT_MS) {
      return { d: snapshotBody(plan.from), transform: null, eyes: plan.from.eyes, box, points: plan.from.points, settled: false };
    }
    const since = ms - CUT_AT_MS;
    const weight = since < CUT_HOLD_MS ? 1 : since < CUT_HOLD_MS + CUT_SETTLE_MS ? CUT_SETTLE_WEIGHT : 0;
    return {
      d: plan.to.body,
      transform: entryTransform(plan.to.entry, plan.toBox, weight),
      eyes: since < CUT_EYE_LAG_MS ? plan.from.eyes : plan.to.eyes,
      box,
      points: null,
      settled: weight === 0,
    };
  }

  if (time <= 0) {
    return { d: snapshotBody(plan.from), transform: null, eyes: plan.from.eyes, box, points: plan.from.points, settled: false };
  }

  const p = easeBody(time);
  const bell = Math.sin(Math.PI * p);
  const raw = lerpPoints(plan.fromPoints, plan.toPoints, p);
  const soft = smoothClosed(raw, MORPH_SMOOTH_PASSES);
  const dip = 1 - MORPH_DIP * bell;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const points = raw.map((q, i) => {
    const x = lerp(q.x, soft[i].x, bell);
    const y = lerp(q.y, soft[i].y, bell);
    return { x: cx + (x - cx) * dip, y: cy + (y - cy) * dip };
  });
  return {
    d: polygonToPath(points),
    transform: null,
    eyes: lerpEyes(plan.from.eyes, plan.to.eyes, easeEyes(clamp01((time - EYE_TRAIL) / (1 - EYE_TRAIL)))),
    box,
    points,
    settled: false,
  };
}

/** A frame caught mid-transition, as the start of the next one. */
export function snapshotOf(plan: TransitionPlan, t: number): GlyphSnapshot {
  const frame = frameAt(plan, t);
  if (frame.settled) return restSnapshot(plan.to);
  const shape = frame.points || frame.d !== plan.to.body ? plan.from.shape : plan.to;
  return { shape, points: frame.points, eyes: frame.eyes, box: frame.box };
}

/* ----------------------------------------------------------------- eyes */

/** Both eyes flattened to a slit about their own centres. */
export function blinkEyes(eyes: readonly [EyeRect, EyeRect]): readonly [EyeRect, EyeRect] {
  const shut = (eye: EyeRect): EyeRect => {
    const height = eye.height * BLINK_SCALE;
    return { ...eye, y: eye.y + (eye.height - height) / 2, height, radius: Math.min(eye.radius, height / 2) };
  };
  return [shut(eyes[0]), shut(eyes[1])];
}

/** Both eyes shifted sideways by `dx` units. */
export function glanceEyes(eyes: readonly [EyeRect, EyeRect], dx: number): readonly [EyeRect, EyeRect] {
  return [
    { ...eyes[0], x: eyes[0].x + dx },
    { ...eyes[1], x: eyes[1].x + dx },
  ];
}
