"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RoomAvatar } from "@/components/rooms/room-avatar";
import { workingLabelForTask } from "@/lib/mock/room-reasoning";
import type { RoomMember } from "@/lib/mock/rooms";

// A task that is still running, standing in the thread it came out of.
//
// It is a room message row in every metric — the 36px face in its own gutter,
// the name, the clock column, a body under them (room-message.tsx) — because
// it sits in the same column as the replies and a live thing that broke that
// rhythm would read as chrome dropped on the conversation rather than as the
// next line of it.
//
// WHAT IT IS NOT IS A MESSAGE. Nothing was said here: an agent is part way
// through work somebody asked for, and this row is the only place in the room
// that says so while it is still true. So the body is one line of status in
// the tool-call idiom (thread/tool-call-row.tsx) — the state, a middot, the
// step it is on — rather than prose, and it sits one tier below the body of a
// real message, because status is not speech.
//
// THE SHIMMER CROSSES THE CELL, NOT THE WORDS. The product's running-label
// device (thread/shimmer.ts) clips its band to the glyphs, which is right for
// a label inside a sentence: there, the thing that is running IS the word, and
// sweeping the box around it would light up a rectangle nobody drew. Here the
// thing that is running is the ROW — a face, a name, a clock and a status line
// that are one live object — so the band is a layer over the whole cell, the
// face included, and the text underneath keeps its ordinary tiers.
//
// Two consequences worth naming, because they are the reasons this is simpler
// than the text version rather than a sloppier one. Nothing is transparent, so
// there is no failure mode where the row paints as invisible text; and nothing
// has to be measured, because a band sized to the cell does not care how long
// the status line is, where the text version had to be cut per character and
// re-cut for whichever run was longest.
//
// It is the repo's own `@keyframes shimmer` (globals.css), which moves
// `background-position` from -200% to 200% across a 200% tile: four element
// widths of travel over two whole tiles, so the loop closes with no seam and
// the band crosses twice a cycle. `reverse` sends it left to right, with the
// reading. The tint is the one the tracker's pulse sweeps with, so the two
// live signals in this feature are made of the same light. Under
// `motion-reduce:` the layer is not drawn at all and the cell is a quiet row
// that says "Working" in words, which was always the part carrying the
// meaning.
//
// AND IT IS A CONTROL WHERE THERE IS SOMEWHERE TO GO. Clicking opens what the
// agent is actually doing, its rows and its prose, in the rail the cell is
// already in (room-agent-thread.tsx). A task nothing has written a turn for
// gets the same cell with no press, no hover and no tab stop: a row that looks
// pressable and answers nothing is worse than a row that never offered.

/** The one row of the board the rail needs in order to draw a live cell. */
export type RoomWorkingTask = {
  /** `RoomTask.id`, which is what the status line and the turn are keyed on. */
  taskId: string;
  /** Who is working: the face and the name, the same pair a message row uses. */
  member: RoomMember;
  /** The task's own title, for the control's name (below). */
  title: string;
  /** How long it has been going ("42m ago"). */
  time: string;
};

/** The row, as both shapes wear it. `relative` and `overflow-hidden` are for
    the band: it is an inset layer, and the cell is what clips it. */
const ROW =
  "relative flex w-full items-start gap-3 overflow-hidden px-4 py-2 text-left text-muted-foreground";

/** The band. One full crossing every 1.3s, which is two to a cycle. */
const SWEEP =
  "pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-tint-20 to-transparent " +
  "[background-size:200%_100%] motion-safe:animate-[shimmer_2600ms_linear_infinite_reverse] motion-reduce:hidden";

export function RoomWorkingMessage({
  taskId,
  member,
  title,
  time,
  onOpen,
  className,
}: RoomWorkingTask & {
  /** Open what it is doing. Omitted, the cell is a line rather than a control. */
  onOpen?: () => void;
  className?: string;
}): ReactNode {
  // The mock's last tool-call label, which is the step it is on right now. It
  // is allowed to be missing: a task whose agent is working somewhere this
  // room does not follow still has a state, and the state is the whole line.
  const step = workingLabelForTask(taskId);

  const content = (
    <>
      <span aria-hidden="true" className={SWEEP} />

      <div className="w-9 shrink-0">
        <RoomAvatar member={member} size="lg" />
      </div>

      <span className="min-w-0 flex-1">
        {/* The message row's own two tiers: the name at the body size in tier
            1, the clock beside it in tier 3 (room-message.tsx). Nothing here
            is transparent — the band is a layer above, not a clip. */}
        <span className="block truncate leading-6">
          <span className="text-base font-semibold text-foreground">{member.name}</span>
          <span className="ml-2 text-xs tabular-nums text-foreground-low">{time}</span>
        </span>
        {/* The rail is 400px, so the line truncates; what is lost is the tail
            of the step, and the control's name below carries the whole of it. */}
        <span className="mt-0.5 block truncate text-sm">
          <span className="font-medium">Working</span>
          {step ? (
            <>
              <span className="mx-1.5" aria-hidden="true">
                ·
              </span>
              {step}
            </>
          ) : null}
        </span>
      </span>
    </>
  );

  if (!onOpen) {
    return (
      <div data-slot="room-working-message" className={cn(ROW, className)}>
        {content}
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="none"
      data-slot="room-working-message"
      onClick={onOpen}
      // The line on screen says what is happening; the name has to say what it
      // is happening TO, because the task's title is nowhere in the cell. The
      // destination is last, the order every other way out of this feature
      // spells it (composer/agent-status/agent-detail.tsx).
      aria-label={`${member.name} is working on ${title}${step ? `, ${step.toLowerCase()}` : ""} — open what it is doing`}
      className={cn(
        ROW,
        // The row is full bleed like a message, so the hover fill reaches the
        // rail's edges the way every other row's does. `ring-offset-0` because
        // the default ring is drawn 2px OUTSIDE the box, and 2px outside a
        // full-bleed row is under the rail's own edge.
        "justify-start rounded-none font-normal hover:bg-tint-5 focus-visible:ring-offset-0",
        className,
      )}
    >
      {content}
    </Button>
  );
}
