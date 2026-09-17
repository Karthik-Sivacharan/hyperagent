import { IconAlertTriangleFilled, IconCircleCheckFilled, IconCircleHalf2, type TablerIcon } from "@tabler/icons-react";

import type { GlyphTone } from "@/components/brand/agent-glyph";
import type { AgentRunState } from "./types";

/**
 * One table, so the chip, the tooltip and the expanded row say the same thing
 * about a state in three places without agreeing by hand.
 *
 * Brand rule 8 keeps status quiet, and the thread's own tool rows spend no hue
 * at all on failure. This bar is the deliberate exception: it is a fleet
 * readout rather than a line of prose, three states out of four are terminal,
 * and the one thing it exists to answer at a glance — "does anything want me?"
 * — is a colour question. The budget is held by keeping `running`, which is
 * most of the bar's life, entirely hueless.
 *
 * TWO TONES PER STATE, for as long as the disc is still being chosen. `tone`
 * is what the bar ships: the `avatar` family, the one colourway the glyph
 * module lets the theme move (agent-glyph/tones.ts), so the disc is paper in
 * the light theme and a neutral-800 slate in the dark instead of a row of
 * near-white coins on a dark composer. `paperTone` is the first treatment,
 * the fixed paper disc, kept ONLY so /design/agent-status can stand the two
 * side by side at real size on the real surface. Once the choice is made, the
 * losing field and `ChipTreatment` come out together.
 */
export type RunStatePresentation = {
  /** The state, as a word. Tooltip line 1's suffix, and the expanded row's tag. */
  label: string;
  /** The glyph's colourway on the themed disc (tones.ts): what ships. */
  tone: GlyphTone;
  /** The same state on the fixed paper disc: the comparison, not the default. */
  paperTone: GlyphTone;
  /** Foreground class for the dial and any state mark. */
  tint: string;
  /** The ring the chip wears, over the stack's separating ring. */
  ring: string;
  /** The mark in front of the expanded row, where there is no progress dial. */
  icon: TablerIcon;
  /** True for the one state that is asking the person for something. */
  wants: boolean;
};

export const RUN_STATES: Readonly<Record<AgentRunState, RunStatePresentation>> = {
  running: {
    label: "Working",
    tone: "avatar",
    paperTone: "sand",
    tint: "text-muted-foreground",
    ring: "ring-transparent",
    icon: IconCircleHalf2,
    wants: false,
  },
  done: {
    label: "Done",
    tone: "avatar-success",
    paperTone: "success",
    tint: "text-success",
    ring: "ring-success/45",
    icon: IconCircleCheckFilled,
    wants: false,
  },
  input: {
    label: "Needs you",
    tone: "avatar-warning",
    paperTone: "warning",
    tint: "text-warning",
    ring: "ring-warning/55",
    icon: IconCircleHalf2,
    wants: true,
  },
  stuck: {
    label: "Stuck",
    tone: "avatar-danger",
    paperTone: "danger",
    tint: "text-destructive",
    ring: "ring-destructive/55",
    icon: IconAlertTriangleFilled,
    wants: false,
  },
};

/**
 * Which disc a chip is cut from. `surface` is the shipping one: the tile and
 * the eyes follow the theme, so a dark composer gets a dark disc and the
 * figure carries the readout. `paper` is the first treatment — a fixed
 * `--color-neutral-100` tile in both themes — and exists so the two can be
 * compared on the design page. A `paper` chip in the LIGHT theme is also, to
 * the pixel, what a `surface` chip looks like there, which is the cheapest
 * way to show that nothing about the light composer moved.
 */
export type ChipTreatment = "surface" | "paper";

/** The colourway for a state on a given disc. */
export function chipTone(state: AgentRunState, treatment: ChipTreatment): GlyphTone {
  const presentation = RUN_STATES[state];
  return treatment === "paper" ? presentation.paperTone : presentation.tone;
}

/** The stack's reading order: whoever wants something first, then trouble,
    then the ones still going, then the ones already finished. */
export const STATE_PRIORITY: Readonly<Record<AgentRunState, number>> = {
  input: 0,
  stuck: 1,
  running: 2,
  done: 3,
};
