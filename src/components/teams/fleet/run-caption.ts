import { IconAlertTriangle, IconPlayerPause, type TablerIcon } from "@tabler/icons-react";
import type { FleetAgent, FleetRun } from "@/lib/mock/teams";

// The caption rule (docs/plans/2026-09-11-teams-fleet-polish.md §3): the one
// line of state a run shows with its title, in words, so no glyph, meter or
// counter has to carry progress. The board card, the list row and the
// sheet's run row all read it from here.
//
//   needs you    the ask
//   working      the agent's own line (what it is doing), while it works
//   queued       nothing, unless the agent is paused or in error: then its
//                own line (why it stopped), after the tone glyph (`tone`)
//   review/done  the outcome
//
// The agent's own line is `agentLine`, which the sheet's header also shows,
// so the sheet can tell when a run's caption would only repeat its header.

export type RunCaptionTone = "paused" | "error";

export interface RunCaption {
  text: string;
  /** Set only when the agent is stuck; the caller draws TONE_GLYPH[tone] before the text. */
  tone?: RunCaptionTone;
}

/**
 * A stuck agent's 14px glyph, the only status colour besides the Needs you
 * glyph (plan §3). The reason beside it stays muted-foreground. `label` is
 * the word for the state, spoken where the glyph is the only thing saying it.
 */
export const TONE_GLYPH: Record<RunCaptionTone, { icon: TablerIcon; className: string; label: string }> = {
  paused: { icon: IconPlayerPause, className: "text-warning", label: "Paused" },
  error: { icon: IconAlertTriangle, className: "text-destructive", label: "Error" },
};

/** What the agent is doing, or why it stopped. Null when idle, or working with nothing to say. */
export function agentLine(agent: FleetAgent): RunCaption | null {
  switch (agent.state) {
    case "working":
      return agent.activity ? { text: agent.activity } : null;
    case "paused":
    case "error":
      return { text: agent.activity ?? TONE_GLYPH[agent.state].label, tone: agent.state };
    case "idle":
      return null;
  }
}

export function runCaption(run: FleetRun, agent: FleetAgent): RunCaption | null {
  switch (run.status) {
    case "needs-you":
      return run.needs ? { text: run.needs } : null;
    case "working":
      return agent.state === "working" ? agentLine(agent) : null;
    case "queued":
      return agent.state === "paused" || agent.state === "error" ? agentLine(agent) : null;
    case "review":
    case "done":
      return run.outcome ? { text: run.outcome } : null;
  }
}
