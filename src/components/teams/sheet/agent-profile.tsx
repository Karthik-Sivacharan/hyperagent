"use client";

import { useState, type ElementType } from "react";
import { motion, useIsPresent } from "motion/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { DURATION, EASE } from "@/lib/motion";
import type { FleetAgent } from "@/lib/mock/teams";
import { useFleet } from "@/components/teams/fleet/fleet-context";
import { AgentAvatar } from "@/components/teams/fleet/agent-avatar";
import { AgentDetails } from "@/components/teams/sheet/agent-details";
import { NeedsYouSection, RunsSection } from "@/components/teams/sheet/sheet-runs";
import { ToneGlyph } from "@/components/teams/sheet/sheet-parts";

// One agent's page inside the sheet. agent-sheet.tsx keys it by agent id
// under AnimatePresence, so moving to another agent (a sub-agent, the
// "Reports to" chip) swaps one of these for the next in place: the old one
// fades out in 90ms while the new one fades in over 200ms with a 4px rise,
// and the sheet itself never moves. Each page is absolutely stacked in the
// same box with its own scroller, so the outgoing page keeps its scroll
// position while it fades and the incoming one starts at the top.
//
// While a page is leaving it is `inert` (no focus, no clicks) and its title
// and description drop the dialog's ids, so for those 90ms the sheet still
// has exactly one title for aria-labelledby to find.
//
// THE HEADER does not scroll: the 48px face, the name over the role, and one
// more line only when there is something to say (what a working agent is
// doing, or why a paused or broken one stopped, after its tone glyph). An
// idle agent gets nothing. The More menu and the close button are not here:
// agent-sheet.tsx pins them over the header's top right, outside the
// cross-fade, so they hold still while pages swap; `pr-17` keeps the name
// clear of them, and they centre on this row's 48px (top 28px = 20px of
// padding plus 24px, less half their 32px).
//
// The header's hairline shows only while the body is scrolled, the one rule
// on the sheet, and only when content is actually passing under it.
//
// THE BODY is sections 32px apart and nothing else: Needs you (only when the
// agent is blocked on someone), Runs, then Details, folded.

const TITLE = "truncate font-heading text-xl font-semibold text-foreground";
const DESCRIPTION = "truncate text-md text-muted-foreground";

const SPOKEN_STATE = { working: "Working", paused: "Paused", error: "Error" } as const;

function StateLine({ agent }: { agent: FleetAgent }) {
  // Nothing to say is said to a screen reader only, so the fact the old
  // state dot carried is still in the page.
  if (agent.state === "idle") return <p className="sr-only">Idle</p>;
  if (agent.state === "working" && !agent.activity) return <p className="sr-only">Working</p>;

  const spoken = SPOKEN_STATE[agent.state];
  return (
    <p className="mt-3 flex gap-1.5 text-md text-muted-foreground">
      {agent.state !== "working" ? (
        <span className="flex h-4.5 shrink-0 items-center">
          <ToneGlyph tone={agent.state} />
        </span>
      ) : null}
      {agent.activity ? (
        <span className="min-w-0">
          <span className="sr-only">{spoken}: </span>
          {agent.activity}
        </span>
      ) : (
        <span>{spoken}</span>
      )}
    </p>
  );
}

export function AgentProfile({
  agent,
  detailsOpen,
  onDetailsOpenChange,
}: {
  agent: FleetAgent;
  detailsOpen: boolean;
  onDetailsOpenChange: (open: boolean) => void;
}) {
  const isPresent = useIsPresent();
  const { runsForAgent } = useFleet();
  const [scrolled, setScrolled] = useState(false);

  const runs = runsForAgent(agent.id);
  const asks = runs.filter((run) => run.status === "needs-you");
  const rest = runs.filter((run) => run.status !== "needs-you");

  const Title: ElementType = isPresent ? SheetTitle : "h2";
  const Description: ElementType = isPresent ? SheetDescription : "p";

  return (
    <motion.div
      inert={!isPresent}
      data-agent={agent.id}
      className="absolute inset-0 flex flex-col"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0, transition: { duration: DURATION.normal, ease: EASE.outQuart } }}
      exit={{ opacity: 0, transition: { duration: DURATION.exit, ease: EASE.out } }}
    >
      <header
        className={cn(
          "shrink-0 border-b px-5 pt-5 pb-4 transition-[border-color] duration-(--duration-fast) ease-out-quart",
          scrolled ? "border-border-subtle" : "border-transparent",
        )}
      >
        <div className="flex items-center gap-4 pr-17">
          <AgentAvatar agent={agent} size="lg" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <Title className={TITLE}>{agent.name}</Title>
            <Description className={DESCRIPTION}>{agent.role}</Description>
          </div>
        </div>
        <StateLine agent={agent} />
      </header>

      {/* `[&>div]:!block`: Radix wraps the viewport's content in an inline
          `display: table` box that sizes to its widest line, which would
          stop the run titles from truncating (agent-panel.tsx has the long
          version of this note). */}
      <ScrollArea
        className="min-h-0 flex-1"
        viewportProps={{
          className: "[&>div]:!block",
          onScroll: (event) => setScrolled(event.currentTarget.scrollTop > 0),
        }}
      >
        <div className="flex flex-col gap-8 px-5 pt-4 pb-8">
          {asks.length ? <NeedsYouSection runs={asks} /> : null}
          <RunsSection agent={agent} runs={rest} hasAsks={asks.length > 0} />
          <AgentDetails agent={agent} open={detailsOpen} onOpenChange={onDetailsOpenChange} />
        </div>
      </ScrollArea>
    </motion.div>
  );
}
