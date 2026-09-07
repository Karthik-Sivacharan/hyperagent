"use client";

import { useState } from "react";
import { IconArchive, IconArrowsUpDown, IconChevronDown, IconFilter2, IconLayoutGrid, IconList } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SearchInput } from "@/components/patterns/search-input";
import { skillFilters, skillSortOptions, skillTabs, userSkills, type SkillTab } from "@/lib/mock/skills";

// The "Your skills / Team skills / Shared with you" tabs, the search + sort +
// filters + view toolbar, and the tab panels (docs/reference/pages/
// skills.html). The account owns no skills, so each panel is the empty state.
// Phase 2 keeps the toolbar's 36px row and swaps every control for its brand
// primitive: pill tabs on a tint track, the shared pill search field (icon
// on the third tier, as the site had it), the sort as the outline select
// (below `lg` only; docs/reference/overlays/skills-sort-select.html holds
// its open state), the filter button as a hairline outline pill, the view
// switcher as a joined pill toggle group, the empty state on the second text
// tier, and each skill as the 22px brand card (docs/brand/design.md §4.1, §5).

type View = "grid" | "list";
type SortOption = (typeof skillSortOptions)[number];

export function SkillsLibrary() {
  const [tab, setTab] = useState<SkillTab>("personal");
  const [view, setView] = useState<View>("list");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("Most recent");

  return (
    <Tabs value={tab} onValueChange={(value) => setTab(value as SkillTab)} className="min-h-0 space-y-4">
      <TabsList>
        {skillTabs.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <SearchInput
            iconClassName="text-foreground-low"
            placeholder="Search skills..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 sm:justify-end sm:gap-3">
          <div className="min-w-0 flex-1 lg:hidden">
            <Select value={sort} onValueChange={(value) => setSort(value as SortOption)}>
              <SelectTrigger
                variant="outline"
                aria-label="Sort"
                className="h-9 w-full min-w-0 justify-between gap-2 sm:w-[160px]"
              >
                <IconArrowsUpDown className="size-4 text-foreground-low" aria-hidden="true" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {skillSortOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 gap-2" aria-label="Filters">
                <IconFilter2 className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Filters</span>
                <IconChevronDown className="size-4 text-foreground-low" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filters</DropdownMenuLabel>
              {skillFilters.map((filter) => (
                <DropdownMenuItem key={filter.id} className="gap-2">
                  <IconArchive className="size-4" aria-hidden="true" />
                  <span className="flex-1">{filter.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <ToggleGroup
            type="single"
            spacing={0}
            value={view}
            onValueChange={(value) => value && setView(value as View)}
            aria-label="View"
            className="h-9 data-[spacing=0]:p-1"
          >
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <IconLayoutGrid className="size-4" aria-hidden="true" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <IconList className="size-4" aria-hidden="true" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {skillTabs.map((item) => {
        const needle = query.trim().toLowerCase();
        const skills = userSkills[item.value].filter(
          (skill) => !needle || skill.name.toLowerCase().includes(needle),
        );
        return (
          <TabsContent key={item.value} value={item.value} className="min-h-0">
            <div aria-busy="false" className="transition-opacity duration-(--duration-normal) ease-out">
              {skills.length === 0 ? (
                <div className="px-4 py-8 text-center text-base text-muted-foreground">No skills found</div>
              ) : (
                <ul className={cn(view === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-2")}>
                  {skills.map((skill) => (
                    <Card key={skill.id} asChild size="none" className="p-5">
                      <li>
                        <div className="font-heading font-medium text-base leading-snug text-foreground">{skill.name}</div>
                        <p className="line-clamp-2 text-muted-foreground text-sm">{skill.description}</p>
                      </li>
                    </Card>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
