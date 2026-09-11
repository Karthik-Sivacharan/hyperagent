"use client";

import * as React from "react";
import { IconAlertTriangle, IconPlayerPause, type TablerIcon } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { FleetAgent, FleetRun, RunTrigger, TeamMember } from "@/lib/mock/teams";
import { useFleet } from "@/components/teams/fleet/fleet-context";
import { AgentAvatar } from "@/components/teams/fleet/agent-avatar";
import { formatUsd } from "@/components/teams/fleet/format";
import { runCaption, type HeldState, type RunCaption } from "@/components/teams/board/run-caption";

// One run on the board, in three lines: the title (two lines at most), the
// caption (one line of state in words, run-caption.ts; a plain queued run
// has none), and a footer with the agent doing the work and how fresh the
// run is. Everything else a card used to show (project, trigger, owner,
// cost, run time, steps, helpers, place in the queue) is one interaction
// deeper, in the agent sheet, and in the card's accessible description, so
// a screen reader still hears every fact the old card showed.
//
// The shell is the native interactive card (/home's featured card, /threads'
// rows): `bg-card shadow-card`, 18px corners, the shadow lifting at
// --duration-slow on hover and nothing else; the card never grows. It is one
// target with no controls inside: a button, so a click, Enter or Space opens
// the agent sheet, which holds the ask and its Review action (v1 has no run
// page). The arrow keys move between cards (board-view.tsx); the scroll
// margins keep a card that takes focus clear of the sticky lane header and
// the board's gutters.
//
// Colour: only a queued run whose agent is paused or in error carries a
// hue, the 14px tone glyph before the reason (docs/plans/2026-09-11-teams-
// fleet-polish.md §3). The reason itself stays muted-foreground.

const HELD: Record<HeldState, { icon: TablerIcon; className: string; label: string }> = {
  paused: { icon: IconPlayerPause, className: "text-warning", label: "Paused" },
  error: { icon: IconAlertTriangle, className: "text-destructive", label: "Error" },
};

export function RunCard({ run, queuePosition }: { run: FleetRun; queuePosition?: number }) {
  const { agentById, memberById, openAgent } = useFleet();
  const agent = agentById(run.agentId);
  const owner = memberById(run.ownerId);
  const helpers = (run.helpers ?? []).map((id) => agentById(id).name);
  const caption = runCaption(run, agent);
  const held = caption?.held ? HELD[caption.held] : null;
  const titleId = React.useId();
  const detailId = React.useId();

  return (
    <Card
      asChild
      size="none"
      variant="interactive"
      className="relative w-full scroll-mx-6 scroll-mt-12 scroll-mb-6 cursor-pointer rounded-2xl p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <button
        type="button"
        data-run-card=""
        data-status={run.status}
        aria-labelledby={titleId}
        aria-describedby={detailId}
        onClick={() => openAgent(agent.id)}
      >
        <span id={titleId} className="line-clamp-2 text-sm font-medium text-pretty text-foreground">
          {run.title}
        </span>

        {caption ? (
          <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-md text-muted-foreground">
            {held ? <held.icon className={cn("size-3.5 shrink-0", held.className)} aria-hidden="true" /> : null}
            <span className="truncate">{caption.text}</span>
          </span>
        ) : null}

        <span className="mt-3 flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-1.5">
            <AgentAvatar agent={agent} size="xs" aria-hidden="true" />
            <span className="truncate text-md text-muted-foreground">{agent.name}</span>
          </span>
          <span className="shrink-0 text-md text-foreground-low tabular-nums">{run.updated}</span>
        </span>

        <span id={detailId} className="sr-only">
          {describeRun({ run, agent, owner, caption, helpers, queuePosition })}
        </span>
      </button>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// The accessible description: the caption, the agent and the time as shown,
// then the facts the card no longer draws, in sentences.

const TRIGGER_WORDS: Record<RunTrigger, string> = {
  thread: "started from a thread",
  slack: "started from Slack",
  schedule: "runs on a schedule",
  email: "started from an email",
  webhook: "started by a webhook",
  agent: "handed off by another agent",
};

function describeRun({
  run,
  agent,
  owner,
  caption,
  helpers,
  queuePosition,
}: {
  run: FleetRun;
  agent: FleetAgent;
  owner: TeamMember;
  caption: RunCaption | null;
  helpers: string[];
  queuePosition?: number;
}) {
  const sentences: string[] = [];
  if (caption) {
    const label = caption.held ? HELD[caption.held].label : "";
    const said = label && !caption.text.toLowerCase().startsWith(label.toLowerCase());
    sentences.push(said ? `${label}: ${caption.text}` : caption.text);
  }
  sentences.push(`${agent.name}, updated ${run.updated}`);
  sentences.push(
    `${run.project}, ${TRIGGER_WORDS[run.trigger]}, for ${owner.name}, ${formatUsd(run.cost)} over ${spokenMinutes(run.minutes)}`,
  );
  if (run.status === "working" && run.progress) {
    sentences.push(`${run.progress.done} of ${run.progress.total} steps done`);
  }
  if (run.status === "queued") {
    const steps = run.progress?.total;
    sentences.push([queuePosition ? inLine(queuePosition) : "Queued", steps ? `${steps} steps` : ""].filter(Boolean).join(", "));
  }
  if (helpers.length) sentences.push(`Helped by ${listNames(helpers)}`);
  return `${sentences.join(". ")}.`;
}

/** "Next up", "2nd in line", "11th in line". */
function inLine(position: number) {
  if (position === 1) return "Next up";
  const tens = position % 100;
  const suffixes: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" };
  const suffix = tens >= 11 && tens <= 13 ? "th" : (suffixes[position % 10] ?? "th");
  return `${position}${suffix} in line`;
}

/** "15 minutes", "1 hour 20 minutes": the words a screen reader should say for "15m". */
function spokenMinutes(minutes: number) {
  const total = Math.max(1, Math.round(minutes));
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  const unit = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
  return [hours ? unit(hours, "hour") : "", rest ? unit(rest, "minute") : ""].filter(Boolean).join(" ");
}

/** "Iris", "Iris and Rook", "Iris, Rook and Quill". */
function listNames(names: string[]) {
  return names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
