"use client";

import { useState } from "react";
import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Overline } from "@/components/ui/overline";
import { bodyHeadings } from "@/components/wiki/wiki-body";
import { wikiGroupDot } from "@/components/wiki/topic-type";
import type { WikiLinkedFrom, WikiPage, WikiTopic } from "@/lib/mock/wiki";

// What the page is about, seen from the side: the sections of the body, the
// Topic and Page records behind it, the Topic's own revision history, and the
// pages that link here or cite an atom on this Topic.

const fmtStamp = (value: string | null) =>
  value
    ? `${new Date(value.slice(0, 19)).toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${value.slice(11, 16)}`
    : "—";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-1 text-xs">
      <span className="w-24 shrink-0 text-foreground-low">{label}</span>
      <span className="min-w-0 flex-1 text-foreground">{children}</span>
    </div>
  );
}

const LINKED_CAP = 6;

export function WikiDetailsRail({
  page,
  topic,
  linkedFrom,
  groupLabels,
}: {
  page: WikiPage;
  topic: WikiTopic;
  linkedFrom: WikiLinkedFrom[];
  groupLabels: Record<string, string>;
}) {
  const [showAllLinked, setShowAllLinked] = useState(false);
  const headings = bodyHeadings(page.content);
  const current = page.versions[page.versions.length - 1];
  const shown = showAllLinked ? linkedFrom : linkedFrom.slice(0, LINKED_CAP);

  return (
    <aside className="flex w-64 shrink-0 flex-col gap-6">
      {headings.length ? (
        <nav aria-label="On this page" className="flex flex-col gap-1">
          <Overline className="px-2 pb-1">On this page</Overline>
          {headings.map((heading) => (
            <Button
              key={heading.id}
              variant="ghost"
              size="none"
              asChild
              className="h-auto w-full justify-start rounded-sm px-2 py-1 text-left text-xs font-normal text-muted-foreground hover:bg-tint-10 hover:text-foreground"
            >
              <Link href={`#${heading.id}`}>
                <span className="truncate">{heading.text}</span>
              </Link>
            </Button>
          ))}
        </nav>
      ) : null}

      <Collapsible defaultOpen className="flex flex-col gap-2">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="none"
            className="group/details h-auto w-full justify-start gap-1.5 rounded-sm px-2 py-1 text-left font-normal hover:bg-tint-10"
          >
            <IconChevronRight
              className="size-3.5 text-foreground-low transition-transform duration-(--duration-fast) ease-out-quart group-aria-expanded/details:rotate-90"
              aria-hidden="true"
            />
            <Overline className="flex-1">Details</Overline>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-col gap-4 px-2">
          <div className="flex flex-col divide-y divide-border-subtle">
            <Row label="topic">{topic.title}</Row>
            <Row label="type">{topic.type}</Row>
            <Row label="subtype">{topic.subtype ?? "—"}</Row>
            <Row label="status">{topic.status}</Row>
            {topic.aliases.length ? <Row label="also known as">{topic.aliases.join(", ")}</Row> : null}
            <Row label="version">
              {current?.version ?? "—"} of {page.versions.length}
            </Row>
            <Row label="citations">{page.citations.length}</Row>
            <Row label="atoms on Topic">
              {topic.currentAtomCount} current of {topic.atomCount}
            </Row>
          </div>

          {topic.versions.length ? (
            <div className="flex flex-col gap-2">
              <Overline>Topic history</Overline>
              <ul className="flex flex-col gap-2">
                {[...topic.versions].reverse().map((version) => (
                  <li key={version.version} className="flex gap-2">
                    <Badge variant="secondary" className="shrink-0">
                      v{version.version}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs leading-5 text-foreground">{version.changeNote}</p>
                      <p className="text-xs text-foreground-low">
                        {fmtStamp(version.createdAt)}
                        {version.dreamRunId ? ` · ${version.dreamRunId}` : version.changedBy ? ` · ${version.changedBy}` : ""}
                        {version.status ? ` · ${version.status}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </CollapsibleContent>
      </Collapsible>

      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-2 px-2">
          <Overline className="flex-1">Linked from</Overline>
          <span className="text-label-12-mono text-foreground-low">{linkedFrom.length}</span>
        </div>
        {shown.length ? (
          <ul className="flex flex-col gap-3 px-2">
            {shown.map((entry) => (
              <li key={entry.slug} className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <span className={cn("size-1.5 shrink-0 rounded-full", wikiGroupDot[entry.group])} aria-hidden="true" />
                  <Link
                    href={`/wiki/${entry.slug}`}
                    className="truncate text-xs text-foreground underline decoration-border underline-offset-4 transition-colors duration-(--duration-fast) ease-out-quart hover:decoration-brand-accent"
                  >
                    {entry.title}
                  </Link>
                  <span className="text-label-12-mono text-foreground-low">{groupLabels[entry.group] ?? groupLabels.concept}</span>
                </div>
                <p className="text-xs leading-5 text-foreground-low">
                  {entry.sentence || "cites an atom linked to this Topic"}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-2 text-xs text-foreground-low">No page links to this Topic or cites its atoms yet.</p>
        )}
        {linkedFrom.length > LINKED_CAP && !showAllLinked ? (
          <Button
            variant="ghost"
            size="none"
            onClick={() => setShowAllLinked(true)}
            className="h-auto w-fit rounded-sm px-2 py-1 text-xs font-normal text-foreground underline decoration-border underline-offset-4 hover:bg-tint-10"
          >
            Show all {linkedFrom.length}
          </Button>
        ) : null}
      </section>
    </aside>
  );
}
