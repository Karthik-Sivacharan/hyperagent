/**
 * Every logo-motion variant takes the same props so the gallery
 * (src/app/design/logo/page.tsx) and the signup page can swap one for another.
 *
 * Each variant plays its entrance once on mount and replays a quieter version
 * on hover and on keyboard focus. To replay the entrance, remount it with a
 * changed React `key`.
 */
export type MarkMotionProps = {
  /** Rendered edge length in px. The mark is square. */
  size?: number;
  className?: string;
  /**
   * Accessible name. Omit when a visible heading already names the product -
   * the mark then renders as `aria-hidden`, which is the signup-page case.
   */
  label?: string;
  /**
   * Whether the turn waits for a pointer or runs on its own. Defaults to
   * `hover`. Only `material-mark.tsx` implements `auto` today; the other three
   * variants ignore it.
   */
  spin?: MarkSpinMode;
};

/**
 * How a variant's turn is triggered.
 *
 * - `hover` (the default): a pointer or focus spins it once and latches the
 *   brand tint. The signup landing mark and the gallery both use this.
 * - `auto`: the mark spins itself on a loop — one turn, a beat of stillness,
 *   another turn — and takes no hover or focus at all. This is the busy
 *   indicator: the signup page shows it while an identity provider is being
 *   read back. `prefers-reduced-motion` drops the loop entirely, which leaves
 *   a still mark, so anything using it owns a text status line as well.
 */
export type MarkSpinMode = "hover" | "auto";
