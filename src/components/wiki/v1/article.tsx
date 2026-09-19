"use client";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TopicMention } from "@/components/wiki/topic-chip";
import { ArticleHeader } from "@/components/wiki/v1/article-header";
import { BodyV1, type BodyContext } from "@/components/wiki/v1/body";
import { HistoryList } from "@/components/wiki/v1/history-list";
import { MentionedIn } from "@/components/wiki/v1/mentioned-in";
import { SourcesList } from "@/components/wiki/v1/sources-list";
import { bodyRepeatsSummary } from "@/components/wiki/v1/text";
import type { WikiAtom, WikiLinkedFrom, WikiPage, WikiTopic, WikiTopicRef } from "@/lib/mock/wiki";

// One composed page in v1: the header, the summary only when the body does
// not already open with it, and the three tabs. The Page tab ends on the
// pages that mention this one; Sources and History are one line per entry
// and open in place; any atom opens the drawer.

export function ArticleV1({
  page,
  topic,
  mergedInto,
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
  /** Where a merged Topic went: the banner names it with its chip. */
  mergedInto: WikiTopicRef | null;
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

  // One measure for the whole column: 40rem holds a 16px line near 80
  // characters, the widest that still reads comfortably, and takes back most
  // of the gutter 36rem left between the rails at 1456. Not `max-w-prose`:
  // 65ch of Geist is 690px, about 88. A maximum, not a width, so the column
  // gives way when something narrows the space between the rails. The column
  // is centred between them, so the width the app sidebar's rail gives back
  // falls on both sides of it rather than all on one.
  return (
    <article className="mx-auto flex w-full min-w-0 max-w-160 flex-col gap-5">
      <ArticleHeader
        page={page}
        topic={topic}
        atoms={atoms}
        aliases={aliases}
        assistants={assistants}
        onDisputes={() => onTab("sources")}
      />

      {page.hidden ? (
        <p className="rounded-md bg-warning/10 px-3 py-2 text-sm text-foreground">
          <span className="font-medium">Hidden page.</span> Its Topic is {topic.status}
          {mergedInto ? (
            <>
              {" "}
              into{" "}
              <TopicMention group={mergedInto.group} href={mergedInto.slug ? `/wiki/${mergedInto.slug}` : undefined}>
                {mergedInto.title}
              </TopicMention>
            </>
          ) : null}
          . The page left listings, search and recall at that moment; this last version stays readable as history.
        </p>
      ) : null}

      {lead ? <p className="text-lg text-pretty text-muted-foreground">{lead}</p> : null}

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
