import { Fragment } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/patterns/page-heading";
import { WikiTabs } from "@/components/wiki/wiki-tabs";
import { wikiCounts, wikiGroupDot, wikiHiddenPages, wikiIndexGroups, wikiPages } from "@/lib/mock/wiki";

// The page index: every listed page with its summary and its slug, grouped by
// the type of Topic it sits on.

export default function Page() {
  const groups = wikiIndexGroups();
  const listed = wikiPages.filter((page) => !page.hidden).length;
  const hidden = wikiHiddenPages().length;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-foreground-low">
          <Link href="/wiki" className="text-foreground hover:underline hover:underline-offset-4">
            Wiki
          </Link>
          <span aria-hidden="true">/</span>
          <span>All pages</span>
        </nav>

        <WikiTabs counts={wikiCounts()} />

        <PageHeading
          title="All pages"
          subtitle={`${listed} pages listed, grouped by Topic type · ${hidden} hidden from listings, search and recall`}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href="/wiki">Back to the wiki</Link>
            </Button>
          }
        />

        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="w-64 px-3 py-2 text-label-12-caps text-foreground-low">page</th>
              <th className="px-3 py-2 text-label-12-caps text-foreground-low">summary</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <Fragment key={group.id}>
                <tr className="border-b border-border-subtle bg-tint-5">
                  <td colSpan={2} className="px-3 py-2">
                    <span className="flex items-center gap-2 text-label-12-caps text-foreground-low">
                      <span className={cn("size-1.5 rounded-full", wikiGroupDot[group.id])} aria-hidden="true" />
                      {group.label}
                      <span className="text-label-12-mono">{group.pages.length}</span>
                    </span>
                  </td>
                </tr>
                {group.pages.map((page) => (
                  <tr key={page.slug} className="border-b border-border-subtle last:border-0">
                    <td className="px-3 py-2.5 align-top">
                      <Link
                        href={`/wiki/${page.slug}`}
                        className="text-foreground underline decoration-border underline-offset-4 transition-colors duration-(--duration-fast) ease-out-quart hover:decoration-brand-accent"
                      >
                        {page.title}
                      </Link>
                      <span className="mt-0.5 block text-label-12-mono text-foreground-low">{page.slug}</span>
                    </td>
                    <td className="px-3 py-2.5 align-top text-xs leading-5 text-muted-foreground">{page.summary}</td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
