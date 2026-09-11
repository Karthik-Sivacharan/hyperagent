"use client";

import { IconBuilding, IconLayoutKanban, IconList, IconSitemap, IconX, type TablerIcon } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { InputGroupAddon, InputGroupButton } from "@/components/ui/input-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SearchInput } from "@/components/patterns/search-input";
import { useFleet } from "@/components/teams/fleet/fleet-context";

// The toolbar over the views, laid out as every resource page's is
// (/threads, /agents): search on the left, the view switch on the right
// (docs/plans/2026-09-11-teams-fleet-polish.md §4.1).
//
// The switch is the /threads layout switch as it stands: the joined pill
// `ToggleGroup`, icon-only items, each label in a tooltip and in the item's
// accessible name. The pressed item simply takes the raised fill, with no
// sliding indicator.
//
// Search filters runs by title, id, project and agent (fleet-context.tsx).
// While a query is set, a live count before the switch says how much of the
// team it kept; the org chart counts agents itself, so there the runs count
// stays in the live region and leaves the screen. Escape or the clear button
// empties the query (the button hands focus back to the field, since it
// leaves with the query).

export type FleetView = "board" | "list" | "org" | "space";

export const FLEET_VIEWS: { key: FleetView; label: string; icon: TablerIcon }[] = [
  { key: "board", label: "Board", icon: IconLayoutKanban },
  { key: "list", label: "List", icon: IconList },
  { key: "org", label: "Org chart", icon: IconSitemap },
  { key: "space", label: "Office", icon: IconBuilding },
];

// Copied from the /threads layout switch (threads-page.tsx). The tooltip
// trigger overwrites radix's data-state on the toggle item, so the "on" look
// is styled from the aria-checked the single-select group sets.
const VIEW_ITEM = "size-7 px-0 aria-checked:bg-background aria-checked:text-foreground aria-checked:shadow-xs";

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
    <div className="flex shrink-0 items-center justify-between gap-3 px-6 py-4">
      <SearchInput
        id={SEARCH_ID}
        className="min-w-0 flex-1 sm:max-w-[306px]"
        placeholder="Search runs and agents"
        aria-label="Search runs and agents"
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

      <div className="flex shrink-0 items-center gap-3">
        <p
          aria-live="polite"
          className={cn(
            "text-md whitespace-nowrap text-foreground-low tabular-nums max-sm:sr-only",
            (view === "org" || view === "space") && "sr-only",
          )}
        >
          {query ? `${runs.length} of ${allRuns.length} runs` : ""}
        </p>
        <ToggleGroup
          type="single"
          spacing={0}
          value={view ?? ""}
          onValueChange={(next) => {
            if (next) onViewChange?.(next as FleetView);
          }}
          aria-label="View"
          className="shrink-0"
        >
          {FLEET_VIEWS.map(({ key, label, icon: Icon }) => (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <ToggleGroupItem value={key} aria-label={label} className={VIEW_ITEM}>
                  <Icon className="size-4" aria-hidden="true" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}
