"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TONE_GLYPH, type RunCaptionTone } from "@/components/teams/fleet/run-caption";

// The pieces every section of the agent sheet's body shares.
//
// A SECTION IS A TITLE AND WHITESPACE. No band, no hairline, no count: the
// sections stand 32px apart (agent-profile.tsx) and each opens on a quiet
// sentence-case title on the third text tier, 8px above its first row, so
// the title belongs to its rows and the gap above it does the dividing.
//
// THE FOLDS. Two things in the sheet fold, the done runs and the details,
// and both use the same ghost toggle and the same move: the content opens on
// its measured height (the collapsible-down / -up keyframes in globals.css)
// at the brand's layout move, 220ms on ease-out-layout, and the chevron turns
// a quarter at 200ms. Both are CSS, so reduced motion drops them and the
// content simply appears. The toggle's hit box is 28px tall but it takes 18px
// of layout (`-my-1.25`), so the text sits on the same rhythm as a section
// title; its pill fill shows on hover only, not while open, because nothing
// in the sheet is filled at rest (plan §3).

export const SECTION_TITLE = "text-md font-medium text-foreground-low";

export const FOLD_TRIGGER =
  "-my-1.25 -ml-2 h-7 gap-1 px-2 text-md font-medium aria-expanded:bg-transparent aria-expanded:hover:bg-tint-10";

export const FOLD_CHEVRON =
  "size-3.5 transition-transform duration-(--duration-normal) ease-out-quart group-data-[state=closed]/button:-rotate-90 motion-reduce:transition-none";

export const FOLD_CONTENT =
  "overflow-hidden data-[state=closed]:animate-[collapsible-up_var(--duration-move)_var(--ease-out-layout)] data-[state=open]:animate-[collapsible-down_var(--duration-move)_var(--ease-out-layout)] motion-reduce:animate-none";

export function SheetSection({ title, children }: { title: string; children: ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id}>
      <h3 id={id} className={cn(SECTION_TITLE, "mb-2")}>
        {title}
      </h3>
      {children}
    </section>
  );
}

// A stuck agent's glyph, before its reason, in the header's state line (and
// on a run's caption, though the sheet drops a caption that only repeats the
// header, sheet-runs.tsx). The only status colour the sheet spends besides
// the Needs you glyph and the spend meter's fill (plan §3); the reason
// beside it stays muted.
export function ToneGlyph({ tone, className }: { tone: RunCaptionTone; className?: string }) {
  const { icon: Icon, className: toneClass } = TONE_GLYPH[tone];
  return <Icon className={cn("size-3.5 shrink-0", toneClass, className)} aria-hidden="true" />;
}
