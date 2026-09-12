"use client";

import { useRef, useState } from "react";

import { Composer } from "@/components/composer/composer";
import { SuggestionTray } from "@/components/home/suggestion-tray";
import { cn } from "@/lib/utils";

// The home composer with its "Suggested for you" tray. The two are one frame,
// as in the reference (a rival general-agent app's home screen): the composer
// is raised and the tray is the sunken base it sits in, so the tray's fill
// shows in the composer's rounded bottom corners and the composer's shadow
// falls on the tray. The frame's corners are the composer's own 32px, and the
// composer spans it edge to edge, so the frame's top half is exactly hidden
// behind it.
//
// `surface-secondary` is the composer's own footer strip ("Connect your
// integrations"), so the strip and the tray read as one continuous base.
//
// Dismiss collapses the tray's row to 0fr rather than unmounting it: the
// block around it is centred on the page, and a tray that vanished in one
// frame would drop the composer half its height in one frame too.
export function HomeComposer() {
  const [draft, setDraft] = useState("");
  const [trayOpen, setTrayOpen] = useState(true);
  const frameRef = useRef<HTMLDivElement>(null);

  // A card puts its prompt in the box and hands the box focus with the caret
  // at the end, as the signup flow's agent cards do (chat-step.tsx), so the
  // next thing you do is edit or send. After the commit, or the field still
  // holds the old text when the caret is placed.
  function pick(prompt: string) {
    setDraft(prompt);
    requestAnimationFrame(() => {
      const field = frameRef.current?.querySelector("textarea");
      if (!field) return;
      field.focus({ preventScroll: true });
      field.setSelectionRange(field.value.length, field.value.length);
    });
  }

  // The dismiss button goes inert with the tray it closes, which drops focus
  // to <body>. The composer is where anyone who just waved the suggestions
  // away is going next.
  function dismiss() {
    setTrayOpen(false);
    frameRef.current?.querySelector("textarea")?.focus({ preventScroll: true });
  }

  return (
    <div
      ref={frameRef}
      className={cn(
        "rounded-5xl transition-[background-color,box-shadow] duration-(--duration-slide) ease-in-out",
        trayOpen ? "bg-surface-secondary ring-1 ring-border-subtle" : "bg-transparent ring-0",
      )}
    >
      <Composer value={draft} onValueChange={setDraft} />
      <div
        inert={!trayOpen}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-(--duration-slide) ease-in-out motion-reduce:transition-none",
          trayOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <SuggestionTray onPick={pick} onDismiss={dismiss} />
        </div>
      </div>
    </div>
  );
}
