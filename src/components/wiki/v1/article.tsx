"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WikiBody, type InlineContext } from "@/components/wiki/wiki-body";
import { ArticleHeader } from "@/components/wiki/v1/article-header";
import { HistoryList } from "@/components/wiki/v1/history-list";
import { SourcesList } from "@/components/wiki/v1/sources-list";
import { bodyRepeatsSummary, splitAliases } from "@/components/wiki/v1/text";
import type { WikiAtom, WikiPage, WikiTopic } from "@/lib/mock/wiki";

// One composed page in v1: the header, the summary only when the body does
// not already open with it, and the three tabs. Sources and History are
// one line per entry and open in place; any atom opens the drawer.

export function ArticleV1({
  page,
  topic,
  atoms,
  ctx,
  onAtom,
  assistants,
}: {
  page: WikiPage;
  topic: WikiTopic;
  atoms: Record<string, WikiAtom>;
  ctx: InlineContext;
  onAtom: (id: string) => void;
  assistants: string[];
}) {
  const [tab, setTab] = useState("page");
  const { aliases, body } = splitAliases(page.content);
  const lead = bodyRepeatsSummary(page.summary, body) ? null : page.summary;

  return (
    <article className="flex min-w-0 max-w-3xl flex-col gap-5">
      <ArticleHeader
        page={page}
        topic={topic}
        atoms={atoms}
        aliases={aliases}
        assistants={assistants}
        onDisputes={() => setTab("sources")}
      />

      {page.hidden ? (
        <p className="rounded-md bg-warning/10 px-3 py-2 text-xs leading-5 text-foreground">
          <span className="font-medium">Hidden page.</span> Its Topic is {topic.status}
          {topic.mergedIntoTitle ? ` into ${topic.mergedIntoTitle}` : ""}. The page left listings, search and recall at
          that moment; this last version stays readable as history.
        </p>
      ) : null}

      {lead ? <p className="text-base leading-7 text-muted-foreground">{lead}</p> : null}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="page">Page</TabsTrigger>
          <TabsTrigger value="sources">
            Sources
            <Badge variant="secondary" className="ml-1.5">
              {page.citations.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="history">
            History
            <Badge variant="secondary" className="ml-1.5">
              {page.versions.length}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "page" ? <WikiBody content={body} ctx={ctx} /> : null}
      {tab === "sources" ? (
        <SourcesList citations={page.citations} atoms={atoms} cites={ctx.cites} onAtom={onAtom} />
      ) : null}
      {tab === "history" ? <HistoryList versions={page.versions} atoms={atoms} ctx={ctx} onAtom={onAtom} /> : null}
    </article>
  );
}
