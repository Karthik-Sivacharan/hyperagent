import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AssetSlot } from "./asset-slot";
import { A11Y, TEAM } from "./content";
import { LandingSection } from "./section";

// The fleet shown as staff: department tabs over three jobs an operator
// repeats, a quote from a published story (a placeholder until one is
// chosen), and the roster beside them (a placeholder in v1).
//
// Every panel stays mounted and they all share one grid cell, so the column
// keeps the height of its tallest list and the quote under it never moves
// when a tab changes. An inactive panel is `invisible`: it takes no clicks,
// no focus and no place in the accessibility tree.
export function TeamSection() {
  const { section, departments, quote, roster } = TEAM;
  return (
    <LandingSection copy={section}>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
        <div className="flex flex-col gap-10">
          <Tabs defaultValue={departments[0].value} className="gap-6">
            <TabsList aria-label={A11Y.departments}>
              {departments.map((department) => (
                <TabsTrigger key={department.value} value={department.value}>
                  {department.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="grid">
              {departments.map((department) => (
                <TabsContent
                  key={department.value}
                  value={department.value}
                  forceMount
                  className="col-start-1 row-start-1 data-[state=inactive]:invisible"
                >
                  <ul className="flex flex-col divide-y divide-border-subtle border-y border-border-subtle">
                    {department.jobs.map((job) => (
                      <li key={job} className="py-3 text-base text-foreground">
                        {job}
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              ))}
            </div>
          </Tabs>
          <AssetSlot asset={quote} variant="lines" />
        </div>
        <AssetSlot asset={roster} className="aspect-4/3" />
      </div>
    </LandingSection>
  );
}
