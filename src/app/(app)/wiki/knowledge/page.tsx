import { PageHeading } from "@/components/patterns/page-heading";
import { WikiTabs } from "@/components/wiki/wiki-tabs";
import { KnowledgeView } from "@/components/wiki/knowledge-view";
import { wikiAgents, wikiAllAtoms, wikiCounts, wikiGroupLabel, wikiTopicOptions, wikiTopics } from "@/lib/mock/wiki";

// The knowledge browser: every atom in the store under the serving filters.

export default function Page() {
  const groups = [...new Set(Object.values(wikiTopics).map((topic) => topic.group))].map((id) => ({
    id,
    label: wikiGroupLabel(id),
  }));

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-4 px-6 py-6">
        <PageHeading
          title="Knowledge"
          subtitle="Every atom dreaming extracted, with its Topics, sources and supersession chain"
        />
        <WikiTabs counts={wikiCounts()} />
        <KnowledgeView atoms={wikiAllAtoms()} topics={wikiTopicOptions()} agents={wikiAgents} groupLabels={groups} />
      </div>
    </div>
  );
}
