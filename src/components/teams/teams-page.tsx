import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/resources/page-heading";

// Transcribed from docs/reference/pages/teams.html: bordered header with
// join/create actions, then the dashed "no teams" card centered in the body.
// Phase 2: hairline header rule, "Join a team" the outline pill and "Create
// team" the ink button, and the dashed card at the 22px card radius with a
// loud tint edge; its icon and copy follow the three text tiers
// (docs/brand/design.md §4.1, §5).
export function TeamsPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex h-full flex-col">
        <header className="border-b border-border-subtle px-6 py-4">
          <PageHeading
            title="Teams"
            subtitle="Shared spaces for your agents and skills."
            actions={
              <>
                <Button variant="outline">Join a team</Button>
                <Button>
                  <Plus className="mr-1.5 size-4" aria-hidden="true" />
                  Create team
                </Button>
              </>
            }
          />
        </header>
        <div className="flex-1 overflow-auto p-6">
          <div className="flex h-full items-center justify-center">
            <div className="max-w-md rounded-3xl border border-dashed border-border-loud p-8 text-center">
              <Users className="mx-auto mb-3 size-10 text-muted-foreground" aria-hidden="true" />
              <p className="font-heading text-base font-medium text-foreground">You&apos;re not on any teams yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a new team or join one with an invite code to share agents and skills.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
