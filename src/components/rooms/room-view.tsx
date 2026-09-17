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
import { roomMember, type Room } from "@/lib/mock/rooms";
import { runForMention } from "@/lib/mock/room-agent-runs";

// The room, assembled: chrome, the message column, the composer, and the
// thread rail beside them. This file owns the two pieces of state the three
// columns share (which tab is showing, which thread the rail is on) and
// nothing else; every part below it is told what to render.
//
// The rail is the interesting layout problem. On a wide screen it sits beside
// the messages, which is the whole point of replying in a thread: the room
// keeps going while a side conversation happens. Below `lg` there is no room
// for both, so the rail takes the column instead of squeezing it, which is
// done with one `max-lg:hidden` rather than a resize listener.
//
// …and one more piece of state since the composer learned `@`: the agents this
// room has out. Tagging an agent and sending is what starts a run, so the
// mention in the field and the chip in the bar are two views of the same act,
// and the room owns the list because the bar sits above a composer that is
// re-created every time the tab changes.
//
// ONLY AGENTS RUN. A room mentions its people too, and those mentions do
// nothing here beyond being written — a person is not a fleet member, and a
// chip that claimed otherwise would be the one dishonest thing on the screen.
//
// THE RUN MOVES ON ITS OWN, because a bar that never changed would prove only
// that a chip can be added. Each tagged agent fills its dial over TICK_MS and
// settles on `done`, which is the shortest honest lifecycle the four states
// allow: hueless while it works, green when it stops. One interval for the
// whole fleet rather than one per agent, so ten chips cost one timer.

/** How often the mock fleet advances, and how much of the dial a tick is worth. */
const TICK_MS = 900;
const TICK_PROGRESS = 0.12;

export function RoomView({ room }: { room: Room }) {
  const [tab, setTab] = useState<RoomTab>("messages");
  const [runs, setRuns] = useState<readonly AgentRun[]>([]);
  // The room opens on its liveliest thread. A room whose threads are all
  // resolved opens closed, which is also what a new room does.
  const [threadRootId, setThreadRootId] = useState<string | undefined>(room.threads[0]?.rootId);

  // The roster in this room's own order, which is the order `@` offers it in.
  const members = useMemo(
    () => room.memberIds.map(roomMember).filter((member) => member !== undefined),
    [room.memberIds],
  );

  // A send starts a run for every agent the draft named. An agent already in
  // the bar is handed the new message rather than added twice: the fleet is
  // keyed by agent, not by mention.
  const handleSend = useCallback(
    (draft: string, mentionedIds: string[]) => {
      const tagged = mentionedIds.flatMap((id) => {
        const member = roomMember(id);
        return member?.kind === "agent" ? [runForMention(member, draft)] : [];
      });
      if (tagged.length === 0) return;
      setRuns((current) => {
        const next = [...current];
        for (const run of tagged) {
          const at = next.findIndex((existing) => existing.id === run.id);
          if (at === -1) next.push(run);
          else next[at] = run;
        }
        return next;
      });
    },
    [],
  );

  // Nothing is running, so nothing needs a clock: the interval exists only
  // while there is an unfinished run to advance, and clears itself the tick
  // after the last one lands on `done`.
  const working = runs.some((run) => run.state === "running");
  useEffect(() => {
    if (!working) return;
    const id = window.setInterval(() => {
      setRuns((current) =>
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

  const openThread = (messageId: string) => setThreadRootId(messageId);
  const toggleThread = () => setThreadRootId((current) => (current ? undefined : room.threads[0]?.rootId));

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <div className={cn("flex min-w-0 flex-1 flex-col", threadRootId && "max-lg:hidden")}>
        <RoomHeader
          room={room}
          tab={tab}
          onTabChange={setTab}
          threadOpen={Boolean(threadRootId)}
          onToggleThread={toggleThread}
        />

        {tab === "messages" ? (
          <>
            <RoomMessageList
              room={room}
              activeThreadId={threadRootId}
              onOpenThread={openThread}
              className="min-h-0 flex-1"
            />
            <div className="shrink-0 px-4 pt-1 pb-4">
              <RoomComposer
                placeholder={`Message #${room.slug}`}
                members={members}
                onSend={handleSend}
                status={runs.length > 0 ? <ComposerAgentStatus runs={runs} /> : null}
              />
            </div>
          </>
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
          onClose={() => setThreadRootId(undefined)}
          className="w-full shrink-0 lg:w-[400px]"
        />
      ) : null}
    </div>
  );
}
