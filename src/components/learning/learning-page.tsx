"use client";

import { useState } from "react";
import { IconRobotFace } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeading } from "@/components/patterns/page-heading";
import { LearningThreadRow } from "@/components/learning/learning-thread-row";
import { learningAgentFilters, learningThreads } from "@/lib/mock/learning";

// Transcribed from docs/reference/pages/learning.html: a centered column
// with the title, an "Agent:" pill filter card, and one card per thread.
// Phase 2: the filter card is the brand card (22px, the resting card shadow;
// the page keeps its own 16px padding), its label sits on the third text
// tier, and the agent pills are the brand chip button (tint at rest, ink
// when pressed via aria-pressed) (docs/brand/design.md §4.1, §5, §6). The
// card's rounded clip is lifted (`overflow-visible`): nothing in it can
// overflow, and Chrome rasterizes the 11px glyph in the "No Agent" chip
// differently under a rounded `overflow-hidden`, which moved antialiasing
// pixels in the /learning capture.
export function LearningPage() {
  const [agentFilter, setAgentFilter] = useState(learningAgentFilters[0].id);

  const threads = learningThreads.filter((thread) =>
    agentFilter === "all" ? true : agentFilter === "none" ? thread.agentId === null : thread.agentId === agentFilter,
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl space-y-6 p-6">
          <PageHeading title={<span className="flex items-center gap-3">Learning</span>} />
          <Card size="none" className="space-y-3 overflow-visible p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-foreground-low">Agent:</span>
              {learningAgentFilters.map((filter) => {
                const active = filter.id === agentFilter;
                return (
                  <Button
                    key={filter.id}
                    variant="chip"
                    size="sm"
                    className="h-7 text-xs"
                    aria-pressed={active}
                    onClick={() => setAgentFilter(filter.id)}
                  >
                    {filter.id === "none" ? (
                      <span
                        className="mr-1 flex shrink-0 items-center justify-center rounded-full"
                        style={{ width: 16, height: 16 }}
                      >
                        <IconRobotFace aria-hidden="true" style={{ width: 11, height: 11 }} />
                      </span>
                    ) : null}
                    {filter.label}
                  </Button>
                );
              })}
            </div>
          </Card>
          <div className="space-y-2">
            {threads.map((thread) => (
              <LearningThreadRow key={thread.id} thread={thread} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
