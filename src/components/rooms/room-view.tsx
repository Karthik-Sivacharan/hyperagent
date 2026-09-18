"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IconLayoutBoardSplit } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { ComposerAgentStatus } from "@/components/composer/composer-agent-status";
import type { AgentRun } from "@/components/composer/agent-status/types";
import { EmptyState } from "@/components/patterns/empty-state";
import { RoomComposer, toRoomText } from "@/components/rooms/room-composer";
import { RoomHeader, type RoomTab } from "@/components/rooms/room-header";
import { RoomAgentThread } from "@/components/rooms/room-agent-thread";
import { RoomMessageList } from "@/components/rooms/room-message-list";
import { RoomThreadPanel } from "@/components/rooms/room-thread-panel";
import type { RoomWorkingTask } from "@/components/rooms/room-working-message";
import { RoomTrackerProvider, useRoomTracker } from "@/components/rooms/tracker/tracker-context";
import { TrackerPanel } from "@/components/rooms/tracker/tracker-panel";
import { roomMember, type Room, type RoomBlock, type RoomMember, type RoomMessage } from "@/lib/mock/rooms";
import { answerForMention, runForMention, threadForAgent, turnForMention } from "@/lib/mock/room-agent-runs";

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
// gives it the room's standing work, one run per live task, and those are
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
// A SEND IS SAID OUT LOUD. Whatever the field held goes into the column under
// your name, tagged or not, on the end of today (`liveRoom`). A message that
// tagged an agent also hands that agent an ASK — the run above, plus the
// message it is answering — and the ask is what ties the bar and the column
// together: while it runs, the message's thread link says who is working and
// the thread shows the live cell; when it lands on `done`, the agent's answer
// is a reply in that thread and the link turns into "1 reply". Replies are
// derived from the asks rather than stored beside them, so a run that was
// stopped simply never answers and there is nothing to take back.
//
// AND A CHIP IS A WAY INTO THE CONVERSATION ONLY WHEN THE AGENT HOLDS ONE
// TASK. Then there is nothing to choose and one click does the whole trip: the
// column scrolls to the message the work came out of and pulses it, the rail
// opens on that thread and washes once, so a rail that swapped under someone
// whose eyes were on the field says so. An agent holding four opens its four
// rows and the room stays exactly where it was — the bar has just handed the
// reader a chooser, and a jump made before they picked would be the room
// answering a question it was never asked, with the column dragged and a
// message pulsed to prove it. The bar is the one that knows how many runs are
// behind a figure, so the bar is where that rule lives
// (composer/composer-agent-status.tsx); this file is simply not called.
//
// THE ROW IS THE OTHER WAY IN, and it makes the same trip for the task it
// names — `handleOpenTask` below is `handleOpenRun` with the guessing taken
// out. It is the only one of the two that can say WHICH once an agent is
// holding four, and the whole line is the target rather than the arrow at the
// end of it (composer/agent-status/agent-detail.tsx).
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

/** One agent tagged in one sent message: the run the bar draws, and what it is
    answering. `answeredAt` is the clock when the run landed on `done`. */
type Ask = {
  id: string;
  messageId: string;
  member: RoomMember;
  /** The message as stored, `@[id]` tokens and all. */
  text: string;
  run: AgentRun;
  answeredAt?: string;
};

/** The clock label every message wears ("7:05 PM"). Only ever called from an
    event or a timer, so the server never renders a time the client disagrees with. */
function clockLabel(): string {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/** A draft's lines as the room's paragraphs. */
function paragraphs(text: string): RoomBlock[] {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({ kind: "paragraph", text: line }));
}

export function RoomView({ room }: { room: Room }) {
  const [tab, setTab] = useState<RoomTab>("messages");

  const showTracker = useCallback(() => setTab("tracker"), []);
  const showMessages = useCallback(() => setTab("messages"), []);

  return (
    <RoomTrackerProvider room={room} onShowTracker={showTracker} onShowMessages={showMessages}>
      {/* Keyed on the room, so what was sent in one room is not still on
          screen after the route moves to the next. */}
      <RoomBody key={room.id} room={room} tab={tab} onTabChange={setTab} />
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
  // What this visit has said in the room, and what it asked the agents it tagged.
  const [sent, setSent] = useState<readonly RoomMessage[]>([]);
  const [asks, setAsks] = useState<readonly Ask[]>([]);
  const sentCount = useRef(0);
  // Runs somebody stopped. An id set rather than an edit, because half the bar
  // is the board's and this view does not own those rows — it can only say
  // "this one is over" and let the composition below apply it.
  const [endedIds, setEndedIds] = useState<ReadonlySet<string>>(new Set());

  // The roster in this room's own order, which is the order `@` offers it in.
  const members = useMemo(
    () => room.memberIds.map(roomMember).filter((member) => member !== undefined),
    [room.memberIds],
  );

  // The bar's side of the asks: one run per agent, the latest ask's. A Map
  // keeps an agent in the place it was first tagged, so tagging it again
  // replaces its chip rather than moving it to the end.
  const mentionRuns = useMemo(() => {
    const latest = new Map<string, AgentRun>();
    for (const ask of asks) latest.set(ask.member.id, ask.run);
    return [...latest.values()];
  }, [asks]);

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

  // A send posts the message, and starts an ask for every agent it named. The
  // run is still built from the draft as typed, because its one line of
  // detail is the reader's own words and `@[id]` tokens are not words.
  const handleSend = useCallback(
    (draft: string, mentionedIds: string[]) => {
      const text = toRoomText(draft, members);
      if (!text) return;
      sentCount.current += 1;
      const messageId = `sent_${sentCount.current}`;
      setSent((current) => [
        ...current,
        { id: messageId, authorId: "you", time: clockLabel(), blocks: paragraphs(text) },
      ]);
      const tagged = mentionedIds.flatMap((id) => {
        const member = roomMember(id);
        return member?.kind === "agent" ? [member] : [];
      });
      if (tagged.length === 0) return;
      setAsks((current) => [
        ...current,
        ...tagged.map((member) => ({
          id: `${messageId}_${member.id}`,
          messageId,
          member,
          text,
          run: runForMention(member, draft),
        })),
      ]);
    },
    [members],
  );

  // Nothing is running, so nothing needs a clock: the interval exists only
  // while there is an unfinished ask to advance, and clears itself the tick
  // after the last one lands on `done`.
  const working = asks.some((ask) => ask.run.state === "running");
  useEffect(() => {
    if (!working) return;
    const id = window.setInterval(() => {
      setAsks((current) =>
        current.map((ask) => {
          if (ask.run.state !== "running") return ask;
          const progress = (ask.run.progress ?? 0) + TICK_PROGRESS;
          if (progress < 1) return { ...ask, run: { ...ask.run, progress } };
          // Done keeps the task it finished and drops the fraction: a run that
          // stopped is not 100% of anything a reader wants (agent-status.ts).
          // The clock is taken here because this is the moment it answered.
          return { ...ask, run: { ...ask.run, state: "done" as const, progress: undefined }, answeredAt: clockLabel() };
        }),
      );
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [working]);

  // The room as this visit has changed it. Sent messages go on the end of
  // today (a room with no "Today" yet gets one), each carrying the replies its
  // answered asks have posted, and those replies are the thread the rail reads.
  const liveRoom = useMemo<Room>(() => {
    if (sent.length === 0) return room;
    const answers = new Map<string, RoomMessage[]>();
    for (const ask of asks) {
      if (ask.run.state !== "done" || !ask.answeredAt) continue;
      const reply: RoomMessage = {
        id: `${ask.id}_reply`,
        authorId: ask.member.id,
        time: ask.answeredAt,
        blocks: [{ kind: "paragraph", text: answerForMention(ask.member, ask.text) }],
      };
      answers.set(ask.messageId, [...(answers.get(ask.messageId) ?? []), reply]);
    }
    const messages = sent.map((message): RoomMessage => {
      const replies = answers.get(message.id);
      if (!replies) return message;
      return {
        ...message,
        replies: {
          count: replies.length,
          participantIds: [...new Set(replies.map((reply) => reply.authorId))],
          lastReplyLabel: `Last reply today at ${replies[replies.length - 1].time}`,
        },
      };
    });
    const last = room.days[room.days.length - 1];
    const days =
      last?.label === "Today"
        ? [...room.days.slice(0, -1), { ...last, messages: [...last.messages, ...messages] }]
        : [...room.days, { label: "Today", messages }];
    const threads = [...room.threads, ...[...answers].map(([rootId, replies]) => ({ rootId, replies }))];
    return { ...room, days, threads };
  }, [room, sent, asks]);

  // Who is still working on each sent message, for the thread link under it.
  const workingOn = useMemo(() => {
    const byMessage = new Map<string, RoomMember[]>();
    for (const ask of asks) {
      if (ask.run.state !== "running") continue;
      byMessage.set(ask.messageId, [...(byMessage.get(ask.messageId) ?? []), ask.member]);
    }
    return byMessage;
  }, [asks]);

  // Where a run's work was asked for. A board run's task names its source
  // message; a mention's run is answering the last message that tagged its
  // agent. Undefined for a card that was never said out loud.
  const sourceOf = useCallback(
    (run: AgentRun) => {
      const task = allTasks.find((candidate) => candidate.id === run.id);
      if (task) return task.sourceMessageId;
      return asks.findLast((ask) => ask.member.id === run.id)?.messageId;
    },
    [allTasks, asks],
  );

  // Where a picked chip goes in the CONVERSATION, on the one occasion the bar
  // still asks: an agent whose whole presence in the strip is this single run.
  // A board run knows the message its task came out of; a mention's run has no
  // card, so the room is asked where that agent has been working instead
  // (room-agent-runs.ts). Neither answering means the chip opens its detail and
  // nothing else moves, which is the honest outcome for an agent this room has
  // not spoken to yet.
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
      const messageId = sourceOf(run) ?? threadForAgent(liveRoom, agentId);
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
    [allTasks, openMessage, liveRoom, sourceOf],
  );

  // Stopping one. A board run is marked ended by id. A mention's run is the
  // agent's, so Stop calls off every ask that agent still has going — the
  // interval reads the asks, and one left running would go on to answer a
  // message after the reader stopped it. It is not added to `endedIds`: that
  // set is keyed on ids, a mention's id is the agent's, and the next tag of
  // the same agent would come up already stopped.
  const handleEndRun = useCallback(
    (run: AgentRun) => {
      if (!asks.some((ask) => ask.member.id === run.id)) {
        setEndedIds((current) => new Set(current).add(run.id));
        return;
      }
      setAsks((current) =>
        current.map((ask) =>
          ask.member.id === run.id && ask.run.state === "running"
            ? { ...ask, run: { ...ask.run, state: "stopped" as const, progress: undefined } }
            : ask,
        ),
      );
    },
    [asks],
  );

  // …and where ONE ROW of that detail goes — which, for an agent holding more
  // than one, is now the only way in. The task's own source message, and
  // nothing else: the chip's fallback (where has this agent been talking?) is
  // an answer about the agent, and a row that borrowed it would send four rows
  // of one agent's detail to the same thread and call each of them precise.
  const handleOpenTask = useCallback(
    (run: AgentRun) => {
      const messageId = sourceOf(run);
      if (!messageId) return;
      openMessage(messageId);
      setRail({ kind: "thread", rootId: messageId });
      setArrival((current) => (current ?? 0) + 1);
    },
    [openMessage, sourceOf],
  );

  // A run whose task was never said out loud keeps the word it always had at
  // the end of its row. The same test as the handler above, asked before the
  // arrow is drawn rather than after it is pressed, so no row ends in a control
  // that would quietly do nothing.
  const hasThread = useCallback((run: AgentRun) => sourceOf(run) !== undefined, [sourceOf]);

  // What is still running in the thread the rail is on. `endedIds` counts here
  // as well as in the bar: a run somebody stopped from the composer must not go
  // on shimmering in the rail as though nobody had.
  const workingHere = useMemo<RoomWorkingTask[]>(() => {
    if (!railRootId) return [];
    const board = allTasks.flatMap((task) => {
      if (task.status !== "working" || task.sourceMessageId !== railRootId) return [];
      if (endedIds.has(task.id)) return [];
      const member = roomMember(task.assigneeId);
      if (!member) return [];
      return [{ taskId: task.id, member, title: task.title, time: task.updated }];
    });
    // An ask carries its own turn, because the board has no card for it to be
    // looked up by: the cell presses through to it the way a card's does.
    const asked = asks.flatMap((ask) =>
      ask.messageId === railRootId && ask.run.state === "running"
        ? [
            {
              taskId: ask.id,
              member: ask.member,
              title: ask.run.task,
              time: "just now",
              turn: turnForMention(ask.member, ask.text),
            },
          ]
        : [],
    );
    return [...board, ...asked];
  }, [allTasks, asks, endedIds, railRootId]);

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

  // The rail's agent level, when the turn on it is a tagged agent's. Memoised
  // on the member and the text rather than the ask, which is a new object
  // every tick while its run advances.
  const railAsk = rail?.kind === "agent" ? asks.find((ask) => ask.id === rail.taskId) : undefined;
  const railAskMember = railAsk?.member;
  const railAskText = railAsk?.text;
  const railTurn = useMemo(
    () => (railAskMember && railAskText !== undefined ? turnForMention(railAskMember, railAskText) : undefined),
    [railAskMember, railAskText],
  );
  // Whose face and clock the turn wears: the ask's agent, or the board card's
  // assignee and its last update, the same pair its working cell showed.
  const railTask = rail?.kind === "agent" && !railAsk ? allTasks.find((task) => task.id === rail.taskId) : undefined;
  const railMember = railAskMember ?? (railTask ? roomMember(railTask.assigneeId) : undefined);
  const railTime = railAsk ? "just now" : railTask?.updated;

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
              room={liveRoom}
              working={workingOn}
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
          reasoning={railTurn}
          member={railMember}
          time={railTime}
          slug={room.slug}
          onBack={backToThread}
          onClose={closeRail}
          className="w-full shrink-0 lg:w-[400px]"
        />
      ) : (
        <RoomThreadPanel
          room={liveRoom}
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
