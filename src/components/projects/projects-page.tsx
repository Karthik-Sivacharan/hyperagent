"use client";

import { useState } from "react";
import Link from "next/link";
import { IconFolderOpen, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/resources/empty-state";
import { PageHeading } from "@/components/resources/page-heading";
import { ShowArchivedSwitch } from "@/components/resources/show-archived-switch";

// Transcribed from docs/reference/pages/projects.html. No projects exist on
// the live account; the archived switch only flips local state. Phase 2:
// hairline header rule, the brand switch and the ink button; the empty
// state comes from the shared piece.
export function ProjectsPage() {
  const [showArchived, setShowArchived] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex h-full flex-col">
        <header className="border-b border-border-subtle px-6 py-4">
          <PageHeading
            title="Projects"
            actions={
              <>
                <ShowArchivedSwitch checked={showArchived} onCheckedChange={setShowArchived} />
                <Button asChild className="gap-2">
                  <Link href="/projects/new">
                    <IconPlus className="size-4" aria-hidden="true" />
                    New Project
                  </Link>
                </Button>
              </>
            }
          />
        </header>
        <div className="flex-1 overflow-auto p-6">
          <EmptyState
            icon={IconFolderOpen}
            title="No projects yet"
            description="Create a project to group related threads and share context. Each project has a shared document and file registry."
            action={
              <Button asChild className="gap-2">
                <Link href="/projects/new">
                  <IconPlus className="size-4" aria-hidden="true" />
                  Create your first project
                </Link>
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
}
