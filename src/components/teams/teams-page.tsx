"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { IconPlus, IconUsers } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/patterns/page-heading";
import { DURATION, EASE } from "@/lib/motion";
import { FleetProvider } from "@/components/teams/fleet/fleet-context";
import { FleetHeader } from "@/components/teams/fleet/fleet-header";
import { FleetSummary } from "@/components/teams/fleet/fleet-summary";
import { FleetToolbar, type FleetView } from "@/components/teams/fleet/fleet-toolbar";
import { BoardView } from "@/components/teams/board-view";
import { ListView } from "@/components/teams/list-view";
import { OrgView } from "@/components/teams/org-view";
import { AgentSheet } from "@/components/teams/agent-sheet";

// /teams: one populated team, Growth Ops, and its fleet of agents seen three
// ways (docs/plans/2026-09-10-teams-fleet-v1.md). Top to bottom: the header
// (fleet-header.tsx), the summary line (fleet-summary.tsx), the toolbar with
// the view switcher and search (fleet-toolbar.tsx), then the view, which
// fills the rest of the height and scrolls inside itself. The agent sheet is
// rendered once, inside the provider, and opens on `openAgent`.
//
// URL STATE. `?view=board|list|org` (default board) is the view, written with
// history.replaceState, which Next folds into useSearchParams without a
// server round trip: switching views is a display choice, not a navigation,
// so it does not stack history entries, and the URL stays shareable.
// `?state=empty` keeps the page's old empty state reachable, unchanged.
// useSearchParams sits under a Suspense boundary, as Next 16 requires of a
// prerendered route (docs: use-search-params, "Prerendering"); the fallback
// is the default board, so the static HTML is the common case.
//
// MOTION. Switching views cross-fades: the outgoing view leaves in 90ms on
// opacity alone, the incoming one enters in 200ms with a 6px rise, and both
// sit absolutely inside the view area so nothing around them jumps. First
// paint does not animate. MotionConfig reducedMotion="user" drops the rise
// and every layout slide for people who ask for less motion.

function parseView(value: string | null): FleetView {
  return value === "list" || value === "org" ? value : "board";
}

export function TeamsPage() {
  return (
    <Suspense fallback={<TeamsFleet view="board" />}>
      <TeamsRoute />
    </Suspense>
  );
}

function TeamsRoute() {
  const searchParams = useSearchParams();
  if (searchParams.get("state") === "empty") return <TeamsEmptyState />;

  const view = parseView(searchParams.get("view"));
  const setView = (next: FleetView) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", next);
    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  return <TeamsFleet view={view} onViewChange={setView} />;
}

function TeamsFleet({ view, onViewChange }: { view: FleetView; onViewChange?: (view: FleetView) => void }) {
  return (
    <MotionConfig reducedMotion="user">
      <FleetProvider>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <FleetHeader />
          <FleetSummary />
          <FleetToolbar view={view} onViewChange={onViewChange} />
          <div className="relative min-h-0 flex-1">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={view}
                data-view={view}
                className="absolute inset-0 flex min-h-0 flex-col overflow-auto"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0, transition: { duration: DURATION.normal, ease: EASE.outQuart } }}
                exit={{ opacity: 0, transition: { duration: DURATION.exit, ease: EASE.out } }}
              >
                {view === "board" ? <BoardView /> : view === "list" ? <ListView /> : <OrgView />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <AgentSheet />
      </FleetProvider>
    </MotionConfig>
  );
}

// Transcribed from docs/reference/pages/teams.html: bordered header with
// join/create actions, then the dashed "no teams" card centered in the body.
// Phase 2: hairline header rule, "Join a team" the outline pill and "Create
// team" the ink button, and the dashed card at the 22px card radius with a
// loud tint edge; its icon and copy follow the three text tiers
// (docs/brand/design.md §4.1, §5). Reachable at /teams?state=empty.
function TeamsEmptyState() {
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
                  <IconPlus className="mr-1.5 size-4" aria-hidden="true" />
                  Create team
                </Button>
              </>
            }
          />
        </header>
        <div className="flex-1 overflow-auto p-6">
          <div className="flex h-full items-center justify-center">
            <div className="max-w-md rounded-3xl border border-dashed border-border-loud p-8 text-center">
              <IconUsers className="mx-auto mb-3 size-10 text-muted-foreground" aria-hidden="true" />
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
