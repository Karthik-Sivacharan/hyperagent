"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RoomAvatar } from "@/components/rooms/room-avatar";
import { SHIMMER, sweepStyle } from "@/components/thread/shimmer";
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
// THE SHIMMER IS THE HOUSE ONE (thread/shimmer.ts): a flat base in the text's
// own colour under a soft band that travels, both clipped to the glyphs. The
// WHOLE cell wears it rather than the status word alone — the name and the
// clock sweep with the line under them, on two spans cut to the same width and
// mounted in the same frame, so one band appears to cross the cell and it
// reads as a single live object rather than a message with a blinking word in
// it. That is also why nothing inside those spans names a colour: under
// `motion-safe:` every word is transparent and painted by the band, so a child
// that set a tier would punch a solid hole in it. The tiers come back as
// weights, and literally under `motion-reduce:`, where the treatment is not
// applied at all and the cell is a message row again.
//
// THE FACE DOES NOT SHIMMER. It is artwork, not text, so there is nothing for
// `bg-clip-text` to clip to — and an avatar pulsing on its own would be a
// second signal saying the first one's sentence a beat out of step with it.
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

/** The row, as both shapes wear it. `text-muted-foreground` is the resting
    colour the shimmer's base is set to, and the colour the whole column falls
    back to under reduced motion. */
const ROW = "flex w-full items-start gap-3 px-4 py-2 text-left text-muted-foreground";

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
  const status = step ? `Working · ${step}` : "Working";

  // The band is sized off the longest run of text in the column, so a cell
  // whose status line is twice the name's length is not swept by a band cut
  // for the name (shimmer.ts sizes it per character).
  const sweep = sweepStyle(
    Math.max(status.length, member.name.length),
    "var(--color-foreground)",
    "var(--color-muted-foreground)",
  );

  const content = (
    <>
      <div className="w-9 shrink-0">
        <RoomAvatar member={member} size="lg" />
      </div>

      <span className="min-w-0 flex-1">
        {/* Both lines are their own sweep, and both are one inline run of text
            with nothing blockish inside them. `background-clip: text` is a
            paint-time clip: an element's own `overflow` is safe (it is what
            `truncate` sets, and a clipped label with an ellipsis is ordinary),
            but a block descendant inside the clipped box is the shape that
            breaks it, and the failure mode is transparent text on no
            background — an invisible row. The two spans are the same width and
            mount in the same frame, so their bands run in step and read as one
            crossing the cell. */}
        <span className={cn("block truncate leading-6", SHIMMER)} style={sweep}>
          <span className="text-base font-semibold motion-reduce:text-foreground">{member.name}</span>
          {/* Both `motion-reduce:` colours are the tiers coming back where the
              band is not there to carry them (see above). */}
          <span className="ml-2 text-xs tabular-nums motion-reduce:text-foreground-low">{time}</span>
        </span>
        {/* The rail is 400px, so the line truncates; what is lost is the tail
            of the step, and the control's name below carries the whole of it. */}
        <span className={cn("mt-0.5 block truncate text-sm", SHIMMER)} style={sweep}>
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
