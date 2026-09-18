"use client";

import { useEffect, useRef, useState } from "react";

import { AgentDetail } from "@/components/composer/agent-status/agent-detail";
import { AgentStack } from "@/components/composer/agent-status/agent-stack";
import { sameAgent, STACK_MAX } from "@/components/composer/agent-status/fold";
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
// AND IT OPENS THE AGENT. The stack is one face per agent, wearing its
// loudest run (fold.ts), and the detail is that agent's every run: having
// clicked a face, the question is "what is this one doing", and answering with
// one of its four tasks would be answering a narrower question than the one
// asked. The board is per task, and the list is where that survives — an agent
// stuck on one render while fine on another says so a line each. So the
// picked run leads and its siblings follow it in the stack's own order, and
// the row that opens is as tall as that takes.
//
// A CHIP IS A NAVIGATION ONLY WHEN THERE IS NOTHING TO CHOOSE. One run behind
// a figure means the chip has exactly one destination, so picking it does both
// things a person wants from a figure they just spotted: the bar swaps to that
// agent's detail, and the surface behind the composer goes to where the work
// actually is (`onOpen`). The detail is then the receipt for the jump rather
// than a menu to read, and the back arrow undoes the disclosure without undoing
// the navigation, which is the right asymmetry — you can stop reading about an
// agent while still standing in its thread.
//
// FOUR RUNS BEHIND THE FIGURE AND THAT SAME CLICK IS A GUESS. What opens is a
// list of four tasks to choose between, and a bar that had already jumped to
// one of them answered before the question was read: the rail swapped, the
// column scrolled, and a message the reader never asked for pulsed. It is also
// the one mistake reading cannot undo — having been sent somewhere, they have
// to work out WHICH of the four they were sent to before they can pick. So a
// chip for an agent holding more than one run opens the detail and moves
// nothing else. A chooser sits still while it is being read.
//
// WHICH LEAVES THE NAVIGATION ON THE ROW (`onOpenTask`), and it is the same
// trip the single chip makes, asked per task. A chip is an agent and a row is a
// task, and once an agent is holding four, the row is the only one of the two
// that can answer "which". On a single row the two land in the same place,
// which is exactly why that chip is allowed to go: there is nothing else it
// could have meant.
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
//
// THE +N UNFOLDS IN PLACE (agent-status/agent-stack.tsx): the counter becomes
// the discs it was counting and a chevron at the right edge folds them back,
// in the same 40px, never a second line. The state lives HERE rather than in
// the stack, because opening a chip unmounts the stack, and a reader who
// unfolded the row, opened one agent and came Back should land in the row
// they left — with the chip they picked still in it for focus to return to.
// Escape folds it too, after it has closed a detail: one key, one thing.
//
// AND FOCUS SURVIVES THE FOLD, under the same guard. Each of the two controls
// unmounts the moment it is pressed, so this is the same safety net: taken
// only when focus has already fallen to <body>, and handed to the nearest
// thing that means the same. From the keyboard, unfolding hands it to the
// first disc the counter stood for, which is where the counter was and what it
// was about, and folding hands it back to the counter, the control that undoes
// the fold. From a pointer it goes to the stack itself, because every control
// in this row opens its tooltip on focus (Radix does not ask how focus
// arrived), and a click on +7 that popped a tooltip over a disc the pointer is
// nowhere near reads as a glitch. The floor still keeps the place: the next
// Tab walks into the discs rather than restarting at the top of the page.

/** The bar's own row. Exported so a specimen can put something else in it
    without the 40px being typed a second time and drifting. */
export const AGENT_BAR_ROW = "flex h-10 min-w-0 items-center border-b border-border-subtle px-4";

/** The same row with the height let go, for the one thing that needs more than
    a line: an agent holding several tasks (agent-status/agent-detail.tsx). */
export const AGENT_BAR_ROW_TALL = "flex min-h-10 min-w-0 items-stretch border-b border-border-subtle px-4";

/** What the detail wears inside that row: its own box off, the bar's kept. */
export const AGENT_BAR_DETAIL = "h-full min-w-0 flex-1 border-b-0 px-0";

/** Everything the agent behind `run` has out, that run first and the rest in
    the order the bar was handed them. It answers both questions the bar asks
    about a picked chip — what the detail lists, and whether there was anything
    to choose — from one definition, so the list and the rule cannot drift. */
function agentGroup(runs: readonly AgentRun[], run: AgentRun): AgentRun[] {
  return [run, ...runs.filter((other) => other !== run && sameAgent(other, run))];
}

/** The fade the stack arrives on, the sibling strip's exactly. The detail
    fades its own contents in already and is left to do it. */
const REVEAL = "animate-in fade-in-0 duration-(--duration-enter) ease-out-quart motion-reduce:animate-none";

export function ComposerAgentStatus({
  runs,
  max = STACK_MAX,
  defaultExpanded = false,
  onOpen,
  onOpenTask,
  canOpenTask,
  onEndRun,
  className,
}: {
  runs: readonly AgentRun[];
  /** How many chips before the rest collapse into a count. */
  max?: number;
  /** Start with every chip on show, for a specimen of the unfolded row. The
      bar itself always opens folded. */
  defaultExpanded?: boolean;
  /**
   * Where the agent's work actually is. Called with the click that opens a
   * chip, but only for an agent whose whole presence in the bar is that one
   * run: with more than one, the detail that opens is a chooser and the choice
   * is the reader's (see the note above). Omitted, a chip only ever opens the
   * detail, which is what the bar does anywhere there is nowhere to go.
   */
  onOpen?: (run: AgentRun) => void;
  /**
   * Where one run's work is written down. Given, the last slot on that line in
   * the detail stops being the word "Done" and becomes the way there — and on
   * a stacked detail the whole line goes with it, because that list is what the
   * chip stopped answering for.
   */
  onOpenTask?: (run: AgentRun) => void;
  /**
   * Whether THIS run has somewhere to be opened. Asked per run, because a bar
   * routinely holds both kinds at once: work that came out of something
   * somebody said, and work that was only ever entered. Omitted, every run is
   * assumed to have somewhere.
   */
  canOpenTask?: (run: AgentRun) => boolean;
  /**
   * Stop one run. Reaches only the `running` lines of the opened detail, where
   * "stop" has exactly one meaning; the bar itself never carries a Stop,
   * because a fleet cannot answer "stop which one".
   */
  onEndRun?: (run: AgentRun) => void;
  className?: string;
}) {
  // The one piece of state in the bar: which agent is open. An id rather than
  // the run, so a fleet that changes under an open detail (the agent finished
  // and its run left the array) falls back to the stack instead of holding a
  // row that is no longer true.
  const [openId, setOpenId] = useState<string | null>(null);
  const open = runs.find((run) => run.id === openId) ?? null;
  // Whether the +N has been unfolded. Only true while there IS a +N: a fleet
  // that shrinks to fit leaves nothing folded, and the stack draws that folded
  // whatever this says (agent-stack.tsx), so the two are read together.
  const [expanded, setExpanded] = useState(defaultExpanded);
  const unfolded = expanded && runs.length > max;
  // The picked run leads, then the rest of that agent's work in the order the
  // stack already put it in, so the lines read the way the chips did.
  const openGroup = open ? agentGroup(runs, open) : [];

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

  // The fold's half of the contract (the note above). Seeded with the first
  // render's value, so a bar that mounts unfolded is not read as a change.
  const shownUnfolded = useRef(unfolded);
  // How the last press in the bar arrived. Set by the bar's own pointer-down
  // and key-down, both of which land before the click they turn into.
  const byPointer = useRef(false);
  useEffect(() => {
    if (shownUnfolded.current === unfolded) return;
    shownUnfolded.current = unfolded;

    const active = document.activeElement;
    if (active && active !== document.body) return;

    const stack = stackRef.current;
    const target = byPointer.current
      ? null
      : stack?.querySelector<HTMLElement>(
          unfolded ? "[data-revealed] button" : "button[aria-expanded='false'][aria-controls]",
        );
    (target ?? stack)?.focus({ preventScroll: true });
  }, [unfolded]);

  return (
    <div
      className={cn(openGroup.length > 1 ? AGENT_BAR_ROW_TALL : AGENT_BAR_ROW, className)}
      onPointerDownCapture={() => {
        byPointer.current = true;
      }}
      onKeyDown={(event) => {
        byPointer.current = false;
        // The detail handles Escape inside itself and stops it there; this is
        // the same key from the rest of the bar, and it stops here for the
        // same reason: one Escape closes one thing, and the composer sits on
        // routes that close their own on it.
        if (event.key !== "Escape" || !(open || unfolded)) return;
        event.stopPropagation();
        if (open) setOpenId(null);
        else setExpanded(false);
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
            onEndRun={onEndRun}
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
          {/* Folded, the count takes the slack and the stack keeps its width.
              Unfolded, the count keeps its words and the ROW takes the slack,
              scrolling inside it when a fleet is wider than the bar: the count
              is the bar's only spoken readout (§5.1), so it is the last thing
              that should be squeezed out of it. */}
          <RunCount runs={runs} className={unfolded ? "shrink-0" : "flex-1"} />
          {/* No `activeId`: the stack and the detail are never on screen
              together, so there is never a chip to mark as the open one. */}
          <AgentStack
            runs={runs}
            max={max}
            expanded={unfolded}
            onExpandedChange={setExpanded}
            className={unfolded ? "flex-1" : undefined}
            onSelect={(run: AgentRun) => {
              setOpenId(run.id);
              // The rule above, as one question about the row that is opening:
              // is there more than one line in it? `openGroup` cannot answer
              // yet — it is derived from state this click has only just set —
              // so the group is taken again here, from the same function, which
              // is what guarantees the count and the list agree.
              if (agentGroup(runs, run).length === 1) onOpen?.(run);
            }}
          />
        </div>
      )}
    </div>
  );
}
