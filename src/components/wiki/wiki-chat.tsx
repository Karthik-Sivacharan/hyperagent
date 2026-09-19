"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  IconArrowsDiagonal,
  IconArrowsDiagonalMinimize2,
  IconArrowsExchange,
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
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { WIKI_AGENT } from "@/components/wiki/wiki-agent";
import { WikiAsk } from "@/components/wiki/wiki-ask";
import type { MessageBlock } from "@/lib/mock/conversation";
import { WIKI_CHAT_SUGGESTIONS, wikiChatReply, type WikiChatSuggestionKind } from "@/lib/mock/wiki-chat";
import { cn } from "@/lib/utils";

// Wiki Agent's chat. It lives in the wiki's left pane: a dock at the foot
// of the index rail, the rail's own 240px wide, with the beam running round
// it for as long as the chat is not open, so the agent is always one glance
// away. Open, it is a window that grows out of the dock's corner (its bottom
// left on the dock's bottom left) over the article, the way a mail app's
// compose window grows out of its corner. From there it minimises back into
// the dock, expands to the height of the screen, or closes to the dock's
// resting "Ask" state. The title bar is the handle: drag it anywhere on
// screen (it stays 8px inside the edges), double-click it to send the window
// home. Expanding also sends it home, so the bigger window never starts half
// off screen.
//
// The window is portalled to <body> and not modal: the wiki stays live
// around it. It sits on the sticky rung of the z ladder (40), under menus and
// dialogs, so the composer's own menus open over it.
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
/** Room kept above and beside an opened window, so it never meets an edge. */
const TOP_GAP = 24;
/** The chat's one palette, on the dock and on the ask box alike. */
const BEAM = { colorVariant: "colorful" } as const;

/** Where the window grows from: the dock's bottom-left corner, in viewport terms. */
type Anchor = { left: number; bottom: number; above: number; right: number };

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

export function WikiChat({ className }: { className?: string }) {
  const [mode, setMode] = useState<Mode>("closed");
  const [expanded, setExpanded] = useState(false);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");

  const dockRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useRef(0);
  const drag = useRef<{ x: number; y: number; start: Offset; min: Offset; max: Offset } | null>(null);

  // One turn reads at a time: send waits for the last to land or be stopped.
  const reading = turns.find(
    (t): t is Extract<Turn, { role: "agent" }> => t.role === "agent" && t.state === "running",
  );
  const running = reading !== undefined;
  const task = reading ? `Reading ${reading.reads.length} ${reading.reads.length === 1 ? "page" : "pages"}…` : undefined;
  const open = mode === "open";
  const home = offset.x === 0 && offset.y === 0;

  useEffect(() => {
    const pending = timer;
    return () => {
      if (pending.current) clearTimeout(pending.current);
    };
  }, []);

  // The dock does not move while the window is open (the rail beside it is
  // fixed; only the article scrolls), but the viewport can: re-measure on a
  // resize so the window keeps growing out of the dock's corner.
  useEffect(() => {
    if (!open) return;
    const measure = () => {
      const rect = dockRef.current?.getBoundingClientRect();
      if (!rect) return;
      setAnchor({
        left: rect.left,
        bottom: window.innerHeight - rect.bottom,
        above: rect.bottom,
        right: window.innerWidth - rect.left,
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open]);

  // Keep the newest turn in view as the conversation grows.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, mode, anchor]);

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

  function close() {
    setMode("closed");
    setExpanded(false);
    setOffset({ x: 0, y: 0 });
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
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    setOffset({
      x: clamp(d.start.x + event.clientX - d.x, d.min.x, d.max.x),
      y: clamp(d.start.y + event.clientY - d.y, d.min.y, d.max.y),
    });
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  // The window's size, from the room the dock leaves above it and to its right.
  const size = anchor && {
    width: expanded ? Math.min(720, anchor.right - TOP_GAP) : 400,
    height: expanded ? anchor.above - TOP_GAP : Math.min(640, anchor.above - TOP_GAP),
  };

  return (
    <div ref={dockRef} className={cn("w-60", className)}>
      {/* The dock: "Ask" at rest, the conversation's own bar while minimised.
          Under an open window it stays where it is, so the rail never shifts;
          the beam fades out there. While the window sits at home it is also
          hidden, since its tighter corner would show past the window's. */}
      <BorderBeam {...BEAM} active={!open} className={cn(open && home && "invisible")}>
        {mode === "minimized" ? (
          <div className="flex h-11 w-full items-center gap-0.5 rounded-xl bg-overlay pr-1 shadow-edge">
            <Button
              variant="ghost"
              size="none"
              onClick={() => setMode("open")}
              aria-label={`Open ${WIKI_AGENT.name}`}
              className="h-full min-w-0 flex-1 justify-start gap-2 rounded-xl pr-1 pl-2 font-normal"
            >
              <AgentGlyph shape={WIKI_AGENT.glyph} size={28} />
              <span className="min-w-0 truncate text-sm">
                <span className="font-medium">{WIKI_AGENT.name}</span>
                {task && <span className="text-muted-foreground"> {task}</span>}
              </span>
            </Button>
            <HeaderButton label="Close" icon={IconX} onClick={close} />
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setMode("open")}
            className="h-11 w-full justify-start gap-2 rounded-xl bg-overlay pr-3 pl-2"
          >
            <AgentGlyph shape={WIKI_AGENT.glyph} size={28} />
            <span>Ask {WIKI_AGENT.name}</span>
            <Badge variant="brand" className="ml-auto">
              {WIKI_CHAT_SUGGESTIONS.length}
              <span className="sr-only"> need you</span>
            </Badge>
          </Button>
        )}
      </BorderBeam>

      {open &&
        anchor &&
        size &&
        createPortal(
          <div
            ref={windowRef}
            role="dialog"
            aria-label={WIKI_AGENT.name}
            data-expanded={expanded || undefined}
            style={{
              left: anchor.left,
              bottom: anchor.bottom,
              width: size.width,
              height: size.height,
              translate: `${offset.x}px ${offset.y}px`,
            }}
            // The corner is the ask box's own (rounded-5xl) plus the 12px it
            // sits in from the edge, so the two curves share a centre and the
            // gap between them stays even round the bend.
            className="fixed z-40 flex origin-bottom-left flex-col overflow-hidden rounded-[calc(var(--radius-5xl)+--spacing(3))] bg-overlay text-foreground shadow-lg ring-1 ring-border-subtle transition-[width,height] duration-(--duration-move) ease-out-quart animate-in fade-in-0 zoom-in-95 motion-reduce:transition-none"
          >
            {/* The title bar is the drag handle; its buttons are left out of the drag.
                It is 56px tall and 16px in, the body's own inset, so the glyph
                and the buttons clear the wide corners instead of being cut. */}
            <div
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onDoubleClick={(event) => {
                if (!(event.target as HTMLElement).closest("button")) setOffset({ x: 0, y: 0 });
              }}
              className="flex h-14 shrink-0 cursor-grab touch-none items-center gap-2 border-b border-border-subtle px-4 select-none active:cursor-grabbing"
            >
              <AgentGlyph shape={WIKI_AGENT.glyph} size={24} />
              <span className="min-w-0 flex-1 truncate font-medium text-sm">{WIKI_AGENT.name}</span>
              <HeaderButton label="New chat" icon={IconEdit} onClick={newChat} disabled={turns.length === 0} />
              <HeaderButton label="Minimize" icon={IconMinus} onClick={() => setMode("minimized")} />
              <HeaderButton
                label={expanded ? "Shrink" : "Expand"}
                icon={expanded ? IconArrowsDiagonalMinimize2 : IconArrowsDiagonal}
                onClick={toggleExpanded}
              />
              <HeaderButton label="Close" icon={IconX} onClick={close} />
            </div>

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
                beam={BEAM}
                autoFocus
              />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
