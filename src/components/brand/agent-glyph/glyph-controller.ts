import { animate, type AnimationPlaybackControls } from "motion/react";

import { DURATION, EASE } from "@/lib/motion";

import {
  BLINK_MS,
  blinkEyes,
  frameAt,
  glanceEyes,
  planTransition,
  restFrame,
  restSnapshot,
  snapshotOf,
  type Choreography,
  type GlyphFrame,
  type TransitionPlan,
} from "./choreography";
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
  /** Milliseconds at rest between autoplay transitions. */
  hold: number;
  blink: boolean;
  glance: boolean;
  paused: boolean;
  reducedMotion: boolean;
};

/** How far a glance moves the eyes, in glyph units (0.3 module: well inside
    the ¾-module margin every shape keeps around its eyes). */
export const GLANCE_DX = 3;
/** How long a glance holds before the eyes come back. */
const GLANCE_HOLD_MS = 560;

/** Attribute values to a thousandth of a unit: finer than any screen shows. */
const fixed = (value: number) => String(Math.round(value * 1000) / 1000);

export class GlyphController {
  private shape: GlyphShape;
  private plan: TransitionPlan | null = null;
  private progress = 0;
  private tween: AnimationPlaybackControls | null = null;
  private eyeTween: AnimationPlaybackControls | null = null;
  private timers = new Set<number>();
  private sequence: readonly GlyphShape[] | null = null;
  private settles = 0;
  private scrubKey = "";
  private scrubPlan: TransitionPlan | null = null;

  constructor(
    private readonly els: GlyphElements,
    initial: GlyphShape,
    private settings: GlyphMotionSettings,
  ) {
    this.shape = initial;
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
      before.reducedMotion !== settings.reducedMotion;
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
    const key = `${from.id}>${to.id}:${this.settings.choreography}`;
    if (!this.scrubPlan || key !== this.scrubKey) {
      this.scrubPlan = planTransition(restSnapshot(from), to, this.settings.choreography);
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

    if (this.settings.reducedMotion) {
      this.crossfade(target);
      return;
    }

    const plan = planTransition(from, target, this.settings.choreography);
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
    const { paused, reducedMotion, blink, glance, hold } = this.settings;
    if (paused) return;
    const lively = !reducedMotion;

    if (this.sequence && this.sequence.length > 1) {
      // A blink on every third hold and a glance on the one after: often
      // enough to feel alive, rare enough not to twitch.
      const beat = this.settles++ % 3;
      if (lively && blink && beat === 1) this.after(hold * 0.45, () => this.blink());
      if (lively && glance && beat === 2) this.after(hold * 0.15, () => this.glance());
      this.after(hold, () => this.next());
      return;
    }

    if (!lively || (!blink && !glance)) return;
    // A lone glyph idles: every few seconds it blinks, or now and then glances.
    this.after(2600 + Math.random() * 2600, () => {
      if (glance && (!blink || Math.random() < 0.35)) this.glance();
      else this.blink();
      this.scheduleIdle();
    });
  }

  private blink() {
    if (this.tween) return;
    const eyes = this.shape.eyes;
    this.drawEyes(blinkEyes(eyes));
    const ms = BLINK_MS[this.settles % BLINK_MS.length];
    this.after(ms, () => this.drawEyes(eyes));
  }

  private glance() {
    if (this.tween) return;
    const eyes = this.shape.eyes;
    const dx = (this.settles % 2 === 0 ? 1 : -1) * GLANCE_DX;
    const move = (from: number, to: number, done?: () => void) => {
      this.eyeTween?.stop();
      this.eyeTween = animate(from, to, {
        duration: DURATION.fast,
        ease: EASE.outQuart,
        onUpdate: (v) => this.drawEyes(glanceEyes(eyes, dx * v)),
        onComplete: done,
      });
    };
    move(0, 1, () => this.after(GLANCE_HOLD_MS, () => move(1, 0)));
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
      body.setAttribute("d", frame.d);
      if (frame.transform) body.setAttribute("transform", frame.transform);
      else body.removeAttribute("transform");
    }
    this.drawEyes(frame.eyes);
    this.els.onFrame?.(frame);
  }

  private drawEyes(eyes: readonly [EyeRect, EyeRect]) {
    const rects = this.els.eyes();
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
