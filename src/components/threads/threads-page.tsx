"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  ChevronRight,
  LayoutGrid,
  List,
  ListFilter,
  MessageCircleQuestionMark,
  Plus,
  Search,
  SquareKanban,
  Star,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Thread } from "@/lib/mock/threads";
import { ThreadCard } from "@/components/threads/thread-card";

// The threads index from hyperagent.com (docs/reference/pages/threads.html):
// title + "New thread", search, filter chips, sort, a layout toggle and the
// list. Filters, sort and layout are local state; the menus carry the items
// the live site lists. Phase 2: the title is the display serif, the search
// field the pill input group, the filters outline pills (a pressed one is
// the active tint fill, no status hue), the layout switcher the pill toggle
// group, "New thread" the ink button, and the rows brand cards
// (docs/brand/design.md §1, §4, §5, §12).

type SortKey = "recent" | "oldest" | "name";
type View = "list" | "grid" | "board";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "recent", label: "Recent" },
  { key: "oldest", label: "Oldest" },
  { key: "name", label: "Name" },
];

const VIEWS: { key: View; label: string; icon: LucideIcon }[] = [
  { key: "list", label: "List view", icon: List },
  { key: "grid", label: "Grid view", icon: LayoutGrid },
  { key: "board", label: "Board view", icon: SquareKanban },
];

// The filter row keeps the site's 36px height on the brand's outline pill.
const CHIP = "h-9 gap-2 px-3 has-[>svg]:px-2.5";

// A pressed filter: the active tint fill with ink text.
const PRESSED = "bg-tint-20 text-foreground hover:bg-tint-20";

// The tooltip trigger overwrites radix's data-state on the toggle item, so
// the "on" look is styled from the aria-checked the single-select group sets.
const VIEW_ITEM = "size-7 px-0 aria-checked:bg-background aria-checked:text-foreground aria-checked:shadow-xs";

// List rows are cards a small gap apart; on phones they collapse to
// full-bleed rows (thread-card.tsx handles the edges).
const LIST = "flex flex-col gap-3 max-sm:gap-0";

export function ThreadsPage({ threads }: { threads: Thread[] }) {
  const [query, setQuery] = useState("");
  const [starredOnly, setStarredOnly] = useState(false);
  const [needsInputOnly, setNeedsInputOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("recent");
  const [view, setView] = useState<View>("list");
  const [status, setStatus] = useState({ live: true, archived: false });
  const [starred, setStarred] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(threads.map((t) => [t.id, t.starred])),
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = threads.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q) && !t.summary.toLowerCase().includes(q)) return false;
      if (starredOnly && !starred[t.id]) return false;
      // Nothing on the account is waiting on the user.
      if (needsInputOnly) return false;
      // Every mock thread is live; none is archived.
      if (!status.live) return false;
      return true;
    });
    return matches.sort((a, b) => {
      if (sort === "name") return a.title.localeCompare(b.title);
      const diff = Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
      return sort === "recent" ? diff : -diff;
    });
  }, [threads, query, starredOnly, needsInputOnly, status.live, sort, starred]);

  const sortLabel = SORTS.find((s) => s.key === sort)?.label ?? "Recent";
  const toggleStar = (id: string) => setStarred((s) => ({ ...s, [id]: !s[id] }));

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex h-full flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <header className="mx-auto w-full max-w-5xl px-6 pt-6 pb-4 max-sm:px-6">
            <div className="flex w-full flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-2xl text-foreground">Threads</h1>
              </div>
              <Button asChild>
                <Link href="/threads/new">
                  <Plus aria-hidden="true" />
                  New thread
                </Link>
              </Button>
            </div>
          </header>

          <div className="mx-auto max-w-5xl px-6 pb-16 max-sm:px-0">
            <div className="max-sm:px-6">
              <div className="@container mb-4 flex items-center justify-between gap-2">
                <InputGroup className="h-9 min-w-0 flex-1 sm:max-w-[306px]">
                  <InputGroupAddon>
                    <Search aria-hidden="true" />
                  </InputGroupAddon>
                  <InputGroupInput
                    translate="no"
                    placeholder="Search by name or topic"
                    aria-label="Search threads"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </InputGroup>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(CHIP, starredOnly && PRESSED)}
                    aria-pressed={starredOnly}
                    aria-label="Starred"
                    onClick={() => setStarredOnly((v) => !v)}
                  >
                    <Star className={cn("size-4", starredOnly && "fill-current")} aria-hidden="true" />
                    <span className="@min-[760px]:inline hidden">Starred</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(CHIP, needsInputOnly && PRESSED)}
                    aria-pressed={needsInputOnly}
                    aria-label="Needs input"
                    onClick={() => setNeedsInputOnly((v) => !v)}
                  >
                    <MessageCircleQuestionMark className="size-4" aria-hidden="true" />
                    <span className="@min-[760px]:inline hidden">Needs input</span>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className={CHIP} aria-label={`Sort by ${sortLabel}`}>
                        <ArrowUpDown className="size-4" aria-hidden="true" />
                        <span className="@min-[760px]:inline hidden">{sortLabel}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuRadioGroup value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                        {SORTS.map((s) => (
                          <DropdownMenuRadioItem key={s.key} value={s.key}>
                            {s.label}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className={CHIP} aria-label="Filters">
                        <ListFilter className="size-4" aria-hidden="true" />
                        <span className="@min-[760px]:inline hidden">Filters</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuCheckboxItem
                        checked={status.live}
                        onCheckedChange={(checked) => setStatus((s) => ({ ...s, live: checked === true }))}
                      >
                        Live
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={status.archived}
                        onCheckedChange={(checked) => setStatus((s) => ({ ...s, archived: checked === true }))}
                      >
                        Archived
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuSeparator />
                      {["Agent", "Project", "Invocation"].map((label) => (
                        <DropdownMenuItem key={label}>
                          {label}
                          <ChevronRight className="ml-auto size-4 text-muted-foreground" aria-hidden="true" />
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <ToggleGroup
                    type="single"
                    spacing={0}
                    value={view}
                    onValueChange={(v) => {
                      if (v) setView(v as View);
                    }}
                    aria-label="Layout"
                    className="shrink-0 max-sm:hidden"
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
            </div>

            {visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">No threads match the current filters</p>
              </div>
            ) : view === "list" ? (
              <div className={LIST}>
                {visible.map((thread) => (
                  <ThreadCard
                    key={thread.id}
                    thread={thread}
                    starred={!!starred[thread.id]}
                    onToggleStar={() => toggleStar(thread.id)}
                  />
                ))}
              </div>
            ) : view === "grid" ? (
              // Grid and board layouts are not captured in a dump (the live
              // account renders the list); they reuse the list card.
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((thread) => (
                  <ThreadCard
                    key={thread.id}
                    thread={thread}
                    starred={!!starred[thread.id]}
                    onToggleStar={() => toggleStar(thread.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Live", items: visible },
                  { label: "Needs input", items: [] as Thread[] },
                  { label: "Archived", items: [] as Thread[] },
                ].map((column) => (
                  <div key={column.label} className="flex min-w-0 flex-col gap-3">
                    {/* A group label: the caps eyebrow on tier 3 (design.md §4.1). */}
                    <div className="flex items-center gap-2 px-1 text-label-12-caps text-foreground-low">
                      <span>{column.label}</span>
                      <span className="rounded-full bg-tint-10 px-1.5 py-0.5 tabular-nums">{column.items.length}</span>
                    </div>
                    {column.items.map((thread) => (
                      <ThreadCard
                        key={thread.id}
                        thread={thread}
                        starred={!!starred[thread.id]}
                        onToggleStar={() => toggleStar(thread.id)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
