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
// THE CONTRACT. `RoomAgentRun` below is a local copy of `AgentRun` in
// src/components/composer/agent-status/types.ts on the branch
// feat/composer-agent-status, which is not merged yet. The two are
// structurally identical today, so nothing casts and nothing adapts. On
// merge: delete `RoomAgentRunState` and `RoomAgentRun`, import `AgentRun` and
// `AgentRunState` from @/components/composer/agent-status/types, and the two
// tables below are the only things that have to survive. If that branch
// changes its shape, this is the one file that moves.

/**
 * Four states, and no idle: a bar on screen at all means an agent has work,
 * so "nothing happening" is the bar not being there.
 */
export type RoomAgentRunState = "running" | "done" | "input" | "stuck";

/** One agent's turn, as the strip needs to draw it. */
export type RoomAgentRun = {
  id: string;
  /** The agent's own name, for the tooltip and the expanded row. */
  name: string;
  /** A glyph id from the registry (`ALL_GLYPHS`), e.g. "trefoil". */
  glyph: string;
  state: RoomAgentRunState;
  /** What it is doing: the task's title. */
  task: string;
  /** The one parameter after the task: the task's caption. */
  detail?: string;
  /** 0 to 1, for the dial in front of the row. Absent when the task has no steps. */
  progress?: number;
};

/**
 * Lane to state. `queued` maps to nothing: the strip's own types say a bar
 * means an agent has work, and an agent whose only task is accepted but not
 * started has none yet, so it keeps its card and loses its glyph.
 */
const RUN_STATE_BY_STATUS: Record<TaskStatus, RoomAgentRunState | null> = {
  "needs-you": "input",
  blocked: "stuck",
  working: "running",
  queued: null,
  done: "done",
};

/**
 * The strip's reading order, copied from `STATE_PRIORITY` in
 * src/components/composer/agent-status/run-state.ts on that branch: whoever
 * wants something first, then trouble, then the ones still going, then the
 * ones already finished.
 */
const STATE_PRIORITY: Record<RoomAgentRunState, number> = {
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
export function roomAgentRuns(tasks: RoomTask[]): RoomAgentRun[] {
  const runs: RoomAgentRun[] = [];

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
