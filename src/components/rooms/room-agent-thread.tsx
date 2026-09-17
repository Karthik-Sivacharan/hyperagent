"use client";

import {
  IconArrowLeft,
  IconDownload,
  IconFileOff,
  IconFileText,
  IconPencil,
  IconPlug,
  IconPuzzle,
  IconX,
  type TablerIcon,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/patterns/empty-state";
import { StreamingMessage, streamLength, useTextStream } from "@/components/thread/streaming-message";
import { ToolCallCount, ToolCallRow } from "@/components/thread/tool-call-row";
import { reasoningForTask } from "@/lib/mock/room-reasoning";
import type { StreamRowIcon } from "@/lib/mock/agent-stream";

// The rail's second level: what an agent is actually doing on one task.
//
// It is the same box as the thread it replaces (room-thread-panel.tsx) — the
// second neutral layer behind a left hairline, the 48px header that lines up
// with the room header across the seam — because the rail did not go anywhere,
// only its contents did. What the header gains is a BACK control, in the slot
// the thread's title starts in, and it keeps Close at the other end: back
// returns to the thread you came from, close puts the rail away. They are
// different sentences and neither is the other's undo, so they are drawn at
// opposite ends of the bar rather than beside each other.
//
// NOTHING NEW IS INVENTED INSIDE IT. A working turn in this product is a stack
// of tool-call rows and the prose the agent writes under them, and both already
// exist as components the thread view uses (thread/tool-call-row.tsx,
// thread/streaming-message.tsx). This file is the composition and the pace,
// not a third drawing of the same object. The signup flow's `AgentTurn` is the
// same composition one size larger, and it is deliberately not imported: it
// carries a skills question, an answer and an acknowledgement, which is a
// conversation this rail is not having.
//
// THE LAST ROW IS THE LIVE ONE, which is the mock's own contract
// (lib/mock/room-reasoning.ts) and the reason the cell in the thread can say
// what the agent is doing in one line: that line is this row's label. So every
// row above it is `done` and it alone is `running`, shimmering on the house
// device. The prose under them streams in on `useTextStream` at the thread
// view's own pace: text arriving is content rather than motion, so it is not
// gated on reduced motion, and one band crossing a label is the only thing in
// here that is.
//
// SHORT ON PURPOSE. The rail is 400px and the reader arrived from a one-line
// status, so three or four rows and two short paragraphs is the whole budget.
// The mock enforces it; this file only has to not add chrome around it.

/** The mock's icon names, drawn. The same five the signup flow maps, kept here
    rather than imported because a room component may not reach into that flow. */
const ICONS: Record<StreamRowIcon, TablerIcon> = {
  reading: IconFileText,
  pencil: IconPencil,
  puzzle: IconPuzzle,
  plug: IconPlug,
  download: IconDownload,
};

/** The rail's header, shared by the turn and the one state that has no turn. */
const HEADER = "flex h-12 shrink-0 items-center gap-2 border-b border-border-subtle px-3";
const HEADER_BUTTON = "size-7 shrink-0 text-muted-foreground hover:text-foreground";

export function RoomAgentThread({
  taskId,
  onBack,
  onClose,
  className,
}: {
  /** The task whose turn to play back (`RoomTask.id`). */
  taskId: string;
  /** Back to the thread this was opened from. */
  onBack: () => void;
  /** Close the rail entirely, from two levels in. */
  onClose: () => void;
  className?: string;
}) {
  // Undefined is a real answer: the board holds tasks whose agents are working
  // somewhere this mock does not follow, and the honest thing to do with one
  // is to say so rather than to draw an empty turn that looks like a failure.
  const reasoning = reasoningForTask(taskId);
  const prose = reasoning?.prose ?? [];
  const total = streamLength(prose);
  const revealed = useTextStream(total, { active: total > 0 });

  const rows = reasoning?.rows ?? [];
  const live = rows.at(-1);

  return (
    <aside
      aria-label={reasoning ? `What ${reasoning.agentName} is doing` : "What this agent is doing"}
      // A FADE, NOT A SLIDE. The rail's own entrance travels 16px in from the
      // right because that is where the rail comes from; this level was opened
      // inside a rail that is already standing there, and a box that slid again
      // would claim a move that did not happen.
      className={cn(
        "relative isolate flex h-full min-h-0 flex-col border-l border-border-subtle bg-surface-secondary",
        "ease-out-quart motion-safe:animate-in motion-safe:fade-in motion-safe:animation-duration-(--duration-enter)",
        className,
      )}
      // Escape goes back one level and stops here, the same contract the
      // composer's agent detail keeps: one Escape closes one thing. There is
      // no field at this level for it to mean anything else in, and stopping
      // it is what keeps a press from also closing something further out.
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.stopPropagation();
        onBack();
      }}
    >
      <div className={HEADER}>
        {/* An arrow, not a chevron: this goes somewhere rather than revealing
            something in place (docs/brand/icons.md). Its name says the
            destination, because "Back" alone is only a direction. */}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn("-ml-1", HEADER_BUTTON)}
          aria-label="Back to the thread"
          onClick={onBack}
        >
          <IconArrowLeft className="size-4" aria-hidden="true" />
        </Button>

        {/* The thread's header shape exactly: tier 1 for what the panel is,
            tier 3 for whose it is, on one baseline. */}
        <div className="flex min-w-0 flex-1 items-baseline gap-2">
          <span className="shrink-0 font-medium text-foreground text-sm">Working</span>
          {reasoning ? <span className="truncate text-foreground-low text-xs">{reasoning.agentName}</span> : null}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={HEADER_BUTTON}
          aria-label="Close thread"
          onClick={onClose}
        >
          <IconX className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        {reasoning ? (
          <div className="px-4 py-3" aria-busy={revealed < total || undefined}>
            {/* The shimmer is the only visible sign that the last row is still
                going, and it says nothing to anyone who cannot see it. One
                polite phrase, the same device the signup turn uses. */}
            <p className="sr-only" role="status" aria-live="polite">
              {live ? `${reasoning.agentName} is working: ${live.label}` : `${reasoning.agentName} is working`}
            </p>

            {/* Rows first, then what it has written, with the gap between them
                a step wider than the gap inside the stack: that is where the
                turn changes from what it did to what it has to say. */}
            <div className="space-y-2 pb-3">
              {rows.map((row, i) => (
                <div key={row.id} className="min-w-0">
                  <ToolCallRow
                    label={row.label}
                    detail={row.detail}
                    status={i === rows.length - 1 ? "running" : "done"}
                    icon={ICONS[row.icon]}
                    // Only a count: a room turn's receipts are figures, and the
                    // logo stack the signup flow draws belongs to a row that
                    // went looking for connectors.
                    receipt={
                      row.receipt?.kind === "count" ? <ToolCallCount>{row.receipt.text}</ToolCallCount> : undefined
                    }
                  />
                </div>
              ))}
            </div>

            {/* The prose block brings the thread view's own right gutter with
                it (`pr-8`, the room a finished message leaves for its hover
                actions), so its column is a little narrower than the rows
                above. On ragged-right text nothing shows, and reaching into
                that component to take it off would be a worse trade. */}
            {total > 0 ? <StreamingMessage paragraphs={prose} revealed={revealed} /> : null}
          </div>
        ) : (
          // Its own gutter: the pattern centres its copy and owns no side
          // padding, which is right in a page column and edge to edge in a
          // 400px rail.
          <div className="px-6">
            <EmptyState
              variant="plain"
              icon={IconFileOff}
              title="Nothing written down"
              description="This agent is working somewhere the room cannot follow, so there is no trace of this task to read."
            />
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
