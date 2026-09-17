"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DURATION, EASE, LAYOUT_TRANSITION } from "@/lib/motion";
import type { RoomTask } from "@/lib/mock/room-tracker";
import { RoomAvatar } from "@/components/rooms/room-avatar";
import { Pulse } from "@/components/rooms/tracker/pulse";
import { TASK_STATUS_META } from "@/components/rooms/tracker/task-status";
import { useRoomTracker } from "@/components/rooms/tracker/tracker-context";

// One task, one line: the face of whoever is on it, the title, the caption and,
// on the right, when it last moved. The group header above says the status, so
// the row does not repeat it, exactly as the /teams list row does not.
//
// THE GRID. Four tracks: a 20px face, the title (up to 18rem), the caption (the
// rest) and a fixed 7rem cluster on the right. The breakpoint is the list's own
// `@xl` (576px) rather than the `@3xl` /teams uses, because this list lives in a
// room column with a sidebar on one side and, often, a thread rail on the other:
// waiting for 768px would mean the caption almost never survives. Below it the
// row is face, title, time.
//
// A row whose task came out of a message goes back to it, the same rule the
// board card follows; one with no source is a plain line and takes no tab stop.
// `data-list-nav` is the list shell's keyboard contract (↑ and ↓ walk the rows
// and the group headers).
//
// The pulse is the board card's, at row height: one shared component so the
// two views answer the same question the same way (pulse.tsx, and
// docs/plans/2026-09-17-room-tracker.md §7).

const ROW_GRID =
  "grid items-center gap-x-3 grid-cols-[1.25rem_minmax(0,1fr)_auto] @xl/list:grid-cols-[1.25rem_minmax(0,18rem)_minmax(0,1fr)_7rem]";

const ENTER = { duration: DURATION.normal, ease: EASE.out };
const EXIT = { opacity: 0, transition: { duration: DURATION.exit, ease: EASE.out } };

export function TaskRow({ task }: { task: RoomTask }) {
  const { memberById, openMessage, pulse } = useRoomTracker();
  const member = memberById(task.assigneeId);
  const meta = TASK_STATUS_META[task.status];
  const source = task.sourceMessageId;
  // Same rule as the card: a pulse that named a task answers from that row
  // alone, a pulse that named an agent answers from all of them.
  const pulseToken = pulse && (pulse.taskId ? pulse.taskId === task.id : pulse.agentId === task.assigneeId)
    ? pulse.token
    : null;

  const steps = task.progress
    ? task.status === "queued"
      ? `${task.progress.total} steps planned`
      : `${task.progress.done} of ${task.progress.total} steps done`
    : null;

  const label = [
    task.title,
    task.caption ? `${meta.label}: ${task.caption}` : meta.label,
    steps,
    `${member?.name ?? "Former member"}, updated ${task.updated}`,
    source ? "Opens the message it came from" : null,
  ]
    .filter(Boolean)
    .join(". ");

  const body = (
    <>
      {member ? <RoomAvatar member={member} size="sm" /> : <span className="size-5" />}

      <span className="truncate text-sm font-medium text-foreground">{task.title}</span>

      <span className="hidden min-w-0 truncate text-md text-muted-foreground @xl/list:block">{task.caption}</span>

      <span className="flex min-w-0 items-center justify-end gap-3 text-md">
        <span className="whitespace-nowrap text-foreground-low tabular-nums">{task.updated}</span>
      </span>

      <Pulse token={pulseToken} />
    </>
  );

  const marks = { "data-task-id": task.id, "data-assignee": task.assigneeId, "data-status": task.status };

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={EXIT}
      transition={{ opacity: ENTER, layout: LAYOUT_TRANSITION }}
    >
      {source ? (
        <Button
          variant="ghost"
          size="none"
          data-list-nav=""
          {...marks}
          aria-label={label}
          onClick={() => openMessage(source)}
          className={cn(
            ROW_GRID,
            "relative h-10 w-full justify-normal rounded-lg px-3 text-left font-normal",
            "hover:bg-tint-7 active:bg-tint-10 motion-safe:active:scale-100",
            "focus-visible:bg-tint-7 focus-visible:ring-inset focus-visible:ring-offset-0",
            // Keyboard walking stops a row clear of the sticky group header (h-9).
            "scroll-mt-9 scroll-mb-3",
          )}
        >
          {body}
        </Button>
      ) : (
        // No `aria-label`: a span carries no role, so the name would be
        // dropped. The facts the row does not draw go in an sr-only span
        // instead, read in place.
        <span {...marks} className={cn(ROW_GRID, "relative h-10 w-full rounded-lg px-3")}>
          {body}
          <span className="sr-only">{label}</span>
        </span>
      )}
    </motion.li>
  );
}
