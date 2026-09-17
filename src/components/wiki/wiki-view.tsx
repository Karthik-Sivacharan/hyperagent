"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AtomDrawer } from "@/components/wiki/atom-drawer";
import { WikiArticle } from "@/components/wiki/wiki-article";
import { WikiDetailsRail } from "@/components/wiki/wiki-details-rail";
import { WikiIndexRail } from "@/components/wiki/wiki-index-rail";
import type { InlineContext } from "@/components/wiki/wiki-body";
import type { WikiGroupId, WikiIndexEntry, WikiView as WikiViewData } from "@/lib/mock/wiki";

// The wiki: a page index on the left, the composed page in the middle, what
// the page is made of on the right, and a drawer for any atom a citation,
// a revision diff or another atom points at.

export function WikiView({
  view,
  groups,
  hiddenPages,
  totalPages,
  header,
}: {
  view: WikiViewData;
  groups: { id: WikiGroupId; label: string; pages: WikiIndexEntry[] }[];
  hiddenPages: WikiIndexEntry[];
  totalPages: number;
  header: { workspace: string; subtitle: string };
}) {
  const [atomId, setAtomId] = useState<string | null>(null);
  const { page, topic, atoms, topicTitles, linkedFrom } = view;

  const ctx: InlineContext = useMemo(
    () => ({
      cites: new Map(page.citations.map((id, index) => [id, index + 1])),
      links: page.links,
      onAtom: setAtomId,
    }),
    [page],
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-6 px-6 py-6">
        <header className="flex flex-col gap-1">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-foreground-low">
            <span>{header.workspace}</span>
            <span aria-hidden="true">/</span>
            <Link href="/wiki" className="text-foreground hover:underline hover:underline-offset-4">
              Wiki
            </Link>
          </nav>
          <p className="text-sm text-muted-foreground">{header.subtitle}</p>
        </header>

        <div className="flex items-start gap-8">
          <div className="sticky top-0 self-start">
            <WikiIndexRail
              groups={groups}
              hiddenPages={hiddenPages}
              activeSlug={page.slug}
              totalPages={totalPages}
            />
          </div>

          <main className="min-w-0 flex-1">
            <WikiArticle page={page} topic={topic} atoms={atoms} ctx={ctx} onAtom={setAtomId} />
          </main>

          <div className="sticky top-0 hidden self-start xl:block">
            <WikiDetailsRail page={page} topic={topic} linkedFrom={linkedFrom} />
          </div>
        </div>
      </div>

      <AtomDrawer
        atomId={atomId}
        atoms={atoms}
        topicTitles={topicTitles}
        onOpenAtom={setAtomId}
        onClose={() => setAtomId(null)}
      />
    </div>
  );
}
