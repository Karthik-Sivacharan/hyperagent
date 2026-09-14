import { IconCheck } from "@tabler/icons-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { Receipt, Step } from "./content";

// The pieces every product picture on the page is built from: a browser
// window, a request bubble, a step row, the working row and the receipt
// line. All real DOM on the brand tokens, so the text selects, wraps and
// scales like the rest of the page. The hero assembles them into a full run
// (hero-run.tsx); the use-case panel assembles a cropped one.

// A browser window: a title bar with three dots and the address, then the
// body. Depth is spent here and nowhere else (the reference pages' rule):
// the photo-tile shadow and a hairline ring, on the white canvas.
export function BrowserFrame({
  url,
  label,
  className,
  bodyClassName,
  children,
}: {
  url: string;
  label: string;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "flex flex-col overflow-hidden rounded-xl bg-background text-left shadow-xl ring-1 ring-black/5",
        className,
      )}
    >
      <div className="flex h-10 shrink-0 items-center gap-3 border-b border-border-subtle bg-surface-secondary px-3">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-tint-20" />
          <span className="size-2.5 rounded-full bg-tint-20" />
          <span className="size-2.5 rounded-full bg-tint-20" />
        </div>
        <p className="mx-auto min-w-0 truncate rounded-full bg-tint-10 px-3 py-0.5 text-xs text-foreground-low">
          {url}
        </p>
        <div className="w-9 shrink-0" aria-hidden="true" />
      </div>
      <div className={cn("min-h-0 flex-1", bodyClassName)}>{children}</div>
    </div>
  );
}

// What a person asked for, as the agent received it: the sender in the
// third tier, the request in a tint bubble.
export function RequestBubble({
  who,
  text,
  className,
}: {
  who: string;
  text: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <p className="text-xs text-foreground-low">{who}</p>
      <p className="rounded-bubble bg-tint-10 px-4 py-3 text-sm text-foreground">
        {text}
      </p>
    </div>
  );
}

// One thing the agent did, with the elapsed time at the end of the row in
// tabular figures so a column of them lines up.
export function StepRow({
  step,
  className,
}: {
  step: Step;
  className?: string;
}) {
  return (
    <li className={cn("flex items-start gap-3 py-1", className)}>
      <span
        aria-hidden="true"
        className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-tint-10 text-foreground-low"
      >
        <IconCheck className="size-3" stroke={2.5} />
      </span>
      <span className="min-w-0 flex-1 text-sm text-muted-foreground">
        {step.text}
      </span>
      <span className="shrink-0 text-xs text-foreground-low tabular-nums">
        {step.at}
      </span>
    </li>
  );
}

// The row pinned under the steps while the agent is still going: the word
// and three dots on the brand's typing-dot loop. It leaves when the run
// stops, so nothing on the page loops for long.
export function WorkingRow({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-3 py-1 text-sm text-foreground-low">
      <span
        className="flex size-4 shrink-0 items-center justify-center gap-0.5"
        aria-hidden="true"
      >
        <span className="size-1 rounded-full bg-foreground-low animate-typing-dot" />
        <span className="size-1 rounded-full bg-foreground-low animate-typing-dot delay-150" />
        <span className="size-1 rounded-full bg-foreground-low animate-typing-dot delay-300" />
      </span>
      {label}
    </li>
  );
}

// The receipt: duration, cost and the judge's score, each a figure in the
// first tier with its unit or label beside it in the third. Figures are
// tabular so two receipts line up.
export function ReceiptLine({
  receipt,
  scoreLabel,
  extra,
  className,
}: {
  receipt: Receipt;
  scoreLabel?: string;
  extra?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm text-foreground tabular-nums",
        className,
      )}
    >
      <span>{receipt.duration}</span>
      <span>{receipt.cost}</span>
      <span>
        {scoreLabel ? (
          <span className="text-foreground-low">{scoreLabel} </span>
        ) : null}
        {receipt.score}
      </span>
      {extra ? <span className="text-foreground-low">{extra}</span> : null}
    </div>
  );
}
