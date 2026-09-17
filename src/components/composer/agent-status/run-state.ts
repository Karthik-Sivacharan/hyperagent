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
 */
export type RunStatePresentation = {
  /** The state, as a word. Tooltip line 1's suffix, and the expanded row's tag. */
  label: string;
  /** The glyph's colourway (tones.ts). `sand` is the hueless one. */
  tone: GlyphTone;
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
    tone: "sand",
    tint: "text-muted-foreground",
    ring: "ring-transparent",
    icon: IconCircleHalf2,
    wants: false,
  },
  done: {
    label: "Done",
    tone: "success",
    tint: "text-success",
    ring: "ring-success/45",
    icon: IconCircleCheckFilled,
    wants: false,
  },
  input: {
    label: "Needs you",
    tone: "warning",
    tint: "text-warning",
    ring: "ring-warning/55",
    icon: IconCircleHalf2,
    wants: true,
  },
  stuck: {
    label: "Stuck",
    tone: "danger",
    tint: "text-destructive",
    ring: "ring-destructive/55",
    icon: IconAlertTriangleFilled,
    wants: false,
  },
};

/** The stack's reading order: whoever wants something first, then trouble,
    then the ones still going, then the ones already finished. */
export const STATE_PRIORITY: Readonly<Record<AgentRunState, number>> = {
  input: 0,
  stuck: 1,
  running: 2,
  done: 3,
};
