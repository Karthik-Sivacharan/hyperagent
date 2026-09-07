"use client";

import { useState } from "react";
import { IconRobot, IconMenuDeep, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/resources/empty-state";
import { PageHeading } from "@/components/resources/page-heading";
import { SearchInput } from "@/components/resources/search-input";

const FILTERS = [
  { id: "mine", label: "Created by me" },
  { id: "shared", label: "Shared with me" },
  { id: "archived", label: "Archived" },
];

// Transcribed from docs/reference/pages/agents.html. The "New agent" button
// and "Filters" are dropdown triggers on the site; both open local menus
// here. There are no agents on the live account. Phase 2: hairline header
// rule, "New agent" the ink button, "Filters" the outline pill, the pill
// search field and the shared empty state.
export function AgentsPage() {
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleFilter = (id: string, checked: boolean) =>
    setActiveFilters((current) => (checked ? [...current, id] : current.filter((f) => f !== id)));

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col h-full">
        <header className="flex flex-col border-b border-border-subtle px-6 pt-4">
          <PageHeading
            className="pb-4"
            title="Agents"
            actions={
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="gap-2">
                      <IconPlus className="size-4" aria-hidden="true" />
                      New agent
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>Create from scratch</DropdownMenuItem>
                    <DropdownMenuItem>Import from JSON</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <input accept=".json,application/json" className="hidden" type="file" />
              </>
            }
          />
        </header>
        <div className="flex-1 overflow-auto p-6 pb-12">
          <div className="mb-4 flex items-center justify-between gap-2">
            <SearchInput
              className="min-w-0 flex-1 sm:max-w-[306px]"
              placeholder="Search agents..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" aria-label="Filters" className="h-9 shrink-0 gap-2">
                  <IconMenuDeep className="size-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Filters</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Show</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {FILTERS.map((filter) => (
                  <DropdownMenuCheckboxItem
                    key={filter.id}
                    checked={activeFilters.includes(filter.id)}
                    onCheckedChange={(checked) => toggleFilter(filter.id, checked === true)}
                  >
                    {filter.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <EmptyState
            icon={IconRobot}
            title="No agents yet"
            description="Use the New agent button to create your first agent."
          />
        </div>
      </div>
    </div>
  );
}
