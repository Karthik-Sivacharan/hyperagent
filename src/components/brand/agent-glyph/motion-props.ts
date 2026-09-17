import { defaultPace, type Choreography, type GlyphIdle, type GlyphPace } from "./choreography";
import { defaultSequence, resolveGlyph } from "./registry";
import type { GlyphShape } from "./types";

/**
 * The motion props the animated glyph and the stage share, and how they
 * resolve. Kept out of the client modules so a server component can read the
 * defaults as values.
 */

/** Milliseconds a glyph rests on each shape in an autoplay loop. */
export const DEFAULT_HOLD_MS = 1100;

export type GlyphMotionProps = {
  /**
   * Controlled: the shape to show. Changing it plays the choreography from
   * whatever is on screen, even mid-transition. Wins over `sequence`.
   */
  shape?: GlyphShape | string;
  /** Autoplay: loop through these shapes. Defaults to the shipping set when
      neither `shape` nor `sequence` is given. */
  sequence?: readonly (GlyphShape | string)[];
  /** `morph` (a true tween, the default) or `cut` (hard cut, then settle). */
  choreography?: Choreography;
  /**
   * How fast and how much. `expressive` (480ms, a beat of eye lag, softened
   * folds) is for the landing stage and hero sizes; `quick` (220ms, eyes with
   * the body, rarer blinks) is for avatars changing state in a list. Defaults
   * to `expressive` from 64px up and on the stage, `quick` below.
   */
  pace?: GlyphPace;
  /**
   * What the face does BETWEEN transitions (choreography `IDLE_TIMING`).
   * `calm` (the default) is a blink every few seconds; `busy` is an agent
   * that is thinking — a beat about once a second, more of them looks than
   * blinks; `restless` is the same, wound tighter. Nothing here changes the
   * SHAPE, which is an agent's identity, and none of it runs under
   * `prefers-reduced-motion`.
   */
  idle?: GlyphIdle;
  /** Autoplay rest per shape, in ms. Defaults to 1100. */
  hold?: number;
  /** Blink now and then at rest. Defaults to true. */
  blink?: boolean;
  /** Glance aside now and then at rest. Defaults to false. The amplitude is
      scaled to the rendered size (glyph-controller `glanceBy`), so this is no
      longer the invisible sub-pixel twitch it used to be below 64px — but at
      avatar size it still costs a timer per glyph, so it stays opt-in. */
  glance?: boolean;
  /** Stop the autoplay clock (a running transition still finishes). */
  paused?: boolean;
  /**
   * Freeze on the transition from `from` to `shape` at this linear time,
   * 0 to 1 over the whole choreography. For scrubbers and screenshots; turns
   * off autoplay, blinks and glances.
   */
  progress?: number;
  from?: GlyphShape | string;
  /** Called each time the glyph comes to rest on a shape. */
  onSettle?: (shape: GlyphShape) => void;
};

/** Resolves ids and fills the defaults shared by the glyph and the stage.
    `size` is the rendered edge in px, which picks the default pace. */
export function resolveMotionProps(props: GlyphMotionProps, size: number) {
  const shape = props.shape === undefined ? undefined : resolveGlyph(props.shape);
  const from = props.from === undefined ? undefined : resolveGlyph(props.from);
  const sequence = shape
    ? undefined
    : props.sequence
      ? props.sequence.map(resolveGlyph)
      : defaultSequence();
  return {
    shape,
    from,
    sequence,
    progress: props.progress,
    choreography: props.choreography ?? "morph",
    pace: props.pace ?? defaultPace(size),
    idle: props.idle ?? "calm",
    // Passed through, not just consumed: the controller sizes a glance from it.
    size,
    hold: props.hold ?? DEFAULT_HOLD_MS,
    blink: props.blink ?? true,
    glance: props.glance ?? false,
    paused: props.paused ?? false,
    onSettle: props.onSettle,
  };
}
