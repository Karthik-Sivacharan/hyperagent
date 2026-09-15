import { IconArrowUp, IconDeviceDesktop, IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import type { CSSProperties } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import { Overline } from "@/components/ui/overline";
import { cn } from "@/lib/utils";

import { HERO, type HeroEntry, LINKS } from "./content";
import { AgentAvatar, StatusBadge } from "./glyphs";
import { SURFACE, TwoToneText } from "./section";
import styles from "./thread.module.css";
import {
  AgentBubble,
  AskCard,
  ReceiptLog,
  SystemLine,
  UserBubble,
} from "./thread-parts";

// The job, the check, then the product itself: the headline and lede on the
// left, and under them a live replica of the app in one hairline frame. A
// sidebar lists the agents by role; the thread on the right plays one run
// once, on load, with every bubble popping in on the brand's spring. No
// typewriter, no loop.
export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="px-4 pt-16 pb-16 sm:px-6 md:pt-24 md:pb-28"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-12 md:gap-16">
        <div className="flex max-w-3xl flex-col items-start gap-6">
          <h1
            id="hero-heading"
            className="text-heading-display font-medium! text-balance text-foreground"
          >
            <TwoToneText heading={HERO.heading} />
          </h1>
          <p className="max-w-xl text-lg text-pretty text-muted-foreground">
            {HERO.lede}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-11 md:h-10">
              <Link href={LINKS.start.href}>{LINKS.start.label}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-11 md:h-10"
            >
              <a href={LINKS.tour.href}>{LINKS.tour.label}</a>
            </Button>
          </div>
          <p className="text-md text-pretty text-foreground-low">{HERO.fine}</p>
        </div>

        <div className="flex flex-col gap-3">
          <HeroDemo />
          <p className="text-xs text-foreground-low">{HERO.demo.caption}</p>
        </div>

        <div className="flex flex-col gap-3 border-t border-border-subtle pt-6 md:flex-row md:items-baseline md:gap-8">
          <Overline asChild>
            <p id="hero-starts-from">{HERO.startsFrom.label}</p>
          </Overline>
          <ul
            role="list"
            aria-labelledby="hero-starts-from"
            className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground"
          >
            {HERO.startsFrom.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function at(ms: number): CSSProperties {
  return { "--at": `${ms}ms` } as CSSProperties;
}

// The frame: 320px sidebar of agents beside the thread, one surface, one
// hairline, the largest radius. It is a picture (`role="img"`, named by its
// label) whose inside is inert, so nothing in it is a tab stop and the
// label is what a screen reader gets. (`inert` on the image itself would
// hide the label too.)
// The thread column is anchored to the bottom and clipped at the top under
// a fade, so new entries push older ones up the way a real thread scrolls
// and the frame never changes height.
function HeroDemo() {
  const { demo } = HERO;
  const selected =
    demo.agents.find((agent) => agent.selected) ?? demo.agents[0];
  return (
    <div
      role="img"
      aria-label={demo.label}
      className={cn(
        styles.frame,
        SURFACE,
        "grid h-[34rem] overflow-hidden md:h-[38rem] md:grid-cols-[20rem_minmax(0,1fr)]",
      )}
    >
      <div inert className="contents">
        <aside className="hidden flex-col border-r border-border-subtle md:flex">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <Overline asChild>
              <p>{demo.sidebarLabel}</p>
            </Overline>
            <Badge variant="secondary">{demo.agents.length}</Badge>
          </div>
          <ul role="list" className="flex flex-col gap-1 px-3">
            {demo.agents.map((agent) => (
              <li
                key={agent.name}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-2 py-2",
                  agent.selected && "bg-tint-10",
                )}
              >
                <AgentAvatar glyph={agent.glyph} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">
                    {agent.name}
                  </span>
                  <span className="truncate text-xs text-foreground-low">
                    {agent.job}
                  </span>
                </div>
                <StatusBadge status={agent.status} />
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="flex items-center gap-3 border-b border-border-subtle px-4 py-3 md:px-5">
            <AgentAvatar glyph={selected.glyph} size="sm" />
            <span className="text-sm font-medium text-foreground">
              {selected.name}
            </span>
            <StatusBadge status={selected.status} />
          </header>

          <ul
            role="list"
            className="flex gap-2 overflow-x-auto border-b border-border-subtle px-4 py-3 scrollbar-hide md:hidden"
          >
            {demo.agents
              .filter((agent) => !agent.selected)
              .map((agent) => (
                <li
                  key={agent.name}
                  className="flex shrink-0 items-center gap-2 rounded-full bg-tint-10 py-1 pr-3 pl-1"
                >
                  <AgentAvatar glyph={agent.glyph} size="sm" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {agent.name}
                  </span>
                </li>
              ))}
          </ul>

          <div className="relative min-h-0 flex-1 overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-linear-to-b from-card to-transparent" />
            <ol
              role="list"
              className="absolute inset-x-0 bottom-0 flex flex-col gap-3 px-4 pt-16 pb-4 md:px-5"
            >
              {demo.thread.map((entry, index) => (
                <Entry key={index} entry={entry} />
              ))}
            </ol>
          </div>

          <div className="px-4 pb-4 md:px-5 md:pb-5">
            <div className="flex h-11 items-center gap-3 rounded-full border border-border-loud px-2 pl-4">
              <IconPlus
                aria-hidden="true"
                className="size-4 text-foreground-low"
              />
              <span className="flex-1 text-sm text-foreground-low">
                {demo.composer}
              </span>
              <IconTile size="sm" shape="circle" tone="raised">
                <IconArrowUp aria-hidden="true" className="size-3.5" />
              </IconTile>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Entry({ entry }: { entry: HeroEntry }) {
  switch (entry.kind) {
    case "system":
      return (
        <SystemLine className={styles.entry} style={at(entry.at)}>
          {entry.text}
        </SystemLine>
      );
    case "user":
      return (
        <UserBubble className={styles.entry} style={at(entry.at)}>
          {entry.text}
        </UserBubble>
      );
    case "agent":
      return (
        <AgentBubble className={styles.entry} style={at(entry.at)}>
          {entry.text}
        </AgentBubble>
      );
    case "ask":
      return (
        <AskCard
          className={styles.entry}
          style={at(entry.at)}
          label={entry.label}
          text={entry.text}
          approve={entry.approve}
          hold={entry.hold}
        />
      );
    case "receipt":
      return (
        <ReceiptLog
          className={styles.entry}
          style={at(entry.at)}
          lines={entry.lines}
          summary={entry.summary}
        />
      );
    case "computer":
      return (
        <li
          className={cn(
            styles.entry,
            "flex w-full max-w-sm flex-col gap-2 self-start rounded-3xl p-4 shadow-edge",
          )}
          style={at(entry.at)}
        >
          <div className="flex items-center gap-2">
            <IconDeviceDesktop
              aria-hidden="true"
              className="size-4 text-foreground-low"
            />
            <span className="flex-1 text-xs font-medium text-foreground">
              {entry.title}
            </span>
            <span className="grid text-xs text-foreground-low">
              <span
                className={cn(
                  styles.leave,
                  "col-start-1 row-start-1 flex items-center gap-1.5",
                )}
                style={at(entry.doneAt)}
              >
                {entry.working}
                <span className="flex gap-0.5">
                  <span className="size-1 rounded-full bg-current animate-typing-dot" />
                  <span className="size-1 rounded-full bg-current animate-typing-dot [animation-delay:160ms]" />
                  <span className="size-1 rounded-full bg-current animate-typing-dot [animation-delay:320ms]" />
                </span>
              </span>
              <span
                className={cn(styles.entry, "col-start-1 row-start-1")}
                style={at(entry.doneAt)}
              >
                {entry.done}
              </span>
            </span>
          </div>
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs">
            {entry.rows.map((row) => (
              <div key={row.label} className="contents">
                <dt className="text-foreground-low">{row.label}</dt>
                <dd className="truncate text-foreground tabular-nums">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </li>
      );
  }
}
