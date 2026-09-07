"use client";

import { useState } from "react";
import {
  IconArchive,
  IconArrowsUpDown,
  IconChevronDown,
  IconFilter2,
  IconLayoutGrid,
  IconList,
  IconSearch,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SiteInput } from "@/components/marketplace/site-input";
import { skillFilters, skillSortOptions, skillTabs, userSkills, type SkillTab } from "@/lib/mock/skills";

// The "Your skills / Team skills / Shared with you" tabs, the search + sort +
// filters + view toolbar, and the tab panels (docs/reference/pages/
// skills.html). The account owns no skills, so each panel is the empty state.
// Phase 2 keeps the toolbar's 36px row and swaps every control for its brand
// primitive: pill tabs on a tint track, the pill input group, the sort and
// filter buttons as hairline outline pills, the view switcher as a joined
// pill toggle group, the empty state on the second text tier
// (docs/brand/design.md §4.1, §5).

type View = "grid" | "list";

export function SkillsLibrary() {
  const [tab, setTab] = useState<SkillTab>("personal");
  const [view, setView] = useState<View>("list");
  const [query, setQuery] = useState("");
  const [sort] = useState<(typeof skillSortOptions)[number]>("Most recent");

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
          <SiteInput
            icon={<IconSearch aria-hidden="true" />}
            placeholder="Search skills..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 sm:justify-end sm:gap-3">
          <div className="min-w-0 flex-1 lg:hidden">
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={false}
              aria-controls="skills-sort"
              className="h-9 w-full min-w-0 justify-between gap-2 sm:w-[160px]"
            >
              <IconArrowsUpDown className="size-4 text-foreground-low" aria-hidden="true" />
              <span data-slot="select-value" className="flex-1 truncate text-left" style={{ pointerEvents: "none" }}>
                {sort}
              </span>
              <IconChevronDown className="size-4 text-foreground-low" aria-hidden="true" />
            </Button>
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
                    <li key={skill.id} className="rounded-3xl bg-card p-5 shadow-card">
                      <div className="font-heading font-medium text-base leading-snug text-foreground">{skill.name}</div>
                      <p className="line-clamp-2 text-muted-foreground text-sm">{skill.description}</p>
                    </li>
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
