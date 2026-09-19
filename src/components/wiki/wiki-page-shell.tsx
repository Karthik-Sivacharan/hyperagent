import { notFound, redirect } from "next/navigation";
import { WikiView } from "@/components/wiki/wiki-view";
import {
  getWikiView,
  wikiCounts,
  wikiGroupLabels,
  wikiHiddenPages,
  wikiIndexGroups,
  wikiJob,
  wikiPages,
  wikiScopedSlug,
  wikiWorkspace,
} from "@/lib/mock/wiki";

// Every wiki route renders this: the index is the same on each page, and the
// route ships only the slice of the store its own page can open
// (`getWikiView`), so the client never carries the whole workspace.

const fmtInt = (value: number) => value.toLocaleString("en-US");

const fmtWindow = (start: string, end: string) => {
  const options = { month: "short", day: "numeric" } as const;
  const from = new Date(start.slice(0, 19)).toLocaleDateString("en-US", options);
  const to = new Date(end.slice(0, 19)).toLocaleDateString("en-US", options);
  return `${from} – ${to}`;
};

export function WikiPageShell({ slug, aside }: { slug: string; aside?: React.ReactNode }) {
  const view = getWikiView(slug);
  if (!view) {
    // Not a shared page. This design reads the workspace scope only, so an
    // assistant's private page opens as the shared page on its Topic.
    const shared = wikiScopedSlug(slug, null);
    if (shared) redirect(`/wiki/${shared}`);
    notFound();
  }

  return (
    <WikiView
      view={view}
      groups={wikiIndexGroups()}
      hiddenPages={wikiHiddenPages()}
      totalPages={wikiPages.filter((page) => !page.hidden).length}
      counts={wikiCounts()}
      groupLabels={wikiGroupLabels}
      aside={aside}
      header={{
        workspace: wikiWorkspace.name,
        subtitle: `${wikiJob.runCount} dreaming runs read ${fmtInt(wikiJob.threadCount)} threads, ${fmtInt(wikiJob.messageCount)} messages, ${wikiJob.memoryCount} saved memories and ${wikiJob.documentCount} documents from ${fmtWindow(wikiJob.windowStart, wikiJob.windowEnd)} and composed these pages.`,
      }}
    />
  );
}
