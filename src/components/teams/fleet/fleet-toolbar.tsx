"use client";

import { LayoutGroup, motion } from "motion/react";
import { IconLayoutKanban, IconList, IconSitemap, IconX, type TablerIcon } from "@tabler/icons-react";
import { InputGroupAddon, InputGroupButton } from "@/components/ui/input-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SearchInput } from "@/components/patterns/search-input";
import { LAYOUT_TRANSITION } from "@/lib/motion";
import { useFleet } from "@/components/teams/fleet/fleet-context";

// The toolbar over the views: the view switcher on the left, search on the
// right. The switcher is the shared pill `ToggleGroup` (the same single-select
// group as the threads layout switch) with its on-state fill handed to one
// shared indicator that slides between the items on a motion `layoutId`, at
// the brand's layout move (220ms, ease-out-layout); under reduced motion
// MotionConfig (teams-page.tsx) drops the slide and the pill just moves.
// Labels collapse to icons below `sm` and stay in the accessibility tree.
// Search filters runs by title, id, project and agent (fleet-context.tsx);
// while a query is set a live count says how much of the team it kept, and
// Escape or the clear button empties it (the button hands focus back to the
// field, since it leaves with the query).

export type FleetView = "board" | "list" | "org";

export const FLEET_VIEWS: { key: FleetView; label: string; icon: TablerIcon }[] = [
  { key: "board", label: "Board", icon: IconLayoutKanban },
  { key: "list", label: "List", icon: IconList },
  { key: "org", label: "Org chart", icon: IconSitemap },
];

// The group paints nothing for the checked item; the indicator does.
const ITEM =
  "relative h-7 gap-1.5 px-3 aria-checked:bg-transparent aria-checked:text-foreground data-[state=on]:bg-transparent";

const SEARCH_ID = "fleet-search";

/** Puts the keyboard back in the search field (after a clear control that leaves with the query). */
export function focusFleetSearch() {
  document.getElementById(SEARCH_ID)?.focus();
}

export function FleetToolbar({
  view,
  onViewChange,
}: {
  /** null in the prerendered shell: nothing is pressed until the URL is read. */
  view: FleetView | null;
  onViewChange?: (view: FleetView) => void;
}) {
  const { query, setQuery, runs, allRuns } = useFleet();

  return (
    <div className="flex shrink-0 items-center justify-between gap-3 px-6 pt-3 pb-3">
      <LayoutGroup id="fleet-view-switcher">
        <ToggleGroup
          type="single"
          spacing={1}
          value={view ?? ""}
          onValueChange={(next) => {
            if (next) onViewChange?.(next as FleetView);
          }}
          aria-label="View"
          className="h-9 shrink-0 bg-tint-10 p-1"
        >
          {FLEET_VIEWS.map(({ key, label, icon: Icon }) => (
            <ToggleGroupItem key={key} value={key} className={ITEM}>
              {view === key ? (
                <motion.span
                  layoutId="fleet-view-indicator"
                  transition={LAYOUT_TRANSITION}
                  className="absolute inset-0 rounded-full bg-background shadow-xs"
                />
              ) : null}
              <span className="relative flex items-center gap-1.5">
                <Icon className="size-4" aria-hidden="true" />
                <span className="max-sm:sr-only">{label}</span>
              </span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </LayoutGroup>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
        <p aria-live="polite" className="text-md whitespace-nowrap text-foreground-low tabular-nums max-md:sr-only">
          {query ? `${runs.length} of ${allRuns.length} runs` : ""}
        </p>
        <SearchInput
          id={SEARCH_ID}
          className="w-full max-w-72"
          placeholder="Search runs, agents, projects"
          aria-label="Search runs"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape" && query) {
              event.preventDefault();
              setQuery("");
            }
          }}
        >
          {query ? (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  focusFleetSearch();
                }}
              >
                <IconX aria-hidden="true" />
              </InputGroupButton>
            </InputGroupAddon>
          ) : null}
        </SearchInput>
      </div>
    </div>
  );
}
