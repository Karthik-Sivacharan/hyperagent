import { animate, type AnimationPlaybackControls } from "motion/react";

import { DURATION, EASE } from "@/lib/motion";

import {
  BLINK_MS,
  blinkEyes,
  frameAt,
  glanceEyes,
  IDLE_TIMING,
  PACE_TIMING,
  planTransition,
  restFrame,
  restSnapshot,
  snapshotOf,
  type Choreography,
  type GlyphFrame,
  type GlyphIdle,
  type GlyphPace,
  type TransitionPlan,
} from "./choreography";
import type { BBox } from "./geometry";
import { GLYPH_BOX, MODULE, type EyeRect, type GlyphShape } from "./types";

/**
 * The imperative half of the animated glyph. It owns one glyph's timeline —
 * the tween, the holds of an autoplay loop, blinks and glances — and writes
 * straight to the SVG through the element getters, so a running morph costs
 * no React render. `useGlyphMotion` creates one per mounted glyph.
 */

export type GlyphElements = {
  body: () => SVGPathElement | null;
  eyes: () => readonly (SVGRectElement | null)[];
  group: () => SVGGElement | null;
  /** Every drawn frame, for anything that follows the glyph (the stage's
      corner squares). */
  onFrame?: (frame: GlyphFrame) => void;
  onSettle?: (shape: GlyphShape) => void;
};

export type GlyphMotionSettings = {
  choreography: Choreography;
  pace: GlyphPace;
  /** What the face does between transitions (choreography `IDLE_TIMING`). */
  idle: GlyphIdle;
  /** Milliseconds at rest between autoplay transitions. */
  hold: number;
  blink: boolean;
  glance: boolean;
  paused: boolean;
  reducedMotion: boolean;
  /** The glyph's rendered edge in px. The timeline needs it for one thing
      only, and it is the whole reason glancing was ever switched off on a
      chip: a glance is authored in glyph UNITS, and 140 of those are the
      rendered size, so the same amplitude that carries 3px at hero size
      carries a third of a pixel at 18. See `glanceBy`. */
  size: number;
  /** On screen and in a visible tab. Off, the clock stops and a change of
      shape jumps straight to rest. */
  visible: boolean;
};

/** How far a glance moves the eyes at hero size, in glyph units (0.3 module:
    well inside the ¾-module margin every shape keeps around its eyes, and 2%
    of the box, under the 4% a calm idle allows). The floor, not the value —
    `glanceBy` scales up from here as the glyph gets smaller. */
export const GLANCE_DX = 3;
/** A glance that looks up rather than aside moves this share of the sideways
    travel (2 units against 3, the two amplitudes this started with). */
const GLANCE_UP_RATIO = 2 / 3;
/**
 * What a glance is worth on screen. A unit is `size / 140` of a pixel, so the
 * authored 3 units are 2.6px on a 120px hero and 0.39px on an 18px chip —
 * under half a pixel, which is antialiasing rather than motion, and the
 * reason the chip had glancing switched off. The amplitude is therefore
 * computed from the rendered size to buy this much travel wherever the glyph
 * is drawn.
 */
const GLANCE_TRAVEL_PX = 1.5;
/**
 * And the ceiling it cannot pass, in units: `EYE_CLEARANCE` (grammar.ts), the
 * body every shape is contractually obliged to keep around each eye. Go
 * further and an eye can reach the outline and stop reading as a hole in the
 * figure — on shapes that exist today AND on shapes nobody has drawn yet,
 * which is why this is the guaranteed margin rather than a per-shape
 * measurement. At 18px the ceiling binds and a look travels ~0.96px: two
 * thirds of an eye's own width, which reads, and the busy idle leans on the
 * blink for the rest.
 */
const GLANCE_MAX = 0.75 * MODULE;
/** The gap between the two blinks of a double blink. */
const DOUBLE_BLINK_GAP_MS = 150;

/** Attribute values to a thousandth of a unit: finer than any screen shows. */
const fixed = (value: number) => String(Math.round(value * 1000) / 1000);
const between = (range: readonly [number, number]) => range[0] + Math.random() * (range[1] - range[0]);

export class GlyphController {
  private shape: GlyphShape;
  private plan: TransitionPlan | null = null;
  private progress = 0;
  private tween: AnimationPlaybackControls | null = null;
  private eyeTween: AnimationPlaybackControls | null = null;
  private timers = new Set<number>();
  private sequence: readonly GlyphShape[] | null = null;
  private scrubKey = "";
  private scrubPlan: TransitionPlan | null = null;
  /* What is on the SVG now, so an unchanged frame writes nothing. */
  private drawnD: string | null = null;
  private drawnTransform: string | null = null;
  private drawnEyes: readonly [EyeRect, EyeRect] | null = null;
  private drawnBox: BBox | null = null;

  constructor(
    private readonly els: GlyphElements,
    initial: GlyphShape,
    private settings: GlyphMotionSettings,
  ) {
    this.shape = initial;
    this.drawnD = initial.body;
    this.drawnEyes = initial.eyes;
  }

  /* ------------------------------------------------------------ inputs */

  update(settings: GlyphMotionSettings) {
    const before = this.settings;
    this.settings = settings;
    const idleChanged =
      before.paused !== settings.paused ||
      before.blink !== settings.blink ||
      before.glance !== settings.glance ||
      before.hold !== settings.hold ||
      before.reducedMotion !== settings.reducedMotion ||
      before.visible !== settings.visible ||
      before.pace !== settings.pace ||
      before.idle !== settings.idle ||
      before.size !== settings.size;
    if (idleChanged && !this.tween && !this.scrubPlan) {
      this.clearIdle();
      this.scheduleIdle();
    }
  }

  /** Controlled: go to `shape` and stay there. */
  show(shape: GlyphShape) {
    this.leaveScrub();
    this.sequence = null;
    this.transition(shape);
  }

  /** Autoplay: loop through `sequence`, holding on each. */
  play(sequence: readonly GlyphShape[]) {
    this.leaveScrub();
    this.sequence = sequence;
    if (sequence.length === 0) return;
    if (!sequence.includes(this.shape)) {
      this.transition(sequence[0]);
      return;
    }
    if (!this.tween) {
      this.clearIdle();
      this.scheduleIdle();
    }
  }

  /** Frozen: draw the `from` → `to` transition at linear time `t`. */
  scrub(from: GlyphShape, to: GlyphShape, t: number) {
    this.cancel();
    const { choreography, pace } = this.settings;
    const key = `${from.id}>${to.id}:${choreography}:${pace}`;
    if (!this.scrubPlan || key !== this.scrubKey) {
      this.scrubPlan = planTransition(restSnapshot(from), to, choreography, pace);
      this.scrubKey = key;
    }
    this.shape = t >= 1 ? to : from;
    this.draw(frameAt(this.scrubPlan, t));
  }

  destroy() {
    this.cancel();
    this.sequence = null;
  }

  /* -------------------------------------------------------- transitions */

  private transition(target: GlyphShape) {
    if (target === this.shape && !this.tween) {
      this.clearIdle();
      this.scheduleIdle();
      return;
    }
    const from = this.tween && this.plan ? snapshotOf(this.plan, this.progress) : restSnapshot(this.shape);
    this.cancel();
    this.shape = target;

    // Nobody can see it: skip the work and land.
    if (!this.settings.visible) {
      this.settle(target);
      return;
    }
    if (this.settings.reducedMotion) {
      this.crossfade(target);
      return;
    }

    const plan = planTransition(from, target, this.settings.choreography, this.settings.pace);
    this.plan = plan;
    this.progress = 0;
    this.tween = animate(0, 1, {
      duration: plan.durationMs / 1000,
      // Linear on purpose: the easing lives in frameAt, per channel, so the
      // body, the eyes and the frame can each keep their own curve.
      ease: "linear",
      onUpdate: (t) => {
        this.progress = t;
        this.draw(frameAt(plan, t));
      },
      onComplete: () => this.settle(target),
    });
  }

  /** Reduced motion: no tween, no blink. The glyph fades out, swaps, fades in. */
  private crossfade(target: GlyphShape) {
    const group = this.els.group();
    const fade = (from: number, to: number, seconds: number, done: () => void) => {
      this.tween = animate(from, to, {
        duration: seconds,
        ease: EASE.out,
        onUpdate: (v) => {
          if (group) group.style.opacity = String(v);
        },
        onComplete: done,
      });
    };
    fade(1, 0, DURATION.exit, () => {
      this.draw(restFrame(target));
      fade(0, 1, DURATION.enter, () => {
        if (group) group.style.opacity = "";
        this.settle(target);
      });
    });
  }

  private settle(target: GlyphShape) {
    this.tween = null;
    this.plan = null;
    this.draw(restFrame(target));
    this.els.onSettle?.(target);
    this.scheduleIdle();
  }

  private next() {
    const sequence = this.sequence;
    if (!sequence || sequence.length === 0) return;
    const index = sequence.indexOf(this.shape);
    this.transition(sequence[(index + 1) % sequence.length]);
  }

  /* --------------------------------------------------------------- idle */

  private scheduleIdle() {
    const { paused, reducedMotion, visible, blink, glance, hold, pace, idle } = this.settings;
    if (paused || !visible) return;

    if (this.sequence && this.sequence.length > 1) {
      // Reduced motion shows one still pose: the loop does not advance.
      if (reducedMotion) return;
      // Now and then, never on a fixed beat: about every other hold blinks,
      // somewhere in its middle; a hold without a blink may glance.
      if (blink && Math.random() < 0.5) {
        this.after(hold * (0.3 + Math.random() * 0.35), () => this.blink());
      } else if (glance && Math.random() < 0.5) {
        this.after(hold * 0.15, () => this.glance(hold * 0.45));
      }
      this.after(hold, () => this.next());
      return;
    }

    if (reducedMotion || (!blink && !glance)) return;
    // A lone glyph idles: every so often it blinks, or looks about. How often,
    // and how much of it is looking rather than blinking, is the idle mode's
    // (IDLE_TIMING); `calm` defers to the pace, which is where the interval
    // used to live outright. The interval is drawn fresh every beat — the
    // first one included — so nothing here is a shared clock and a row of
    // chips that mounted together still scatters.
    const timing = IDLE_TIMING[idle];
    this.after(between(timing.everyMs ?? PACE_TIMING[pace].blinkEveryMs), () => {
      if (glance && (!blink || Math.random() < timing.glanceShare)) this.glance(timing.glanceHoldMs[1]);
      else this.blink();
      this.scheduleIdle();
    });
  }

  /**
   * The glance amplitude for the size this glyph is drawn at: enough units to
   * move `GLANCE_TRAVEL_PX`, never less than the authored `GLANCE_DX` and
   * never past the clearance every eye is guaranteed.
   */
  private glanceBy() {
    const { size } = this.settings;
    const perUnit = size > 0 ? size / GLYPH_BOX : 0;
    const wanted = perUnit > 0 ? GLANCE_TRAVEL_PX / perUnit : GLANCE_DX;
    return Math.min(GLANCE_MAX, Math.max(GLANCE_DX, wanted));
  }

  private blink() {
    if (this.tween) return;
    const eyes = this.shape.eyes;
    this.drawEyes(blinkEyes(eyes));
    this.after(between(BLINK_MS), () => {
      this.drawEyes(eyes);
      // One blink in a few is a double blink; a busier face doubles more often.
      if (Math.random() < 1 / IDLE_TIMING[this.settings.idle].doubleBlinkIn) {
        this.after(DOUBLE_BLINK_GAP_MS, () => {
          if (this.tween || this.shape.eyes !== eyes) return;
          this.drawEyes(blinkEyes(eyes));
          this.after(BLINK_MS[0], () => this.drawEyes(eyes));
        });
      }
    });
  }

  /** The eyes look aside (or, one time in four, up), hold, and come back. */
  private glance(maxHoldMs: number) {
    if (this.tween) return;
    const eyes = this.shape.eyes;
    const by = this.glanceBy();
    const up = Math.random() < 0.25;
    const dx = up ? 0 : (Math.random() < 0.5 ? -1 : 1) * by;
    const dy = up ? -by * GLANCE_UP_RATIO : 0;
    const move = (from: number, to: number, done?: () => void) => {
      this.eyeTween?.stop();
      this.eyeTween = animate(from, to, {
        duration: DURATION.fast,
        ease: EASE.outQuart,
        onUpdate: (v) => this.drawEyes(glanceEyes(eyes, dx * v, dy * v)),
        onComplete: done,
      });
    };
    const holdMs = Math.min(maxHoldMs, between(IDLE_TIMING[this.settings.idle].glanceHoldMs));
    move(0, 1, () => this.after(holdMs, () => move(1, 0)));
  }

  /* ------------------------------------------------------------ plumbing */

  private after(ms: number, run: () => void) {
    const id = window.setTimeout(() => {
      this.timers.delete(id);
      run();
    }, ms);
    this.timers.add(id);
  }

  private clearIdle() {
    for (const id of this.timers) window.clearTimeout(id);
    this.timers.clear();
    if (this.eyeTween) {
      this.eyeTween.stop();
      this.eyeTween = null;
    }
    if (!this.tween) this.drawEyes(this.shape.eyes);
  }

  private cancel() {
    if (this.tween) {
      this.tween.stop();
      this.tween = null;
    }
    this.plan = null;
    this.clearIdle();
    const group = this.els.group();
    if (group) group.style.opacity = "";
  }

  private leaveScrub() {
    if (!this.scrubPlan) return;
    this.scrubPlan = null;
    this.scrubKey = "";
    this.draw(restFrame(this.shape));
  }

  private draw(frame: GlyphFrame) {
    const body = this.els.body();
    if (body) {
      if (frame.d !== this.drawnD) {
        body.setAttribute("d", frame.d);
        this.drawnD = frame.d;
      }
      if (frame.transform !== this.drawnTransform) {
        if (frame.transform) body.setAttribute("transform", frame.transform);
        else body.removeAttribute("transform");
        this.drawnTransform = frame.transform;
      }
    }
    this.drawEyes(frame.eyes);
    if (this.els.onFrame && !sameBox(frame.box, this.drawnBox)) {
      this.drawnBox = frame.box;
      this.els.onFrame(frame);
    }
  }

  private drawEyes(eyes: readonly [EyeRect, EyeRect]) {
    if (eyes === this.drawnEyes) return;
    const rects = this.els.eyes();
    if (!rects[0] && !rects[1]) return;
    this.drawnEyes = eyes;
    eyes.forEach((eye, index) => {
      const rect = rects[index];
      if (!rect) return;
      rect.setAttribute("x", fixed(eye.x));
      rect.setAttribute("y", fixed(eye.y));
      rect.setAttribute("width", fixed(eye.width));
      rect.setAttribute("height", fixed(eye.height));
      rect.setAttribute("rx", fixed(eye.radius));
    });
  }
}

function sameBox(a: BBox, b: BBox | null) {
  return b !== null && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}
