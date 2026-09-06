"use client";

import { useState } from "react";
import { Brain, ChevronDown, Ellipsis, LayoutGrid, List, ListFilter, Menu, Plus } from "lucide-react";
import { Checkbox as CheckboxPrimitive, Tabs as TabsPrimitive } from "radix-ui";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/resources/empty-state";
import { PageHeading } from "@/components/resources/page-heading";
import { SearchInput } from "@/components/resources/search-input";
import { memoryFilters, memoryOwners } from "@/lib/mock/memories";

// Transcribed from docs/reference/pages/memories.html. The site's tabs and
// checkbox carry an older shadcn class set than ui/tabs.tsx, so the radix
// primitives are styled inline with the dump's strings. The two-pane body is
// container-query driven (`@container/memories`): the owner column and the
// wide toolbar show from 3xl up, the narrow search row below that.
const TAB_TRIGGER =
  "inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-transparent px-2 py-1 font-medium text-foreground text-sm transition-[color,box-shadow] focus-visible:border-ring focus-visible:outline-1 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:shadow-sm dark:text-muted-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0";

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
        <header className="border-border/50 border-b px-6 py-4">
          <PageHeading
            title="Memories"
            subtitle="Browse saved context and memories owned by your agents."
            actions={
              <>
                <div className="flex items-center gap-2">
                  <TabsPrimitive.Root
                    value={view}
                    onValueChange={setView}
                    data-slot="tabs"
                    className="flex min-h-0 flex-col gap-2"
                  >
                    <TabsPrimitive.List
                      data-slot="tabs-list"
                      className="inline-flex h-9 w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground"
                    >
                      <TabsPrimitive.Trigger
                        value="list"
                        aria-label="List view"
                        data-slot="tabs-trigger"
                        className={TAB_TRIGGER}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex items-center justify-center">
                              <List className="size-4" aria-hidden="true" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>List view</TooltipContent>
                        </Tooltip>
                      </TabsPrimitive.Trigger>
                      <TabsPrimitive.Trigger
                        value="grid"
                        aria-label="Grid view"
                        data-slot="tabs-trigger"
                        className={TAB_TRIGGER}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex items-center justify-center">
                              <LayoutGrid className="size-4" aria-hidden="true" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>Grid view</TooltipContent>
                        </Tooltip>
                      </TabsPrimitive.Trigger>
                    </TabsPrimitive.List>
                  </TabsPrimitive.Root>
                  <span className="inline-flex">
                    <Button size="sm">
                      <Plus className="size-4" aria-hidden="true" />
                      Add memory
                    </Button>
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="More actions">
                        <Ellipsis className="size-4" aria-hidden="true" />
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
              <aside className="@3xl/memories:flex hidden w-80 shrink-0 flex-col overflow-y-auto border-border/50 border-r p-3">
                <div className="flex w-full flex-col gap-2">
                  {memoryOwners.map((item) => {
                    const selected = item.id === ownerId;
                    return (
                      <div key={item.id} className="rounded-[8px] transition-all">
                        <button
                          type="button"
                          aria-current={selected || undefined}
                          aria-label={`${item.name}, ${item.count} memories`}
                          onClick={() => setOwnerId(item.id)}
                          className={cn(
                            "flex w-full cursor-pointer items-center gap-2 rounded-[8px] border border-border p-2.5 text-left transition-colors",
                            selected ? "bg-muted" : "hover:bg-muted/50",
                          )}
                        >
                          <div className="flex size-5 shrink-0 items-center justify-center">
                            <Brain className="size-4 shrink-0 text-foreground" aria-hidden="true" />
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
                <div className="flex min-h-[52px] shrink-0 items-center border-border/50 border-b px-4">
                  <div className="flex w-full min-w-0 items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mr-3 @3xl/memories:hidden h-9 min-w-0 max-w-48 justify-start gap-2 px-2"
                      aria-haspopup="dialog"
                    >
                      <Menu className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
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
                              className="peer size-4 shrink-0 rounded-[4px] border border-muted-foreground/30 shadow-xs outline-none transition-shadow focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=indeterminate]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:text-primary-foreground dark:bg-input/30 dark:data-[state=checked]:bg-primary dark:aria-invalid:ring-destructive/40 cursor-pointer"
                            />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>No memories to select</TooltipContent>
                      </Tooltip>
                      <span className="whitespace-nowrap text-muted-foreground text-sm">
                        {owner.count} memories
                      </span>
                    </div>
                    <div className="hidden min-w-0 items-center gap-2 ml-auto @3xl/memories:@xl/memory-list:flex">
                      <FiltersMenu active={activeFilters} onToggle={toggleFilter}>
                        <Button variant="outline" size="sm" className="h-9">
                          <ListFilter className="size-3.5" aria-hidden="true" />
                          Filters
                          <ChevronDown className="size-3.5 opacity-60" aria-hidden="true" />
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
                <div className="flex shrink-0 items-center gap-3 border-border/50 border-b px-4 py-2 @3xl/memories:@xl/memory-list:hidden">
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
                          <ListFilter className="size-4" aria-hidden="true" />
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
                        icon={Brain}
                        title="No memories yet"
                        description="Add important context you want your agents to remember."
                        action={
                          <Button size="sm">
                            <Plus className="size-4" aria-hidden="true" />
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
