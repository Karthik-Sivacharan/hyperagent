"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { IconLayoutBoardSplit } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { ComposerAgentStatus } from "@/components/composer/composer-agent-status";
import type { AgentRun } from "@/components/composer/agent-status/types";
import { EmptyState } from "@/components/patterns/empty-state";
import { RoomComposer } from "@/components/rooms/room-composer";
import { RoomHeader, type RoomTab } from "@/components/rooms/room-header";
import { RoomMessageList } from "@/components/rooms/room-message-list";
import { RoomThreadPanel } from "@/components/rooms/room-thread-panel";
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
// AND A CHIP IS TWO WAYS OUT, which is the shape both halves of this file
// agreed on independently. Picking the figure goes to the CONVERSATION: the
// column scrolls to the message the work came out of and pulses it, the rail
// opens on that thread and washes once so a rail that swapped under you says
// so. The control at the end of the opened row goes to the WORK: the tracker
// tab, with that one card pulsing. Same two surfaces the room already links
// between, reached from the bar instead of from a message — and the pulse, the
// scroll and the wash are all the room's existing gestures, so nothing here
// introduces a fourth way of saying "over there".

/** How often a mention's run advances, and how much of the dial a tick is worth. */
const TICK_MS = 900;
const TICK_PROGRESS = 0.12;

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
  const { allTasks, tasksByStatus, agentRuns, focusAgent, focusTask, highlight, openMessage } = useRoomTracker();

  // The room opens on its liveliest thread. A room whose threads are all
  // resolved opens closed, which is also what a new room does.
  const [threadRootId, setThreadRootId] = useState<string | undefined>(room.threads[0]?.rootId);
  // Bumped only when something opened the rail FOR the reader, which is what
  // the rail washes on. Opening one yourself leaves it at null.
  const [arrival, setArrival] = useState<number | null>(null);
  const [mentionRuns, setMentionRuns] = useState<readonly AgentRun[]>([]);

  // The roster in this room's own order, which is the order `@` offers it in.
  const members = useMemo(
    () => room.memberIds.map(roomMember).filter((member) => member !== undefined),
    [room.memberIds],
  );

  // Board first, then anything a mention started that the board has no card
  // for. De-duplicated on id, so a run that later gains a card is one chip.
  const runs = useMemo(() => {
    const seen = new Set(agentRuns.map((run) => run.id));
    return [...agentRuns, ...mentionRuns.filter((run) => !seen.has(run.id))];
  }, [agentRuns, mentionRuns]);

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
      // literally what the work came out of. Half this room's tasks have none,
      // so the fallback is where that agent has been talking instead.
      const messageId = task?.sourceMessageId ?? threadForAgent(room, agentId);
      if (!messageId) return;
      // `openMessage` brings the messages tab back and scrolls the column to
      // the message, pulsing it — the same trip a card makes, so the two read
      // as one gesture. The rail follows it onto that thread.
      openMessage(messageId);
      setThreadRootId(messageId);
      setArrival((current) => (current ?? 0) + 1);
    },
    [allTasks, openMessage, room],
  );

  // …and where it goes in the WORK. Only a board run has a card; `focusTask`
  // stays put for anything else rather than showing an empty board.
  const handleOpenTask = useCallback((run: AgentRun) => focusTask(run.id), [focusTask]);

  // A run the board has no card for keeps the word it always had at the end of
  // its row, because a control that goes nowhere is worse than no control.
  const hasCard = useCallback(
    (run: AgentRun) => allTasks.some((candidate) => candidate.id === run.id),
    [allTasks],
  );

  const openThread = (messageId: string) => {
    setThreadRootId(messageId);
    setArrival(null);
  };
  const toggleThread = () => {
    setArrival(null);
    setThreadRootId((current) => (current ? undefined : room.threads[0]?.rootId));
  };

  // What the room owes a person: the two lanes that are asking for one. The
  // header prints it beside the tab so it is not hidden behind a click.
  const waiting = tasksByStatus["needs-you"].length + tasksByStatus.blocked.length;

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <div className={cn("flex min-w-0 flex-1 flex-col", threadRootId && "max-lg:hidden")}>
        <RoomHeader
          room={room}
          tab={tab}
          onTabChange={onTabChange}
          threadOpen={Boolean(threadRootId)}
          onToggleThread={toggleThread}
          trackerWaiting={waiting}
        />

        {tab === "messages" ? (
          <>
            <RoomMessageList
              room={room}
              activeThreadId={threadRootId}
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
                      canOpenTask={hasCard}
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

      {threadRootId ? (
        <RoomThreadPanel
          room={room}
          rootId={threadRootId}
          arrival={arrival}
          onClose={() => {
            setArrival(null);
            setThreadRootId(undefined);
          }}
          className="w-full shrink-0 lg:w-[400px]"
        />
      ) : null}
    </div>
  );
}
