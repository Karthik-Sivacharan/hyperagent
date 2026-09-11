"use client";

import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import type { FleetAgent, FleetRun } from "@/lib/mock/teams";
import type { ActorId } from "@/components/teams/space/types";
import { Caret, Floating, POP } from "@/components/teams/space/actors/floating";
import { groupHeadOf } from "@/components/teams/space/actors/name-tag";

// Walk up to an ask (docs/plans/2026-09-11-teams-space-v1.md §4): when you
// stand next to an agent (1 tile) that needs a person, its first ask opens
// in a small card above it: the ask, whose it is, `Review` (ink, inert in
// v1, as in the sheet) and `Open` (ghost, the sheet). One card at a time,
// the nearest agent's; walking away closes it. It sits above the tag line
// (the agent's own tag, or its group's), so it never covers a name. It is
// the first thing in the map's tab order, so after walking up with the
// arrow keys a single Tab reaches Review.

/** The tag's height above the head: 4px gap, the 6px caret, the 24px pill. */
const TAG_STACK_PX = 34;

export function AskCard({
  agent,
  asks,
  ownerName,
  company,
  onOpen,
}: {
  agent: FleetAgent;
  asks: readonly FleetRun[];
  /** "Diego", or "you". */
  ownerName: string;
  /** Everyone whose tag this agent's is merged into, itself included; just itself when alone. */
  company: readonly ActorId[];
  onOpen: () => void;
}) {
  const [ask] = asks;
  const key = company.join("+");
  return (
    <Floating
      anchor={(store) => {
        const x = store.box(agent.id)?.cx;
        const line = groupHeadOf(store, company);
        return x === undefined || !line ? null : { x, y: line.y - TAG_STACK_PX };
      }}
      deps={[agent.id, key]}
      className="z-20"
    >
      <motion.div {...POP} className="absolute bottom-1 left-0 origin-bottom -translate-x-1/2">
        <div className="flex flex-col items-center">
          <div
            role="group"
            aria-label={`${agent.name} needs you`}
            className="pointer-events-auto flex w-max max-w-60 flex-col rounded-xl bg-card p-3 shadow-md"
          >
            <p className="text-sm font-medium text-pretty text-foreground">{ask.needs ?? ask.title}</p>
            <p className="mt-0.5 text-md text-muted-foreground tabular-nums">
              For {ownerName}
              {asks.length > 1 ? `, +${asks.length - 1} more` : ""}
            </p>
            <div className="mt-3 flex gap-1.5">
              <Button size="sm">Review</Button>
              <Button size="sm" variant="ghost" onClick={onOpen}>
                Open
              </Button>
            </div>
          </div>
          <Caret className="-mt-px text-card" />
        </div>
      </motion.div>
    </Floating>
  );
}
