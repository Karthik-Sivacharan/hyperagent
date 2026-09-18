"use client";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArticleHeader } from "@/components/wiki/v1/article-header";
import { BodyV1, type BodyContext } from "@/components/wiki/v1/body";
import { HistoryList } from "@/components/wiki/v1/history-list";
import { MentionedIn } from "@/components/wiki/v1/mentioned-in";
import { SourcesList } from "@/components/wiki/v1/sources-list";
import { bodyRepeatsSummary } from "@/components/wiki/v1/text";
import type { WikiAtom, WikiLinkedFrom, WikiPage, WikiTopic } from "@/lib/mock/wiki";

// One composed page in v1: the header, the summary only when the body does
// not already open with it, and the three tabs. The Page tab ends on the
// pages that mention this one; Sources and History are one line per entry
// and open in place; any atom opens the drawer.

export function ArticleV1({
  page,
  topic,
  atoms,
  aliases,
  body,
  linkedFrom,
  tab,
  onTab,
  ctx,
  onAtom,
  assistants,
}: {
  page: WikiPage;
  topic: WikiTopic;
  atoms: Record<string, WikiAtom>;
  /** The body's own "Also known as" names, lifted out of it. */
  aliases: string[];
  /** The body without that line. */
  body: string;
  linkedFrom: WikiLinkedFrom[];
  tab: string;
  onTab: (tab: string) => void;
  ctx: BodyContext;
  onAtom: (id: string) => void;
  assistants: string[];
}) {
  const lead = bodyRepeatsSummary(page.summary, body) ? null : page.summary;

  return (
    <article className="flex min-w-0 max-w-3xl flex-col gap-5">
      <ArticleHeader
        page={page}
        topic={topic}
        atoms={atoms}
        aliases={aliases}
        assistants={assistants}
        onDisputes={() => onTab("sources")}
      />

      {page.hidden ? (
        <p className="rounded-md bg-warning/10 px-3 py-2 text-xs leading-5 text-foreground">
          <span className="font-medium">Hidden page.</span> Its Topic is {topic.status}
          {topic.mergedIntoTitle ? ` into ${topic.mergedIntoTitle}` : ""}. The page left listings, search and recall at
          that moment; this last version stays readable as history.
        </p>
      ) : null}

      {lead ? <p className="text-base leading-7 text-muted-foreground">{lead}</p> : null}

      <Tabs value={tab} onValueChange={onTab}>
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

      {tab === "page" ? (
        <div className="flex flex-col">
          <BodyV1 content={body} ctx={ctx} />
          <MentionedIn entries={linkedFrom} />
        </div>
      ) : null}
      {tab === "sources" ? (
        <SourcesList citations={page.citations} atoms={atoms} cites={ctx.cites} onAtom={onAtom} />
      ) : null}
      {tab === "history" ? <HistoryList versions={page.versions} atoms={atoms} ctx={ctx} onAtom={onAtom} /> : null}
    </article>
  );
}
