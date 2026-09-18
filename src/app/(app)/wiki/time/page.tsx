import { WikiTabs } from "@/components/wiki/wiki-tabs";
import { TimeView } from "@/components/wiki/time-view";
import { PageHeading } from "@/components/patterns/page-heading";
import {
  wikiAllAtoms,
  wikiConflicts,
  wikiCounts,
  wikiDayFinalSeq,
  wikiDays,
  wikiGroupLabels,
  wikiJob,
  wikiPagesForGraph,
  wikiRuns,
  wikiTopicOptions,
} from "@/lib/mock/wiki";

// The job as it happened: the run feed and one Topic's atoms across the window.

export default function Page() {
  const totals = wikiRuns.reduce(
    (sum, run) => ({
      tokensIn: sum.tokensIn + (run.tokenUsage.input ?? 0),
      tokensOut: sum.tokensOut + (run.tokenUsage.output ?? 0),
      calls: sum.calls + (run.tokenUsage.calls ?? 0),
    }),
    { tokensIn: 0, tokensOut: 0, calls: 0 },
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-4 px-6 py-6">
        <PageHeading title="Over time" subtitle="How knowledge developed run by run and day by day" />
        <WikiTabs counts={wikiCounts()} />
        <TimeView
          runs={wikiRuns}
          atoms={wikiAllAtoms()}
          topics={wikiTopicOptions()}
          pages={wikiPagesForGraph()}
          conflicts={wikiConflicts}
          days={wikiDays}
          dayFinalSeq={wikiDayFinalSeq}
          job={{ id: wikiJob.id, model: wikiJob.model, ...totals }}
          groupLabels={wikiGroupLabels}
        />
      </div>
    </div>
  );
}
