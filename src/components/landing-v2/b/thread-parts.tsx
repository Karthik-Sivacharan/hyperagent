import type { ReactNode } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import { A11Y } from "./content";

// The pieces every picture of a thread on this page is built from: the
// person's and the agent's bubbles, the typing dots, and the agent's disc.
// One vocabulary, so the hero thread, the use-case stage and the receipts
// all read as the same product.

// A chat bubble. The person speaks in the brand's user bubble (tangerine,
// the one sanctioned solid accent besides a CTA); the agent answers in white
// on the panel with the hairline ring. The tail is the corner nearest the
// author, as in the product.
export function Bubble({
  from,
  children,
  className,
  animate = false,
}: {
  from: "person" | "agent";
  children: ReactNode;
  className?: string;
  animate?: boolean;
}) {
  const person = from === "person";
  return (
    <div
      className={cn(
        "flex w-full shrink-0",
        person ? "justify-end" : "justify-start",
      )}
    >
      <p
        className={cn(
          "w-fit max-w-[min(20rem,92%)] px-3.5 py-2.5 text-sm text-pretty",
          person
            ? "rounded-bubble rounded-tr-md bg-chat-bubble-user text-chat-bubble-user-foreground"
            : "rounded-bubble rounded-tl-md bg-background text-foreground shadow-card-soft",
          animate && "lb-pop",
          animate && person && "lb-pop-end",
          className,
        )}
      >
        {children}
      </p>
    </div>
  );
}

// Three dots in an agent bubble, staggered on the brand's typing-dot loop.
// The label is for screen readers; the dots are decoration.
export function TypingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex w-full shrink-0 justify-start", className)}>
      <div
        role="status"
        aria-label={A11Y.typing}
        className="lb-pop flex h-9 w-fit items-center gap-1 rounded-bubble rounded-tl-md bg-background px-3.5 shadow-card-soft"
      >
        <span
          aria-hidden="true"
          className="size-1.5 animate-typing-dot rounded-full bg-foreground"
        />
        <span
          aria-hidden="true"
          className="size-1.5 animate-typing-dot rounded-full bg-foreground [animation-delay:160ms]"
        />
        <span
          aria-hidden="true"
          className="size-1.5 animate-typing-dot rounded-full bg-foreground [animation-delay:320ms]"
        />
      </div>
    </div>
  );
}

// The agent's disc: an initial on ink when it is the one speaking, on a
// tint when it is one of several at rest. Both states are colour only, so a
// row of them never moves when the selection changes.
export function AgentDisc({
  initial,
  active = true,
  size = "default",
  className,
}: {
  initial: string;
  active?: boolean;
  size?: "default" | "lg";
  className?: string;
}) {
  return (
    <Avatar
      size={size}
      className={cn(
        "transition-[background-color,color] duration-(--duration-normal) ease-out",
        size === "lg" && "data-[size=lg]:size-14",
        className,
      )}
    >
      <AvatarFallback
        className={cn(
          "transition-[background-color,color] duration-(--duration-normal) ease-out",
          active
            ? "bg-primary text-primary-foreground"
            : "bg-tint-10 text-muted-foreground",
          size === "lg" && "text-base",
        )}
      >
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}

// A dot-separated meta line without a middle-dot character in the copy:
// each part is its own span, the separator is a 3px disc.
export function MetaLine({
  parts,
  className,
}: {
  parts: string[];
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-center gap-x-2 gap-y-1",
        className,
      )}
    >
      {parts.map((part, index) => (
        <span key={part} className="inline-flex items-center gap-2">
          {index > 0 ? (
            <span
              aria-hidden="true"
              className="size-0.75 rounded-full bg-border-loud"
            />
          ) : null}
          {part}
        </span>
      ))}
    </span>
  );
}
