"use client";

import { IconLayoutKanban, IconList, IconX, type TablerIcon } from "@tabler/icons-react";
import { InputGroupAddon, InputGroupButton } from "@/components/ui/input-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SearchInput } from "@/components/patterns/search-input";
import { useRoomTracker, type TrackerView } from "@/components/rooms/tracker/tracker-context";

// The toolbar over the room's board, laid out the way every other toolbar in
// the app is: search on the left, the view switch on the right. The switch is
// the /threads and /teams switch as it stands, an icon-only joined pill with
// each label in a tooltip and in the item's accessible name, so a reader who
// has used either page already knows this one.
//
// It sits on `px-3`, the room header's gutter, so the search field starts on
// the same left edge as the `#` and the tabs above it.
//
// Search filters tasks by title, caption and whoever is on them. While a query
// is set a live count says how much of the room it kept, which is the one thing
// the lanes cannot say for themselves once they are all partly empty. Escape or
// the clear button empties the field, and the button hands focus back to it,
// since it leaves with the query.

const VIEWS: { key: TrackerView; label: string; icon: TablerIcon }[] = [
  { key: "board", label: "Board", icon: IconLayoutKanban },
  { key: "list", label: "List", icon: IconList },
];

/** Copied from the /threads layout switch: the tooltip trigger overwrites radix's
    data-state, so the on-state is styled from the group's aria-checked. */
const VIEW_ITEM = "size-7 px-0 aria-checked:bg-background aria-checked:text-foreground aria-checked:shadow-xs";

const SEARCH_ID = "room-tracker-search";

export function TrackerToolbar() {
  const { query, setQuery, tasks, allTasks, view, setView } = useRoomTracker();

  return (
    <div className="flex shrink-0 items-center justify-between gap-3 px-3 py-3">
      <SearchInput
        id={SEARCH_ID}
        className="min-w-0 flex-1 sm:max-w-[260px]"
        placeholder="Search tasks"
        aria-label="Search tasks"
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
                document.getElementById(SEARCH_ID)?.focus();
              }}
            >
              <IconX aria-hidden="true" />
            </InputGroupButton>
          </InputGroupAddon>
        ) : null}
      </SearchInput>

      <div className="flex shrink-0 items-center gap-3">
        <p aria-live="polite" className="text-md whitespace-nowrap text-foreground-low tabular-nums max-sm:sr-only">
          {query ? `${tasks.length} of ${allTasks.length} tasks` : ""}
        </p>
        <ToggleGroup
          type="single"
          spacing={0}
          value={view}
          onValueChange={(next) => {
            if (next) setView(next as TrackerView);
          }}
          aria-label="View"
          className="shrink-0"
        >
          {VIEWS.map(({ key, label, icon: Icon }) => (
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
