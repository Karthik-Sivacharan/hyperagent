import { cn } from "@/lib/utils";

import { RUN_STATES } from "./run-state";
import type { AgentRunState } from "./types";

// The mark the expanded agent row leads with: a disc filled to the share of
// the task that is done, painted in the state's own tint.
//
// This is a HAND-DRAWN SVG, on purpose. The icon rule (docs/brand/icons.md)
// says every icon comes from Tabler and nothing else, because two icon sets
// in one view never quite match. A dial is not an icon. Its fill is a DATUM —
// `run.progress`, a number between 0 and 1 — and no fixed glyph can carry a
// number; a set of stepped half-and-quarter glyphs would be a worse lie at
// every value in between. Where there is no number the row falls back to the
// library's own mark (`RUN_STATES[state].icon`), so the two sit side by side
// deliberately: Tabler where the mark is a symbol, this where it is a
// measurement. Do not "fix" this into an icon import.
//
// The shape: a wedge swept clockwise from twelve o'clock, over a quiet disc
// of the same colour, so a dial at zero is still a shape on the row rather
// than a hole in it. Both ends are special-cased, because an arc cannot draw
// either of them. A full turn starts and ends at the same point, and a
// zero-length arc paints NOTHING — 100% is the one proportion pie geometry
// gets wrong — so 1 is a plain circle and 0 is the track alone.
//
// It does not animate. A wedge's `d` cannot be tweened in CSS, and the
// alternative — a stroked ring with a dash offset, which can — is a different
// object: a ring reads as a gauge, and this row wanted the filled disc. The
// dial simply reads the number it is handed, and the row it sits in fades in
// once, with everything else in the bar.

/** The dial's own grid: a 16-unit box on a 7-unit radius, so the disc keeps a
    unit of air inside its box at any rendered size. */
const BOX = 16;
const CENTRE = BOX / 2;
const RADIUS = 7;

/** The track: present enough to read as a shape at 14px, quiet enough that an
    empty dial is not a mark in its own right. */
const TRACK_OPACITY = 0.2;

/** Three decimals is under a thousandth of a pixel at any size this renders,
    and it keeps the path string short and identical across renders. */
const round = (value: number) => Number(value.toFixed(3));

/** The point on the edge `turn` of the way round, clockwise from twelve. */
function edgePoint(turn: number): readonly [number, number] {
  const angle = turn * 2 * Math.PI;
  return [round(CENTRE + RADIUS * Math.sin(angle)), round(CENTRE - RADIUS * Math.cos(angle))];
}

/** The filled wedge, for a turn strictly between 0 and 1. Sweep flag 1 is
    clockwise in SVG's y-down space; the large-arc flag turns on past the
    half, or the path takes the short way round and draws the complement. */
function wedgePath(turn: number): string {
  const [x, y] = edgePoint(turn);
  return `M${CENTRE} ${CENTRE}L${CENTRE} ${CENTRE - RADIUS}A${RADIUS} ${RADIUS} 0 ${turn > 0.5 ? 1 : 0} 1 ${x} ${y}Z`;
}

export function StateDial({
  state,
  progress,
  size = 14,
  className,
}: {
  state: AgentRunState;
  /** 0 to 1. Omit and the dial falls back to the state's plain mark. */
  progress?: number;
  /** Rendered edge in px. Defaults to 14. */
  size?: number;
  className?: string;
}): React.ReactElement {
  const { icon: Icon, tint } = RUN_STATES[state];

  // No number, or a number that is not one (NaN off a division by zero in
  // mock data): the state's mark, in the same tint, at the same size. The
  // row's shape does not change with the shape of the data it was given.
  if (progress === undefined || !Number.isFinite(progress)) {
    return <Icon size={size} className={cn("shrink-0", tint, className)} aria-hidden="true" />;
  }

  const turn = Math.min(1, Math.max(0, progress));
  return (
    // Decorative, like every mark in this bar: the row beside it says the
    // state in words and carries the task, so a reader that also announced
    // the disc would say the same thing twice. Tabler does not add
    // `aria-hidden` for you and neither does a hand-drawn SVG, so it is here.
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${BOX} ${BOX}`}
      fill="none"
      className={cn("shrink-0", tint, className)}
      aria-hidden="true"
    >
      <circle cx={CENTRE} cy={CENTRE} r={RADIUS} fill="currentColor" fillOpacity={TRACK_OPACITY} />
      {turn >= 1 ? (
        <circle cx={CENTRE} cy={CENTRE} r={RADIUS} fill="currentColor" />
      ) : turn > 0 ? (
        <path d={wedgePath(turn)} fill="currentColor" />
      ) : null}
    </svg>
  );
}
