"use client";

import { IconBrowser, IconFolder, IconMail } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { A11Y, HERO } from "./content";
import {
  BrowserFrame,
  ReceiptLine,
  RequestBubble,
  StepRow,
  WorkingRow,
} from "./thread-replica";

const { window: WINDOW } = HERO;
const { thread, roster, computer } = WINDOW;

// How many rows mount after the request: every step, then the ask, then the
// receipt line. Rows mount one per second, once, after a short pause;
// nothing loops and nothing restarts on scroll.
const TOTAL = thread.steps.length + 2;
const FIRST_ROW_DELAY_MS = 600;
const ROW_INTERVAL_MS = 1000;

// A row that has just mounted: the brand's enter (fade + a 8px rise) at the
// chip duration on the quart-out curve. Under reduced motion every row is
// already there, and the class is off anyway.
const ENTER =
  "animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-(--duration-normal) ease-out-quart motion-reduce:animate-none";

// One glyph per row of the agent's computer, in the order content.ts lists
// them: the page its browser is on, the drafts it holds, the files it wrote.
const COMPUTER_ICONS = [IconBrowser, IconMail, IconFolder];

// The product, hand-built: one job inside a browser window. On the left, the
// team as a message list (name, last report, time), the way a messages app
// shows people; the agent whose job is open is the highlighted row. In the
// middle the request, the steps as they land, the one ask that waits for a
// person, and the line with time, cost and score. On a wide screen, the
// agent's own computer on the right.
//
// The window keeps a fixed height and the band below crops its bottom edge,
// so the rows mounting never move anything on the page.
export function HeroRun() {
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
  const working = !askShown;

  return (
    <BrowserFrame
      url={WINDOW.url}
      label={A11Y.browser}
      className="mx-auto h-[45rem] w-full max-w-5xl rounded-b-none md:h-[36rem] lg:h-[33rem]"
      bodyClassName="grid md:grid-cols-[15rem_minmax(0,1fr)] lg:grid-cols-[15rem_minmax(0,1fr)_15rem]"
    >
      <aside
        aria-label={A11Y.roster}
        className="hidden flex-col gap-2 border-r border-border-subtle bg-surface-secondary p-3 md:flex"
      >
        <p className="px-2 text-xs text-foreground-low">{roster.label}</p>
        <ul role="list" className="flex flex-col gap-0.5">
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
                        "truncate text-sm",
                        open
                          ? "font-medium text-foreground"
                          : "text-foreground",
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

      <div className="flex min-w-0 flex-col overflow-hidden">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border-subtle px-4 py-3 sm:px-5">
          <p className="text-sm font-medium text-foreground">{thread.title}</p>
          <Badge variant="secondary">{thread.schedule}</Badge>
          <span className="ml-auto flex items-center gap-2 text-xs text-foreground-low">
            <Avatar size="sm">
              <AvatarFallback>{thread.agent.charAt(0)}</AvatarFallback>
            </Avatar>
            {thread.agent}
          </span>
        </div>

        <div className="flex flex-col gap-4 px-4 py-4 sm:px-5">
          <RequestBubble who={thread.you} text={thread.request} />

          <ol role="list" className="flex flex-col">
            {thread.steps.slice(0, stepsShown).map((step, index) => (
              <StepRow
                key={step.text}
                step={step}
                className={index < shown ? ENTER : undefined}
              />
            ))}
            {working ? <WorkingRow label={A11Y.working} /> : null}
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
              {/* The two actions are part of the picture, not controls on
                  the page: they take no focus and are hidden from the
                  accessibility tree. */}
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

      <aside
        aria-label={A11Y.computer}
        className="hidden flex-col gap-3 border-l border-border-subtle bg-surface-secondary p-4 lg:flex"
      >
        <p className="px-1 text-xs text-foreground-low">{computer.title}</p>
        <dl className="flex flex-col gap-2">
          {computer.rows.map((row, index) => {
            const Icon = COMPUTER_ICONS[index] ?? IconBrowser;
            return (
              <div
                key={row.label}
                className="flex flex-col gap-1 rounded-xl bg-background p-3 shadow-edge"
              >
                <dt className="flex items-center gap-1.5 text-xs text-foreground-low">
                  <Icon className="size-3.5" aria-hidden="true" />
                  {row.label}
                </dt>
                <dd className="text-sm break-words text-foreground">
                  {row.value}
                </dd>
              </div>
            );
          })}
        </dl>
      </aside>
    </BrowserFrame>
  );
}
