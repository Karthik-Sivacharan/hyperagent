import { notFound } from "next/navigation";
import { WikiViewV1 } from "@/components/wiki/v1/wiki-view";
import {
  getWikiView,
  wikiAgents,
  wikiCounts,
  wikiGroupLabels,
  wikiGroupOrder,
  wikiHiddenPages,
  wikiIndexGroups,
  wikiJob,
  wikiLinkGroups,
  wikiWorkspace,
} from "@/lib/mock/wiki";

// The v1 article route: the same slice of the store the original ships
// (`getWikiView`), plus the few store readings v1 draws with: the group of
// every Topic the page links to, the group labels and order, and the names
// of the workspace's assistants. Every value on the page comes from here.

export function WikiPageShellV1({ slug, aside }: { slug: string; aside: React.ReactNode }) {
  const view = getWikiView(slug);
  if (!view) notFound();

  return (
    <WikiViewV1
      view={view}
      groups={wikiIndexGroups()}
      hiddenPages={wikiHiddenPages()}
      counts={wikiCounts()}
      linkGroups={wikiLinkGroups(view.page)}
      groupLabels={wikiGroupLabels}
      groupOrder={wikiGroupOrder}
      assistants={[...new Set(wikiAgents.map((agent) => agent.name))]}
      job={{
        workspace: wikiWorkspace.name,
        runCount: wikiJob.runCount,
        threadCount: wikiJob.threadCount,
        messageCount: wikiJob.messageCount,
        memoryCount: wikiJob.memoryCount,
        documentCount: wikiJob.documentCount,
        windowStart: wikiJob.windowStart,
        windowEnd: wikiJob.windowEnd,
      }}
      aside={aside}
    />
  );
}
