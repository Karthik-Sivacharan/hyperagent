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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Thread } from "@/lib/mock/threads";
import { ThreadCard } from "@/components/threads/thread-card";

// The threads index from hyperagent.com (docs/reference/pages/threads.html):
// title + "New thread", search, filter chips, sort, a layout toggle and the
// list. Filters, sort and layout are local state; the menus carry the items
// the live site lists.

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

// The site's outline/sm button plus its overrides, verbatim from the dump.
const CHIP = "px-3 has-[>svg]:px-2.5 h-9 gap-2 rounded-[8px] bg-white dark:bg-muted";

// Pressed chips, as the live page renders them (each filter has its own tint).
const PRESSED = {
  starred: "border-yellow-500/40 bg-yellow-500/10 text-foreground hover:bg-yellow-500/15 dark:bg-yellow-500/15",
  needsInput: "border-blue-500/40 bg-blue-500/10 text-foreground hover:bg-blue-500/15 dark:bg-blue-500/15",
};

// The site's <Input> (an older shadcn build than src/components/ui/input.tsx).
const INPUT =
  "notranslate h-9 min-w-0 border px-3 py-1 font-body text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm rounded-[8px] border-border bg-white dark:bg-muted focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 w-full pl-8 pr-3";

const LIST_FRAME =
  "overflow-hidden rounded-lg border border-border bg-background max-sm:rounded-none max-sm:border-x-0 max-sm:bg-transparent";

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
                <h1 className="font-display font-semibold tracking-[-0.01em] text-2xl text-foreground">Threads</h1>
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
                <div className="relative min-w-0 flex-1 sm:max-w-[306px]">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    data-slot="input"
                    translate="no"
                    className={INPUT}
                    placeholder="Search by name or topic"
                    aria-label="Search threads"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(CHIP, starredOnly && PRESSED.starred)}
                    aria-pressed={starredOnly}
                    aria-label="Starred"
                    onClick={() => setStarredOnly((v) => !v)}
                  >
                    <Star className={cn("size-4", starredOnly && "fill-current text-yellow-500")} aria-hidden="true" />
                    <span className="@min-[760px]:inline hidden">Starred</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(CHIP, needsInputOnly && PRESSED.needsInput)}
                    aria-pressed={needsInputOnly}
                    aria-label="Needs input"
                    onClick={() => setNeedsInputOnly((v) => !v)}
                  >
                    <MessageCircleQuestionMark
                      className={cn("size-4", needsInputOnly && "text-blue-600")}
                      aria-hidden="true"
                    />
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

                  <div
                    role="group"
                    aria-label="Layout"
                    className="inline-flex h-9 shrink-0 items-center gap-0.5 rounded-[8px] border bg-white p-[3px] shadow-xs max-sm:hidden dark:border-input dark:bg-muted"
                  >
                    {VIEWS.map(({ key, label, icon: Icon }) => {
                      const active = view === key;
                      return (
                        <Tooltip key={key}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className={cn(
                                "size-7 rounded-[5px]",
                                active
                                  ? "bg-accent text-foreground hover:bg-accent dark:bg-background dark:hover:bg-background"
                                  : "text-muted-foreground",
                              )}
                              aria-pressed={active}
                              aria-label={label}
                              onClick={() => setView(key)}
                            >
                              <Icon className="size-4" aria-hidden="true" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{label}</TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">No threads match the current filters</p>
              </div>
            ) : view === "list" ? (
              <div className={LIST_FRAME}>
                <div>
                  {visible.map((thread) => (
                    <ThreadCard
                      key={thread.id}
                      thread={thread}
                      starred={!!starred[thread.id]}
                      onToggleStar={() => toggleStar(thread.id)}
                    />
                  ))}
                </div>
              </div>
            ) : view === "grid" ? (
              // Grid and board layouts are not captured in a dump (the live
              // account renders the list); they reuse the list row inside cards.
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((thread) => (
                  <div key={thread.id} className={LIST_FRAME}>
                    <ThreadCard thread={thread} starred={!!starred[thread.id]} onToggleStar={() => toggleStar(thread.id)} />
                  </div>
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
                    <div className="flex items-center gap-2 px-1 font-medium text-muted-foreground text-xs">
                      <span>{column.label}</span>
                      <span className="rounded-full bg-muted px-1.5 py-0.5 tabular-nums">{column.items.length}</span>
                    </div>
                    {column.items.map((thread) => (
                      <div key={thread.id} className={LIST_FRAME}>
                        <ThreadCard thread={thread} starred={!!starred[thread.id]} onToggleStar={() => toggleStar(thread.id)} />
                      </div>
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
