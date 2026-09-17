"use client";

import { useEffect, useRef } from "react";
import { IconArrowLeft } from "@tabler/icons-react";

import { AgentGlyph } from "@/components/brand/agent-glyph";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { RUN_STATES } from "./run-state";
import { StateDial } from "./state-dial";
import type { AgentRun } from "./types";

// One agent, opened out inside the bar it was a chip in.
//
// The rule this variant inherits from the "Working… / Stop" strip
// (composer-status.tsx) is that the bar NEVER animates its height: it is
// layout, the composer is docked at the bottom of the screen, and a row that
// eased open would drag the field's top edge for no information. Expanding an
// agent here is the same promise kept one level deeper — the bar does not
// grow to hold the detail, its CONTENTS swap. So this row is the collapsed
// bar's own box, to the pixel (36px, one hairline under it, 16px of side
// padding), and only the things inside it fade in, over --duration-enter.
// The box is simply there; the words arrive in it.
//
// Reading order, left to right: back, who, how far, what, and — last, at the
// far right — the state as a WORD. That word is the point. Everywhere else in
// this bar the state is a colour: a tinted glyph, a ring, an amber dial. Here
// it is readable, so the fleet stays usable for someone who cannot separate
// the hues, and the colour is confirmation rather than the whole message.
//
// The words themselves are a tool-call row's (thread/tool-call-row.tsx): a
// name at weight 500, the task in the muted tier, then the one parameter
// after a middot on the tier below, truncated. Same idiom, same restraint —
// brand rule 8 keeps status quiet, and this row is a sibling of that one, not
// a banner.

/** The content's arrival. Never the box: see the note above. */
const ENTER = "animate-in fade-in-0 duration-(--duration-enter) ease-out-quart motion-reduce:animate-none";

export function AgentDetail({
  run,
  onBack,
  claimFocus = false,
  className,
}: {
  run: AgentRun;
  /** Back to the stack. */
  onBack: () => void;
  /**
   * This row opened because someone picked a chip, so it may take the focus
   * that chip left behind. Off by default: a row rendered cold — a specimen
   * on a design page, a server-rendered bar — is not the answer to anything a
   * person just did, and must not pull focus out of whatever they were using.
   */
  claimFocus?: boolean;
  className?: string;
}): React.ReactElement {
  const { label, tint, tone } = RUN_STATES[run.state];
  const backRef = useRef<HTMLButtonElement>(null);

  // Half the focus contract. Opening the detail unmounts the chip that was
  // clicked, and the browser drops focus to the body when the focused element
  // leaves the DOM — a keyboard user would land back at the top of the page
  // on their next Tab. So: if focus has fallen to nothing, this row picks it
  // up on the back control, which is both the way out and the first thing in
  // the bar. The guard is the whole point of the effect — focus is only
  // claimed when it is already lost, and only when the caller says this row
  // is the answer to a click, so a mouse user in a browser that does not focus
  // buttons on click keeps whatever they had. The `claimFocus` half matters on
  // a page that renders a specimen of this row: `document.activeElement` is
  // the body on every freshly painted page, so the lost-focus test alone reads
  // a cold mount as a click and quietly takes the page's focus on load.
  // preventScroll because the composer is docked: focusing
  // a control 36px above the field must not scroll the thread behind it.
  useEffect(() => {
    if (!claimFocus) return;
    const active = document.activeElement;
    if (active && active !== document.body) return;
    backRef.current?.focus({ preventScroll: true });
  }, [claimFocus]);

  return (
    <div
      className={cn("flex h-9 min-w-0 items-center gap-2 border-b border-border-subtle px-4", className)}
      // Escape goes back, but only from inside the row: the handler sits on
      // the bar, so pressing it in the field still belongs to the composer.
      // It stops there rather than bubbling on, because one Escape should
      // close one thing.
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.stopPropagation();
        onBack();
      }}
    >
      {/* 24px in a 36px row, the same reasoning as the Stop button it
          replaces: a full-height control would touch the hairline. An arrow,
          not a chevron — a chevron reveals in place, an arrow goes back
          (docs/brand/icons.md) — and the name says where it goes, because
          "Back" alone is a direction, not a destination. */}
      <Button
        ref={backRef}
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label="Back to all agents"
        onClick={onBack}
        className={cn("-ml-1.5 shrink-0 text-muted-foreground hover:text-foreground", ENTER)}
      >
        <IconArrowLeft className="size-3.5" aria-hidden="true" />
      </Button>

      {/* Identity, then how far along. The glyph carries no label, which is
          how AgentGlyph knows to mark itself aria-hidden: the name is two
          spans away in words, and an avatar that announced itself would read
          as a second agent. */}
      <span className={cn("flex shrink-0 items-center gap-1.5", ENTER)}>
        <AgentGlyph shape={run.glyph} size={20} tone={tone} />
        <StateDial state={run.state} progress={run.progress} />
      </span>

      <span className={cn("flex min-w-0 flex-1 items-center gap-1.5 text-xs", ENTER)}>
        <span className="shrink-0 font-medium text-foreground">{run.name}</span>
        {/* One line, one ellipsis: the task and its parameter truncate as a
            single run of text, so the row never wraps and never breaks in two
            places. `title` is the promise that truncation makes good — the
            whole sentence is a hover away. It is a plain title rather than
            the tooltip primitive because this is text, not a control: a
            Tooltip here would need a focusable trigger, which would put a
            second stop in the bar's tab order for no action. */}
        <span className="truncate text-muted-foreground" title={run.detail ? `${run.task} · ${run.detail}` : run.task}>
          {run.task}
          {run.detail && (
            <>
              <span className="mx-1.5 text-foreground-low" aria-hidden="true">
                ·
              </span>
              <span className="text-foreground-low">{run.detail}</span>
            </>
          )}
        </span>
      </span>

      <span className={cn("shrink-0 text-xs", tint, ENTER)}>{label}</span>
    </div>
  );
}
