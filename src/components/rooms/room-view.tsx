"use client";

import { useState } from "react";
import { IconLayoutBoardSplit } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/patterns/empty-state";
import { RoomComposer } from "@/components/rooms/room-composer";
import { RoomHeader, type RoomTab } from "@/components/rooms/room-header";
import { RoomMessageList } from "@/components/rooms/room-message-list";
import { RoomThreadPanel } from "@/components/rooms/room-thread-panel";
import type { Room } from "@/lib/mock/rooms";

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

export function RoomView({ room }: { room: Room }) {
  const [tab, setTab] = useState<RoomTab>("messages");
  // The room opens on its liveliest thread. A room whose threads are all
  // resolved opens closed, which is also what a new room does.
  const [threadRootId, setThreadRootId] = useState<string | undefined>(room.threads[0]?.rootId);

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
              <RoomComposer placeholder={`Message #${room.slug}`} />
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
