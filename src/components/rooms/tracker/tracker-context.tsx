"use client";

import * as React from "react";
import { roomMember, type Room, type RoomMember } from "@/lib/mock/rooms";
import {
  TASK_STATUS_ORDER,
  tasksForRoom,
  type RoomTask,
  type TaskStatus,
} from "@/lib/mock/room-tracker";
import { roomAgentRuns, type RoomAgentRun } from "@/components/rooms/tracker/agent-runs";

// The one store the room's tracker reads, and the only thing the Messages tab
// and the Tracker tab share (docs/plans/2026-09-17-room-tracker.md §7).
//
// It owns four things: the search query, which of the two views is showing,
// the pulse that answers "where is this agent's work", and the message a card
// points back at. Everything else is derived.
//
// THE PULSE is a pair, not a flag: the agent's id and a token that goes up on
// every ask. A flag cannot say "the same agent, again" — the second click on
// one name would set a value that was already set and nothing would move. The
// token makes each ask distinct, so a card can key its one-shot animation on
// it and replay (task-card.tsx). Both directions of the jump work the same
// way: `focusAgent` sends the reader to the board, `openMessage` sends them
// back to the conversation the card came out of.
//
// WHY THE TAB IS NOT HERE. `RoomView` owns which tab is showing, because the
// header and the three panels all read it and the tracker is only one of
// them. The provider is handed the two moves it needs instead, which also
// keeps this file usable by a room that has no tracker tab at all.
//
// `tasks` is filtered by the query; `allTasks` and `tasksForMember` never are,
// because some facts belong to the whole room whatever is typed in the box:
// the toolbar's count, the strip above the composer, and the pulse, which has
// to find an agent's cards even when the search has hidden them.

export type TrackerView = "board" | "list";

/** Which agent's cards should pulse, and which ask this is. */
export type AgentPulse = { agentId: string; token: number };

/** Which message a card pointed back at, and which ask this is. */
export type MessagePulse = { messageId: string; token: number };

export interface RoomTrackerValue {
  room: Room;
  /** Tasks matching the query, in the mock's order. */
  tasks: RoomTask[];
  /** Every task in the room, ignoring the query. */
  allTasks: RoomTask[];
  /** `tasks` bucketed by status, every status present (possibly empty). */
  tasksByStatus: Record<TaskStatus, RoomTask[]>;
  /** The member behind an id, or undefined for one who has left the room. */
  memberById: (id: string) => RoomMember | undefined;
  /** Every task (unfiltered) assigned to a member. */
  tasksForMember: (id: string) => RoomTask[];
  query: string;
  setQuery: (query: string) => void;
  view: TrackerView;
  setView: (view: TrackerView) => void;
  /** Null until someone asks; then the agent and the ask's token. */
  pulse: AgentPulse | null;
  /** Show the board and pulse this agent's cards once. */
  focusAgent: (id: string) => void;
  /** The message a card pointed back at, for the conversation to mark. */
  highlight: MessagePulse | null;
  /** Show the conversation, at this message. */
  openMessage: (id: string) => void;
  /** The room's live work as the composer's agent strip wants it (§6.1). */
  agentRuns: RoomAgentRun[];
}

const RoomTrackerContext = React.createContext<RoomTrackerValue | null>(null);

export function RoomTrackerProvider({
  room,
  tasks: provided,
  onShowTracker,
  onShowMessages,
  children,
}: {
  room: Room;
  /** The room's tasks. Defaults to the mock, so a story or a test can pass its own. */
  tasks?: RoomTask[];
  /** Called when something asks for the board. Omitted, the pulse still fires. */
  onShowTracker?: () => void;
  /** Called when a card points back at the conversation. */
  onShowMessages?: () => void;
  children: React.ReactNode;
}) {
  const [query, setQuery] = React.useState("");
  const [view, setView] = React.useState<TrackerView>("board");
  const [pulse, setPulse] = React.useState<AgentPulse | null>(null);
  const [highlight, setHighlight] = React.useState<MessagePulse | null>(null);

  const tasks = React.useMemo(() => provided ?? tasksForRoom(room.id), [provided, room.id]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter((task) => {
      const member = roomMember(task.assigneeId);
      return [task.title, task.caption ?? "", member?.name ?? "", member?.role ?? ""].some((field) =>
        field.toLowerCase().includes(q),
      );
    });
  }, [query, tasks]);

  const tasksByStatus = React.useMemo(() => {
    const buckets = Object.fromEntries(TASK_STATUS_ORDER.map((status) => [status, [] as RoomTask[]])) as Record<
      TaskStatus,
      RoomTask[]
    >;
    for (const task of filtered) buckets[task.status].push(task);
    return buckets;
  }, [filtered]);

  const tasksForMember = React.useCallback(
    (id: string) => tasks.filter((task) => task.assigneeId === id),
    [tasks],
  );

  const agentRuns = React.useMemo(() => roomAgentRuns(tasks), [tasks]);

  const focusAgent = React.useCallback(
    (id: string) => {
      onShowTracker?.();
      // A query left over from an earlier visit could be hiding the very cards
      // this is pointing at, and a pointer at nothing is worse than no pointer.
      setQuery("");
      // The token is read off the previous value rather than a counter of its
      // own, so two asks in the same commit cannot land on the same number.
      setPulse((current) => ({ agentId: id, token: (current?.token ?? 0) + 1 }));
    },
    [onShowTracker],
  );

  const openMessage = React.useCallback(
    (id: string) => {
      onShowMessages?.();
      setHighlight((current) => ({ messageId: id, token: (current?.token ?? 0) + 1 }));
    },
    [onShowMessages],
  );

  const value = React.useMemo<RoomTrackerValue>(
    () => ({
      room,
      tasks: filtered,
      allTasks: tasks,
      tasksByStatus,
      memberById: roomMember,
      tasksForMember,
      query,
      setQuery,
      view,
      setView,
      pulse,
      focusAgent,
      highlight,
      openMessage,
      agentRuns,
    }),
    [
      room,
      filtered,
      tasks,
      tasksByStatus,
      tasksForMember,
      query,
      view,
      pulse,
      focusAgent,
      highlight,
      openMessage,
      agentRuns,
    ],
  );

  return <RoomTrackerContext.Provider value={value}>{children}</RoomTrackerContext.Provider>;
}

export function useRoomTracker(): RoomTrackerValue {
  const value = React.useContext(RoomTrackerContext);
  if (!value) throw new Error("useRoomTracker must be used inside <RoomTrackerProvider>");
  return value;
}
