"use client";

import { useMemo, useState } from "react";
import { IconHistory } from "@tabler/icons-react";
import { PageHeading } from "@/components/patterns/page-heading";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AtomDrawer } from "@/components/wiki/atom-drawer";
import { WikiTabs } from "@/components/wiki/wiki-tabs";
import { ArticleV1 } from "@/components/wiki/v1/article";
import type { BodyContext } from "@/components/wiki/v1/body";
import { DetailsRailV1 } from "@/components/wiki/v1/details-rail";
import { fmtInt, fmtWindow } from "@/components/wiki/v1/format";
import { IndexRailV1 } from "@/components/wiki/v1/index-rail";
import { WikiScopeSelect, type WikiScopeSwitch } from "@/components/wiki/v1/scope-select";
import { splitAliases } from "@/components/wiki/v1/text";
import type { WikiGroupId, WikiIndexEntry, WikiView as WikiViewData } from "@/lib/mock/wiki";

// v1 of the wiki: the page index on the left, the article in the middle, a
// map of the page on the right, and the atom drawer over all three. It opens
// on the heading every app page shares: the title, a subtitle naming the runs
// that composed the wiki (click or tap it for the detail), and on the right
// whose wiki you are reading beside the design switch, as a top bar would hold
// them. The workspace is already named in the sidebar, so there is no
// breadcrumb. The title is not an h1, because the article's own title is
// the page's one h1. The view tabs below stay out of the way while Pages is
// the only view.

export type WikiJob = {
  runCount: number;
  threadCount: number;
  messageCount: number;
  memoryCount: number;
  documentCount: number;
  windowStart: string;
  windowEnd: string;
};

// The subtitle is the trigger, so it wears the subtitle's own size and colour
// and lights up on hover. A popover rather than a hover card, because touch
// cannot hover.
function JobNote({ job }: { job: WikiJob }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="link"
          size="none"
          className="gap-1.5 font-normal text-muted-foreground hover:text-foreground hover:no-underline aria-expanded:text-foreground"
        >
          <IconHistory className="size-4" aria-hidden="true" />
          Composed by {job.runCount} runs, {fmtWindow(job.windowStart, job.windowEnd)}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-3 text-xs leading-5">
        <p className="text-foreground">
          {job.runCount} dreaming runs read {fmtInt(job.threadCount)} threads, {fmtInt(job.messageCount)} messages,{" "}
          {job.memoryCount} saved memories and {job.documentCount} documents from{" "}
          {fmtWindow(job.windowStart, job.windowEnd)} and composed these pages.
        </p>
      </PopoverContent>
    </Popover>
  );
}

export function WikiViewV1({
  view,
  linkGroups,
  groups,
  privatePages,
  hiddenPages,
  counts,
  groupLabels,
  groupOrder,
  assistants,
  job,
  scope,
  aside,
}: {
  view: WikiViewData;
  linkGroups: Record<string, WikiGroupId>;
  groups: { id: WikiGroupId; label: string; pages: WikiIndexEntry[] }[];
  /** The scope's own pages; null in the workspace scope. */
  privatePages: WikiIndexEntry[] | null;
  hiddenPages: WikiIndexEntry[];
  counts: { pages: number; days: number; runs: number; atoms: number };
  groupLabels: Record<WikiGroupId, string>;
  groupOrder: WikiGroupId[];
  assistants: string[];
  job: WikiJob;
  /** Whose wiki is on screen, and the Server Function that changes it. */
  scope: WikiScopeSwitch;
  aside: React.ReactNode;
}) {
  const [atomId, setAtomId] = useState<string | null>(null);
  const { page, topic, atoms, topicTitles, linkedFrom } = view;
  const isPrivate = privatePages?.some((entry) => entry.slug === page.slug) ?? false;
  const { aliases, body } = useMemo(() => splitAliases(page.content), [page.content]);

  // Each page opens on its Page tab.
  const [tab, setTab] = useState("page");
  const [tabPage, setTabPage] = useState(page.slug);
  if (tabPage !== page.slug) {
    setTabPage(page.slug);
    setTab("page");
  }

  /** Show the Page tab, then bring one of its sections (or the backlinks) into view. */
  const reveal = (id: string) => {
    setTab("page");
    requestAnimationFrame(() => {
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.getElementById(id)?.scrollIntoView({ block: "start", behavior: still ? "auto" : "smooth" });
    });
  };

  const ctx: BodyContext = useMemo(
    () => ({
      cites: new Map(page.citations.map((id, index) => [id, index + 1])),
      links: page.links,
      onAtom: setAtomId,
      atoms,
      linkGroups,
    }),
    [page, atoms, linkGroups],
  );

  return (
    <div data-wiki-scroll className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-5 px-6 py-5">
        <PageHeading
          title="Wiki"
          titleAs="p"
          subtitle={<JobNote job={job} />}
          actions={
            <>
              <WikiScopeSelect {...scope} />
              {aside}
            </>
          }
        />

        <WikiTabs counts={counts} hideAlone />

        <div className="flex items-start gap-8">
          <div className="sticky top-5 -m-1 max-h-[calc(100dvh-2.5rem)] self-start overflow-y-auto overscroll-contain p-1">
            <IndexRailV1
              groups={groups}
              privatePages={privatePages}
              hiddenPages={hiddenPages}
              activeSlug={page.slug}
              activeGroup={page.hidden || isPrivate ? null : page.group}
            />
          </div>

          <main className="min-w-0 flex-1">
            <ArticleV1
              key={page.slug}
              page={page}
              topic={topic}
              atoms={atoms}
              aliases={aliases}
              body={body}
              linkedFrom={linkedFrom}
              tab={tab}
              onTab={setTab}
              ctx={ctx}
              onAtom={setAtomId}
              assistants={assistants}
            />
          </main>

          <div className="sticky top-5 -m-1 hidden max-h-[calc(100dvh-2.5rem)] self-start overflow-y-auto overscroll-contain p-1 xl:block">
            <DetailsRailV1
              page={page}
              topic={topic}
              body={body}
              atoms={atoms}
              linkGroups={linkGroups}
              groupLabels={groupLabels}
              groupOrder={groupOrder}
              mentionedIn={linkedFrom.length}
              onReveal={reveal}
            />
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
