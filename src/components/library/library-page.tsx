"use client";

import { useState } from "react";
import { BookOpen, Grid3x3, List, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/resources/empty-state";
import { PageHeading } from "@/components/resources/page-heading";
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
// empty state (the live account has no generated content yet).
export function LibraryPage() {
  const [showArchived, setShowArchived] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(librarySortOptions[0].value);
  const [type, setType] = useState(libraryTypeOptions[0].value);
  const [visibility, setVisibility] = useState(libraryVisibilityOptions[0].value);
  const [source, setSource] = useState(librarySourceOptions[0].value);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex h-full flex-col">
        <div className="space-y-3 border-b p-4">
          <PageHeading
            title="Library"
            actions={
              <>
                <ShowArchivedSwitch checked={showArchived} onCheckedChange={setShowArchived} />
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={view === "grid" ? "secondary" : "ghost"}
                        size="icon"
                        aria-label="Grid view"
                        aria-pressed={view === "grid"}
                        onClick={() => setView("grid")}
                      >
                        <Grid3x3 className="size-4" aria-hidden="true" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Grid view</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={view === "list" ? "secondary" : "ghost"}
                        size="icon"
                        aria-label="List view"
                        aria-pressed={view === "list"}
                        onClick={() => setView("list")}
                      >
                        <List className="size-4" aria-hidden="true" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>List view</TooltipContent>
                  </Tooltip>
                </div>
              </>
            }
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="relative w-full sm:max-w-md sm:flex-1">
              <Search
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                data-slot="input"
                translate="no"
                className="notranslate h-9 w-full min-w-0 border border-input px-3 py-1 font-body text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm rounded-md bg-muted dark:bg-input/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 pl-9"
                placeholder="Search library…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
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
            icon={BookOpen}
            title="No items found"
            description="Generated content will appear here"
          />
        </div>
      </div>
    </div>
  );
}
