import type { FleetAgent, FleetRun } from "@/lib/mock/teams";

// The one line of state under a run's title, in words, so no glyph, meter or
// counter has to carry progress (docs/plans/2026-09-11-teams-fleet-polish.md
// §3, "The caption rule"). Needs you says the ask; Working says what the
// agent is doing while it is doing it; Queued says nothing unless its agent
// cannot start (paused or in error), and then says why, after the tone glyph
// the card draws from `held`; In review and Done say what the run produced.
//
// The list row and the sheet's run row follow the same rule with their own
// copy of this function; the orchestrator folds the three into
// fleet/run-caption.ts at merge.

export type HeldState = "paused" | "error";

export interface RunCaption {
  text: string;
  /** Set when a queued run waits on an agent a person has to unblock. */
  held?: HeldState;
}

export function runCaption(run: FleetRun, agent: FleetAgent): RunCaption | null {
  switch (run.status) {
    case "needs-you":
      return run.needs ? { text: run.needs } : null;
    case "working":
      return agent.state === "working" && agent.activity ? { text: agent.activity } : null;
    case "queued":
      if (agent.state !== "paused" && agent.state !== "error") return null;
      return { text: agent.activity ?? (agent.state === "paused" ? "Paused" : "Error"), held: agent.state };
    case "review":
    case "done":
      return run.outcome ? { text: run.outcome } : null;
  }
}
