"use client";

import { useState } from "react";
import { IconBrain, IconChevronDown, IconDots, IconFilter2, IconLayoutGrid, IconList, IconMenu2, IconPlus } from "@tabler/icons-react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/resources/empty-state";
import { PageHeading } from "@/components/resources/page-heading";
import { SearchInput } from "@/components/resources/search-input";
import { memoryFilters, memoryOwners } from "@/lib/mock/memories";

// Transcribed from docs/reference/pages/memories.html. The two-pane body is
// container-query driven (`@container/memories`): the owner column and the
// wide toolbar show from 3xl up, the narrow search row below that. Phase 2:
// the view toggle is the brand pill tab track, the owner rows are tint chips
// (hairline at rest, a stronger tint when selected), the select-all box is an
// ink checkbox with the `input` tint outline, the count sits on the third
// text tier, and every divider is a hairline (docs/brand/design.md §4.1, §5).
const CHECKBOX =
  "peer size-4 shrink-0 cursor-pointer rounded-sm border border-input outline-none transition-[color,background-color,border-color,box-shadow] duration-(--duration-fast) ease-out-quart hover:border-border-loud focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=indeterminate]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:text-primary-foreground";

function FiltersMenu({
  active,
  onToggle,
  children,
}: {
  active: string[];
  onToggle: (id: string, checked: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Filter memories</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {memoryFilters.map((filter) => (
          <DropdownMenuCheckboxItem
            key={filter.id}
            checked={active.includes(filter.id)}
            onCheckedChange={(checked) => onToggle(filter.id, checked === true)}
          >
            {filter.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function MemoriesPage() {
  const [view, setView] = useState("list");
  const [ownerId, setOwnerId] = useState(memoryOwners[0].id);
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const owner = memoryOwners.find((o) => o.id === ownerId) ?? memoryOwners[0];
  const toggleFilter = (id: string, checked: boolean) =>
    setActiveFilters((current) => (checked ? [...current, id] : current.filter((f) => f !== id)));

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex h-full flex-col">
        <header className="border-b border-border-subtle px-6 py-4">
          <PageHeading
            title="Memories"
            subtitle="Browse saved context and memories owned by your agents."
            actions={
              <>
                <div className="flex items-center gap-2">
                  <Tabs value={view} onValueChange={setView} className="min-h-0">
                    <TabsList>
                      <TabsTrigger value="list" aria-label="List view" className="px-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex items-center justify-center">
                              <IconList className="size-4" aria-hidden="true" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>List view</TooltipContent>
                        </Tooltip>
                      </TabsTrigger>
                      <TabsTrigger value="grid" aria-label="Grid view" className="px-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex items-center justify-center">
                              <IconLayoutGrid className="size-4" aria-hidden="true" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>Grid view</TooltipContent>
                        </Tooltip>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <span className="inline-flex">
                    <Button size="sm">
                      <IconPlus className="size-4" aria-hidden="true" />
                      Add memory
                    </Button>
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="More actions">
                        <IconDots className="size-4" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem>Import memories</DropdownMenuItem>
                      <DropdownMenuItem>Export memories</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            }
          />
        </header>
        <div className="flex min-h-0 flex-1 flex-col">
          <section className="flex flex-col min-h-0 flex-1 gap-0">
            <div className="@container/memories flex min-h-0 flex-1">
              <aside className="@3xl/memories:flex hidden w-80 shrink-0 flex-col overflow-y-auto border-r border-border-subtle p-3">
                <div className="flex w-full flex-col gap-2">
                  {memoryOwners.map((item) => {
                    const selected = item.id === ownerId;
                    return (
                      <div key={item.id}>
                        <button
                          type="button"
                          aria-current={selected || undefined}
                          aria-label={`${item.name}, ${item.count} memories`}
                          onClick={() => setOwnerId(item.id)}
                          className={cn(
                            "flex w-full cursor-pointer items-center gap-2 rounded-full p-2.5 text-left outline-none transition-[color,background-color,box-shadow] duration-(--duration-fast) ease-out-quart focus-visible:ring-2 focus-visible:ring-ring/50",
                            selected ? "bg-tint-15 text-foreground" : "shadow-edge hover:bg-tint-10",
                          )}
                        >
                          <div className="flex size-5 shrink-0 items-center justify-center">
                            <IconBrain className="size-4 shrink-0 text-foreground" aria-hidden="true" />
                          </div>
                          <span className="min-w-0 flex-1 truncate font-medium text-sm">{item.name}</span>
                          <span className="shrink-0 text-muted-foreground text-xs tabular-nums">{item.count}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </aside>
              <div className="@container/memory-list flex min-w-0 flex-1 flex-col">
                <div className="flex min-h-[52px] shrink-0 items-center border-b border-border-subtle px-4">
                  <div className="flex w-full min-w-0 items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mr-3 @3xl/memories:hidden h-9 min-w-0 max-w-48 justify-start gap-2 px-2"
                      aria-haspopup="dialog"
                    >
                      <IconMenu2 className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span className="truncate font-medium">{owner.name} memories</span>
                    </Button>
                    <div className="@3xl/memories:flex hidden min-w-0 items-center gap-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center">
                            <CheckboxPrimitive.Root
                              disabled={owner.count === 0}
                              aria-label="Select all memories"
                              data-slot="checkbox"
                              className={CHECKBOX}
                            />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>No memories to select</TooltipContent>
                      </Tooltip>
                      <span className="whitespace-nowrap text-sm text-foreground-low tabular-nums">
                        {owner.count} memories
                      </span>
                    </div>
                    <div className="hidden min-w-0 items-center gap-2 ml-auto @3xl/memories:@xl/memory-list:flex">
                      <FiltersMenu active={activeFilters} onToggle={toggleFilter}>
                        <Button variant="outline" size="sm" className="h-9">
                          <IconFilter2 className="size-3.5" aria-hidden="true" />
                          Filters
                          <IconChevronDown className="size-3.5 opacity-60" aria-hidden="true" />
                        </Button>
                      </FiltersMenu>
                      <SearchInput
                        className="w-64 min-w-40"
                        placeholder="Search memories"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3 border-b border-border-subtle px-4 py-2 @3xl/memories:@xl/memory-list:hidden">
                  <SearchInput
                    className="min-w-0 flex-1"
                    inputClassName="pr-14"
                    placeholder="Search memories"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  >
                    <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-0.5">
                      <FiltersMenu active={activeFilters} onToggle={toggleFilter}>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label="Filters"
                          className="h-7 gap-1 px-1.5 text-muted-foreground hover:text-foreground"
                        >
                          <IconFilter2 className="size-4" aria-hidden="true" />
                        </Button>
                      </FiltersMenu>
                    </div>
                  </SearchInput>
                </div>
                <div className="min-h-0 flex-1 overflow-auto">
                  <div className="relative flex min-w-0 flex-1 flex-col">
                    <div className="flex flex-col p-6">
                      <EmptyState
                        variant="plain"
                        icon={IconBrain}
                        title="No memories yet"
                        description="Add important context you want your agents to remember."
                        action={
                          <Button size="sm">
                            <IconPlus className="size-4" aria-hidden="true" />
                            Add memory
                          </Button>
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
