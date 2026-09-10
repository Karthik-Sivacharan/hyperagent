import type { CSSProperties } from "react";

// The product's running-label device, shared by everything in a turn that is
// still happening: a tool call's label, the "Reasoning…" line, the signup
// flow's heading and its research rows. It lived in
// src/components/signup/research-signals.tsx until the streaming turn needed
// it too, and a thread component may not import from the signup flow.
//
// The product's running label is NOT a keyframe on a solid element. It is a
// two-layer background clipped to the glyphs: a flat base in the label's own
// colour, and above it a soft band that travels. Reproduced here on this
// repo's own `@keyframes shimmer` (src/app/globals.css), which moves
// `background-position` from -200% to 200%.
//
// Those keyframes want a 200% tile and the default `repeat`, and then the
// arithmetic comes out exact: 400% of position travel across a 200%-wide tile
// is four element-widths, which is two whole tiles, so the loop closes on
// itself with no seam and the band crosses the text exactly twice a cycle,
// each crossing taking a quarter of it. `reverse` in the shorthand is what
// turns the sweep left-to-right, with the reading, instead of against it.
//
// The band colour is always one tier away from the base, in whichever
// direction there is room: a muted label brightens towards `foreground`, and a
// `foreground` heading is swept by --shimmer-sweep (the repo's own token, a
// 40% neutral) which dims it. Using --shimmer-sweep on the muted label as well
// would have been the literal reuse, and it measured worse: a 40% neutral over
// a muted grey is a smaller step than the antialiasing, so the band vanished.
//
// EVERY part of this is behind `motion-safe:`, including `bg-clip-text` and
// `text-transparent` — under reduce the treatment is not applied at all, which
// is the only safe way to do it: a transparent label with no background
// painted behind it is an invisible label. That is also why the gradient
// arrives as a custom property rather than an inline `background-image`: an
// inline style outranks every class, so a `motion-reduce:` override could
// never take it back off.
export const SHIMMER =
  "motion-safe:bg-clip-text motion-safe:text-transparent motion-safe:[background-image:var(--sweep-image)] motion-safe:[background-size:200%_100%] motion-safe:animate-[shimmer_var(--sweep-cycle)_linear_infinite_reverse]";

// The research row's tempo, and the default because it came first: its label
// runs for 1400ms and a cycle of four times that puts exactly one whole
// crossing inside the row's working phase (see research-signals.tsx, which
// passes its own figure rather than trusting this one to stay in step).
const DEFAULT_CYCLE_MS = 5600;

// 2px of band per character, the ratio measured off the 2026-09-09 dump:
// `--spread: 34px` on "Searching the web", which is 17 characters. A ratio
// rather than a constant because the tile scales with the element — a fixed
// spread would be a hard-edged flick on a short label and an almost-flat wash
// on a long one. The product's "prominent" variant (the Reasoning line) runs
// twice as wide, 4px a character: `--spread: 40px` on "Reasoning…", live on
// 2026-09-10.
const DEFAULT_SPREAD_PER_CHAR_PX = 2;

/**
 * The custom properties `SHIMMER` reads. `chars` is the length of the text
 * being swept, `sweep` the band colour and `base` the label's resting colour —
 * both as `var(--color-…)` strings, never literals, so the pair follows the
 * theme. `cycleMs` is one full keyframe loop (two crossings); `spreadPerChar`
 * is the band's half-width per character, in px.
 */
export function sweepStyle(
  chars: number,
  sweep: string,
  base: string,
  opts: { cycleMs?: number; spreadPerChar?: number } = {},
): CSSProperties {
  const cycleMs = opts.cycleMs ?? DEFAULT_CYCLE_MS;
  const spread = `${chars * (opts.spreadPerChar ?? DEFAULT_SPREAD_PER_CHAR_PX)}px`;
  return {
    "--sweep-cycle": `${cycleMs}ms`,
    "--sweep-image": `linear-gradient(90deg, transparent calc(50% - ${spread}), ${sweep} 50%, transparent calc(50% + ${spread})), linear-gradient(${base}, ${base})`,
  } as CSSProperties;
}
