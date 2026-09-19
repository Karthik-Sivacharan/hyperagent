"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconArrowsDiagonal,
  IconArrowsDiagonalMinimize2,
  IconArrowsExchange,
  IconChevronUp,
  IconEdit,
  IconFileAlert,
  IconFilePlus,
  IconFileText,
  IconMinus,
  IconX,
  type TablerIcon,
} from "@tabler/icons-react";

import { AgentGlyph } from "@/components/brand/agent-glyph";
import { AssistantMessage } from "@/components/thread/assistant-message";
import { ToolCallRow, type ToolCallStatus } from "@/components/thread/tool-call-row";
import { UserMessage } from "@/components/thread/user-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { WIKI_AGENT } from "@/components/wiki/wiki-agent";
import { WikiAsk } from "@/components/wiki/wiki-ask";
import type { MessageBlock } from "@/lib/mock/conversation";
import { WIKI_CHAT_SUGGESTIONS, wikiChatReply, type WikiChatSuggestionKind } from "@/lib/mock/wiki-chat";
import { cn } from "@/lib/utils";

// Wiki Agent's chat, as a window that floats over the wiki in the bottom
// right corner, the way a mail app's compose window does. Four states: closed
// (a pill in the corner, with a count of what needs you), open, minimised to
// its title bar, and expanded to the height of the screen. The title bar is
// the handle: drag it to move the window anywhere on screen (it stays at
// least 8px inside the edges), double-click it to send the window back to its
// corner. Expanding also sends it back, so the bigger window never starts
// half off screen.
//
// The window is not modal: the wiki stays live around it, which is the point
// of a floating chat. It sits on the sticky rung of the z ladder (40), under
// menus and dialogs, so the composer's own menus open over it.
//
// The conversation is mock and local: a message gets the agent's "Reading"
// rows for the pages it opens, the beam and the Working row on the ask box,
// and after a moment the written answer from src/lib/mock/wiki-chat.ts. Stop
// cuts the reading short and leaves the rows as they were, interrupted.

type Mode = "closed" | "open" | "minimized";
type Offset = { x: number; y: number };

type Turn =
  | { id: string; role: "user"; text: string }
  | {
      id: string;
      role: "agent";
      reads: readonly string[];
      blocks: readonly MessageBlock[];
      state: "running" | "done" | "interrupted";
    };

const SUGGESTION_ICONS: Record<WikiChatSuggestionKind, TablerIcon> = {
  conflict: IconArrowsExchange,
  missing: IconFilePlus,
  retracted: IconFileAlert,
};

/** How long the agent "reads" before it answers. */
const READING_MS = 1800;
/** The window keeps this much of the viewport around it while dragged. */
const EDGE = 8;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function HeaderButton({
  label,
  icon: Icon,
  onClick,
  disabled,
}: {
  label: string;
  icon: TablerIcon;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          onClick={onClick}
          disabled={disabled}
          className="text-muted-foreground hover:text-foreground"
        >
          <Icon className="size-4" aria-hidden="true" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function Suggestions({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="flex flex-col gap-4 pt-6 pb-2">
      <AgentGlyph shape={WIKI_AGENT.glyph} size={40} />
      <div className="flex flex-col gap-1">
        <p className="font-heading text-lg">{WIKI_AGENT.name}</p>
        <p className="text-muted-foreground text-sm">
          I read every page in the wiki. These need you; pick one, or ask me anything.
        </p>
      </div>
      <ul className="flex flex-col gap-1.5">
        {WIKI_CHAT_SUGGESTIONS.map((s) => {
          const Icon = SUGGESTION_ICONS[s.kind];
          return (
            <li key={s.id}>
              <Button
                variant="outline"
                size="none"
                onClick={() => onPick(s.prompt)}
                className="h-auto w-full justify-start gap-2.5 rounded-xl px-3 py-2.5 text-left font-normal text-sm whitespace-normal"
              >
                <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                {s.label}
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AgentTurn({ turn }: { turn: Extract<Turn, { role: "agent" }> }) {
  const status: ToolCallStatus =
    turn.state === "running" ? "running" : turn.state === "interrupted" ? "interrupted" : "done";
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col items-start gap-1">
        {turn.reads.map((page) => (
          <ToolCallRow key={page} label="Reading" detail={page} status={status} icon={IconFileText} />
        ))}
      </div>
      {turn.state === "done" && <AssistantMessage id={turn.id} blocks={[...turn.blocks]} />}
    </div>
  );
}

export function WikiChat() {
  const [mode, setMode] = useState<Mode>("closed");
  const [expanded, setExpanded] = useState(false);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");

  const windowRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useRef(0);
  const drag = useRef<{ x: number; y: number; start: Offset; min: Offset; max: Offset; moved: boolean } | null>(null);

  // One turn reads at a time: send waits for the last to land or be stopped.
  const reading = turns.find(
    (t): t is Extract<Turn, { role: "agent" }> => t.role === "agent" && t.state === "running",
  );
  const running = reading !== undefined;
  const task = reading ? `Reading ${reading.reads.length} ${reading.reads.length === 1 ? "page" : "pages"}…` : undefined;

  useEffect(() => {
    const pending = timer;
    return () => {
      if (pending.current) clearTimeout(pending.current);
    };
  }, []);

  // Keep the newest turn in view as the conversation grows.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, mode]);

  const id = () => `wiki-chat-${nextId.current++}`;

  function send(text: string) {
    const prompt = text.trim();
    if (!prompt || running) return;
    const reply = wikiChatReply(prompt);
    const agentId = id();
    setTurns((prev) => [
      ...prev,
      { id: id(), role: "user", text: prompt },
      { id: agentId, role: "agent", reads: reply.reads, blocks: reply.blocks, state: "running" },
    ]);
    setDraft("");
    timer.current = setTimeout(() => {
      setTurns((prev) => prev.map((t) => (t.id === agentId && t.role === "agent" ? { ...t, state: "done" } : t)));
      timer.current = null;
    }, READING_MS);
  }

  function stop() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setTurns((prev) =>
      prev.map((t) => (t.role === "agent" && t.state === "running" ? { ...t, state: "interrupted" } : t)),
    );
  }

  function newChat() {
    stop();
    setTurns([]);
    setDraft("");
  }

  function toggleExpanded() {
    setExpanded((value) => !value);
    setOffset({ x: 0, y: 0 });
  }

  // Dragging by the title bar. The bounds are worked out once, from where the
  // window is when the drag starts, so it can never be pulled past an edge.
  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || (event.target as HTMLElement).closest("button")) return;
    const rect = windowRef.current?.getBoundingClientRect();
    if (!rect) return;
    drag.current = {
      x: event.clientX,
      y: event.clientY,
      start: offset,
      min: { x: offset.x - (rect.left - EDGE), y: offset.y - (rect.top - EDGE) },
      max: { x: offset.x + (window.innerWidth - EDGE - rect.right), y: offset.y + (window.innerHeight - EDGE - rect.bottom) },
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    const dx = event.clientX - d.x;
    const dy = event.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
    setOffset({ x: clamp(d.start.x + dx, d.min.x, d.max.x), y: clamp(d.start.y + dy, d.min.y, d.max.y) });
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    // A click (not a drag) on a minimised bar opens it again, as a mail app's does.
    if (d && !d.moved && mode === "minimized") setMode("open");
  }

  if (mode === "closed") {
    return (
      <Button
        variant="outline"
        onClick={() => setMode("open")}
        className="fixed right-6 bottom-6 z-40 h-11 gap-2 rounded-full bg-overlay pr-3 pl-2 shadow-lg animate-in fade-in-0 zoom-in-95 duration-(--duration-enter) ease-out-quart"
      >
        <AgentGlyph shape={WIKI_AGENT.glyph} size={28} />
        <span>Ask {WIKI_AGENT.name}</span>
        <Badge variant="brand">
          {WIKI_CHAT_SUGGESTIONS.length}
          <span className="sr-only"> need you</span>
        </Badge>
      </Button>
    );
  }

  const minimized = mode === "minimized";

  return (
    <div
      ref={windowRef}
      role="dialog"
      aria-label={WIKI_AGENT.name}
      data-state={mode}
      data-expanded={expanded || undefined}
      style={{ translate: `${offset.x}px ${offset.y}px` }}
      className={cn(
        "fixed right-6 bottom-6 z-40 flex origin-bottom-right flex-col overflow-hidden rounded-4xl bg-overlay text-foreground shadow-lg ring-1 ring-border-subtle",
        "transition-[width,height] duration-(--duration-move) ease-out-quart animate-in fade-in-0 zoom-in-95 motion-reduce:transition-none",
        minimized
          ? "h-12 w-80"
          : expanded
            ? "h-[calc(100dvh-3rem)] w-[min(720px,calc(100vw-3rem))]"
            : "h-[min(640px,calc(100dvh-3rem))] w-100",
      )}
    >
      {/* The title bar is the drag handle; its buttons are left out of the drag. */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={(event) => {
          if (!(event.target as HTMLElement).closest("button")) setOffset({ x: 0, y: 0 });
        }}
        className={cn(
          "flex h-12 shrink-0 cursor-grab touch-none items-center gap-2 pr-2 pl-3 select-none active:cursor-grabbing",
          !minimized && "border-b border-border-subtle",
        )}
      >
        <AgentGlyph shape={WIKI_AGENT.glyph} size={24} />
        <span className="min-w-0 flex-1 truncate font-medium text-sm">{WIKI_AGENT.name}</span>
        {minimized && running && <span className="text-muted-foreground text-xs">{task}</span>}
        {!minimized && (
          <HeaderButton label="New chat" icon={IconEdit} onClick={newChat} disabled={turns.length === 0} />
        )}
        {minimized ? (
          <HeaderButton label="Restore" icon={IconChevronUp} onClick={() => setMode("open")} />
        ) : (
          <HeaderButton label="Minimize" icon={IconMinus} onClick={() => setMode("minimized")} />
        )}
        {!minimized && (
          <HeaderButton
            label={expanded ? "Shrink" : "Expand"}
            icon={expanded ? IconArrowsDiagonalMinimize2 : IconArrowsDiagonal}
            onClick={toggleExpanded}
          />
        )}
        <HeaderButton label="Close" icon={IconX} onClick={() => setMode("closed")} />
      </div>

      {!minimized && (
        <>
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
            {turns.length === 0 ? (
              <Suggestions onPick={send} />
            ) : (
              turns.map((turn) =>
                turn.role === "user" ? (
                  <UserMessage key={turn.id} id={turn.id} text={turn.text} sentAtLabel="Just now" />
                ) : (
                  <AgentTurn key={turn.id} turn={turn} />
                ),
              )
            )}
          </div>
          <div className="shrink-0 px-3 pb-3">
            <WikiAsk
              value={draft}
              onValueChange={setDraft}
              onSend={() => send(draft)}
              task={task}
              onStop={stop}
              autoFocus
            />
          </div>
        </>
      )}
    </div>
  );
}
