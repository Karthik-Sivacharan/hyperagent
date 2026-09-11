"use client";

import { FlowPanel } from "@/components/ui/flow";
import { Overline } from "@/components/ui/overline";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useFleet } from "@/components/teams/fleet/fleet-context";
import { AGENT_STATE_META } from "@/components/teams/fleet/agent-avatar";

// The key in the chart's top-left corner: how many agents are in each state
// that asks for attention, with the same dots the avatars wear (tangerine
// for the agents a person is blocking, the one place the chart spends it),
// then what the two kinds of line mean. Counts are the whole team; while a
// search is on, one more line says how much of the chart it lit.

function LegendLine({ className }: { className: string }) {
  return (
    <svg width="20" height="4" viewBox="0 0 20 4" aria-hidden="true" className="shrink-0">
      <line x1="0" y1="2" x2="20" y2="2" className={className} />
    </svg>
  );
}

export function OrgLegend({ matchCount }: { matchCount: number | null }) {
  const { agents, allRuns } = useFleet();
  const blocked = new Set(allRuns.filter((run) => run.status === "needs-you").map((run) => run.agentId)).size;
  const inState = (state: keyof typeof AGENT_STATE_META) => agents.filter((agent) => agent.state === state).length;

  const rows = [
    { label: "Working", count: inState("working"), dot: AGENT_STATE_META.working.dot },
    { label: "Needs you", count: blocked, dot: "bg-brand-accent" },
    { label: "Paused", count: inState("paused"), dot: AGENT_STATE_META.paused.dot },
    { label: "Error", count: inState("error"), dot: AGENT_STATE_META.error.dot },
  ].filter((row) => row.count > 0 || row.label === "Working" || row.label === "Needs you");

  return (
    <FlowPanel position="top-left" className="w-44 px-3 py-2.5 text-xs">
      {/* The unit, said once: these count agents, where the summary line
          above the chart counts runs ("6 working now" there, 8 here). */}
      <Overline aria-hidden="true" className="mb-2">
        Agents
      </Overline>
      <ul aria-label="Agents by state" className="flex flex-col gap-1.5">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center gap-2">
            <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full", row.dot)} />
            <span className="flex-1 text-muted-foreground">{row.label}</span>
            <span className="font-medium text-foreground tabular-nums">{row.count}</span>
          </li>
        ))}
      </ul>
      <Separator className="my-2.5" />
      <ul aria-label="Lines" className="flex flex-col gap-1.5 text-muted-foreground">
        <li className="flex items-center gap-2">
          <LegendLine className="stroke-(--flow-edge) [stroke-width:1]" />
          Reports to
        </li>
        <li className="flex items-center gap-2">
          <LegendLine className="stroke-info [stroke-dasharray:5_5] [stroke-width:1.5]" />
          Delegating now
        </li>
      </ul>
      {/* The region is always mounted so a screen reader hears it fill. */}
      <div aria-live="polite">
        {matchCount === null ? null : (
          <>
            <Separator className="my-2.5" />
            <p className="text-muted-foreground tabular-nums">
              {matchCount === 0 ? "No agents match" : `${matchCount} of ${agents.length} agents match`}
            </p>
          </>
        )}
      </div>
    </FlowPanel>
  );
}
