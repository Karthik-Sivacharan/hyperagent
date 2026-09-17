"use client";

import { useEffect, useRef, useState } from "react";

import { AgentDetail } from "@/components/composer/agent-status/agent-detail";
import { AgentStack } from "@/components/composer/agent-status/agent-stack";
import type { AgentRun } from "@/components/composer/agent-status/types";
import { cn } from "@/lib/utils";

// The composer's agent bar: the strip a composer grows when more than one
// agent is out. It goes in the same `status` slot as ComposerWorkingStatus
// (composer-status.tsx) and is its sibling in every material — one hairline
// underneath, the same 16px sides, a height fixed before anything is drawn in
// it — and it holds the variant's two views: the stack, and one agent opened
// out of it.
//
// THE LEFT IS EMPTY, AND THAT IS THE VARIANT. The strip this replaces spends
// its left on three pulsing dots and the word "Working…", and its right on a
// ghost Stop. Both say the same thing, "something is happening", and neither
// says which thing, how many, or whether any of them has stopped and is
// waiting on you. Four figures wearing their own states answer all three
// without a word, so the words and the dots went and the whole readout moved
// to the right edge, where the send arrow already is. Stop went too, but it
// did not disappear: it belongs to ONE agent rather than to the composer, so
// it is inside that agent's detail, one click from the chip that names it. An
// empty left beats a label that repeats what the figures are already doing,
// and it is the room the detail opens into.
//
// 40px, AND THE SAME IN BOTH VIEWS. The strip it replaces is 36, sized around
// a 28px ghost button with 4px of air either side. A chip is a 28px disc plus
// two 2px rings — the separator that bites it out of the one behind and the
// state's hue over it — so it draws 32px in every direction; at 36 those rings
// sit 2px off the hairline, and a stack pressed against its own container
// reads as an overflow rather than as a row. 40 is one step up the 4px grid
// and hands the rings back the 4px the button had. It stays under the 44px
// field below it, so the bar never out-weighs the thing it is attached to.
//
// AND IT NEVER ANIMATES, which is the rule the sibling strip states and the
// reason is the same one: the composer is docked to the bottom of the screen,
// so a row that eased open would drag the field's top edge for a quarter of a
// second and say nothing the reader did not already know. The box is simply
// there, and its CONTENT fades in over --duration-enter. Swapping the two
// views is that same fade and nothing else: same height, same hairline, same
// sides, so only the contents change hands.
//
// THE BAR OWNS THE BOX. AgentDetail carries a collapsed bar of its own (36px,
// hairline, 16px sides) so that it can be shown standing alone, on a design
// page or anywhere the stack is not. Inside this bar that would be a second
// hairline under the first and padding inside padding, so it is switched off
// through the `className` escape hatch every component here leaves open, and
// the detail fills the row the stack was just in. Nothing is reached into: the
// classes below are the documented way to say "the parent is the box".
//
// FOCUS SURVIVES THE SWAP. Opening the detail unmounts the stack, which takes
// the clicked chip with it, and a browser whose focused element leaves the DOM
// drops focus on <body>: the next Tab restarts at the top of the document. So
// each view is a focus target of its own, claimed under the same guard the
// detail uses — only when focus has ALREADY been lost, never taken off the
// field from someone who was typing. On open that makes this a safety net and
// nothing more, because a child's effects run before its parent's and the
// detail picks up a lost focus on its own back control first. On close there
// is no child left to do it, so this asks the stack for the chip by the
// accessible name it just had, and settles for the stack itself when the chip
// is gone (it finished, or the count swallowed it) — a floor rather than the
// answer, but never <body>. Neither target carries a role or a name: each view
// already introduces itself, the stack as a labelled list and the detail in
// words, and a wrapper repeating either would be announced twice. They are
// floors, not destinations.

/** The bar's own row. Exported so a specimen can put something else in it
    without the 40px being typed a second time and drifting. */
export const AGENT_BAR_ROW = "flex h-10 min-w-0 items-center border-b border-border-subtle px-4";

/** What the detail wears inside that row: its own box off, the bar's kept. */
export const AGENT_BAR_DETAIL = "h-full min-w-0 flex-1 border-b-0 px-0";

/** The fade the stack arrives on, the sibling strip's exactly. The detail
    fades its own contents in already and is left to do it. */
const REVEAL = "animate-in fade-in-0 duration-(--duration-enter) ease-out-quart motion-reduce:animate-none";

export function ComposerAgentStatus({
  runs,
  max,
  className,
}: {
  runs: readonly AgentRun[];
  /** How many chips before the rest collapse into a count. */
  max?: number;
  className?: string;
}) {
  // The one piece of state in the bar: which agent is open. An id rather than
  // the run, so a fleet that changes under an open detail (the agent finished
  // and its run left the array) falls back to the stack instead of holding a
  // row that is no longer true.
  const [openId, setOpenId] = useState<string | null>(null);
  const open = runs.find((run) => run.id === openId) ?? null;

  const stackRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const shown = useRef<AgentRun | null>(null);

  useEffect(() => {
    // Both sides normalised to null, or the first render (`undefined` against
    // `null`) reads as a change and the bar takes focus off a page that was
    // only just painted.
    const previous = shown.current;
    if ((previous?.id ?? null) === (open?.id ?? null)) return;
    shown.current = open;

    const active = document.activeElement;
    if (active && active !== document.body) return;

    if (open) {
      detailRef.current?.focus({ preventScroll: true });
      return;
    }
    // The chip announces itself as "<name>, <state>, <task>", so its name is
    // the one thing this side knows about it. JSON.stringify quotes and
    // escapes the value, which is what an attribute selector needs.
    const prefix = previous ? JSON.stringify(`${previous.name}, `) : null;
    const chip = prefix ? stackRef.current?.querySelector<HTMLElement>(`[aria-label^=${prefix}]`) : null;
    (chip ?? stackRef.current)?.focus({ preventScroll: true });
  }, [open]);

  return (
    <div
      className={cn(AGENT_BAR_ROW, className)}
      onKeyDown={(event) => {
        // The detail handles Escape inside itself and stops it there; this is
        // the same key from the rest of the bar, and it stops here for the
        // same reason: one Escape closes one thing, and the composer sits on
        // routes that close their own on it.
        if (event.key !== "Escape" || !open) return;
        event.stopPropagation();
        setOpenId(null);
      }}
    >
      {open ? (
        // Keyed on the run so a different agent arrives on its own fade
        // rather than swapping its words in place.
        <div
          key={open.id}
          ref={detailRef}
          tabIndex={-1}
          className="flex h-full min-w-0 flex-1 items-center outline-none"
        >
          <AgentDetail run={open} onBack={() => setOpenId(null)} claimFocus className={AGENT_BAR_DETAIL} />
        </div>
      ) : (
        <div
          ref={stackRef}
          tabIndex={-1}
          className={cn(REVEAL, "flex h-full min-w-0 flex-1 items-center justify-end outline-none")}
        >
          {/* No `activeId`: the stack and the detail are never on screen
              together, so there is never a chip to mark as the open one. */}
          <AgentStack runs={runs} max={max} onSelect={(run: AgentRun) => setOpenId(run.id)} />
        </div>
      )}
    </div>
  );
}
