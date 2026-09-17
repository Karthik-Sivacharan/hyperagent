"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
// the affordance is honest rather than dead.

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

export function RoomComposer({
  placeholder,
  size = "default",
  autoFocus,
  className,
}: {
  /** Names the destination, and is the field's accessible name: "Message #release-train". */
  placeholder: string;
  size?: RoomComposerSize;
  autoFocus?: boolean;
  className?: string;
}) {
  const [draft, setDraft] = useState("");
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const metrics = SIZE[size];
  const canSend = draft.trim().length > 0;

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

  function send() {
    if (!canSend) return;
    setDraft("");
    editorRef.current?.focus();
  }

  return (
    <div
      className={cn(
        // The ring is the hairline at rest and the focus ring on focus-within,
        // so the whole box lights up rather than the textarea inside it; both
        // the ring and the lift are box-shadows, which is why one property
        // covers the transition.
        "group/composer relative w-full bg-surface-elevated shadow-sm ring-1 ring-border-subtle",
        "focus-within:shadow-md focus-within:ring-2 focus-within:ring-ring/50",
        "transition-[box-shadow] duration-[var(--duration-normal)] ease-out",
        metrics.shell,
        className,
      )}
    >
      <div className={cn("cursor-text", metrics.editor)}>
        <Textarea
          variant="bare"
          ref={editorRef}
          rows={1}
          value={draft}
          autoFocus={autoFocus}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
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
  );
}
