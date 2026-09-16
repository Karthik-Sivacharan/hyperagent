"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconArrowsDiff,
  IconBrandSlack,
  IconFileText,
  IconSearch,
  type TablerIcon,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { A11Y, HERO, type ThreadStep } from "./content";
import { useInViewOnce, usePrefersReducedMotion } from "./motion";
import { AgentDisc, Bubble, MetaLine, TypingDots } from "./thread-parts";

const ICONS: Record<ThreadStep["icon"], TablerIcon> = {
  search: IconSearch,
  compare: IconArrowsDiff,
  draft: IconFileText,
  post: IconBrandSlack,
};

const { thread } = HERO;
// Frames after the request: one per step, then the receipt, then Needs you.
const TOTAL = thread.steps.length + 2;
const FIRST_DELAY = 700;
const STEP_DELAY = 900;

// The large thread in the hero panel: a person's brief in the user bubble,
// then the agent's work landing one row at a time (the reference's one row
// per second, on our reveal duration), a receipt, and the one decision it
// holds for a person. It plays once, when it scrolls into view. Under
// reduced motion the finished thread is simply there, and no timer runs.
export function HeroThread() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInViewOnce(ref, 0.3);
  const reduced = usePrefersReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (reduced || !seen || count >= TOTAL) return;
    const timer = setTimeout(
      () => setCount((current) => Math.min(current + 1, TOTAL)),
      count === 0 ? FIRST_DELAY : STEP_DELAY,
    );
    return () => clearTimeout(timer);
  }, [reduced, seen, count]);

  const shown = reduced ? TOTAL : count;
  const done = shown >= TOTAL;
  const stepsShown = Math.min(shown, thread.steps.length);
  const receiptShown = shown >= thread.steps.length + 1;
  const needsYouShown = shown >= thread.steps.length + 2;

  return (
    <div
      ref={ref}
      aria-label={A11Y.thread}
      className="mx-auto flex w-full max-w-wide flex-col gap-5 rounded-3xl bg-background p-4 shadow-card-soft sm:p-6"
    >
      <div className="flex items-center gap-3">
        <AgentDisc initial={thread.agent.initial} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">
            {thread.agent.name}
          </p>
          <p className="text-md text-foreground-low">{thread.schedule}</p>
        </div>
        <Badge variant={done ? "success" : "secondary"}>
          {done ? thread.status.done : thread.status.working}
        </Badge>
      </div>

      <Bubble from="person" className="max-w-[min(28rem,92%)]">
        {thread.request}
      </Bubble>

      <div className="flex flex-col gap-4">
        <ol role="list" className="flex flex-col gap-2.5">
          {thread.steps.slice(0, stepsShown).map((step) => {
            const Icon = ICONS[step.icon];
            return (
              <li
                key={step.text}
                className="lb-rise flex items-start gap-2.5 text-sm"
              >
                <Icon
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-foreground-low"
                />
                <span className="text-muted-foreground">{step.text}</span>
              </li>
            );
          })}
        </ol>

        {!done ? <TypingDots /> : null}

        {receiptShown ? (
          <MetaLine
            className="lb-rise text-sm text-muted-foreground tabular-nums"
            parts={[
              `${thread.receiptLabels.duration} ${thread.receipt.duration}`,
              `${thread.receiptLabels.cost} ${thread.receipt.cost}`,
              `${thread.receiptLabels.score} ${thread.receipt.score}`,
            ]}
          />
        ) : null}

        {needsYouShown ? (
          <div className="lb-rise flex flex-col gap-3 rounded-2xl bg-surface-secondary p-4 sm:flex-row sm:items-center">
            <Badge variant="brand" className="shrink-0">
              {thread.needsYou.label}
            </Badge>
            <p className="flex-1 text-sm text-foreground">
              {thread.needsYou.text}
            </p>
            <div className="flex shrink-0 gap-2" aria-hidden="true">
              <span className={PILL}>{thread.needsYou.approve}</span>
              <span
                className={cn(
                  PILL,
                  "bg-transparent text-muted-foreground shadow-none",
                )}
              >
                {thread.needsYou.skip}
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// The two answers a person could give, drawn as the product's pills. They
// are a picture, not controls, so they are spans and hidden from the tree.
const PILL =
  "inline-flex h-8 items-center rounded-full bg-background px-3 text-sm font-medium text-foreground shadow-xs";
