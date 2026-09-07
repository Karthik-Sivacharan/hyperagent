import { IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/patterns/page-heading";
import { DiscoverSkills } from "@/components/skills/discover-skills";
import { SkillsLibrary } from "@/components/skills/skills-library";

// Everything inside <main> on hyperagent.com/skills, transcribed from
// docs/reference/pages/skills.html: the page header with "Create skill",
// then the scrolling body with the discover row and the skills library.
// Phase 2: the shared title row (heading face on the brand scale, the lede on
// the second text tier), a hairline under the header and "Create skill" as
// the ink pill (the default button) (docs/brand/design.md §1, §4.1, §5).

export function SkillsPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex h-full flex-col">
        <header className="border-border-subtle border-b px-6 py-4">
          <PageHeading
            title="Skills"
            subtitle="Building blocks that add specific capabilities to your agents and threads."
            actions={
              <Button type="button" className="gap-1">
                <IconPlus className="size-4" aria-hidden="true" />
                Create skill
              </Button>
            }
          />
        </header>
        <div className="flex-1 overflow-auto">
          <div className="space-y-8 px-6 py-6">
            <DiscoverSkills />
            <SkillsLibrary />
          </div>
        </div>
      </div>
    </div>
  );
}
