// The brand motion tokens for JS animation (`motion/react`), mirrored from
// the "Motion" block of src/design/brand/brand.css (the --duration-* and
// --ease-* custom properties, docs/brand/design.md §8). CSS keeps reading the
// variables; this file exists because motion takes numbers, not var()s.
// Durations are in SECONDS (motion's unit), eases are cubic-bezier arrays.
// If a value changes in brand.css, change it here too.
//
// The rules that come with them: enter at or under 200ms, exits faster than
// enters (`exit`), layout and position moves at `move` on `outLayout`,
// `stagger` only on first paint, nothing past `entrance`. Every animation
// honours prefers-reduced-motion: wrap a tree in
// <MotionConfig reducedMotion="user"> or branch on useReducedMotion().

export const DURATION = {
  /** 90ms: anything leaving. */
  exit: 0.09,
  /** 100ms: toggles, press feedback. */
  instant: 0.1,
  /** 140ms: menus, popovers, chips appearing. */
  enter: 0.14,
  /** 150ms: buttons, inputs. */
  fast: 0.15,
  /** 200ms: chips, tabs, colour, a view cross-fading in. */
  normal: 0.2,
  /** 220ms: layout and position shifts (a sliding indicator). */
  move: 0.22,
  /** 300ms: hover shadows; the product-UI ceiling. */
  slow: 0.3,
  /** 400ms: icon and composer reveals only. */
  reveal: 0.4,
  /** 480ms: large transform moves. */
  slide: 0.48,
  /** 500ms: staggered first-paint entrances only. */
  entrance: 0.5,
  /** 80ms: the delay between staggered siblings. */
  stagger: 0.08,
} as const;

export const EASE = {
  /** cubic-bezier(0, 0, .2, 1): chips, tiles, generic enter / exit. */
  out: [0, 0, 0.2, 1],
  /** cubic-bezier(.165, .84, .44, 1): buttons, inputs, quick enters. */
  outQuart: [0.165, 0.84, 0.44, 1],
  /** cubic-bezier(.22, 1, .36, 1): large transform moves. */
  outQuint: [0.22, 1, 0.36, 1],
  /** cubic-bezier(.23, 1, .32, 1): layout and position shifts. */
  outLayout: [0.23, 1, 0.32, 1],
  /** cubic-bezier(.16, 1, .3, 1): reveals and first-paint entrances. */
  outExpo: [0.16, 1, 0.3, 1],
  /** cubic-bezier(.4, 0, .2, 1): on-screen movement. */
  inOut: [0.4, 0, 0.2, 1],
} as const;

/** The layout transition every sliding indicator and reflowing card shares. */
export const LAYOUT_TRANSITION = { duration: DURATION.move, ease: EASE.outLayout } as const;
