"use client";

import { useEffect, useRef } from "react";
import { IconArrowLeft, IconArrowUpRight, IconPlayerStopFilled } from "@tabler/icons-react";

import { AgentGlyph } from "@/components/brand/agent-glyph";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { RUN_STATES } from "./run-state";
import { StateDial } from "./state-dial";
import type { AgentRun } from "./types";

// One agent, opened out inside the bar it was a chip in — and, when that agent
// is doing more than one thing, everything it is doing, stacked.
//
// The rule this variant inherits from the "Working… / Stop" strip
// (composer-status.tsx) is that the bar never animates its height: it is
// layout, the composer is docked at the bottom of the screen, and a row that
// eased open would drag the field's top edge for no information. Expanding an
// agent here is the same promise kept one level deeper — the bar does not
// GROW to hold the detail, its CONTENTS swap. So a one-task row is the
// collapsed bar's own box, to the pixel (36px, one hairline under it, 16px of
// side padding), and only the things inside it fade in.
//
// A STACK IS THE ONE THING THAT CHANGES THE BOX, and it is worth it. An agent
// on four tasks is four chips in the stack, because the board is per task and
// a readout that collapsed them could not say Media Lab Director is stuck on
// one render and fine on another — that sentence is the whole reason the board
// exists, and the bar would be undoing it at the last moment. So picking any
// one of that agent's chips opens all of them, one line each. The box gets
// taller, it does not animate getting taller, and the rule it keeps is the
// real one: nothing MOVES under the reader's hands. The field below it stays
// exactly where it was; the bar grows upward, into the thread, which is the
// direction with somewhere to go.
//
// ONE FIGURE, MANY LINES. The agent is drawn once, at the top, because it is
// one agent: repeating the glyph and the name down the left would read as four
// agents who happen to share a face. What repeats is what differs — the dial,
// the task, its parameter, and the way to its card. The count sits at the end
// of the identity line, where a single run puts its state, so the top line
// always answers "how much of this is there".
//
// Reading order on a single row, left to right: back, who, how far, what, and
// last, at the far right, the state as a WORD. That word is the point.
// Everywhere else in this bar the state is a colour: a tinted glyph, a ring,
// an amber dial. Here it is readable, so the fleet stays usable for someone
// who cannot separate the hues, and the colour is confirmation rather than the
// whole message.
//
// UNLESS THE RUN HAS A CARD, in which case that last slot is a way out instead
// of a full stop. "Done" at the end of a row is the least useful true thing
// the bar can say: the dial in front of the name already said it, in the same
// hue, 200px to the left. Where the run is a task on the room's board, the
// slot becomes the link to it — an arrow that leaves the plane and no words at
// all (docs/brand/icons.md: an arrow goes, a chevron reveals), in the quiet
// pair the back control wears rather than in the state's tint. A stack would
// otherwise end in four coloured arrows down its right edge, and four hues in
// a column read as four more state marks: the colour belongs to the dial and
// the figure, and the arrow is a way out, which is the same sentence in every
// state. The state is not lost for anyone who could not read the hue: it is in
// the control's accessible name, which spells out the agent, the state and the
// destination in that order.
//
// The words themselves are a tool-call row's (thread/tool-call-row.tsx): a
// name at weight 500, the task in the muted tier, then the one parameter after
// a middot on the tier below, truncated. Same idiom, same restraint — brand
// rule 8 keeps status quiet, and this row is a sibling of that one, not a
// banner.

/** The content's arrival. Never the box: see the note above. */
const ENTER = "animate-in fade-in-0 duration-(--duration-enter) ease-out-quart motion-reduce:animate-none";

/** The line height every task line keeps, single or stacked, so a stack is an
    exact multiple of the row it grew out of rather than a looser version. */
const LINE = "flex h-6 min-w-0 items-center gap-1.5 text-xs";

/** The task and its one parameter, as one run of text with one ellipsis. */
function TaskText({ run }: { run: AgentRun }) {
  return (
    // `title` is the promise truncation makes good — the whole sentence is a
    // hover away. A plain title rather than the Tooltip primitive because this
    // is text, not a control: a Tooltip needs a focusable trigger, which would
    // put a second stop in the bar's tab order for no action.
    <span className="truncate text-muted-foreground" title={run.detail ? `${run.task} · ${run.detail}` : run.task}>
      {run.task}
      {run.detail && (
        <>
          <span className="mx-1.5 text-foreground-low" aria-hidden="true">
            ·
          </span>
          <span className="text-foreground-low">{run.detail}</span>
        </>
      )}
    </span>
  );
}

/**
 * The end of a line: stop it, go to its card, or — for a run with neither —
 * the state as a word.
 *
 * STOP BELONGS TO ONE RUN, which is the whole reason it is here rather than on
 * the bar. The strip this variant replaces spends its right edge on a single
 * ghost Stop, and a fleet makes that control a question it cannot answer:
 * stop WHICH one. So it moved down to the line that names the work, where
 * "stop" has exactly one meaning.
 *
 * ONLY WHILE SOMETHING IS RUNNING. The other three states have already
 * stopped — done, waiting on you, stuck — so a Stop beside them would be a
 * control with nothing to do, which is the same lie as a Stop that stops
 * nothing (composer-status.tsx says it in those words). It sits BEFORE the
 * arrow because the two are not peers: stopping is the destructive one and
 * the arrow is the safe one, and a reader who overshoots the last control on
 * a line should land on the harmless one.
 *
 * IT IS AS NEUTRAL AS THE ARROW. A red Stop on a hueless `running` row would
 * put the loudest colour in the bar on the one state that deliberately spends
 * none, and it would read as the state rather than as the action. The muted
 * tier for both, and the hover is the only thing that separates them.
 */
function RunEnd({
  run,
  onEnd,
  onOpenTask,
  className,
}: {
  run: AgentRun;
  /** Stop this run. Only ever shown on `running`; omit and there is no Stop. */
  onEnd?: () => void;
  onOpenTask?: () => void;
  className?: string;
}) {
  const { label, tint } = RUN_STATES[run.state];
  const stop =
    run.state === "running" && onEnd ? (
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={onEnd}
        aria-label={`Stop ${run.name}: ${run.task}`}
        className="shrink-0 text-muted-foreground hover:text-foreground"
      >
        <IconPlayerStopFilled className="size-3.5" aria-hidden="true" />
      </Button>
    ) : null;

  if (!onOpenTask) {
    if (!stop) return <span className={cn("shrink-0 text-xs", tint, className)}>{label}</span>;
    return (
      <span className={cn("flex shrink-0 items-center gap-0.5", className)}>
        {stop}
        <span className={cn("text-xs", tint)}>{label}</span>
      </span>
    );
  }

  return (
    <span className={cn("flex shrink-0 items-center gap-0.5", className)}>
      {stop}
      {/* The back control's own size, at the other end of the same line:
          `icon-xs` is a 24px square, which is the line exactly, so an icon-only
          control adds nothing between the lines of a stack and the row keeps
          its height. `icon-xs` sets no icon size of its own and the Button base
          shrinks any svg that carries none, so the `size-3.5` is load-bearing.
          Both controls are that size, so a running line ends in two equal
          squares rather than in a pair that has to be read for weight. */}
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={onOpenTask}
        aria-label={`${run.name}, ${label} — open this task on the board`}
        className="-mr-1.5 shrink-0 text-muted-foreground hover:text-foreground"
      >
        <IconArrowUpRight className="size-3.5" aria-hidden="true" />
      </Button>
    </span>
  );
}

export function AgentDetail({
  runs,
  onBack,
  onOpenTask,
  onEndRun,
  claimFocus = false,
  className,
}: {
  /**
   * Everything this agent has out, the order the stack sorted it in. One run
   * is the bar's own 36px row; more than one is the stack, and the caller is
   * the one that decided they belong to the same agent.
   */
  runs: readonly AgentRun[];
  /** Back to the stack. */
  onBack: () => void;
  /**
   * Where a run's work is written down, asked per run because a stack
   * routinely mixes work the board has a card for with work it does not.
   * Returning nothing leaves that line's state word where it was.
   */
  onOpenTask?: (run: AgentRun) => (() => void) | undefined;
  /** Stop one run. Only reaches the lines that are actually running. */
  onEndRun?: (run: AgentRun) => void;
  /**
   * This row opened because someone picked a chip, so it may take the focus
   * that chip left behind. Off by default: a row rendered cold — a specimen
   * on a design page, a server-rendered bar — is not the answer to anything a
   * person just did, and must not pull focus out of whatever they were using.
   */
  claimFocus?: boolean;
  className?: string;
}): React.ReactElement | null {
  const backRef = useRef<HTMLButtonElement>(null);

  // Half the focus contract. Opening the detail unmounts the chip that was
  // clicked, and the browser drops focus to the body when the focused element
  // leaves the DOM — a keyboard user would land back at the top of the page on
  // their next Tab. So: if focus has fallen to nothing, this row picks it up
  // on the back control, which is both the way out and the first thing in the
  // bar. The guard is the whole point of the effect — focus is only claimed
  // when it is already lost, and only when the caller says this row is the
  // answer to a click, so a mouse user in a browser that does not focus
  // buttons on click keeps whatever they had. The `claimFocus` half matters on
  // a page that renders a specimen of this row: `document.activeElement` is
  // the body on every freshly painted page, so the lost-focus test alone reads
  // a cold mount as a click and quietly takes the page's focus on load.
  // preventScroll because the composer is docked: focusing a control 36px
  // above the field must not scroll the thread behind it.
  useEffect(() => {
    if (!claimFocus) return;
    const active = document.activeElement;
    if (active && active !== document.body) return;
    backRef.current?.focus({ preventScroll: true });
  }, [claimFocus]);

  const lead = runs[0];
  if (!lead) return null;
  const stacked = runs.length > 1;
  // The identity is the agent's, so it comes off the first run and the rest
  // agree with it by construction — the caller grouped them.
  const { tone } = RUN_STATES[lead.state];

  const back = (
    // 24px in a 36px row, the same reasoning as the Stop button it replaces: a
    // full-height control would touch the hairline. An arrow, not a chevron —
    // a chevron reveals in place, an arrow goes back (docs/brand/icons.md) —
    // and the name says where it goes, because "Back" alone is a direction,
    // not a destination.
    <Button
      ref={backRef}
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label="Back to all agents"
      onClick={onBack}
      className={cn("-ml-1.5 shrink-0 text-muted-foreground hover:text-foreground", ENTER)}
    >
      <IconArrowLeft className="size-3.5" aria-hidden="true" />
    </Button>
  );

  // The glyph carries no label, which is how AgentGlyph knows to mark itself
  // aria-hidden: the name is one span away in words, and an avatar that
  // announced itself would read as a second agent. It is TILED here, unlike
  // the chip's bare figure, and the tile is the `avatar` tone — the one
  // colourway that follows the theme (agent-glyph/tones.ts) — so a 20px paper
  // square does not sit in a dark bar for the same reason the discs no longer
  // do. On a stack the tile takes the LEAD run's tone, which is the loudest
  // state this agent is in, because that is the one the figure is answering
  // for.
  const face = <AgentGlyph shape={lead.glyph} size={20} tone={tone} className={cn("shrink-0", ENTER)} />;

  if (!stacked) {
    return (
      <div
        className={cn("flex h-9 min-w-0 items-center gap-2 border-b border-border-subtle px-4", className)}
        onKeyDown={escapeGoesBack(onBack)}
      >
        {back}
        <span className={cn("flex shrink-0 items-center gap-1.5", ENTER)}>
          {face}
          <StateDial state={lead.state} progress={lead.progress} />
        </span>
        <span className={cn(LINE, "flex-1", ENTER)}>
          <span className="shrink-0 font-medium text-foreground">{lead.name}</span>
          <TaskText run={lead} />
        </span>
        <RunEnd
          run={lead}
          onEnd={onEndRun ? () => onEndRun(lead) : undefined}
          onOpenTask={onOpenTask?.(lead)}
          className={ENTER}
        />
      </div>
    );
  }

  return (
    <div
      // `py-1.5` over `h-9`: the box is however tall its lines are. Same 16px
      // sides and the same hairline, so the bar is the one that grew rather
      // than a different component having been swapped in.
      className={cn("flex min-w-0 flex-col gap-1 border-b border-border-subtle px-4 py-1.5", className)}
      onKeyDown={escapeGoesBack(onBack)}
    >
      <div className={cn(LINE, ENTER)}>
        {back}
        {face}
        <span className="flex-1 truncate font-medium text-foreground">{lead.name}</span>
        {/* Where a single run puts its state. It is a count, not a control:
            every line below is its own way in, and a fifth thing to click at
            the end of the top line would be one too many. */}
        <span className="shrink-0 text-xs text-foreground-low tabular-nums">{runs.length} tasks</span>
      </div>

      {/* One line per task, indented to the column the name started, so the
          figure above reads as presiding over them rather than as belonging to
          the first one. `list` because that is what it is, and a screen reader
          should hear how many before it hears the first. */}
      <ul aria-label={`${runs.length} tasks for ${lead.name}`} className="flex min-w-0 flex-col gap-0.5 pl-7">
        {runs.map((run) => (
          <li key={run.id} className={cn(LINE, ENTER)}>
            <StateDial state={run.state} progress={run.progress} />
            <span className="min-w-0 flex-1">
              <TaskText run={run} />
            </span>
            <RunEnd run={run} onEnd={onEndRun ? () => onEndRun(run) : undefined} onOpenTask={onOpenTask?.(run)} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Escape goes back, but only from inside the row: the handler sits on the
    bar, so pressing it in the field still belongs to the composer. It stops
    there rather than bubbling on, because one Escape should close one thing. */
function escapeGoesBack(onBack: () => void) {
  return (event: React.KeyboardEvent) => {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    onBack();
  };
}
