"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { IconChevronRight, IconEyeOff } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SearchInput } from "@/components/patterns/search-input";
import { TopicIcon } from "@/components/wiki/topic-chip";
import type { WikiGroupId, WikiIndexEntry } from "@/lib/mock/wiki";

// The page index as a list of Topic types: each group is one row (its icon,
// its label, how many pages) and opens to its pages. The group of the page
// you are on starts open; a search opens every group it matches. The pages a
// merge or an exclusion took out of listings fold away at the end, behind a
// row set like a group row but in the low ink; what "hidden" means is said
// on the hidden page itself, so the row only names and counts. A group row
// is set at 500 like the app sidebar's rows beside it; its pages stay at 400
// in the muted ink, so a parent and its children read apart. An open group
// keeps no fill (the ghost button's own open fill is reset, as the app
// sidebar's section toggles do): in this list a fill means the page you are
// on, and two filled rows would say it twice.

function PageRow({ page, active }: { page: WikiIndexEntry; active: boolean }) {
  return (
    <Button
      variant="ghost"
      size="none"
      asChild
      className={cn(
        "h-auto w-full justify-start rounded-md py-1.5 pr-2 pl-7.5 text-left text-sm font-normal text-muted-foreground hover:bg-tint-10 hover:text-foreground",
        active && "bg-tint-10 text-foreground",
      )}
    >
      <Link href={`/wiki/${page.slug}`} aria-current={active ? "page" : undefined}>
        <span className="truncate">{page.title}</span>
      </Link>
    </Button>
  );
}

function GroupRow({
  label,
  count,
  icon,
  open,
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
  open: boolean;
}) {
  return (
    <CollapsibleTrigger asChild>
      <Button
        variant="ghost"
        size="none"
        className="h-auto w-full justify-start gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium text-foreground hover:bg-tint-10 aria-expanded:bg-transparent aria-expanded:hover:bg-tint-10"
      >
        {icon}
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <span className="text-xs text-foreground-low tabular-nums">{count}</span>
        <IconChevronRight
          className={cn(
            "size-3.5 text-foreground-low transition-transform duration-(--duration-fast) ease-out-quart",
            open && "rotate-90",
          )}
          aria-hidden="true"
        />
      </Button>
    </CollapsibleTrigger>
  );
}

export function IndexRailV1({
  groups,
  hiddenPages,
  activeSlug,
  activeGroup,
}: {
  groups: { id: WikiGroupId; label: string; pages: WikiIndexEntry[] }[];
  hiddenPages: WikiIndexEntry[];
  activeSlug: string;
  /** The group to open: the current page's, when the page is listed. */
  activeGroup: WikiGroupId | null;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(() => new Set(activeGroup ? [activeGroup] : []));
  const [shownGroup, setShownGroup] = useState(activeGroup);

  // Moving to a page in another group opens that group too; the rest stay as left.
  if (shownGroup !== activeGroup) {
    setShownGroup(activeGroup);
    if (activeGroup) setOpen((previous) => new Set(previous).add(activeGroup));
  }

  const needle = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!needle) return groups;
    return groups
      .map((group) => ({
        ...group,
        pages: group.pages.filter((page) => `${page.title} ${page.summary} ${page.slug}`.toLowerCase().includes(needle)),
      }))
      .filter((group) => group.pages.length > 0);
  }, [groups, needle]);

  const toggle = (id: WikiGroupId, next: boolean) =>
    setOpen((previous) => {
      const copy = new Set(previous);
      if (next) copy.add(id);
      else copy.delete(id);
      return copy;
    });

  const listed = groups.reduce((sum, group) => sum + group.pages.length, 0);
  const hiddenActive = hiddenPages.some((page) => page.slug === activeSlug);

  return (
    <nav aria-label="Wiki pages" className="flex w-60 shrink-0 flex-col gap-3">
      <div className="flex items-center gap-2">
        <SearchInput
          placeholder={`Search ${listed} pages`}
          aria-label="Search pages"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-8 flex-1"
        />
        <Button variant="outline" size="sm" asChild>
          <Link href="/wiki/all">All</Link>
        </Button>
      </div>

      <div className="flex flex-col gap-0.5">
        {filtered.map((group) => {
          const isOpen = Boolean(needle) || open.has(group.id);
          return (
            <Collapsible key={group.id} open={isOpen} onOpenChange={(next) => toggle(group.id, next)}>
              <GroupRow
                label={group.label}
                count={group.pages.length}
                icon={<TopicIcon group={group.id} />}
                open={isOpen}
              />
              <CollapsibleContent className="flex flex-col gap-0.5 pt-0.5 pb-1.5">
                {group.pages.map((page) => (
                  <PageRow key={page.slug} page={page} active={page.slug === activeSlug} />
                ))}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
        {filtered.length === 0 ? (
          <p className="px-2 py-1.5 text-xs text-foreground-low">No page matches “{query}”.</p>
        ) : null}
      </div>

      {hiddenPages.length ? (
        <Collapsible defaultOpen={hiddenActive} className="flex flex-col gap-0.5 border-t border-border-subtle pt-3">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="none"
              className="group/fold h-auto w-full justify-start gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium text-foreground-low hover:bg-tint-10 aria-expanded:bg-transparent aria-expanded:hover:bg-tint-10"
            >
              <IconEyeOff className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">Hidden</span>
              <span className="text-xs tabular-nums">{hiddenPages.length}</span>
              <IconChevronRight
                className="size-3.5 transition-transform duration-(--duration-fast) ease-out-quart group-aria-expanded/fold:rotate-90"
                aria-hidden="true"
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-0.5">
            {hiddenPages.map((page) => (
              <PageRow key={page.slug} page={page} active={page.slug === activeSlug} />
            ))}
          </CollapsibleContent>
        </Collapsible>
      ) : null}
    </nav>
  );
}
