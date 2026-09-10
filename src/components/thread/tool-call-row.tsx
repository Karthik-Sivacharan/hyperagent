import Image from "next/image";
import type { TablerIcon } from "@tabler/icons-react";

import { SHIMMER, sweepStyle } from "@/components/thread/shimmer";
import { cn } from "@/lib/utils";

// One tool call in a running turn, in the product's own idiom.
//
// GROUND TRUTH is two captures of hyperagent.com: the finished and
// reconstructed-running rows in docs/reference/overlays/thread-streaming-turn.html
// (2026-09-09), and the live run in thread-streaming-live.html (2026-09-10),
// which confirmed them frame by frame. A tool call is one 28px row: a 12px
// mark, a 12/16 label at weight 500, a middot, then a truncated parameter on a
// lower text tier. There is NO spinner, no check and no duration. Running and
// done are the SAME row: the label shimmers and the glyph takes a tint while
// it runs, and both stop when it lands. The words never go past tense.
//
// Extracted from the signup flow's research row (research-signals.tsx), which
// now renders this, so the two stay one object. For the running and done
// states the DOM and the class strings are the ones that row always had, byte
// for byte: the research pass is pixel-identical across the extraction.
//
// What the live capture added. A finished row can carry a RECEIPT after its
// parameter: the product lands a stack of 16px favicons and a "+1 more" there
// at the moment the label stops, which is the only way a row says what it
// found. It is a slot here (`receipt`), rendered only once the call is done,
// because a receipt for work still under way would be a claim the row cannot
// back. And the two unhappy endings from the reconstruction, which the flow
// can reach with Stop: interrupted (the row drops to 60% and says so, in the
// same third tier as its parameter) and failed ("· Failed", no hue: brand rule
// 8 keeps status quiet, and a red word in a list of grey ones would be the
// loudest thing in the turn).

export type ToolCallStatus = "running" | "done" | "interrupted" | "failed";

/** 12px, whichever source it came from. */
function ToolCallMark({ icon: Icon, logoSrc, running }: { icon?: TablerIcon; logoSrc?: string; running: boolean }) {
  if (logoSrc) {
    // A logo cannot take a tint, so on these rows the shimmer is the whole
    // running signal. 24 is the 2x of a 12px mark.
    return <Image src={logoSrc} alt="" width={24} height={24} className="mr-1 size-3 shrink-0 object-contain" />;
  }
  if (!Icon) return null;
  // The product tints its running glyph and drops the tint on completion. Ink
  // rather than the accent: brand rule 3 spends a screen's one tangerine on
  // its primary action, and a working indicator is not an action.
  return (
    <Icon
      className={cn(
        "mr-1 size-3 shrink-0 transition-colors duration-(--duration-normal) ease-out motion-reduce:transition-none",
        running ? "text-foreground" : "text-foreground-low",
      )}
      aria-hidden="true"
    />
  );
}

export function ToolCallRow({
  label,
  detail,
  status,
  icon,
  logoSrc,
  receipt,
  shimmerCycleMs,
  className,
}: {
  /** Present participle plus object, sentence case, no period. */
  label: string;
  /** The one parameter after the middot, exactly as the product does it. */
  detail?: string;
  status: ToolCallStatus;
  /** A glyph, tinted up one tier while the call runs… */
  icon?: TablerIcon;
  /** …or a 12px logo, where the source is a product. */
  logoSrc?: string;
  /** What the call found. Rendered after the detail, and only once done. */
  receipt?: React.ReactNode;
  /**
   * One loop of the label's shimmer, which is two crossings (shimmer.ts).
   * Pass four times the row's running time and exactly one crossing lands
   * inside it; omit it for the shared default.
   */
  shimmerCycleMs?: number;
  className?: string;
}) {
  const running = status === "running";
  return (
    // The product's row, measured: 28px tall, 8px of side padding, a 10px
    // radius, one hairline edge, a fill one step off the canvas. Its greys
    // become this system's materials — `bg-tint-10` and `shadow-edge`, the
    // same pair the tool tile group on the agent cards wears, and `rounded-lg`
    // because brand.css names 10px "inline reference chips" and that is
    // precisely what this is.
    //
    // `opacity-60` on an interrupted row is the product's own canceled
    // treatment: the call did not finish, so the whole row steps back, words
    // and mark together, rather than any one part of it changing colour.
    <span
      className={cn(
        "inline-flex h-7 min-w-0 max-w-full items-center rounded-lg bg-tint-10 px-2 text-xs text-muted-foreground shadow-edge",
        status === "interrupted" && "opacity-60",
        className,
      )}
    >
      <ToolCallMark icon={icon} logoSrc={logoSrc} running={running} />
      <span
        className={cn("shrink-0 font-medium", running && SHIMMER)}
        style={
          running
            ? sweepStyle(label.length, "var(--color-foreground)", "var(--color-muted-foreground)", {
                cycleMs: shimmerCycleMs,
              })
            : undefined
        }
      >
        {label}
      </span>
      {detail && (
        <>
          <span className="mx-1.5 shrink-0 text-foreground-low" aria-hidden="true">
            ·
          </span>
          <span className="truncate text-foreground-low">{detail}</span>
        </>
      )}
      {/* The receipt lands with the label going quiet, in one beat: it fades
          in over --duration-enter, the brand's "something appearing", with no
          rise. A row is a line of text and a mark that drifts up inside a line
          reads as a glitch, not an arrival. `shrink-0` so it is the parameter
          that truncates when the row runs out of column, never the receipt:
          the parameter is what the call was asked, the receipt is what it
          found, and the second is the reason to look. */}
      {status === "done" && receipt && (
        <span className="ml-1.5 inline-flex shrink-0 items-center animate-in fade-in-0 duration-(--duration-enter) ease-out-quart">
          {receipt}
        </span>
      )}
      {status === "failed" && (
        <>
          <span className="mx-1.5 shrink-0 text-foreground-low" aria-hidden="true">
            ·
          </span>
          <span className="shrink-0">Failed</span>
        </>
      )}
      {status === "interrupted" && <span className="ml-1.5 shrink-0 italic text-foreground-low">Interrupted</span>}
    </span>
  );
}

/**
 * A receipt that is a number: "6 found", "+1 more". The third tier and
 * tabular figures, so a count that changes between two runs of the same call
 * does not move the words after it. Sized for the row's own 12px.
 *
 * It brings its own middot. The product's "+1 more" follows a stack of
 * favicons, and the marks are what separate it from the parameter; a count
 * with no marks in front of it ran straight on from the detail and read as
 * part of it ("design systems, Figma, iOS 6 found"). The dot is the row's own
 * field separator, the same one between the label and the detail, so the
 * receipt reads as a third field rather than as the tail of the second.
 */
export function ToolCallCount({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs text-foreground-low tabular-nums">
      <span className="mr-1.5" aria-hidden="true">
        ·
      </span>
      {children}
    </span>
  );
}
