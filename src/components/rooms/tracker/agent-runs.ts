import type { AgentRun, AgentRunState } from "@/components/composer/agent-status/types";
import { roomMember } from "@/lib/mock/rooms";
import type { RoomTask, TaskStatus } from "@/lib/mock/room-tracker";

// The room's tasks, compressed into the rows the strip above the composer
// draws (docs/plans/2026-09-17-room-tracker.md §6.1). The tracker and the
// strip are the same data at two sizes: the board gives every task a card,
// the strip gives every live task a glyph, and this file is the only place
// that knows how one becomes the other.
//
// One entry per task, not per agent. An agent on three live tasks appears
// three times, wearing a different state each time, which is the same reason
// the board is per task: a readout that collapses an agent into one row
// cannot say it is stuck on one render and fine on the other.
//
// THE CONTRACT, now kept rather than promised. This file was written against
// a local copy of `AgentRun` while the composer's bar lived on an unmerged
// branch; that branch has landed, so the copy is gone and the real type is
// imported. The two tables below are what survived, and they are still the
// only place that knows how a task becomes a glyph — if the bar changes shape,
// this is the one file that moves.
//
// THE RUN'S ID IS THE TASK'S, not the agent's, which is what lets a chip point
// at one card. An agent on three live tasks is three chips and three ids, and
// the room resolves each one back to its task to find the message it came out
// of and the card it belongs to (room-view.tsx).

/**
 * Lane to state. `queued` maps to nothing: the strip's own types say a bar
 * means an agent has work, and an agent whose only task is accepted but not
 * started has none yet, so it keeps its card and loses its glyph.
 */
const RUN_STATE_BY_STATUS: Record<TaskStatus, AgentRunState | null> = {
  "needs-you": "input",
  blocked: "stuck",
  working: "running",
  queued: null,
  done: "done",
};

/**
 * The strip's reading order. It mirrors `STATE_PRIORITY` in
 * src/components/composer/agent-status/run-state.ts — whoever wants something
 * first, then trouble, then the ones still going, then the ones already
 * finished — and is kept here rather than imported because this sort decides
 * what the ROOM hands over, and the bar is free to re-sort what it is given.
 */
const STATE_PRIORITY: Record<AgentRunState, number> = {
  input: 0,
  stuck: 1,
  running: 2,
  done: 3,
};

/**
 * The strip's rows for a room's tasks, one per live task an agent holds.
 *
 * Queued tasks are dropped, and so is anything assigned to a person: it is an
 * agent bar, and a person's work is the board's business rather than the
 * strip's. An assignee the roster cannot resolve is skipped in silence, the
 * way a member who has left the room is everywhere else. Within a state the
 * tasks keep the order they were given in, because the sort is stable and the
 * mock is written in the order the room would read it.
 */
export function roomAgentRuns(tasks: RoomTask[]): AgentRun[] {
  const runs: AgentRun[] = [];

  for (const task of tasks) {
    const state = RUN_STATE_BY_STATUS[task.status];
    if (!state) continue;

    const member = roomMember(task.assigneeId);
    if (!member || member.kind !== "agent" || !member.glyph) continue;

    runs.push({
      id: task.id,
      name: member.name,
      glyph: member.glyph.shape,
      state,
      task: task.title,
      ...(task.caption ? { detail: task.caption } : {}),
      ...(task.progress && task.progress.total > 0
        ? { progress: task.progress.done / task.progress.total }
        : {}),
    });
  }

  return runs.sort((a, b) => STATE_PRIORITY[a.state] - STATE_PRIORITY[b.state]);
}
