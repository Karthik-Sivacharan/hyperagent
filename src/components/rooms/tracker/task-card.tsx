"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import type { RoomTask } from "@/lib/mock/room-tracker";
import { RoomAvatar } from "@/components/rooms/room-avatar";
import { Pulse } from "@/components/rooms/tracker/pulse";
import { TASK_STATUS_META } from "@/components/rooms/tracker/task-status";
import { useRoomTracker } from "@/components/rooms/tracker/tracker-context";

// One task on the room's board, in three lines: the title (two lines at most),
// the caption (one line of state in words) and a footer with whoever is on it
// and how fresh it is. The shell is the board card /teams settled on: the
// native interactive `Card`, 18px corners, `p-3`, the shadow lifting on hover
// and nothing else moving. The card never grows.
//
// NO STATUS GLYPH ON THE CARD. The lane header above it already carries the
// status, its glyph and its hue, and the list's group header does the same;
// repeating it on every card would spend the board's whole colour budget on
// the thing that is already answered by where the card is sitting
// (docs/plans/2026-09-17-room-tracker.md §3). The steps a working or queued
// task has made are in the accessible description rather than on a meter, for
// the same reason the caption is words: a board of five lanes does not need a
// sixth thing to read.
//
// WHAT A CLICK DOES. A task that came out of a message is a button that goes
// back to it; the room is the point, and the conversation is where the rest of
// the answer lives. A task with no source message is a plain card and does not
// pretend to be pressable. Nothing is nested inside either shape, so the whole
// card is one tab stop or none.
//
// THE PULSE. When someone clicks an agent in the conversation, that agent's
// cards answer once (§7). The animation itself is `pulse.tsx`, shared with the
// list row and the message row, so the answer looks the same whichever
// direction the reader asked from; the card only says which token it is on.

export function TaskCard({ task }: { task: RoomTask }) {
  const { memberById, openMessage, pulse } = useRoomTracker();
  const member = memberById(task.assigneeId);
  const meta = TASK_STATUS_META[task.status];
  const titleId = React.useId();
  const detailId = React.useId();

  const pulseToken = pulse && pulse.agentId === task.assigneeId ? pulse.token : null;
  const source = task.sourceMessageId;

  const body = (
    <>
      <span id={titleId} className="line-clamp-2 text-sm font-medium text-pretty text-foreground">
        {task.title}
      </span>

      {task.caption ? (
        <span className="mt-0.5 block truncate text-md text-muted-foreground">{task.caption}</span>
      ) : null}

      <span className="mt-3 flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-1.5">
          {member ? <RoomAvatar member={member} size="sm" /> : null}
          <span className="truncate text-md text-muted-foreground">{member?.name ?? "Former member"}</span>
        </span>
        <span className="shrink-0 text-md text-foreground-low tabular-nums">{task.updated}</span>
      </span>

      <span id={detailId} className="sr-only">
        {describeTask(task, meta.label, member?.name, Boolean(source))}
      </span>

      <Pulse token={pulseToken} radius="2xl" />
    </>
  );

  // `data-tracker-card` is the board shell's keyboard contract (it walks the
  // cards with the arrow keys); `data-assignee` is how the panel finds the
  // first card to scroll to when a pulse arrives.
  const marks = {
    "data-tracker-card": "",
    "data-assignee": task.assigneeId,
    "data-status": task.status,
  };

  if (!source) {
    // A plain div, so no `aria-labelledby`: the card is read in source order
    // and the description below is the last thing in it.
    return (
      <Card size="none" {...marks} className="relative w-full rounded-2xl p-3 text-left">
        {body}
      </Card>
    );
  }

  return (
    <Card
      asChild
      size="none"
      variant="interactive"
      className="relative w-full scroll-mx-6 scroll-mt-12 scroll-mb-6 cursor-pointer rounded-2xl p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <button type="button" {...marks} aria-labelledby={titleId} aria-describedby={detailId} onClick={() => openMessage(source)}>
        {body}
      </button>
    </Card>
  );
}

/** Everything the card no longer draws, in sentences, plus where a click goes. */
function describeTask(task: RoomTask, status: string, name: string | undefined, linked: boolean) {
  const sentences = [
    task.caption ? `${status}: ${task.caption}` : status,
    `${name ?? "Former member"}, updated ${task.updated}`,
  ];
  if (task.progress) {
    const { done, total } = task.progress;
    sentences.push(task.status === "queued" ? `${total} steps planned` : `${done} of ${total} steps done`);
  }
  if (linked) sentences.push("Opens the message it came from");
  return `${sentences.join(". ")}.`;
}
