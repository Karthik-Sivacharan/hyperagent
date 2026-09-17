"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Overline } from "@/components/ui/overline";
import { SearchInput } from "@/components/patterns/search-input";
import { wikiGroupDot, type WikiGroupId, type WikiIndexEntry } from "@/lib/mock/wiki";

// The page index: every listed page grouped by the type of Topic it sits on,
// plus the fold of pages a merge or an exclusion took out of listings. Search
// filters titles, summaries and slugs in place, as the prototype does.

function PageRow({ page, active }: { page: WikiIndexEntry; active: boolean }) {
  return (
    <Button
      variant="ghost"
      size="none"
      asChild
      className={cn(
        "h-auto w-full justify-start rounded-sm px-2 py-1.5 text-left text-sm font-normal text-muted-foreground hover:bg-tint-10 hover:text-foreground",
        active && "bg-tint-10 text-foreground",
        page.hidden && "text-foreground-low",
      )}
    >
      <Link href={`/wiki/${page.slug}`} title={page.summary}>
        <span className="truncate">{page.title}</span>
      </Link>
    </Button>
  );
}

export function WikiIndexRail({
  groups,
  hiddenPages,
  activeSlug,
  totalPages,
}: {
  groups: { id: WikiGroupId; label: string; pages: WikiIndexEntry[] }[];
  hiddenPages: WikiIndexEntry[];
  activeSlug: string | null;
  totalPages: number;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return groups;
    return groups
      .map((group) => ({
        ...group,
        pages: group.pages.filter((page) =>
          `${page.title} ${page.summary} ${page.slug}`.toLowerCase().includes(needle),
        ),
      }))
      .filter((group) => group.pages.length > 0);
  }, [groups, query]);

  return (
    <nav aria-label="Wiki pages" className="flex w-60 shrink-0 flex-col gap-4">
      <div className="flex items-center gap-2">
        <SearchInput
          placeholder="Search pages"
          aria-label="Search pages"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-8 flex-1"
        />
        <Button variant="outline" size="sm" asChild>
          <Link href="/wiki/all">All</Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {filtered.map((group) => (
          <div key={group.id} className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2 px-2 pb-1">
              <span className={cn("size-1.5 rounded-full", wikiGroupDot[group.id])} aria-hidden="true" />
              <Overline className="flex-1">{group.label}</Overline>
              <span className="text-label-12-mono text-foreground-low">{group.pages.length}</span>
            </div>
            {group.pages.map((page) => (
              <PageRow key={page.slug} page={page} active={page.slug === activeSlug} />
            ))}
          </div>
        ))}
        {filtered.length === 0 ? (
          <p className="px-2 text-xs text-foreground-low">No page matches “{query}”.</p>
        ) : null}
      </div>

      <p className="px-2 text-xs text-foreground-low">{totalPages} pages listed.</p>

      {hiddenPages.length ? (
        <Collapsible className="flex flex-col gap-0.5">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="none"
              className="group/fold h-auto w-full justify-start gap-1.5 rounded-sm px-2 py-1.5 text-left text-xs font-normal text-foreground-low hover:bg-tint-10"
            >
              <IconChevronRight
                className="size-3.5 transition-transform duration-(--duration-fast) ease-out-quart group-aria-expanded/fold:rotate-90"
                aria-hidden="true"
              />
              <span className="flex-1 whitespace-normal">
                {hiddenPages.length} page{hiddenPages.length === 1 ? "" : "s"} hidden from listings, search and recall
              </span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-0.5">
            {hiddenPages.map((page) => (
              <PageRow key={page.slug} page={page} active={page.slug === activeSlug} />
            ))}
          </CollapsibleContent>
        </Collapsible>
      ) : null}

      <Badge variant="secondary" className="h-auto w-fit whitespace-normal px-2 py-1 text-xs">
        Composed by dreaming · nothing here was written by hand
      </Badge>
    </nav>
  );
}
