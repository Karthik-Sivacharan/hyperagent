"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { IconLayoutBoardSplit } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { ComposerAgentStatus } from "@/components/composer/composer-agent-status";
import type { AgentRun } from "@/components/composer/agent-status/types";
import { EmptyState } from "@/components/patterns/empty-state";
import { RoomComposer } from "@/components/rooms/room-composer";
import { RoomHeader, type RoomTab } from "@/components/rooms/room-header";
import { RoomAgentThread } from "@/components/rooms/room-agent-thread";
import { RoomMessageList } from "@/components/rooms/room-message-list";
import { RoomThreadPanel } from "@/components/rooms/room-thread-panel";
import type { RoomWorkingTask } from "@/components/rooms/room-working-message";
import { RoomTrackerProvider, useRoomTracker } from "@/components/rooms/tracker/tracker-context";
import { TrackerPanel } from "@/components/rooms/tracker/tracker-panel";
import { roomMember, type Room } from "@/lib/mock/rooms";
import { runForMention, threadForAgent } from "@/lib/mock/room-agent-runs";

// The room, assembled: chrome, the three tabs, the composer, and the thread
// rail beside them. This file owns the state the columns share and nothing
// else; every part below it is told what to render.
//
// The rail is the interesting layout problem. On a wide screen it sits beside
// the messages, which is the whole point of replying in a thread: the room
// keeps going while a side conversation happens. Below `lg` there is no room
// for both, so the rail takes the column instead of squeezing it, which is
// done with one `max-lg:hidden` rather than a resize listener.
//
// THE TRACKER is the room's work, the same way Messages is its conversation
// (docs/plans/2026-09-17-room-tracker.md). Its state lives in a provider
// wrapped around the whole room rather than inside the tab, because both tabs
// read it: the conversation needs `focusAgent` so a name can open an agent's
// cards, and the header needs the count of what is waiting on a person. The
// provider does not own the tab itself; it is handed the two moves it makes
// (show the tracker, show the conversation) so that nothing below has to know
// how many tabs there are.
//
// THE AGENT BAR HOLDS TWO LIFETIMES OF THE SAME THING (§6.1 item 2). The board
// gives it the room's standing work, one chip per live task, and those are
// there the moment you arrive. The composer's `@` gives it the run you just
// started, which has no card yet because nothing writes to the board. They are
// not rivals, so the bar gets both, board first, de-duplicated on id. Letting
// a send write a `working` task onto the board instead is the better product
// and the larger change; it belongs in its own pass.
//
// ONLY AGENTS RUN. A room mentions its people too, and those mentions do
// nothing here beyond being written — a person is not a fleet member, and a
// chip that claimed otherwise would be the one dishonest thing on the screen.
//
// THE MENTION'S RUN MOVES ON ITS OWN, because a chip that never changed would
// prove only that a chip can be added. It fills its dial over TICK_MS and
// settles on `done`: hueless while it works, green when it stops. One interval
// for the whole fleet rather than one per agent, so ten chips cost one timer.
// The board's runs are static and are left alone by it.
//
// AND A CHIP IS TWO WAYS INTO THE CONVERSATION, one per agent and one per
// task. Picking the figure takes the reader to where that AGENT is: the column
// scrolls to the message its work came out of and pulses it, the rail opens on
// that thread and washes once, so a rail that swapped under someone whose eyes
// were on the field says so. The arrow at the end of a row in the opened detail
// takes them to where that TASK is, which is a different question the moment an
// agent is holding four of them — the chip can only answer for the one it was
// pressed on, and the rows below it each have their own message.
//
// Both trips end in the rail rather than on the tracker. The tracker still has
// every card and `focusTask` still puts the reader on one; what changed is that
// the bar is no longer the thing that asks for it. A person reading a room who
// picks an agent out of the strip above the composer wants the conversation the
// work is happening in, not a card restating the row they just read.
//
// A TASK WITH NO MESSAGE HAS NOWHERE TO GO, and roughly half of them have none:
// they were entered on the board rather than said out loud. Those rows keep the
// state word they always had at the end, because a control that goes nowhere is
// worse than no control.
//
// THE RAIL IS A STACK NOW, two deep and no deeper (§ RailView below): a thread,
// and under it one agent's turn on one task. Everything that opens the rail
// opens it at the thread level; only the live cell inside a thread pushes the
// second. Back pops to the exact thread it was pushed from rather than to
// whichever thread the rail happened to open on first, which is why the agent
// level carries that id rather than reading it back off some other state.

/** How often a mention's run advances, and how much of the dial a tick is worth. */
const TICK_MS = 900;
const TICK_PROGRESS = 0.12;

/**
 * Where the rail is. Closed is `null`.
 *
 * An explicit two-case union rather than a pair of ids, because the two levels
 * are not the same kind of thing and a flag beside a rootId would let them be
 * on at once. `fromRootId` is the thread the agent view was pushed from, so
 * Back is exact. `back` marks the thread the reader popped onto rather than
 * opened, which is the one thing the panel needs in order not to slide a rail
 * that never moved (room-thread-panel.tsx).
 */
type RailView =
  | { kind: "thread"; rootId: string; back?: true }
  | { kind: "agent"; taskId: string; fromRootId: string };

export function RoomView({ room }: { room: Room }) {
  const [tab, setTab] = useState<RoomTab>("messages");

  const showTracker = useCallback(() => setTab("tracker"), []);
  const showMessages = useCallback(() => setTab("messages"), []);

  return (
    <RoomTrackerProvider room={room} onShowTracker={showTracker} onShowMessages={showMessages}>
      <RoomBody room={room} tab={tab} onTabChange={setTab} />
    </RoomTrackerProvider>
  );
}

function RoomBody({ room, tab, onTabChange }: { room: Room; tab: RoomTab; onTabChange: (tab: RoomTab) => void }) {
  const { allTasks, tasksByStatus, agentRuns, focusAgent, highlight, openMessage } = useRoomTracker();

  // The room opens on its liveliest thread. A room whose threads are all
  // resolved opens closed, which is also what a new room does.
  const [rail, setRail] = useState<RailView | null>(() => {
    const first = room.threads[0]?.rootId;
    return first ? { kind: "thread", rootId: first } : null;
  });
  // The thread the rail is on, at either level: the agent view is still ABOUT
  // that thread, so the message it hangs off keeps its open mark in the column
  // and the header's rail toggle stays pressed while the reader is one deeper.
  const railRootId = rail ? (rail.kind === "thread" ? rail.rootId : rail.fromRootId) : undefined;
  // Bumped only when something opened the rail FOR the reader, which is what
  // the rail washes on. Opening one yourself leaves it at null.
  const [arrival, setArrival] = useState<number | null>(null);
  const [mentionRuns, setMentionRuns] = useState<readonly AgentRun[]>([]);
  // Runs somebody stopped. An id set rather than an edit, because half the bar
  // is the board's and this view does not own those rows — it can only say
  // "this one is over" and let the composition below apply it.
  const [endedIds, setEndedIds] = useState<ReadonlySet<string>>(new Set());

  // The roster in this room's own order, which is the order `@` offers it in.
  const members = useMemo(
    () => room.memberIds.map(roomMember).filter((member) => member !== undefined),
    [room.memberIds],
  );

  // Board first, then anything a mention started that the board has no card
  // for. De-duplicated on id, so a run that later gains a card is one chip.
  const runs = useMemo(() => {
    const seen = new Set(agentRuns.map((run) => run.id));
    const all = [...agentRuns, ...mentionRuns.filter((run) => !seen.has(run.id))];
    // A stopped run keeps its chip and its words and loses the one thing that
    // was still true of it. `stopped` is its own state rather than `done`,
    // because a green tick on work that was called off half way is the bar
    // telling the reader their own decision went fine; and rather than
    // `stuck`, which would blame the agent for it. The dial goes with the
    // fraction, because a run that was stopped is not a fraction of anything
    // any more.
    if (endedIds.size === 0) return all;
    return all.map((run) =>
      endedIds.has(run.id) ? { ...run, state: "stopped" as const, progress: undefined } : run,
    );
  }, [agentRuns, mentionRuns, endedIds]);

  // A send starts a run for every agent the draft named. An agent already in
  // the bar is handed the new message rather than added twice.
  const handleSend = useCallback((draft: string, mentionedIds: string[]) => {
    const tagged = mentionedIds.flatMap((id) => {
      const member = roomMember(id);
      return member?.kind === "agent" ? [runForMention(member, draft)] : [];
    });
    if (tagged.length === 0) return;
    setMentionRuns((current) => {
      const next = [...current];
      for (const run of tagged) {
        const at = next.findIndex((existing) => existing.id === run.id);
        if (at === -1) next.push(run);
        else next[at] = run;
      }
      return next;
    });
  }, []);

  // Nothing is running, so nothing needs a clock: the interval exists only
  // while there is an unfinished mention run to advance, and clears itself the
  // tick after the last one lands on `done`.
  const working = mentionRuns.some((run) => run.state === "running");
  useEffect(() => {
    if (!working) return;
    const id = window.setInterval(() => {
      setMentionRuns((current) =>
        current.map((run) => {
          if (run.state !== "running") return run;
          const progress = (run.progress ?? 0) + TICK_PROGRESS;
          if (progress < 1) return { ...run, progress };
          // Done keeps the task it finished and drops the fraction: a run that
          // stopped is not 100% of anything a reader wants (agent-status.ts).
          return { ...run, state: "done" as const, progress: undefined };
        }),
      );
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [working]);

  // Where a picked chip goes in the CONVERSATION. A board run knows the message
  // its task came out of; a mention's run has no card, so the room is asked
  // where that agent has been working instead (room-agent-runs.ts). Neither
  // answering means the chip opens its detail and nothing else moves, which is
  // the honest outcome for an agent this room has not spoken to yet.
  const handleOpenRun = useCallback(
    (run: AgentRun) => {
      // A board run's id is a task id and a mention's run id is the agent's,
      // so the agent is whichever of the two this turns out to be.
      const task = allTasks.find((candidate) => candidate.id === run.id);
      const agentId = task?.assigneeId ?? run.id;
      // The task's own source message is the best answer there is — it is
      // literally what the work came out of, and every task in the demo room
      // now carries one. The fallback is for the two cases that never will: a
      // mention's run, which has no task at all, and a room whose board is
      // written but whose conversation is not.
      const messageId = task?.sourceMessageId ?? threadForAgent(room, agentId);
      if (!messageId) return;
      // `openMessage` brings the messages tab back and scrolls the column to
      // the message, pulsing it — the same trip a card makes, so the two read
      // as one gesture. The rail follows it onto that thread.
      openMessage(messageId);
      // Always the thread level: a jump that landed the reader two deep would
      // leave a Back control pointing at a thread they were never on.
      setRail({ kind: "thread", rootId: messageId });
      setArrival((current) => (current ?? 0) + 1);
    },
    [allTasks, openMessage, room],
  );

  // Stopping one. The interval below reads the mention runs rather than this
  // list, so a stopped mention run is also written back there or the next tick
  // would start it going again.
  const handleEndRun = useCallback((run: AgentRun) => {
    setEndedIds((current) => new Set(current).add(run.id));
    setMentionRuns((current) =>
      current.map((existing) =>
        existing.id === run.id ? { ...existing, state: "stopped" as const, progress: undefined } : existing,
      ),
    );
  }, []);

  // …and where ONE ROW of that detail goes. The task's own source message, and
  // nothing else: the chip's fallback (where has this agent been talking?) is
  // an answer about the agent, and a row that borrowed it would send four rows
  // of one agent's detail to the same thread and call each of them precise.
  const handleOpenTask = useCallback(
    (run: AgentRun) => {
      const task = allTasks.find((candidate) => candidate.id === run.id);
      if (!task?.sourceMessageId) return;
      openMessage(task.sourceMessageId);
      setRail({ kind: "thread", rootId: task.sourceMessageId });
      setArrival((current) => (current ?? 0) + 1);
    },
    [allTasks, openMessage],
  );

  // A run whose task was never said out loud keeps the word it always had at
  // the end of its row. The same test as the handler above, asked before the
  // arrow is drawn rather than after it is pressed, so no row ends in a control
  // that would quietly do nothing.
  const hasThread = useCallback(
    (run: AgentRun) =>
      allTasks.some((candidate) => candidate.id === run.id && candidate.sourceMessageId !== undefined),
    [allTasks],
  );

  // What is still running in the thread the rail is on. `endedIds` counts here
  // as well as in the bar: a run somebody stopped from the composer must not go
  // on shimmering in the rail as though nobody had.
  const workingHere = useMemo<RoomWorkingTask[]>(() => {
    if (!railRootId) return [];
    return allTasks.flatMap((task) => {
      if (task.status !== "working" || task.sourceMessageId !== railRootId) return [];
      if (endedIds.has(task.id)) return [];
      const member = roomMember(task.assigneeId);
      if (!member) return [];
      return [{ taskId: task.id, member, title: task.title, time: task.updated }];
    });
  }, [allTasks, endedIds, railRootId]);

  const openThread = (messageId: string) => {
    setRail({ kind: "thread", rootId: messageId });
    setArrival(null);
  };
  const toggleThread = () => {
    setArrival(null);
    setRail((current) => {
      if (current) return null;
      const first = room.threads[0]?.rootId;
      return first ? { kind: "thread", rootId: first } : null;
    });
  };
  // Push: only ever from a thread, because the cell that asks is inside one.
  const openAgentTurn = useCallback((taskId: string) => {
    setArrival(null);
    setRail((current) =>
      current?.kind === "thread" ? { kind: "agent", taskId, fromRootId: current.rootId } : current,
    );
  }, []);
  // Pop. Close is the other control and it is not this one's neighbour: back
  // goes up a level, close puts the whole rail away.
  const backToThread = useCallback(() => {
    setArrival(null);
    setRail((current) =>
      current?.kind === "agent" ? { kind: "thread", rootId: current.fromRootId, back: true } : current,
    );
  }, []);
  const closeRail = useCallback(() => {
    setArrival(null);
    setRail(null);
  }, []);

  // What the room owes a person: the two lanes that are asking for one. The
  // header prints it beside the tab so it is not hidden behind a click.
  const waiting = tasksByStatus["needs-you"].length + tasksByStatus.blocked.length;

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <div className={cn("flex min-w-0 flex-1 flex-col", railRootId && "max-lg:hidden")}>
        <RoomHeader
          room={room}
          tab={tab}
          onTabChange={onTabChange}
          threadOpen={Boolean(railRootId)}
          onToggleThread={toggleThread}
          trackerWaiting={waiting}
        />

        {tab === "messages" ? (
          <>
            <RoomMessageList
              room={room}
              activeThreadId={railRootId}
              onOpenThread={openThread}
              onFocusAgent={focusAgent}
              highlight={highlight}
              className="min-h-0 flex-1"
            />
            <div className="shrink-0 px-4 pt-1 pb-4">
              <RoomComposer
                placeholder={`Message #${room.slug}`}
                members={members}
                onSend={handleSend}
                status={
                  runs.length > 0 ? (
                    <ComposerAgentStatus
                      runs={runs}
                      onOpen={handleOpenRun}
                      onOpenTask={handleOpenTask}
                      canOpenTask={hasThread}
                      onEndRun={handleEndRun}
                    />
                  ) : null
                }
              />
            </div>
          </>
        ) : tab === "tracker" ? (
          <TrackerPanel />
        ) : (
          // The canvas is the room's shared document. It is not built yet, so
          // the tab says so in one line rather than rendering a fake surface.
          <div className="flex min-h-0 flex-1 items-center justify-center p-8">
            <EmptyState
              variant="plain"
              icon={IconLayoutBoardSplit}
              title="The canvas is empty"
              description="Anything the room pins, drafts or renders together ends up here. Nothing has been put on it yet."
            />
          </div>
        )}
      </div>

      {/* One rail, two levels. They are siblings in the same slot rather than
          one panel with a mode, so each owns its own header, its own entrance
          and its own Escape, and neither has to carry the other's state. */}
      {rail === null ? null : rail.kind === "agent" ? (
        <RoomAgentThread
          // Keyed on the task, so opening a second agent's turn replays rather
          // than streaming the new prose into the old one's position.
          key={rail.taskId}
          taskId={rail.taskId}
          onBack={backToThread}
          onClose={closeRail}
          className="w-full shrink-0 lg:w-[400px]"
        />
      ) : (
        <RoomThreadPanel
          room={room}
          rootId={rail.rootId}
          arrival={arrival}
          entrance={rail.back ? "level" : "rail"}
          working={workingHere}
          onOpenAgent={openAgentTurn}
          onClose={closeRail}
          className="w-full shrink-0 lg:w-[400px]"
        />
      )}
    </div>
  );
}
