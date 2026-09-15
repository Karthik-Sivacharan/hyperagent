import { IconCircleCheck } from "@tabler/icons-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// The pieces every scene's windows are drawn with. Mostly the brand skeleton
// held still (the desktop is a picture, so nothing pulses), plus the few real
// words that say what the job is: a window's heading, a handful of short rows,
// a status pill and a footer line. Widths are the scene's to set.

/** A line of text that is not there: a still, round skeleton bar. */
export function Bar({ className }: { className?: string }) {
  return (
    <Skeleton
      className={cn("h-2 animate-none rounded-full bg-tint-15", className)}
    />
  );
}

/** A round placeholder, for an avatar or a thumbnail. */
export function Blob({ className }: { className?: string }) {
  return (
    <Skeleton
      className={cn(
        "size-5 shrink-0 animate-none rounded-full bg-tint-15",
        className,
      )}
    />
  );
}

/** A window's heading row: the real title on the left, a pill or bar on the right. */
export function WindowHeader({
  title,
  trailing,
  className,
}: {
  title: string;
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-11 shrink-0 items-center justify-between gap-3 border-b border-border-subtle px-4",
        className,
      )}
    >
      <p className="truncate text-sm font-medium text-foreground">{title}</p>
      {trailing}
    </div>
  );
}

/** One row of a list: a lead (check, blob, icon), the content, a trailing pill. */
export function Row({
  lead,
  trailing,
  className,
  children,
}: {
  lead?: ReactNode;
  trailing?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-b border-border-subtle px-4 py-2.5 last:border-b-0",
        className,
      )}
    >
      {lead}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">{children}</div>
      {trailing}
    </div>
  );
}

/** A row's real words: one short line in the first text tier. */
export function RowText({ children }: { children: ReactNode }) {
  return (
    <p className="truncate text-xs font-medium text-foreground">{children}</p>
  );
}

/** The quiet line under a list: a count, a state. */
export function WindowFooter({
  children,
  trailing,
}: {
  children: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <div className="mt-auto flex h-9 shrink-0 items-center justify-between gap-3 border-t border-border-subtle px-4 text-xs text-foreground-low">
      <span className="truncate">{children}</span>
      {trailing ? <span className="shrink-0">{trailing}</span> : null}
    </div>
  );
}

/** A done mark for a list row. */
export function Check({ className }: { className?: string }) {
  return (
    <IconCircleCheck
      aria-hidden="true"
      stroke={1.75}
      className={cn("size-4 shrink-0 text-success", className)}
    />
  );
}

const PILL_TONES = {
  /** Written, not sent: waits for a person. */
  draft: "outline",
  /** Needs someone first. */
  urgent: "destructive",
  /** Held back on purpose. */
  held: "warning",
  /** Finished and checked. */
  done: "success",
  /** A label with no state. */
  quiet: "secondary",
} as const;

/** A status pill: the Badge primitive, in the one set of tones the scenes share. */
export function Pill({
  tone,
  children,
}: {
  tone: keyof typeof PILL_TONES;
  children: ReactNode;
}) {
  return (
    <Badge variant={PILL_TONES[tone]} className="shrink-0 font-medium">
      {children}
    </Badge>
  );
}
