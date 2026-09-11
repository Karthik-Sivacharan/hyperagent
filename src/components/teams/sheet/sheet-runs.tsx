"use client";

import { useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RUN_STATUS_ORDER, type FleetAgent, type FleetRun } from "@/lib/mock/teams";
import { RUN_STATUS_META, RunStatusIcon } from "@/components/teams/fleet/run-status";
import { agentLine, runCaption } from "@/components/teams/fleet/run-caption";
import {
  FOLD_CHEVRON,
  FOLD_CONTENT,
  FOLD_TRIGGER,
  SheetSection,
  ToneGlyph,
} from "@/components/teams/sheet/sheet-parts";

// The agent's work, in two sections: what a person owes it, then what it is
// doing. Neither row is a control; the sheet is where a run ends up, not a
// door to somewhere else, so rows take no hover fill.
//
// NEEDS YOU leads the sheet whenever the agent is blocked on someone. Each
// ask is the tangerine glyph (the one place the sheet spends the accent), the
// ask itself on top because it is the thing to act on, the run it belongs to
// under it, and an ink Review. The ask wraps rather than truncates: it is
// the sentence the person came to read.
//
// RUNS lists the rest by status (working, queued, in review), each as the
// neutral status glyph, the title over its caption (fleet/run-caption.ts)
// and when it last moved. A working run's caption, and a queued one's when
// the agent is stuck, is the agent's own line, which the header already
// shows word for word (Atlas working, Gauge paused), so here that row has no
// caption rather than saying it twice. The status label is spoken, not
// shown: the glyph carries it by eye. Done runs fold away behind "Show N
// done", closed every time the page mounts (a new agent, or the sheet opened
// again), because a receipt is rarely what brought someone here.
//
// Glyphs sit in a 20px box so they centre on the first line of text, not on
// the whole row; the time shares the title's 20px line for the same reason.

function spokenSteps(run: FleetRun): string | null {
  if (!run.progress) return null;
  if (run.status === "working") return `${run.progress.done} of ${run.progress.total} steps done`;
  if (run.status === "queued") return `${run.progress.total} steps planned`;
  return null;
}

export function NeedsYouSection({ runs }: { runs: FleetRun[] }) {
  return (
    <SheetSection title="Needs you">
      <ul className="flex flex-col gap-3">
        {runs.map((run) => (
          <li key={run.id} className="flex items-center gap-3">
            <span className="flex h-5 shrink-0 items-center self-start">
              <RunStatusIcon status="needs-you" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{run.needs}</p>
              <p className="mt-0.5 truncate text-md text-muted-foreground">{run.title}</p>
            </div>
            {/* Inert in v1: there is no review flow to open yet. The hidden
                run title tells one Review from the next ("Review Investor
                update, August"); no colon, since the name is computed with
                a space before the hidden span. */}
            <Button size="sm" className="shrink-0">
              Review<span className="sr-only"> {run.title}</span>
            </Button>
          </li>
        ))}
      </ul>
    </SheetSection>
  );
}

function RunLine({ run, agent }: { run: FleetRun; agent: FleetAgent }) {
  const own = runCaption(run, agent);
  const caption = own && own.text === agentLine(agent)?.text ? null : own;
  const steps = spokenSteps(run);
  return (
    <li className="flex gap-3">
      <span className="flex h-5 shrink-0 items-center">
        <RunStatusIcon status={run.status} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          <span className="sr-only">{RUN_STATUS_META[run.status].label}: </span>
          {run.title}
        </p>
        {caption ? (
          <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-md text-muted-foreground">
            {caption.tone ? <ToneGlyph tone={caption.tone} /> : null}
            <span className="truncate">{caption.text}</span>
          </p>
        ) : null}
        {steps ? <span className="sr-only">, {steps}</span> : null}
      </div>
      <span className="shrink-0 text-md leading-5 whitespace-nowrap text-foreground-low tabular-nums">
        {run.updated}
      </span>
    </li>
  );
}

export function RunsSection({
  agent,
  runs,
  hasAsks,
}: {
  agent: FleetAgent;
  /** Every run of the agent's except the asks, which Needs you shows. */
  runs: FleetRun[];
  hasAsks: boolean;
}) {
  const [showDone, setShowDone] = useState(false);
  const active = runs
    .filter((run) => run.status !== "done")
    .sort((a, b) => RUN_STATUS_ORDER.indexOf(a.status) - RUN_STATUS_ORDER.indexOf(b.status));
  const done = runs.filter((run) => run.status === "done");

  return (
    <SheetSection title="Runs">
      {active.length ? (
        <ul className="flex flex-col gap-3">
          {active.map((run) => (
            <RunLine key={run.id} run={run} agent={agent} />
          ))}
        </ul>
      ) : null}

      {done.length ? (
        <Collapsible open={showDone} onOpenChange={setShowDone} className={active.length ? "mt-3" : undefined}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="none"
              className={`${FOLD_TRIGGER} text-muted-foreground hover:text-foreground`}
            >
              {showDone ? "Hide" : "Show"} {done.length} done
              <IconChevronDown className={FOLD_CHEVRON} aria-hidden="true" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className={FOLD_CONTENT}>
            <ul className="flex flex-col gap-3 pt-3">
              {done.map((run) => (
                <RunLine key={run.id} run={run} agent={agent} />
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      ) : null}

      {!active.length && !done.length ? (
        <p className="text-md text-foreground-low">{hasAsks ? "Nothing else in progress." : "No runs this week."}</p>
      ) : null}
    </SheetSection>
  );
}
