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
};
