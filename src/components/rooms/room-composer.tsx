"use client";

import { type ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { IconArrowUp, IconPlus } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { matchMembers, RoomMentionMenu } from "@/components/rooms/room-mention-menu";
import type { RoomMember } from "@/lib/mock/rooms";

// The box you type into in a room: the app composer's leaner relative. It
// keeps the brand's chat-composer shape (the elevated surface, the hairline,
// the big radius, docs/brand/design.md §5, §6) and drops everything the room
// does not need — no model pill, no execution mode, no integrations strip —
// because a room message goes to the people and agents already in the room.
//
// Two sizes, one file. `default` is the room column; `compact` is the thread
// rail beside it, where 32px controls and a tighter radius keep a 320px
// column from reading as a squashed copy of the big one.
//
// The send button is the ONE brand-orange control in the whole room (§11), so
// its arrival is the view's single moment of colour: it sits on a tint fill
// while the draft is empty and turns orange the instant there is something to
// send, over 200ms of quart-out. That is slower than the app's 150ms button
// default on purpose — this transition is meant to be noticed, and it is the
// only one here that is.
//
// Nothing is ever sent: this is a UI clone. Enter still clears the draft, so
// the affordance is honest rather than dead — and it hands the room the agents
// the draft named, which is the one consequence a send has here.
//
// `@` OPENS THE ROSTER (room-mention-menu.tsx). The token is detected on the
// text BEFORE THE CARET rather than on the whole draft, so mentioning someone
// in the middle of a sentence you are going back over works the same as
// mentioning them at the end. What is inserted is the member's NAME, not the
// prose marker `@[id]` the message list renders: the field is a textarea, a
// reader would see the brackets, and a roster of fixed names resolves back to
// ids on send without a rich-text editor being introduced for a mock.
//
// THE MENU BORROWS THE FIELD'S KEYS. While it is open, Up, Down, Enter and Tab
// belong to the list and Escape closes it; everything else falls through to
// the textarea untouched, including the Enter that sends when the menu is shut.
// That ordering is the whole contract, and it is why the key handler below
// checks the menu first and returns.

type RoomComposerSize = "default" | "compact";

const SIZE = {
  default: {
    shell: "rounded-5xl",
    editor: "px-4 pt-3.5",
    row: "px-3 pt-1 pb-3",
    control: "icon",
    // The brand sets the composer at `base` (§4). `md:text-base` is the part
    // that matters: the Textarea primitive drops to 14px from `md` up, and a
    // room's message box is a reading surface, not a filter field.
    text: "text-base md:text-base",
  },
  compact: {
    shell: "rounded-3xl",
    editor: "px-3.5 pt-2.5",
    row: "px-2 pt-0.5 pb-2",
    control: "icon-sm",
    // 16px on a phone so iOS does not zoom the page when the field takes
    // focus, 14px from `md` up where the rail is actually narrow.
    text: "text-base md:text-sm",
  },
} as const;

// Lifted from src/components/composer/composer.tsx, which explains itself
// there and is the app's one auto-grow: one row until the text needs more,
// then up to MAX_EDITOR_PX and a scroll. `height: auto` first because
// scrollHeight only reports the content's height when the element is not
// already being held taller than it. Same file's SSR guard, too:
// useLayoutEffect warns when React renders this on the server, where there is
// no textarea to measure anyway.
const MAX_EDITOR_PX = 200;
function grow(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${Math.min(el.scrollHeight, MAX_EDITOR_PX)}px`;
}
const useBeforePaint = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** The `@name` being typed: what has been written after the `@`, and where the `@` is. */
type MentionQuery = { query: string; at: number };

/** The token under the caret, if the caret is inside one. A mention starts a
    word, so an email address never opens the roster. */
function mentionAt(text: string, caret: number): MentionQuery | null {
  const before = text.slice(0, caret);
  const match = /(?:^|\s)@([\p{L}\p{N}_-]*)$/u.exec(before);
  if (!match) return null;
  return { query: match[1], at: caret - match[1].length - 1 };
}

/**
 * The ids a draft named, in roster order. Longest name first while scanning,
 * so "@Media Lab Director" is not read as a mention of a "Media" who also
 * happens to be in the room; each hit is blanked out so one `@` is spent once.
 */
export function mentionedMemberIds(draft: string, members: readonly RoomMember[]): string[] {
  let rest = draft;
  const found = new Set<string>();
  for (const member of [...members].sort((a, b) => b.name.length - a.name.length)) {
    const token = `@${member.name}`;
    if (!rest.includes(token)) continue;
    found.add(member.id);
    rest = rest.split(token).join(" ");
  }
  return members.filter((member) => found.has(member.id)).map((member) => member.id);
}

/**
 * The draft as the room stores it: every "@Name" the roster recognises becomes
 * the `@[id]` token the written messages use (room-rich-text.tsx), so a sent
 * message draws its mentions exactly the way the mock's own do. The same scan
 * as above, longest name first, so "@Media Lab Director" is never cut down to
 * a "@Media" and the rest of the name left behind as prose.
 */
export function toRoomText(draft: string, members: readonly RoomMember[]): string {
  let text = draft.trim();
  for (const member of [...members].sort((a, b) => b.name.length - a.name.length)) {
    text = text.split(`@${member.name}`).join(`@[${member.id}]`);
  }
  return text;
}

export function RoomComposer({
  placeholder,
  size = "default",
  autoFocus,
  members = [],
  status,
  onSend,
  className,
}: {
  /** Names the destination, and is the field's accessible name: "Message #release-train". */
  placeholder: string;
  size?: RoomComposerSize;
  autoFocus?: boolean;
  /** The room's roster, which is what `@` offers. Omit and `@` is just a character. */
  members?: readonly RoomMember[];
  /** A strip across the top of the card, above the field: the agent bar
      (composer-agent-status.tsx) while anything the room tagged is out. */
  status?: ReactNode;
  /** The draft, and the ids it named. Called on a send that had something in it. */
  onSend?: (draft: string, mentionedIds: string[]) => void;
  className?: string;
}) {
  const [draft, setDraft] = useState("");
  const [mention, setMention] = useState<MentionQuery | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const metrics = SIZE[size];
  const canSend = draft.trim().length > 0;

  // No roster, no menu — and no candidates is the same thing as far as every
  // branch below is concerned, so the two collapse into one list.
  const candidates = useMemo(
    () => (mention && members.length > 0 ? matchMembers(members, mention.query) : []),
    [mention, members],
  );
  const menuOpen = candidates.length > 0;

  // Keyed on the value rather than hung off the textarea's own `onInput`, so a
  // draft cleared from a keystroke handler re-measures in the same frame that
  // cleared it.
  useBeforePaint(() => {
    grow(editorRef.current);
  }, [draft]);

  // …and again whenever the box CHANGES WIDTH, which is the same bug with a
  // different trigger. A room column narrows by ~320px the moment the thread
  // rail opens beside it, which is exactly the width at which a two-line draft
  // becomes three; no input event fires, so without this the box keeps the
  // height it measured before and clips the overflow.
  useEffect(() => {
    const el = editorRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => grow(el));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /** Re-reads the token under the caret after anything that could have moved it. */
  function syncMention(el: HTMLTextAreaElement | null) {
    if (!el) return;
    const next = mentionAt(el.value, el.selectionStart ?? el.value.length);
    setMention(next);
    setActiveIndex(0);
  }

  /** Swaps the half-typed `@name` for the whole one and puts the caret past it. */
  function pick(member: RoomMember) {
    if (!mention) return;
    const el = editorRef.current;
    const caret = el?.selectionStart ?? draft.length;
    const inserted = `@${member.name} `;
    const next = draft.slice(0, mention.at) + inserted + draft.slice(caret);
    setDraft(next);
    setMention(null);
    setActiveIndex(0);
    // After React has written the value, or the caret lands where the OLD
    // string put it and the next keystroke arrives in the middle of the name.
    const to = mention.at + inserted.length;
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(to, to);
    });
  }

  function send() {
    if (!canSend) return;
    onSend?.(draft, mentionedMemberIds(draft, members));
    setDraft("");
    setMention(null);
    editorRef.current?.focus();
  }

  return (
    // The card clips its own corners once there is a bar inside it, so the
    // strip's hairline stops at the radius rather than running past it; the
    // menu is OUTSIDE that clip, which is why it hangs off this wrapper and
    // not off the card.
    <div className="relative w-full">
      {menuOpen ? (
        <RoomMentionMenu
          members={candidates}
          activeIndex={activeIndex}
          onHover={setActiveIndex}
          onPick={pick}
        />
      ) : null}

      <div
      className={cn(
        // The ring is the hairline at rest and the focus ring on focus-within,
        // so the whole box lights up rather than the textarea inside it; both
        // the ring and the lift are box-shadows, which is why one property
        // covers the transition.
        "group/composer relative w-full bg-surface-elevated shadow-sm ring-1 ring-border-subtle",
        "focus-within:shadow-md focus-within:ring-2 focus-within:ring-ring/50",
        "transition-[box-shadow] duration-[var(--duration-normal)] ease-out",
        status && "overflow-hidden",
        metrics.shell,
        className,
      )}
    >
      {/* Inside the card and above the field, where the app composer puts its
          own status row (composer.tsx): part of the composer, not a banner. */}
      {status}

      <div className={cn("cursor-text", metrics.editor)}>
        <Textarea
          variant="bare"
          ref={editorRef}
          rows={1}
          value={draft}
          autoFocus={autoFocus}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(event) => {
            setDraft(event.target.value);
            syncMention(event.target);
          }}
          // The caret can move without the value changing — an arrow key, a
          // click, a drag-select — and a menu that only watched `onChange`
          // would stay open over a caret that had left the token.
          onSelect={(event) => syncMention(event.currentTarget)}
          onBlur={() => setMention(null)}
          onKeyDown={(event) => {
            if (menuOpen) {
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                const step = event.key === "ArrowDown" ? 1 : -1;
                // Wraps, because a four-name list is faster to walk round than
                // to walk back.
                setActiveIndex((i) => (i + step + candidates.length) % candidates.length);
                return;
              }
              if (event.key === "Enter" || event.key === "Tab") {
                event.preventDefault();
                pick(candidates[activeIndex]);
                return;
              }
              if (event.key === "Escape") {
                // Stops here: the room closes its thread rail on Escape, and
                // dismissing a menu should not also close the panel behind it.
                event.preventDefault();
                event.stopPropagation();
                setMention(null);
                return;
              }
            }
            if (event.key !== "Enter") return;
            // ⌘/Ctrl+Enter always sends; plain Enter sends; Shift+Enter is the
            // one Enter that stays a newline.
            if (event.metaKey || event.ctrlKey) {
              event.preventDefault();
              send();
              return;
            }
            if (event.shiftKey) return;
            event.preventDefault();
            send();
          }}
          className={cn("block max-h-[200px] resize-none overflow-y-auto", metrics.text)}
        />
      </div>

      <div className={cn("flex items-center justify-between gap-2", metrics.row)}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size={metrics.control}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Add to this message"
            >
              <IconPlus className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuItem>Attach a file</DropdownMenuItem>
            <DropdownMenuItem>Add from Library</DropdownMenuItem>
            <DropdownMenuItem>Run a skill</DropdownMenuItem>
            <DropdownMenuItem>Mention an agent</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="brand"
              size={metrics.control}
              aria-label="Send message"
              disabled={!canSend}
              onClick={send}
              className={cn(
                // `scale` has to stay in the list: Tailwind v4 compiles
                // `scale-*` to the CSS `scale` property, and overriding
                // Button's list without it kills the press feedback.
                "transition-[color,background-color,box-shadow,scale] duration-[var(--duration-normal)] ease-out-quart",
                "motion-safe:active:scale-[var(--scale-press-icon)]",
                // Empty: a tint fill, not a faded orange one. Tier 3 would
                // miss AA on a tint-10 ground, so the arrow sits on tier 2
                // (docs/brand/design.md §4.1).
                "disabled:bg-tint-10 disabled:text-muted-foreground disabled:opacity-100 disabled:shadow-none",
              )}
            >
              <IconArrowUp className="size-4" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Send message</TooltipContent>
        </Tooltip>
      </div>
      </div>
    </div>
  );
}
