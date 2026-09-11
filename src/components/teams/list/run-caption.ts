import type { FleetAgent, FleetRun } from "@/lib/mock/teams";

// The caption rule (docs/plans/2026-09-11-teams-fleet-polish.md §3): the one
// line of state a run shows beside its title, in words. The board card, the
// list row and the sheet's run row each keep a copy of this function until
// the orchestrator folds them into fleet/run-caption.ts.
//
//   needs you    the ask
//   working      the agent's live line, while the agent is working
//   queued       nothing, unless the agent is paused or in error: then its
//                reason, after the tone glyph (`tone`)
//   review/done  the outcome

export type RunCaptionTone = "paused" | "error";

export interface RunCaption {
  text: string;
  /** Set only on a queued run whose agent is stuck; the row draws the glyph. */
  tone?: RunCaptionTone;
}

export function runCaption(run: FleetRun, agent: FleetAgent): RunCaption | null {
  switch (run.status) {
    case "needs-you":
      return run.needs ? { text: run.needs } : null;
    case "working":
      return agent.state === "working" && agent.activity ? { text: agent.activity } : null;
    case "queued":
      return (agent.state === "paused" || agent.state === "error") && agent.activity
        ? { text: agent.activity, tone: agent.state }
        : null;
    case "review":
    case "done":
      return run.outcome ? { text: run.outcome } : null;
  }
}
