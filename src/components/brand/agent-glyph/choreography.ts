/**
 * The two ways one glyph becomes another, as pure functions of time. Nothing
 * here touches the DOM or a clock: `planTransition` does the per-pair work
 * once (sampling, shift alignment, warping, the per-point arrival curve), and
 * `frameAt(plan, t)` returns what to draw at linear time `t` in [0, 1]. The
 * animated component, the progress scrubber and the tests all read the same
 * frames.
 *
 * - `morph` is a true tween. Every point of the source outline travels to its
 *   partner on the target. Three things keep the in-betweens geometric when
 *   the silhouettes have nothing in common (a cog into an arch): the pairing
 *   warps locally (geometry `correspond`), so features grow out of and fold
 *   into their neighbours instead of crossing the body; points with further
 *   to go arrive sooner (`lead`), so the target's features are already crisp
 *   while the short hops finish, instead of a long tail where a half-closed
 *   notch lingers; and, on the expressive pace only, a brief softening around
 *   the fastest moment melts the folds that are left. The eyes trail the body
 *   a beat (overlapping action), the same way they trail it in a cut.
 * - `cut` is the hard cut. The frame starts moving first, the body swaps to
 *   the target's authored drawing held in its `entry` pose, then settles to
 *   rest in two held steps with no in-between drawings; the eyes trail the
 *   body by a beat.
 *
 * Both run at a `pace`: `expressive` for the landing stage and anything at
 * hero size, `quick` for avatars in lists, where a state change must be fast
 * and quiet.
 */

// Relative, not `@/lib/motion`: vitest resolves no tsconfig paths, and this
// module is under test.
import { DURATION, EASE } from "../../../lib/motion";

import {
  buildOutline,
  correspond,
  lerp,
  lerpBox,
  lerpRect,
  pointInPolygon,
  polygonToPath,
  resample,
  SAMPLE_COUNT,
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

type Easing = (x: number) => number;

const bezier = (curve: readonly number[]): Easing => cubicBezier(curve[0], curve[1], curve[2], curve[3]);

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/* ----------------------------------------------------------------- pace */

/**
 * How fast and how much. `expressive` is the landing stage: the brand's
 * large-move duration and curve, a beat of overlapping action on the eyes,
 * a cut that holds its entry pose like the reference. `quick` is an avatar in
 * a list changing state: the layout-move duration, no softening, eyes moving
 * with the body, a cut with half the holds.
 */
export type GlyphPace = "expressive" | "quick";

export const GLYPH_PACES: readonly GlyphPace[] = ["expressive", "quick"];

export type PaceTiming = {
  /** The whole transition: the morph, the frame's move, and the cut's
      settle, which ends inside it. */
  durationMs: number;
  /** The body's curve (a morph) and the frame's curve (both). */
  ease: readonly number[];
  /** The eyes' curve through a morph. */
  eyeEase: readonly number[];
  /** A morph's eyes wait this long, then catch up by the end. */
  eyeDelayMs: number;
  /** Rounds of [¼ ½ ¼] neighbour averaging at the softest moment of a morph;
      0 turns softening off. */
  softPasses: number;
  /** How much smaller the body gets at the softest moment. */
  dip: number;
  /** How points close on the target: a point's remaining distance falls as
      (1 − p)^(arrival + lead · travel), travel normalised to [0, 1]. Above 1,
      the whole outline lands ahead of the frame instead of creeping in on
      its tail; `lead` lands the long journeys soonest. */
  arrival: number;
  lead: number;
  /** The cut lands this far into the frame's move... */
  cutAtMs: number;
  /** ...the entry pose holds this long... */
  cutHoldMs: number;
  /** ...then `cutSettleWeight` of it holds this long before rest. */
  cutSettleMs: number;
  cutSettleWeight: number;
  /** The eyes stay where they were for this long after the body cuts. */
  cutEyeLagMs: number;
  /** A resting glyph blinks at a random interval in this range. */
  blinkEveryMs: readonly [number, number];
};

export const PACE_TIMING: Readonly<Record<GlyphPace, PaceTiming>> = {
  expressive: {
    // `--duration-slide` on `--ease-out-quint`: the tokens for large moves.
    // The outline is ~90% there by 160ms; the rest is a quiet landing.
    durationMs: DURATION.slide * 1000,
    ease: EASE.outQuint,
    eyeEase: EASE.outQuart,
    eyeDelayMs: 60,
    // σ ≈ 2.2 sample points, weighted sin³: all of it lands in the first
    // ~100ms, while the outline is moving too fast to read as a blob, and
    // none of it is left by the time the target is recognisable.
    softPasses: 10,
    dip: 0.015,
    // Clean by ~130ms: a tooth that has only a unit to go no longer rides
    // quint's long tail as a bump on the finished drawing.
    arrival: 1.5,
    lead: 1.5,
    // The reference: the frame leads the swap by 1-2 frames (60ms), the entry
    // pose holds 3-4 frames, a residue holds 3, then rest (280ms after the cut).
    cutAtMs: 60,
    cutHoldMs: 160,
    cutSettleMs: 120,
    cutSettleWeight: 0.15,
    cutEyeLagMs: 80,
    blinkEveryMs: [2800, 6400],
  },
  quick: {
    // `--duration-move` on `--ease-out-quart`: a state change in product UI.
    durationMs: DURATION.move * 1000,
    ease: EASE.outQuart,
    eyeEase: EASE.outQuart,
    eyeDelayMs: 0,
    // Below ~64px a fold is under a pixel; softening would cost frame time
    // and show nothing.
    softPasses: 0,
    dip: 0,
    arrival: 1.5,
    lead: 1.5,
    cutAtMs: 0,
    cutHoldMs: 80,
    cutSettleMs: 60,
    cutSettleWeight: 0.15,
    cutEyeLagMs: 40,
    // Twenty avatars on one page should not twitch: roughly one blink across
    // the whole list every 300ms rather than every 200ms.
    blinkEveryMs: [4000, 9000],
  },
};

/** Glyphs at or above this edge length default to the expressive pace. */
export const EXPRESSIVE_MIN_SIZE = 64;

/** The pace a glyph gets when none is given. */
export function defaultPace(size: number): GlyphPace {
  return size >= EXPRESSIVE_MIN_SIZE ? "expressive" : "quick";
}

/** The expressive transition's length, the one the stage and the scrubber
    use. */
export const TRANSITION_MS = PACE_TIMING.expressive.durationMs;

/** Blinks flatten each eye to this fraction of its height, instantly. */
export const BLINK_SCALE = 0.23;
/** A blink lasts somewhere in 80-120ms. */
export const BLINK_MS = [80, 120] as const;

const easings = new Map<readonly number[], Easing>();
function easing(curve: readonly number[]): Easing {
  let fn = easings.get(curve);
  if (!fn) {
    fn = bezier(curve);
    easings.set(curve, fn);
  }
  return fn;
}

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

/** The paired outlines of a morph as flat arrays, for a frame loop that
    allocates nothing. */
type MorphData = {
  fx: Float64Array;
  fy: Float64Array;
  tx: Float64Array;
  ty: Float64Array;
  /** The same pairs pre-smoothed, when the pace softens. Smoothing is linear,
      so smoothing the ends once equals smoothing every in-between. */
  sfx: Float64Array | null;
  sfy: Float64Array | null;
  stx: Float64Array | null;
  sty: Float64Array | null;
  /** Per point: arrival + lead · normalised travel. */
  exponent: Float64Array;
};

export type TransitionPlan = {
  choreography: Choreography;
  pace: GlyphPace;
  timing: PaceTiming;
  from: GlyphSnapshot;
  to: GlyphShape;
  toBox: BBox;
  durationMs: number;
  morph: MorphData | null;
  /** A cut's eyes may hold their old place for a beat: only when that place
      is on the new body, so a lagging eye never floats off it. */
  cutEyesLag: boolean;
};

/** [¼ ½ ¼] averaging around a closed list of numbers, `passes` times. */
function smoothRing(values: Float64Array, passes: number): Float64Array {
  const n = values.length;
  let current = Float64Array.from(values);
  let next = new Float64Array(n);
  for (let pass = 0; pass < passes; pass++) {
    for (let i = 0; i < n; i++) {
      next[i] = (current[(i + n - 1) % n] + 2 * current[i] + current[(i + 1) % n]) / 4;
    }
    [current, next] = [next, current];
  }
  return current;
}

function buildMorph(from: readonly Point[], to: readonly Point[], timing: PaceTiming): MorphData {
  const pairs = correspond(from.length === SAMPLE_COUNT ? from : resample(from, SAMPLE_COUNT), to);
  const n = pairs.from.length;
  const fx = new Float64Array(n);
  const fy = new Float64Array(n);
  const tx = new Float64Array(n);
  const ty = new Float64Array(n);
  const travel = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    fx[i] = pairs.from[i].x;
    fy[i] = pairs.from[i].y;
    tx[i] = pairs.to[i].x;
    ty[i] = pairs.to[i].y;
    travel[i] = Math.hypot(tx[i] - fx[i], ty[i] - fy[i]);
  }
  // Neighbours arrive together: smooth the travel along the outline before it
  // sets each point's curve, so a feature does not tear at its edges.
  const smoothTravel = smoothRing(travel, 8);
  let most = 1e-6;
  for (let i = 0; i < n; i++) most = Math.max(most, smoothTravel[i]);
  const exponent = new Float64Array(n);
  for (let i = 0; i < n; i++) exponent[i] = timing.arrival + (timing.lead * smoothTravel[i]) / most;

  const soft = timing.softPasses > 0;
  return {
    fx,
    fy,
    tx,
    ty,
    sfx: soft ? smoothRing(fx, timing.softPasses) : null,
    sfy: soft ? smoothRing(fy, timing.softPasses) : null,
    stx: soft ? smoothRing(tx, timing.softPasses) : null,
    sty: soft ? smoothRing(ty, timing.softPasses) : null,
    exponent,
  };
}

/** The 3 × 3 grid an eye is tested at: corners, edge midpoints and centre,
    so a waist pinching between an eye's corners still counts as out. */
const EYE_GRID = [0, 0.5, 1] as const;

/** Both eyes wholly inside `outline`. */
function eyesInside(eyes: readonly [EyeRect, EyeRect], outline: readonly Point[]): boolean {
  return eyes.every((eye) =>
    EYE_GRID.every((u) =>
      EYE_GRID.every((v) => pointInPolygon({ x: eye.x + eye.width * u, y: eye.y + eye.height * v }, outline)),
    ),
  );
}

/** Plans between two shapes at rest, shared by every glyph making the same
    change (a roster of twenty on one beat plans each pair once). */
const restPlans = new WeakMap<GlyphShape, Map<string, TransitionPlan>>();

export function planTransition(
  from: GlyphSnapshot,
  to: GlyphShape,
  choreography: Choreography,
  pace: GlyphPace = "expressive",
): TransitionPlan {
  const atRest = from.points === null;
  const key = `${to.id}|${choreography}|${pace}`;
  if (atRest) {
    const cached = restPlans.get(from.shape)?.get(key);
    if (cached && cached.to === to) return cached;
  }

  const timing = PACE_TIMING[pace];
  const target = glyphOutline(to);
  const plan: TransitionPlan = {
    choreography,
    pace,
    timing,
    from,
    to,
    toBox: target.bbox,
    durationMs: timing.durationMs,
    morph:
      choreography === "morph"
        ? buildMorph(from.points ?? glyphOutline(from.shape).samples, target.samples, timing)
        : null,
    cutEyesLag: choreography === "cut" && eyesInside(from.eyes, target.dense),
  };

  if (atRest) {
    let byTarget = restPlans.get(from.shape);
    if (!byTarget) {
      byTarget = new Map();
      restPlans.set(from.shape, byTarget);
    }
    byTarget.set(key, plan);
  }
  return plan;
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
  /** The body is an in-between polygon (mid-morph). */
  morphing: boolean;
  /** The body is the target's authored drawing at rest. */
  settled: boolean;
};

export function restFrame(shape: GlyphShape): GlyphFrame {
  return {
    d: shape.body,
    transform: null,
    eyes: shape.eyes,
    box: glyphOutline(shape).bbox,
    morphing: false,
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

/* The in-between polygon is written into these and read straight back out,
   within one synchronous call, so every glyph on the page can share them. */
const scratchX = new Float64Array(SAMPLE_COUNT);
const scratchY = new Float64Array(SAMPLE_COUNT);

/** Fills the scratch buffers with the morph's polygon at linear `time` and
    returns the point count. */
function morphInto(plan: TransitionPlan, morph: MorphData, time: number): number {
  const { timing } = plan;
  const p = easing(timing.ease)(time);
  const rest = 1 - p;
  // sin³ of the eased progress: a short window around the fastest moment.
  const bell = Math.sin(Math.PI * p);
  const soft = morph.sfx ? bell * bell * bell : 0;
  const dip = 1 - timing.dip * soft;
  const box = lerpBox(plan.from.box, plan.toBox, p);
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const { fx, fy, tx, ty, sfx, sfy, stx, sty, exponent } = morph;
  const n = fx.length;
  for (let i = 0; i < n; i++) {
    const q = 1 - Math.pow(rest, exponent[i]);
    let x = fx[i] + (tx[i] - fx[i]) * q;
    let y = fy[i] + (ty[i] - fy[i]) * q;
    if (soft > 0) {
      const sx = sfx![i] + (stx![i] - sfx![i]) * q;
      const sy = sfy![i] + (sty![i] - sfy![i]) * q;
      x += (sx - x) * soft;
      y += (sy - y) * soft;
    }
    scratchX[i] = cx + (x - cx) * dip;
    scratchY[i] = cy + (y - cy) * dip;
  }
  return n;
}

/** Tenths of a unit: at the largest stage a unit is ~2px, so the rounding
    stays under a quarter pixel. */
const tenth = (v: number) => Math.round(v * 10) / 10;

function scratchPath(n: number): string {
  let d = `M${tenth(scratchX[0])} ${tenth(scratchY[0])}`;
  for (let i = 1; i < n; i++) d += `L${tenth(scratchX[i])} ${tenth(scratchY[i])}`;
  return `${d}Z`;
}

/** Even-odd containment against the first `n` scratch points. */
function insideScratch(x: number, y: number, n: number): boolean {
  let inside = false;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const ax = scratchX[i];
    const ay = scratchY[i];
    const bx = scratchX[j];
    const by = scratchY[j];
    if (ay > y !== by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) inside = !inside;
  }
  return inside;
}

/** How far inside its corners an eye is tested: a hair, so an eye that
    touches the outline counts as out. */
const EYE_INSET = 0.5;

function eyesInsideScratch(eyes: readonly [EyeRect, EyeRect], n: number): boolean {
  for (const eye of eyes) {
    const width = eye.width + 2 * EYE_INSET;
    const height = eye.height + 2 * EYE_INSET;
    for (const u of EYE_GRID) {
      for (const v of EYE_GRID) {
        if (!insideScratch(eye.x - EYE_INSET + width * u, eye.y - EYE_INSET + height * v, n)) return false;
      }
    }
  }
  return true;
}

/**
 * The eyes through a morph, given the body polygon in the scratch buffers.
 * They trail the body by `eyeDelayMs`; where the body has already moved away
 * from where trailing eyes would be (a waist arriving under them), the body
 * carries them along their own path just far enough to stay inside it.
 */
function morphEyes(plan: TransitionPlan, time: number, n: number) {
  const { timing } = plan;
  const ms = time * plan.durationMs;
  const span = Math.max(1, plan.durationMs - timing.eyeDelayMs);
  const trailing = easing(timing.eyeEase)(clamp01((ms - timing.eyeDelayMs) / span));
  const at = (t: number) => (t <= 0 ? plan.from.eyes : lerpEyes(plan.from.eyes, plan.to.eyes, t));
  const eyes = at(trailing);
  if (trailing >= 1 || eyesInsideScratch(eyes, n)) return eyes;
  // Bisect toward the target for the least push that fits.
  let lo = trailing;
  let hi = 1;
  for (let step = 0; step < 6; step++) {
    const mid = (lo + hi) / 2;
    if (eyesInsideScratch(at(mid), n)) hi = mid;
    else lo = mid;
  }
  return at(hi);
}

/** What to draw at linear time `t` (0 = the snapshot, 1 = the target at rest). */
export function frameAt(plan: TransitionPlan, t: number): GlyphFrame {
  const time = clamp01(t);
  if (time >= 1) return restFrame(plan.to);
  const { timing } = plan;
  const box = lerpBox(plan.from.box, plan.toBox, easing(timing.ease)(time));
  const ms = time * plan.durationMs;

  if (plan.choreography === "cut" || !plan.morph) {
    if (ms < timing.cutAtMs) {
      return { d: snapshotBody(plan.from), transform: null, eyes: plan.from.eyes, box, morphing: plan.from.points !== null, settled: false };
    }
    const since = ms - timing.cutAtMs;
    const weight =
      since < timing.cutHoldMs ? 1 : since < timing.cutHoldMs + timing.cutSettleMs ? timing.cutSettleWeight : 0;
    return {
      d: plan.to.body,
      transform: entryTransform(plan.to.entry, plan.toBox, weight),
      eyes: plan.cutEyesLag && since < timing.cutEyeLagMs ? plan.from.eyes : plan.to.eyes,
      box,
      morphing: false,
      settled: weight === 0 && (!plan.cutEyesLag || since >= timing.cutEyeLagMs),
    };
  }

  if (time <= 0) {
    return { d: snapshotBody(plan.from), transform: null, eyes: plan.from.eyes, box, morphing: plan.from.points !== null, settled: false };
  }

  const n = morphInto(plan, plan.morph, time);
  return { d: scratchPath(n), transform: null, eyes: morphEyes(plan, time, n), box, morphing: true, settled: false };
}

/** A frame caught mid-transition, as the start of the next one. */
export function snapshotOf(plan: TransitionPlan, t: number): GlyphSnapshot {
  const time = clamp01(t);
  const frame = frameAt(plan, time);
  if (frame.settled) return restSnapshot(plan.to);
  if (frame.morphing && plan.morph && time > 0) {
    const n = morphInto(plan, plan.morph, time);
    const points = Array.from({ length: n }, (_, i) => ({ x: scratchX[i], y: scratchY[i] }));
    return { shape: plan.from.shape, points, eyes: frame.eyes, box: frame.box };
  }
  if (frame.d === plan.to.body) return { shape: plan.to, points: null, eyes: frame.eyes, box: frame.box };
  return { shape: plan.from.shape, points: plan.from.points, eyes: frame.eyes, box: frame.box };
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

/** Both eyes shifted by `dx` and `dy` units. */
export function glanceEyes(eyes: readonly [EyeRect, EyeRect], dx: number, dy = 0): readonly [EyeRect, EyeRect] {
  return [
    { ...eyes[0], x: eyes[0].x + dx, y: eyes[0].y + dy },
    { ...eyes[1], x: eyes[1].x + dx, y: eyes[1].y + dy },
  ];
}
