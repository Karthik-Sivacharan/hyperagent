"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { IconInfoCircle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AtomDrawer } from "@/components/wiki/atom-drawer";
import { WikiDetailsRail } from "@/components/wiki/wiki-details-rail";
import { WikiTabs } from "@/components/wiki/wiki-tabs";
import type { InlineContext } from "@/components/wiki/wiki-body";
import { ArticleV1 } from "@/components/wiki/v1/article";
import { fmtInt, fmtWindow } from "@/components/wiki/v1/format";
import { IndexRailV1 } from "@/components/wiki/v1/index-rail";
import type { WikiGroupId, WikiIndexEntry, WikiView as WikiViewData } from "@/lib/mock/wiki";

// v1 of the wiki: the page index on the left, the article in the middle, a
// map of the page on the right, and the atom drawer over all three. Chrome is
// one line (where you are, what composed it, which design) above the tabs.

export type WikiJob = {
  workspace: string;
  runCount: number;
  threadCount: number;
  messageCount: number;
  memoryCount: number;
  documentCount: number;
  windowStart: string;
  windowEnd: string;
};

function JobNote({ job }: { job: WikiJob }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="xs" className="gap-1 text-foreground-low hover:text-foreground">
          {job.runCount} runs, {fmtWindow(job.windowStart, job.windowEnd)}
          <IconInfoCircle className="size-3.5" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="flex w-80 flex-col gap-2 p-3 text-xs leading-5">
        <p className="text-foreground">
          {job.runCount} dreaming runs read {fmtInt(job.threadCount)} threads, {fmtInt(job.messageCount)} messages,{" "}
          {job.memoryCount} saved memories and {job.documentCount} documents from{" "}
          {fmtWindow(job.windowStart, job.windowEnd)} and composed these pages.
        </p>
        <p className="text-foreground-low">Composed by dreaming · nothing here was written by hand</p>
      </PopoverContent>
    </Popover>
  );
}

export function WikiViewV1({
  view,
  groups,
  hiddenPages,
  counts,
  groupLabels,
  assistants,
  job,
  aside,
}: {
  view: WikiViewData;
  groups: { id: WikiGroupId; label: string; pages: WikiIndexEntry[] }[];
  hiddenPages: WikiIndexEntry[];
  counts: { pages: number; days: number; runs: number; atoms: number };
  groupLabels: Record<WikiGroupId, string>;
  assistants: string[];
  job: WikiJob;
  aside: React.ReactNode;
}) {
  const [atomId, setAtomId] = useState<string | null>(null);
  const { page, topic, atoms, topicTitles, linkedFrom } = view;

  const ctx: InlineContext = useMemo(
    () => ({
      cites: new Map(page.citations.map((id, index) => [id, index + 1])),
      links: page.links,
      onAtom: setAtomId,
    }),
    [page],
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-5 px-6 py-5">
        <div className="flex min-h-8 items-center gap-2">
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-xs text-foreground-low">
            <span className="truncate">{job.workspace}</span>
            <span aria-hidden="true">/</span>
            <Link href="/wiki" className="text-foreground hover:underline hover:underline-offset-4">
              Wiki
            </Link>
          </nav>
          <JobNote job={job} />
          <div className="ml-auto">{aside}</div>
        </div>

        <WikiTabs counts={counts} />

        <div className="flex items-start gap-8">
          <div className="sticky top-5 self-start">
            <IndexRailV1
              groups={groups}
              hiddenPages={hiddenPages}
              activeSlug={page.slug}
              activeGroup={page.hidden ? null : page.group}
            />
          </div>

          <main className="min-w-0 flex-1">
            <ArticleV1
              page={page}
              topic={topic}
              atoms={atoms}
              ctx={ctx}
              onAtom={setAtomId}
              assistants={assistants}
            />
          </main>

          <div className="sticky top-5 hidden self-start xl:block">
            <WikiDetailsRail page={page} topic={topic} linkedFrom={linkedFrom} groupLabels={groupLabels} />
          </div>
        </div>
      </div>

      <AtomDrawer
        atomId={atomId}
        atoms={atoms}
        topicTitles={topicTitles}
        onOpenAtom={setAtomId}
        onClose={() => setAtomId(null)}
      />
    </div>
  );
}
