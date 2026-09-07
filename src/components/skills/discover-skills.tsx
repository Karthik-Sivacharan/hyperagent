"use client";

import { useState } from "react";
import Link from "next/link";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import { discoverSkills } from "@/lib/mock/skills";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SkillListingCard } from "@/components/marketplace/skill-listing-card";

// "Discover and install new skills" (docs/reference/pages/skills.html): a
// collapsible section whose heading is the trigger, a "See more" link to the
// marketplace, and a four-up row of the marketplace's featured skills (a
// snap-scrolling strip below xl, a 4-column grid at xl and up). Phase 2: the
// heading in the heading face at the section step of the brand scale (the
// same step as the marketplace's section titles), the chevron on the third
// tier and "See more" as the link button (docs/brand/design.md §4, §4.1).

export function DiscoverSkills() {
  const [open, setOpen] = useState(true);
  const Chevron = open ? IconChevronDown : IconChevronRight;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-start justify-between gap-2 mb-0 min-w-0">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 font-heading text-xl text-foreground">
              <CollapsibleTrigger className="flex min-w-0 cursor-pointer items-center gap-2 rounded-full py-0.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                <span className="min-w-0 truncate">Discover and install new skills</span>
                <span className="shrink-0 text-foreground-low">
                  <Chevron className="size-4" aria-hidden="true" />
                </span>
              </CollapsibleTrigger>
            </h2>
          </div>
        </div>
        <Button variant="link" size="sm" className="h-auto shrink-0 px-0" asChild>
          <Link href="/marketplace">See more</Link>
        </Button>
      </div>
      <CollapsibleContent className="space-y-4 pt-2">
        <div className="flex min-h-0 flex-col gap-4">
          <div className="min-h-0 flex-1 outline-none mt-0">
            <div className="scrollbar-hide -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 py-2 xl:mx-0 xl:grid xl:grid-cols-4 xl:overflow-visible xl:px-0 xl:py-0">
              {discoverSkills.map((skill) => (
                <div
                  key={skill.id}
                  className="w-[320px] shrink-0 snap-start xl:w-auto xl:min-w-0 xl:shrink xl:snap-none"
                >
                  <SkillListingCard skill={skill} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
