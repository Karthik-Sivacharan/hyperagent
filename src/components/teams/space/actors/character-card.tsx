"use client";

import * as React from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { FleetAgent, FleetRun, TeamMember } from "@/lib/mock/teams";
import { runCaption } from "@/components/teams/fleet/run-caption";
import { RunStatusIcon } from "@/components/teams/fleet/run-status";
import { accountLine, liveLine } from "@/components/teams/org/org-graph";
import { asksWaiting } from "@/components/teams/space/scene/labels";

// Level 2 of the disclosure (docs/plans/2026-09-11-teams-space-v1.md §3): the
// org chart's tooltip, on a character. CONTROLLED, as the org chart's is:
// space-view.tsx decides whose card is open with the org chart's own intent
// timing (org/node-intent.ts: 250ms after the pointer or focus lands, at
// once when moving on to a neighbour), so Radix's hover timing never runs.
// The ink primitive, under the character, 256px at most, no controls in it:
// everything a task needs is on the ask card or in the sheet. It fades and
// does not move (the primitive's zoom and slide zeroed, as node-tip.tsx does).
//
//   agent   the live line; the run it is on and that run's caption (unless
//           the caption only repeats the live line); the first ask, "+1
//           more"; the owner, spend of budget and score
//   person  "Priya Nair, Founder, online" and the asks waiting on them
//   group   the live run they share and its caption, or "Chatting"

const FADE_ONLY = {
  "--tw-enter-scale": "1",
  "--tw-exit-scale": "1",
  "--tw-enter-translate-x": "0",
  "--tw-enter-translate-y": "0",
} as React.CSSProperties;

export function SceneTip({
  open,
  content,
  side = "bottom",
  children,
}: {
  open: boolean;
  content: React.ReactNode;
  side?: "top" | "bottom";
  children: React.ReactElement;
}) {
  return (
    <Tooltip open={open}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} align="center" sideOffset={8} className="flex max-w-64 flex-col gap-1" style={FADE_ONLY}>
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

function RunLine({ run, caption }: { run: FleetRun; caption: string | null }) {
  return (
    <p className="flex gap-1.5">
      <RunStatusIcon status={run.status} className="mt-px size-3.5 text-muted-foreground" />
      <span className="text-pretty">
        {run.title}
        {caption ? <span className="block text-muted-foreground">{caption}</span> : null}
      </span>
    </p>
  );
}

export function AgentCard({
  agent,
  ownerName,
  run,
  runAgent,
  asks,
}: {
  agent: FleetAgent;
  ownerName: string;
  run: FleetRun | null;
  /** The run's own agent, whose line its caption is. */
  runAgent: FleetAgent | null;
  asks: readonly FleetRun[];
}) {
  const live = liveLine(agent);
  const caption = run && runAgent ? (runCaption(run, runAgent)?.text ?? null) : null;
  const [ask] = asks;
  return (
    <>
      <p className="text-pretty">{live}</p>
      {run ? <RunLine run={run} caption={caption === live ? null : caption} /> : null}
      {ask ? (
        <p className="flex gap-1.5">
          {/* The tooltip inverts the theme, so in dark it is a light card: the
              deeper tangerine step keeps the glyph at 3:1 there (as the org chart's). */}
          <RunStatusIcon status="needs-you" className="mt-px size-3.5 dark:text-brand" />
          <span className="text-pretty">
            {ask.needs ?? ask.title}
            {asks.length > 1 ? <span className="text-muted-foreground tabular-nums">, +{asks.length - 1} more</span> : null}
          </span>
        </p>
      ) : null}
      <p className="text-muted-foreground tabular-nums">{accountLine(agent, ownerName)}</p>
    </>
  );
}

export function PersonCard({ member, waiting }: { member: TeamMember; waiting: number }) {
  return (
    <>
      <p>
        {member.name}, {member.role}, {member.online ? "online" : "away"}
      </p>
      {waiting > 0 ? <p className="text-muted-foreground tabular-nums">{asksWaiting(waiting)}</p> : null}
    </>
  );
}

export function GroupCard({ run, runAgent }: { run: FleetRun | null; runAgent: FleetAgent | null }) {
  if (!run || !runAgent) return <p>Chatting</p>;
  return <RunLine run={run} caption={runCaption(run, runAgent)?.text ?? null} />;
}
