"use client";

import { useState } from "react";
import { IconBook, IconLayoutGrid, IconList } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/resources/empty-state";
import { PageHeading } from "@/components/resources/page-heading";
import { SearchInput } from "@/components/resources/search-input";
import { ShowArchivedSwitch } from "@/components/resources/show-archived-switch";
import { LibrarySelect } from "@/components/library/library-select";
import {
  librarySortOptions,
  librarySourceOptions,
  libraryTypeOptions,
  libraryVisibilityOptions,
} from "@/lib/mock/library";

// Transcribed from docs/reference/pages/library.html: header with the
// archived switch and grid/list toggle, a search + filters toolbar, and the
// empty state (the live account has no generated content yet). Phase 2:
// hairline rule under the header, the grid/list pair as ghost icon pills
// with an active tint fill, the shared pill search field (the site's
// separate muted treatment converges on it) and tint pill selects.
export function LibraryPage() {
  const [showArchived, setShowArchived] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(librarySortOptions[0].value);
  const [type, setType] = useState(libraryTypeOptions[0].value);
  const [visibility, setVisibility] = useState(libraryVisibilityOptions[0].value);
  const [source, setSource] = useState(librarySourceOptions[0].value);

  const viewButton = (mode: "grid" | "list") =>
    cn(
      "text-muted-foreground hover:text-foreground",
      view === mode && "bg-tint-15 text-foreground hover:bg-tint-20",
    );

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex h-full flex-col">
        <div className="space-y-3 border-b border-border-subtle p-4">
          <PageHeading
            title="Library"
            actions={
              <>
                <ShowArchivedSwitch checked={showArchived} onCheckedChange={setShowArchived} />
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Grid view"
                        aria-pressed={view === "grid"}
                        className={viewButton("grid")}
                        onClick={() => setView("grid")}
                      >
                        <IconLayoutGrid className="size-4" aria-hidden="true" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Grid view</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="List view"
                        aria-pressed={view === "list"}
                        className={viewButton("list")}
                        onClick={() => setView("list")}
                      >
                        <IconList className="size-4" aria-hidden="true" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>List view</TooltipContent>
                  </Tooltip>
                </div>
              </>
            }
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <SearchInput
              className="w-full sm:max-w-md sm:flex-1"
              placeholder="Search library…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="flex items-center gap-2 overflow-x-auto sm:gap-4">
              <LibrarySelect ariaLabel="Sort" value={sort} onValueChange={setSort} options={librarySortOptions} />
              <LibrarySelect
                ariaLabel="Type"
                value={type}
                onValueChange={setType}
                options={libraryTypeOptions}
                className="gap-1.5"
              />
              <LibrarySelect
                ariaLabel="Visibility"
                value={visibility}
                onValueChange={setVisibility}
                options={libraryVisibilityOptions}
              />
              <LibrarySelect
                ariaLabel="Source"
                value={source}
                onValueChange={setSource}
                options={librarySourceOptions}
                className="max-w-[200px] gap-1.5"
              />
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <EmptyState
            variant="plain"
            icon={IconBook}
            title="No items found"
            description="Generated content will appear here"
          />
        </div>
      </div>
    </div>
  );
}
