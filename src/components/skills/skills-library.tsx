"use client";

import { useState } from "react";
import {
  Archive,
  ArrowUpDown,
  ChevronDown,
  LayoutGrid,
  List,
  ListFilter,
  Search,
} from "lucide-react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SiteInput } from "@/components/marketplace/site-input";
import { skillFilters, skillSortOptions, skillTabs, userSkills, type SkillTab } from "@/lib/mock/skills";

// The "Your skills / Team skills / Shared with you" tabs, the search + sort +
// filters + view toolbar, and the tab panels (docs/reference/pages/
// skills.html). The account owns no skills, so each panel is the empty state.

// The site's tab trigger: shadcn's, restyled as plain text that turns
// semibold when active. Verbatim from the dump.
const TAB_TRIGGER =
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap border-transparent transition-[color,box-shadow] focus-visible:border-ring focus-visible:outline-1 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-border dark:text-muted-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 h-auto flex-none rounded-none border-0 bg-transparent px-0 py-0 font-medium text-base text-muted-foreground shadow-none data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-none";

// The sort <Select> trigger (only shown below lg). Verbatim from the dump.
const SELECT_TRIGGER =
  "flex items-center justify-between gap-2 whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[size=default]:h-9 data-[size=sm]:h-8 data-[placeholder]:text-muted-foreground *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:hover:bg-input/50 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 w-full min-w-0 sm:w-[160px]";

type View = "grid" | "list";

export function SkillsLibrary() {
  const [tab, setTab] = useState<SkillTab>("personal");
  const [view, setView] = useState<View>("list");
  const [query, setQuery] = useState("");
  const [sort] = useState<(typeof skillSortOptions)[number]>("Most recent");

  return (
    <TabsPrimitive.Root
      value={tab}
      onValueChange={(value) => setTab(value as SkillTab)}
      data-slot="tabs"
      className="flex min-h-0 flex-col gap-2 space-y-4"
    >
      <TabsPrimitive.List
        data-slot="tabs-list"
        className="inline-flex items-center text-muted-foreground scrollbar-hide h-auto w-full justify-start gap-4 overflow-x-auto rounded-none bg-transparent p-0 sm:gap-6"
      >
        {skillTabs.map((item) => (
          <TabsPrimitive.Trigger
            key={item.value}
            value={item.value}
            data-slot="tabs-trigger"
            className={TAB_TRIGGER}
          >
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <SiteInput
            className="w-full pl-8 pr-3"
            placeholder="Search skills..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 sm:justify-end sm:gap-3">
          <div className="min-w-0 flex-1 lg:hidden">
            <button
              type="button"
              role="combobox"
              aria-expanded={false}
              aria-controls="skills-sort"
              data-slot="select-trigger"
              data-size="default"
              className={SELECT_TRIGGER}
            >
              <ArrowUpDown className="size-4 text-muted-foreground" aria-hidden="true" />
              <span data-slot="select-value" style={{ pointerEvents: "none" }}>
                {sort}
              </span>
              <ChevronDown className="size-4 opacity-50" aria-hidden="true" />
            </button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 gap-2 border-input" aria-label="Filters">
                <ListFilter className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Filters</span>
                <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filters</DropdownMenuLabel>
              {skillFilters.map((filter) => (
                <DropdownMenuItem key={filter.id} className="gap-2">
                  <Archive className="size-4" aria-hidden="true" />
                  <span className="flex-1">{filter.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex h-9 rounded-md border border-input shadow-xs">
            <Button
              variant="ghost"
              size="icon"
              className={cn("size-9 h-full w-9 rounded-r-none", view === "grid" && "bg-muted")}
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              onClick={() => setView("grid")}
            >
              <LayoutGrid className="size-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "size-9 h-full w-9 rounded-l-none border-input border-l",
                view === "list" && "bg-muted",
              )}
              aria-label="List view"
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
            >
              <List className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      {skillTabs.map((item) => {
        const needle = query.trim().toLowerCase();
        const skills = userSkills[item.value].filter(
          (skill) => !needle || skill.name.toLowerCase().includes(needle),
        );
        return (
          <TabsPrimitive.Content
            key={item.value}
            value={item.value}
            data-slot="tabs-content"
            className="min-h-0 flex-1 outline-none"
          >
            <div aria-busy="false" className="transition-opacity">
              {skills.length === 0 ? (
                <div className="px-4 py-8 text-center text-muted-foreground">No skills found</div>
              ) : (
                <ul className={cn(view === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-2")}>
                  {skills.map((skill) => (
                    <li key={skill.id} className="rounded-[16px] border border-border bg-card p-5">
                      <div className="font-semibold text-base text-foreground">{skill.name}</div>
                      <p className="line-clamp-2 text-muted-foreground text-sm">{skill.description}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsPrimitive.Content>
        );
      })}
    </TabsPrimitive.Root>
  );
}
