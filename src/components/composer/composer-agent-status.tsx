"use client";

import { useEffect, useRef, useState } from "react";

import { AgentDetail } from "@/components/composer/agent-status/agent-detail";
import { AgentStack } from "@/components/composer/agent-status/agent-stack";
import { RunCount } from "@/components/composer/agent-status/run-count";
import type { AgentRun } from "@/components/composer/agent-status/types";
import { cn } from "@/lib/utils";

// The composer's agent bar: the strip a composer grows when more than one
// agent is out. It goes in the same `status` slot as ComposerWorkingStatus
// (composer-status.tsx) and is its sibling in every material — one hairline
// underneath, the same 16px sides, a height fixed before anything is drawn in
// it — and it holds the variant's two views: the stack, and one agent opened
// out of it.
//
// THE LEFT CARRIES A COUNT, AND THAT IS THE VARIANT. The strip this replaces
// spends its left on three pulsing dots and the word "Working…", and its right
// on a ghost Stop. Both say the same thing, "something is happening", and
// neither says which thing, how many, or whether any of them has stopped and
// is waiting on you. Four figures wearing their own states answer two of those
// three without a word, so the dots went and the whole readout moved to the
// right edge, where the send arrow already is. Stop went too, but it did not
// disappear: it belongs to ONE agent rather than to the composer, so it is
// inside that agent's detail, one click from the chip that names it.
//
// AND IT OPENS THE AGENT, NOT THE CHIP. The stack is per RUN, because the
// board is per task and an agent stuck on one render while fine on another is
// the sentence the whole tracker exists to say. The detail is per AGENT, for
// the same reason from the other end: having clicked a face, the question is
// "what is this one doing", and answering with one of its four tasks would be
// answering a narrower question than the one asked. So the picked run leads
// and its siblings follow it in the stack's own order, and the row that opens
// is as tall as that takes.
//
// PICKING A CHIP IS A NAVIGATION, not just a disclosure. One click does both
// things a person wants from a figure they just spotted: the bar swaps to that
// agent's detail, and the surface behind the composer goes to where the agent
// is actually working (`onOpen`). There is no second control for the second
// half — a "go to thread" button in the detail would be a click asking for a
// click, and the row is 36px with four things in it already. The detail is
// then the receipt for the jump rather than a menu to read: it names the agent
// you are now looking at, and the back arrow undoes the disclosure without
// undoing the navigation, which is the right asymmetry — you can stop reading
// about an agent while still standing in its thread.
//
// What came back to the left is the one thing the stack genuinely cannot say:
// HOW MANY. Three discs and a "+3" is six agents, and nobody reads that sum
// off a row of overlapping circles. So the left is a count and a tense — "6
// agents working", shimmering on the product's own running-label device while
// anything is still out, plain and past-tense once the last one lands
// (agent-status/run-count.tsx). It is also the bar's only spoken readout,
// which is what keeps the state hues confirmation rather than the message.
// The detail still opens over it, so the count is the room the detail uses.
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

/** The same row with the height let go, for the one thing that needs more than
    a line: an agent holding several tasks (agent-status/agent-detail.tsx). */
export const AGENT_BAR_ROW_TALL = "flex min-h-10 min-w-0 items-stretch border-b border-border-subtle px-4";

/** What the detail wears inside that row: its own box off, the bar's kept. */
export const AGENT_BAR_DETAIL = "h-full min-w-0 flex-1 border-b-0 px-0";

/** One agent's runs, by the id it carries or, failing that, by its name — the
    only other thing on a run that belongs to the agent and not to the work. */
function sameAgent(a: AgentRun, b: AgentRun): boolean {
  return a.agentId && b.agentId ? a.agentId === b.agentId : a.name === b.name;
}

/** The fade the stack arrives on, the sibling strip's exactly. The detail
    fades its own contents in already and is left to do it. */
const REVEAL = "animate-in fade-in-0 duration-(--duration-enter) ease-out-quart motion-reduce:animate-none";

export function ComposerAgentStatus({
  runs,
  max,
  onOpen,
  onOpenTask,
  canOpenTask,
  className,
}: {
  runs: readonly AgentRun[];
  /** How many chips before the rest collapse into a count. */
  max?: number;
  /**
   * Where the agent's work actually is. Called with the same click that opens
   * the chip, so picking a figure both explains it here and puts its
   * conversation on screen. Omitted, the chip only opens the detail, which is
   * what the bar does anywhere there is nowhere to go.
   */
  onOpen?: (run: AgentRun) => void;
  /**
   * Where the opened run is written down. Given, the last slot in the detail
   * stops being the word "Done" and becomes the way to that card.
   */
  onOpenTask?: (run: AgentRun) => void;
  /**
   * Whether THIS run has somewhere to be opened. Asked per run, because a bar
   * routinely holds both kinds at once: work the board has a card for, and a
   * run something just started that it does not. Omitted, every run is assumed
   * to have one.
   */
  canOpenTask?: (run: AgentRun) => boolean;
  className?: string;
}) {
  // The one piece of state in the bar: which agent is open. An id rather than
  // the run, so a fleet that changes under an open detail (the agent finished
  // and its run left the array) falls back to the stack instead of holding a
  // row that is no longer true.
  const [openId, setOpenId] = useState<string | null>(null);
  const open = runs.find((run) => run.id === openId) ?? null;
  // The picked run leads, then the rest of that agent's work in the order the
  // stack already put it in, so the lines read the way the chips did.
  const openGroup = open ? [open, ...runs.filter((run) => run !== open && sameAgent(run, open))] : [];

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
      className={cn(openGroup.length > 1 ? AGENT_BAR_ROW_TALL : AGENT_BAR_ROW, className)}
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
          className="flex h-full min-w-0 flex-1 items-stretch outline-none"
        >
          <AgentDetail
            runs={openGroup}
            onBack={() => setOpenId(null)}
            onOpenTask={
              onOpenTask
                ? (run) => ((canOpenTask?.(run) ?? true) ? () => onOpenTask(run) : undefined)
                : undefined
            }
            claimFocus
            className={AGENT_BAR_DETAIL}
          />
        </div>
      ) : (
        <div
          ref={stackRef}
          tabIndex={-1}
          className={cn(REVEAL, "flex h-full min-w-0 flex-1 items-center gap-3 outline-none")}
        >
          <RunCount runs={runs} className="flex-1" />
          {/* No `activeId`: the stack and the detail are never on screen
              together, so there is never a chip to mark as the open one. */}
          <AgentStack
            runs={runs}
            max={max}
            onSelect={(run: AgentRun) => {
              setOpenId(run.id);
              onOpen?.(run);
            }}
          />
        </div>
      )}
    </div>
  );
}
