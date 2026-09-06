import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiscoverSkills } from "@/components/skills/discover-skills";
import { SkillsLibrary } from "@/components/skills/skills-library";

// Everything inside <main> on hyperagent.com/skills, transcribed from
// docs/reference/pages/skills.html: the page header with "Create skill",
// then the scrolling body with the discover row and the skills library.

export function SkillsPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex h-full flex-col">
        <header className="border-border/50 border-b px-6 py-4">
          <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <h1 className="font-display font-semibold tracking-[-0.01em] text-2xl text-foreground">Skills</h1>
              <p className="text-muted-foreground text-sm">
                Building blocks that add specific capabilities to your agents and threads.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Button type="button" className="gap-1">
                <Plus className="size-4" aria-hidden="true" />
                Create skill
              </Button>
            </div>
          </div>
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
