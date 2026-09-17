"use client";

import * as React from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { IconChecklist, IconSearch } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/patterns/empty-state";
import { DURATION, EASE } from "@/lib/motion";
import { TASK_STATUS_ORDER } from "@/lib/mock/room-tracker";
import { TrackerBoard } from "@/components/tracker/board/tracker-board";
import { TrackerList } from "@/components/tracker/list/tracker-list";
import { TASK_EMPTY_COPY, TASK_STATUS_META } from "@/components/rooms/tracker/task-status";
import { TaskCard } from "@/components/rooms/tracker/task-card";
import { TaskRow } from "@/components/rooms/tracker/task-row";
import { TrackerToolbar } from "@/components/rooms/tracker/tracker-toolbar";
import { useRoomTracker } from "@/components/rooms/tracker/tracker-context";

// The Tracker tab: the toolbar, then the room's tasks as a board or a list.
// Both are the shared tracker shell (docs/plans/2026-09-17-room-tracker.md §5),
// which is the same shell /teams renders into; only the card and the row below
// are the room's own.
//
// The board runs at `compact` density. A room column has the sidebar on one
// side and, when a thread is open, the rail on the other, so the lanes are
// given less width to reach before the board scrolls sideways than a full page
// would give them. Done is folded at rest, which is what keeps four lanes in
// view at the width a room usually has.
//
// THE PULSE LANDS HERE. The provider says which agent was asked about and which
// ask this is; the cards draw it. This file does the two things neither of them
// can: it scrolls the first of that agent's cards into view, because an answer
// below the fold is not an answer, and it says the answer in words in a polite
// live region, because a pulse nobody can see is nothing. Switching views
// re-runs the scroll, so the answer survives a move from the board to the list.
//
// MOTION. Switching views cross-fades, the way /teams switches its four: the
// outgoing view leaves on opacity in 90ms, the incoming one enters in 200ms
// with a 6px rise, and both sit absolutely in the view area so the toolbar
// above them never moves. `reducedMotion="user"` drops the rise and every
// layout move and keeps the fades.

/** What a lane or group header counts, for the shell's accessible names. */
const TASK_NOUN = { one: "task", many: "tasks" };

export function TrackerPanel({ className }: { className?: string }) {
  const { tasks, tasksByStatus, query, view, pulse, memberById, tasksForMember } = useRoomTracker();
  const searching = query.trim().length > 0;
  const reduceMotion = useReducedMotion();
  const areaRef = React.useRef<HTMLDivElement>(null);

  // After the commit that set the pulse (and, when the pulse came from a
  // message or from the composer's agent bar, the commit that showed this tab
  // at all), put the asked-for card on screen. A pulse that named a task
  // scrolls to that card; a pulse that named an agent scrolls to the first of
  // theirs, which is the one the lanes read first. `block: "nearest"` so a card
  // already in view is left where it is.
  React.useEffect(() => {
    if (!pulse) return;
    const frame = requestAnimationFrame(() => {
      const selector = pulse.taskId
        ? `[data-task-id="${CSS.escape(pulse.taskId)}"]`
        : `[data-assignee="${CSS.escape(pulse.agentId)}"]`;
      const target = areaRef.current?.querySelector<HTMLElement>(selector);
      target?.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [pulse, reduceMotion, view]);

  const announcement = React.useMemo(() => {
    if (!pulse) return "";
    const name = memberById(pulse.agentId)?.name;
    if (!name) return "";
    // A pulse that named a task lit exactly one card, so the count would be a
    // lie; it says whose card it is instead.
    if (pulse.taskId) return `1 task for ${name}`;
    const count = tasksForMember(pulse.agentId).length;
    return count === 1 ? `1 task for ${name}` : `${count} tasks for ${name}`;
  }, [pulse, memberById, tasksForMember]);

  return (
    <MotionConfig reducedMotion="user">
      <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
        <TrackerToolbar />
        <div ref={areaRef} className="relative min-h-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              data-view={view}
              className="absolute inset-0 flex min-h-0 flex-col overflow-hidden"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0, transition: { duration: DURATION.normal, ease: EASE.outQuart } }}
              exit={{ opacity: 0, transition: { duration: DURATION.exit, ease: EASE.out } }}
            >
              {view === "board" ? (
                <TrackerBoard
                  statuses={TASK_STATUS_ORDER}
                  meta={TASK_STATUS_META}
                  itemsByStatus={tasksByStatus}
                  getKey={(task) => task.id}
                  renderItem={(task) => <TaskCard task={task} />}
                  emptyCopy={TASK_EMPTY_COPY}
                  noun={TASK_NOUN}
                  searching={searching}
                  density="compact"
                  searchEmpty={<TaskSearchEmpty />}
                  ariaLabel="Tasks by status"
                />
              ) : (
                <TrackerList
                  statuses={TASK_STATUS_ORDER}
                  meta={TASK_STATUS_META}
                  itemsByStatus={tasksByStatus}
                  getKey={(task) => task.id}
                  renderItem={(task) => <TaskRow task={task} />}
                  noun={TASK_NOUN}
                  searching={searching}
                  empty={tasks.length === 0 ? <TaskEmpty /> : undefined}
                  searchEmpty={<TaskSearchEmpty />}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>
      </div>
    </MotionConfig>
  );
}

/** A search that keeps no task at all: the miss, what search reads, and the way out. */
function TaskSearchEmpty() {
  const { query, setQuery } = useRoomTracker();
  return (
    <motion.div
      className="px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DURATION.normal, ease: EASE.out }}
    >
      <EmptyState
        variant="plain"
        icon={IconSearch}
        title={`No tasks match “${query.trim()}”`}
        description="Search looks at task titles and their state, and at the name and role of whoever is on them."
        action={
          <Button
            variant="outline"
            onClick={() => {
              setQuery("");
              document.getElementById("room-tracker-search")?.focus();
            }}
          >
            Clear search
          </Button>
        }
      />
    </motion.div>
  );
}

/** A room where nothing has been picked up yet. */
function TaskEmpty() {
  return (
    <div className="px-4">
      <EmptyState
        variant="plain"
        icon={IconChecklist}
        title="Nothing on the board"
        description="Work the room picks up shows up here, grouped by what it needs next."
      />
    </div>
  );
}
