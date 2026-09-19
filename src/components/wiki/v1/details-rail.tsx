"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { IconArrowDown, IconChevronRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Overline } from "@/components/ui/overline";
import { bodyHeadings } from "@/components/wiki/wiki-body";
import { SourceKindIcon, TopicChip } from "@/components/wiki/topic-chip";
import { fmtDay, fmtStamp } from "@/components/wiki/v1/format";
import { wordCount } from "@/components/wiki/v1/text";
import type { WikiAtom, WikiGroupId, WikiLinkTarget, WikiPage, WikiTopic, WikiTopicRef } from "@/lib/mock/wiki";

// The page seen from the side, as a map rather than a record: its outline
// with the section you are reading marked, every Topic it mentions grouped by
// type (the three most mentioned of each, the rest a click away), and a way
// down to the pages that mention it. The record itself (the
// numbers, the audit fields, the Topic's own history) is folded into Info.

/** The heading whose section holds the reading line: the last one scrolled past the top fifth. */
function useActiveHeading(ids: string[], rail: React.RefObject<HTMLElement | null>) {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    // The article's column is the scroller, beside this rail rather than around it.
    const scroller = rail.current?.closest("[data-wiki-view]")?.querySelector<HTMLElement>("[data-wiki-scroll]");
    if (!scroller || ids.length === 0) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const line = scroller.getBoundingClientRect().top + scroller.clientHeight * 0.2;
      let current: string | null = null;
      for (const id of ids) {
        const heading = document.getElementById(id);
        if (!heading) continue;
        if (heading.getBoundingClientRect().top <= line) current = id;
        else break;
      }
      setActive(current ?? ids[0]);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    frame = requestAnimationFrame(measure);
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ids, rail]);

  return active;
}

/**
 * The bar beside the outline row you are reading: a short bar on a hairline
 * track that slides to the next row as the reading line crosses a heading,
 * so a change of section shows as movement rather than a fill that jumps.
 * It is placed by measuring the row and written straight to the bar's style,
 * so scrolling never re-renders the rail. It arrives without sliding the
 * first time, and a reader who asks for less motion gets the jump.
 */
function useOutlineMarker(
  active: string | null,
  ids: string[],
  nav: React.RefObject<HTMLElement | null>,
  bar: React.RefObject<HTMLSpanElement | null>,
) {
  useLayoutEffect(() => {
    const marker = bar.current;
    const row = nav.current?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!marker) return;
    if (!row) {
      marker.style.setProperty("opacity", "0");
      return;
    }
    marker.style.setProperty("opacity", "1");
    marker.style.setProperty("translate", `0 ${row.offsetTop + 4}px`);
    marker.style.setProperty("height", `${row.offsetHeight - 8}px`);
    if (!marker.hasAttribute("data-placed")) {
      // Commit the first position before the slide switches on.
      marker.getBoundingClientRect();
      marker.setAttribute("data-placed", "");
    }
  }, [active, ids, nav, bar]);
}

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-2 px-2">
        <Overline className="flex-1">{title}</Overline>
        {count !== undefined ? <span className="text-label-12-mono text-foreground-low">{count}</span> : null}
      </div>
      {children}
    </section>
  );
}

/** "Thread" to "threads", "Saved memory" to "saved memories". */
const plural = (label: string) => (label.endsWith("y") ? `${label.slice(0, -1)}ies` : `${label}s`);

/** How many Topics of one type show before the rest wait behind "+N more". */
const MENTIONS_SHOWN = 3;

type Mention = WikiLinkTarget & { key: string; count: number };

/**
 * One type's mentions, most mentioned first. The first few are chips and the
 * rest open in place, so a page that names twenty Topics still fits its rail
 * on one screen, with Mentioned in and Info in view.
 */
function MentionGroup({ group, label, entries }: { group: WikiGroupId; label: string; entries: Mention[] }) {
  const [all, setAll] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const shown = all ? entries : entries.slice(0, MENTIONS_SHOWN);
  const rest = entries.length - shown.length;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-foreground-low">{label}</span>
      <div ref={list} className="flex flex-wrap gap-1">
        {shown.map((entry) => (
          <TopicChip
            key={entry.key}
            group={group}
            label={entry.title}
            count={entry.count}
            href={entry.slug ? `/wiki/${entry.slug}` : undefined}
            tone="neutral"
          />
        ))}
        {rest > 0 ? (
          <Button
            variant="ghost"
            size="none"
            aria-label={`Show ${rest} more in ${label}`}
            onClick={() => {
              // The button leaves with the click: render the rest now, then
              // hand focus to the first chip it revealed.
              flushSync(() => setAll(true));
              list.current?.querySelectorAll<HTMLElement>("[data-slot=badge]")[MENTIONS_SHOWN]?.focus();
            }}
            className="h-6 rounded-full px-2 text-md font-normal text-foreground-low hover:text-foreground"
          >
            +{rest} more
          </Button>
        ) : null}
      </div>
    </div>
  );
}

/** A label and its value side by side, or `stacked`, the label over a value too wide to sit beside it. */
function Row({ label, stacked, children }: { label: string; stacked?: boolean; children: React.ReactNode }) {
  return (
    <div className={cn("flex gap-3 py-1 text-md", stacked && "flex-col items-start gap-1")}>
      <dt className="w-24 shrink-0 text-foreground-low">{label}</dt>
      <dd className="min-w-0 flex-1 text-foreground tabular-nums">{children}</dd>
    </div>
  );
}

export function DetailsRailV1({
  page,
  topic,
  mergedInto,
  body,
  atoms,
  linkGroups,
  groupLabels,
  groupOrder,
  mentionedIn,
  onReveal,
}: {
  page: WikiPage;
  topic: WikiTopic;
  mergedInto: WikiTopicRef | null;
  /** The body as the article renders it, so the outline's ids match its headings. */
  body: string;
  atoms: Record<string, WikiAtom>;
  linkGroups: Record<string, WikiGroupId>;
  groupLabels: Record<WikiGroupId, string>;
  groupOrder: WikiGroupId[];
  /** How many pages link here; the list itself sits at the foot of the page. */
  mentionedIn: number;
  /** Show the Page tab and scroll to an element in it. */
  onReveal: (id: string) => void;
}) {
  const rail = useRef<HTMLElement>(null);
  const headings = useMemo(() => bodyHeadings(body), [body]);
  const ids = useMemo(() => headings.map((heading) => heading.id), [headings]);
  const active = useActiveHeading(ids, rail);
  const outline = useRef<HTMLElement>(null);
  const outlineBar = useRef<HTMLSpanElement>(null);
  useOutlineMarker(active, ids, outline, outlineBar);

  // Every Topic the body links to, counted, grouped by type in the store's order.
  const counts = new Map<string, number>();
  for (const match of body.matchAll(/\[\[([^\]|]+)/g)) {
    const key = match[1].trim().toLowerCase().replace(/\s+/g, "-");
    if (page.links[key]) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const mentions = groupOrder
    .map((group) => ({
      group,
      entries: [...counts]
        .filter(([key]) => (linkGroups[key] ?? "concept") === group)
        .map(([key, count]) => ({ key, count, ...page.links[key] }))
        .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title)),
    }))
    .filter((entry) => entry.entries.length > 0);

  // What the cited atoms were extracted from, by source kind, with the store's labels.
  const sourceKinds = new Map<string, { label: string; count: number }>();
  for (const id of page.citations) {
    for (const source of atoms[id]?.sources ?? []) {
      const entry = sourceKinds.get(source.kind) ?? { label: source.label, count: 0 };
      entry.count += 1;
      sourceKinds.set(source.kind, entry);
    }
  }

  const sources = [...sourceKinds].map(([kind, entry]) => ({ kind, ...entry })).sort((a, b) => b.count - a.count);
  const firstDay = page.versions[0]?.sourceDay ?? null;

  return (
    <aside ref={rail} className="flex w-64 shrink-0 flex-col gap-6">
      {headings.length ? (
        <Section title="Outline">
          <nav ref={outline} aria-label="Outline" className="relative flex flex-col pl-3">
            <span className="absolute inset-y-0 left-0 flex w-0.5 justify-center" aria-hidden="true">
              <span className="w-px bg-border-subtle" />
            </span>
            <span
              ref={outlineBar}
              className="pointer-events-none absolute top-0 left-0 w-0.5 rounded-full bg-foreground opacity-0 data-placed:transition-[translate,height] data-placed:duration-(--duration-move) data-placed:ease-out-quart motion-reduce:transition-none"
              aria-hidden="true"
            />
            {headings.map((heading) => {
              const isActive = heading.id === active;
              return (
                <Button
                  key={heading.id}
                  variant="ghost"
                  size="none"
                  asChild
                  className={cn(
                    "h-auto w-full justify-start rounded-md px-2 py-1 text-left text-sm font-normal text-muted-foreground hover:bg-tint-10 hover:text-foreground",
                    isActive && "text-foreground",
                  )}
                >
                  <a
                    href={`#${heading.id}`}
                    aria-current={isActive ? "location" : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      onReveal(heading.id);
                    }}
                  >
                    <span className="truncate">{heading.text}</span>
                  </a>
                </Button>
              );
            })}
          </nav>
        </Section>
      ) : null}

      <Collapsible className="flex flex-col gap-2">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="none"
            className="group/details h-auto w-full justify-start gap-1 rounded-md px-2 py-1 text-left font-normal hover:bg-tint-10 aria-expanded:bg-transparent aria-expanded:hover:bg-tint-10"
          >
            <Overline>Details</Overline>
            <IconChevronRight
              className="size-3.5 text-foreground-low transition-transform duration-(--duration-fast) ease-out-quart group-aria-expanded/details:rotate-90"
              aria-hidden="true"
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-col gap-4 px-2">
          <dl className="flex flex-col divide-y divide-border-subtle">
            <Row label="Status">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={cn("size-1.5 shrink-0 rounded-full", topic.status === "active" ? "bg-success" : "bg-warning")}
                  aria-hidden="true"
                />
                <span className="capitalize">{topic.status}</span>
              </span>
            </Row>
            {/* The rail is too narrow for a Topic's name beside the label, so its chip goes under it. */}
            {mergedInto ? (
              <Row label="Merged into" stacked>
                <TopicChip
                  group={mergedInto.group}
                  label={mergedInto.title}
                  href={mergedInto.slug ? `/wiki/${mergedInto.slug}` : undefined}
                />
              </Row>
            ) : null}
            <Row label="Versions">
              {page.versions.length}
              {firstDay ? `, since ${fmtDay(firstDay)}` : ""}
            </Row>
            <Row label="Citations">{page.citations.length}</Row>
            <Row label="Atoms">
              {topic.currentAtomCount} current of {topic.atomCount}
            </Row>
            {sources.length ? (
              <Row label="Sources">
                <ul className="flex flex-col gap-0.5">
                  {sources.map(({ kind, label, count }) => (
                    <li key={kind} className="flex items-center gap-1.5">
                      <SourceKindIcon kind={kind} className="text-foreground-low" />
                      {count} {(count === 1 ? label : plural(label)).toLowerCase()}
                    </li>
                  ))}
                </ul>
              </Row>
            ) : null}
            <Row label="Words">{wordCount(body).toLocaleString("en-US")}</Row>
            {topic.aliases.length ? <Row label="Also known as">{topic.aliases.join(", ")}</Row> : null}
          </dl>

          {topic.versions.length ? (
            <div className="flex flex-col gap-2">
              <Overline>Topic history</Overline>
              <ol className="flex flex-col gap-2">
                {[...topic.versions].reverse().map((version) => (
                  <li key={version.version} className="flex gap-2">
                    <Badge variant="secondary" className="shrink-0">
                      v{version.version}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="text-md text-foreground">{version.changeNote}</p>
                      <p className="text-xs text-foreground-low">
                        {fmtStamp(version.createdAt)}
                        {version.dreamRunId ? `, ${version.dreamRunId}` : version.changedBy ? `, ${version.changedBy}` : ""}
                        {version.status ? `, ${version.status}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </CollapsibleContent>
      </Collapsible>

      {mentions.length ? (
        <Section title="Mentions" count={counts.size}>
          <div className="flex flex-col gap-3 px-2">
            {mentions.map(({ group, entries }) => (
              <MentionGroup
                key={`${page.slug}-${group}`}
                group={group}
                label={groupLabels[group] ?? groupLabels.concept}
                entries={entries}
              />
            ))}
          </div>
        </Section>
      ) : null}

      {mentionedIn ? (
        <Button
          variant="ghost"
          size="none"
          asChild
          className="h-auto w-full justify-start gap-2 rounded-md px-2 py-1.5 text-left text-sm font-normal text-muted-foreground hover:bg-tint-10 hover:text-foreground"
        >
          <a
            href="#mentioned-in"
            onClick={(event) => {
              event.preventDefault();
              onReveal("mentioned-in");
            }}
          >
            <IconArrowDown className="size-3.5" aria-hidden="true" />
            Mentioned in {mentionedIn} page{mentionedIn === 1 ? "" : "s"}
          </a>
        </Button>
      ) : null}

    </aside>
  );
}
