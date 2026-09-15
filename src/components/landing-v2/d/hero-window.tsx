"use client";

import { useEffect, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { A11Y as A_A11Y, HERO } from "../a/content";
import {
  ReceiptLine,
  RequestBubble,
  StepRow,
  WorkingRow,
} from "../a/thread-replica";
import { A11Y } from "./content";

const { thread, roster } = HERO.window;

// The same run as variant A's hero, with the same timing: after a short
// pause one row mounts per second (every step, then the ask, then the line
// with time, cost and score), once. Under reduced motion every row is there
// from the start.
const TOTAL = thread.steps.length + 2;
const FIRST_ROW_DELAY_MS = 600;
const ROW_INTERVAL_MS = 1000;

// A row that has just mounted: fade and an 8px rise at the chip duration on
// the quart-out curve. Off under reduced motion.
const ENTER =
  "animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-(--duration-normal) ease-out-quart motion-reduce:animate-none";

// The three window controls, as a picture: tint dots, never status hues.
function WindowDots({ className }: { className?: string }) {
  return (
    <span className={cn("flex shrink-0 gap-2", className)} aria-hidden="true">
      <span className="size-3 rounded-full bg-tint-20" />
      <span className="size-3 rounded-full bg-tint-20" />
      <span className="size-3 rounded-full bg-tint-20" />
    </span>
  );
}

// Variant A's hero picture drawn as a desktop app instead of a browser tab:
// one rounded window with no address bar. The window controls sit at the top
// of the sidebar, the team is a message list under them, and the open job
// fills the main pane beside it. Below md the sidebar goes and the controls
// move into the pane's own title row.
//
// The window keeps a fixed height per breakpoint, sized for the finished
// run, so the rows mounting never move anything on the page.
export function HeroWindow() {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let interval: number | undefined;
    let count = 0;
    const start = window.setTimeout(
      () => {
        if (reduced.matches) {
          setShown(TOTAL);
          return;
        }
        interval = window.setInterval(() => {
          count += 1;
          setShown(count);
          if (count >= TOTAL) window.clearInterval(interval);
        }, ROW_INTERVAL_MS);
      },
      reduced.matches ? 0 : FIRST_ROW_DELAY_MS,
    );
    return () => {
      window.clearTimeout(start);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, []);

  const stepsShown = Math.min(shown, thread.steps.length);
  const askShown = shown > thread.steps.length;
  const receiptShown = shown > thread.steps.length + 1;

  return (
    <div
      role="group"
      aria-label={A11Y.window}
      className="grid h-[42rem] w-full overflow-hidden rounded-3xl bg-background text-left shadow-xl ring-1 ring-border-subtle sm:h-[36rem] md:h-[35rem] md:grid-cols-[15rem_minmax(0,1fr)] lg:grid-cols-[17rem_minmax(0,1fr)]"
    >
      <aside
        aria-label={A_A11Y.roster}
        className="hidden min-h-0 flex-col border-r border-border-subtle bg-surface-secondary md:flex"
      >
        <div className="flex h-12 shrink-0 items-center px-4">
          <WindowDots />
        </div>
        <p className="px-4 pt-1 pb-2 text-xs text-foreground-low">
          {roster.label}
        </p>
        <ul role="list" className="flex flex-col gap-0.5 px-2">
          {roster.items.map((item) => {
            const open = item.name === thread.agent;
            return (
              <li
                key={item.name}
                className={cn(
                  "flex items-start gap-2.5 rounded-xl px-2 py-2",
                  open ? "bg-tint-10" : undefined,
                )}
              >
                <Avatar size="sm" className="mt-0.5">
                  <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-baseline justify-between gap-2">
                    <span
                      className={cn(
                        "truncate text-sm text-foreground",
                        open ? "font-medium" : undefined,
                      )}
                    >
                      {item.name}
                    </span>
                    <span className="shrink-0 text-xs text-foreground-low tabular-nums">
                      {item.time}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "line-clamp-2 text-xs",
                      item.state === "waiting"
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.preview}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-col">
        <div className="flex min-h-12 shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border-subtle px-4 py-2.5 sm:px-6">
          <WindowDots className="mr-1 md:hidden" />
          <p className="text-sm font-medium text-foreground">{thread.title}</p>
          <Badge variant="secondary">{thread.schedule}</Badge>
          {/* The sidebar already marks whose job this is; without it the
              title row names the agent. */}
          <span className="ml-auto flex items-center gap-2 text-xs text-foreground-low md:hidden">
            <Avatar size="sm">
              <AvatarFallback>{thread.agent.charAt(0)}</AvatarFallback>
            </Avatar>
            {thread.agent}
          </span>
        </div>

        <div className="flex flex-col gap-4 px-4 py-5 sm:px-6">
          <RequestBubble who={thread.you} text={thread.request} />

          <ol role="list" className="flex flex-col">
            {thread.steps.slice(0, stepsShown).map((step) => (
              <StepRow key={step.text} step={step} className={ENTER} />
            ))}
            {askShown ? null : <WorkingRow label={A_A11Y.working} />}
          </ol>

          {askShown ? (
            <div
              className={cn(
                "flex flex-col gap-3 rounded-2xl bg-background p-4 shadow-card",
                ENTER,
              )}
            >
              <div className="flex flex-col gap-1.5">
                <Badge variant="brand">{thread.ask.label}</Badge>
                <p className="text-sm text-foreground">{thread.ask.body}</p>
              </div>
              {/* Part of the picture, not controls on the page: no focus,
                  hidden from the accessibility tree. */}
              <div className="flex gap-2" aria-hidden="true">
                <Button size="sm" tabIndex={-1} type="button">
                  {thread.ask.approve}
                </Button>
                <Button size="sm" variant="outline" tabIndex={-1} type="button">
                  {thread.ask.edit}
                </Button>
              </div>
            </div>
          ) : null}

          {receiptShown ? (
            <ReceiptLine
              receipt={thread.receipt}
              extra={thread.receipt.waiting}
              className={cn("px-1", ENTER)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
