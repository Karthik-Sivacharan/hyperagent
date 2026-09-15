import { animate, type AnimationPlaybackControls } from "motion/react";

import { DURATION, EASE } from "@/lib/motion";

import {
  BLINK_MS,
  blinkEyes,
  frameAt,
  glanceEyes,
  PACE_TIMING,
  planTransition,
  restFrame,
  restSnapshot,
  snapshotOf,
  type Choreography,
  type GlyphFrame,
  type GlyphPace,
  type TransitionPlan,
} from "./choreography";
import type { BBox } from "./geometry";
import type { EyeRect, GlyphShape } from "./types";

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
  /** Milliseconds at rest between autoplay transitions. */
  hold: number;
  blink: boolean;
  glance: boolean;
  paused: boolean;
  reducedMotion: boolean;
  /** On screen and in a visible tab. Off, the clock stops and a change of
      shape jumps straight to rest. */
  visible: boolean;
};

/** How far a glance moves the eyes, in glyph units (0.3 module: well inside
    the ¾-module margin every shape keeps around its eyes, and 2% of the box,
    under the 4% a calm idle allows). */
export const GLANCE_DX = 3;
/** A glance that looks up rather than aside moves this far. */
const GLANCE_DY = 2;
/** How long a glance holds before the eyes come back. */
const GLANCE_HOLD_MS = [480, 1000] as const;
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
      before.pace !== settings.pace;
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
    const { paused, reducedMotion, visible, blink, glance, hold, pace } = this.settings;
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
    // A lone glyph idles: every few seconds it blinks, or now and then glances.
    this.after(between(PACE_TIMING[pace].blinkEveryMs), () => {
      if (glance && (!blink || Math.random() < 0.35)) this.glance(GLANCE_HOLD_MS[1]);
      else this.blink();
      this.scheduleIdle();
    });
  }

  private blink() {
    if (this.tween) return;
    const eyes = this.shape.eyes;
    this.drawEyes(blinkEyes(eyes));
    this.after(between(BLINK_MS), () => {
      this.drawEyes(eyes);
      // One blink in six is a double blink.
      if (Math.random() < 1 / 6) {
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
    const up = Math.random() < 0.25;
    const dx = up ? 0 : (Math.random() < 0.5 ? -1 : 1) * GLANCE_DX;
    const dy = up ? -GLANCE_DY : 0;
    const move = (from: number, to: number, done?: () => void) => {
      this.eyeTween?.stop();
      this.eyeTween = animate(from, to, {
        duration: DURATION.fast,
        ease: EASE.outQuart,
        onUpdate: (v) => this.drawEyes(glanceEyes(eyes, dx * v, dy * v)),
        onComplete: done,
      });
    };
    const holdMs = Math.min(maxHoldMs, between(GLANCE_HOLD_MS));
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
