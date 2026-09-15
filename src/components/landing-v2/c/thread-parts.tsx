import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import type { CSSProperties, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The pieces of a thread replica, shared by the hero and the use-case
// panel. Every piece is a list item; the caller owns the list. Bubbles keep
// the brand's 20px bubble radius with one tighter corner as the tail.
//
// The user speaks in the primary fill (light on ink, since `primary` flips
// with the page's `dark`); the agent speaks on a tint. Neither carries
// chroma: tangerine appears only on the "Needs you" ask.

export function UserBubble({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <li
      style={style}
      className={cn(
        "max-w-[85%] self-end rounded-bubble rounded-br-md bg-primary px-4 py-2.5 text-sm text-pretty text-primary-foreground",
        className,
      )}
    >
      {children}
    </li>
  );
}

export function AgentBubble({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <li
      style={style}
      className={cn(
        "max-w-[85%] self-start rounded-bubble rounded-bl-md bg-tint-10 px-4 py-2.5 text-sm text-pretty text-foreground",
        className,
      )}
    >
      {children}
    </li>
  );
}

export function SystemLine({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <li
      style={style}
      className={cn(
        "self-center px-2 text-xs text-foreground-low tabular-nums",
        className,
      )}
    >
      {children}
    </li>
  );
}

// The ask: a hairline card with the page's one tangerine mark, the
// question, and the two answers. The buttons are the brand's, so the
// picture is honest about what a person clicks; the caller makes the whole
// picture inert, so they are never a tab stop.
export function AskCard({
  label,
  text,
  approve,
  hold,
  className,
  style,
}: {
  label: string;
  text: string;
  approve?: string;
  hold?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <li
      style={style}
      className={cn(
        "flex w-full max-w-sm flex-col gap-3 self-start rounded-3xl p-4 shadow-edge",
        className,
      )}
    >
      <p className="flex items-center gap-1.5 text-xs font-medium text-brand-accent">
        <IconAlertCircle aria-hidden="true" className="size-3.5" />
        {label}
      </p>
      <p className="text-sm text-foreground">{text}</p>
      {approve && hold ? (
        <div className="flex gap-2">
          <Button size="sm" tabIndex={-1}>
            {approve}
          </Button>
          <Button size="sm" variant="outline" tabIndex={-1}>
            {hold}
          </Button>
        </div>
      ) : null}
    </li>
  );
}

// The receipt: one check per step, then the run's figures on the third tier.
export function ReceiptLog({
  lines,
  summary,
  className,
  style,
}: {
  lines: string[];
  summary?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <li
      style={style}
      className={cn(
        "flex w-full max-w-sm flex-col gap-2 self-start rounded-3xl bg-tint-10 p-4",
        className,
      )}
    >
      <ul role="list" className="flex flex-col gap-1.5">
        {lines.map((line) => (
          <li
            key={line}
            className="flex items-start gap-2 text-sm text-foreground"
          >
            <IconCheck
              aria-hidden="true"
              className="mt-1 size-3.5 shrink-0 text-muted-foreground"
              stroke={2.25}
            />
            {line}
          </li>
        ))}
      </ul>
      {summary ? (
        <p className="text-xs text-foreground-low tabular-nums">{summary}</p>
      ) : null}
    </li>
  );
}

// A single finished step, for the short use-case threads.
export function DoneLine({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <li
      style={style}
      className={cn(
        "flex items-center gap-2 self-start px-1 text-sm text-muted-foreground tabular-nums",
        className,
      )}
    >
      <IconCheck aria-hidden="true" className="size-3.5" stroke={2.25} />
      {children}
    </li>
  );
}
