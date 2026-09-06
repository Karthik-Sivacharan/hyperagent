"use client";

import { useState } from "react";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/resources/page-heading";
import { LearningThreadRow } from "@/components/learning/learning-thread-row";
import { learningAgentFilters, learningThreads } from "@/lib/mock/learning";

// Transcribed from docs/reference/pages/learning.html: a centered column
// with the title, an "Agent:" pill filter card, and one card per thread.
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
          <div className="space-y-3 rounded-lg border bg-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-muted-foreground text-sm">Agent:</span>
              {learningAgentFilters.map((filter) => {
                const active = filter.id === agentFilter;
                return (
                  <Button
                    key={filter.id}
                    variant={active ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                    aria-pressed={active}
                    onClick={() => setAgentFilter(filter.id)}
                  >
                    {filter.id === "none" ? (
                      <span
                        className="flex shrink-0 items-center justify-center text-muted-foreground mr-1 rounded-full"
                        style={{ width: 16, height: 16 }}
                      >
                        <Bot aria-hidden="true" style={{ width: 11, height: 11 }} />
                      </span>
                    ) : null}
                    {filter.label}
                  </Button>
                );
              })}
            </div>
          </div>
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
