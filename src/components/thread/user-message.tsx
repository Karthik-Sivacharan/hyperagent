import type { CSSProperties } from "react";
import { Sparkles } from "lucide-react";

// A user turn: right-aligned bubble tinted with the thread accent, then the
// "N knowledge hints · date" meta line. Markup from
// docs/reference/pages/thread-detail.html.
export function UserMessage({
  id,
  text,
  knowledgeHints,
  sentAtLabel,
  accent,
}: {
  id: string;
  text: string;
  knowledgeHints: number;
  sentAtLabel: string;
  /** Bubble background (the site sets it inline per thread). */
  accent: string;
}) {
  // The site's `glass-bubble-primary--revamp` modifier (no shadow, black/10
  // border) is not ported to globals.css, and the live bubble also computes
  // `backdrop-filter: none`; those three values are set inline next to the
  // background and colour the site already sets inline.
  const bubbleStyle: CSSProperties = {
    background: accent,
    color: "var(--foreground)",
    borderColor: "rgba(0, 0, 0, 0.1)",
    boxShadow: "none",
    backdropFilter: "none",
  };

  return (
    <div className="mt-8 mb-5">
      <div className="group relative flex min-w-0 gap-3 flex-row-reverse" data-role="user" data-message-id={id}>
        <div className="flex min-w-0 flex-col gap-1 max-w-[85%] items-end">
          <div
            className="w-full max-w-full overflow-hidden break-words px-4 py-3 transition-all duration-200 rounded-lg glass-bubble-primary glass-bubble-primary--revamp text-primary-foreground"
            style={bubbleStyle}
          >
            <div className="space-y-2">
              <div className="break-words text-sm">
                <div className="whitespace-normal">
                  <div className="my-2 break-words first:mt-0 last:mb-0">{text}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-1 flex max-w-[min(100%,560px)] flex-col items-end gap-1.5">
            <span className="flex select-none items-center gap-1.5 text-muted-foreground/70 text-xs">
              <button type="button" className="inline-flex cursor-pointer items-center gap-1 transition-colors hover:text-foreground">
                <Sparkles className="size-3" aria-hidden="true" />
                {knowledgeHints} knowledge hint{knowledgeHints === 1 ? "" : "s"}
              </button>
              <span aria-hidden="true">·</span>
              <span>{sentAtLabel}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
