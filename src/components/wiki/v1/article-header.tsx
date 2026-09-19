"use client";

import { IconAlertTriangle, IconClock, IconInfoCircle } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TopicChip } from "@/components/wiki/topic-chip";
import { fmtDay, fmtStamp } from "@/components/wiki/v1/format";
import type { WikiAtom, WikiPage, WikiTopic } from "@/lib/mock/wiki";

// What the page is before you read it: the kind of Topic above the title, the
// names it also goes by under it, then one line of facets (how fresh it is,
// what is in dispute, whose conversations it came from). The audit fields
// (slug, version, run) sit one click away in the Info popover.

const CONTRIBUTORS_SHOWN = 2;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-1">
      <dt className="w-24 shrink-0 text-foreground-low">{label}</dt>
      <dd className="min-w-0 flex-1 text-foreground">{children}</dd>
    </div>
  );
}

export function ArticleHeader({
  page,
  topic,
  atoms,
  aliases,
  assistants,
  onDisputes,
}: {
  page: WikiPage;
  topic: WikiTopic;
  atoms: Record<string, WikiAtom>;
  /** The body's own "Also known as" names. */
  aliases: string[];
  /** The workspace's assistant names: the extraction groups that are someone. */
  assistants: string[];
  onDisputes: () => void;
}) {
  const current = page.versions[page.versions.length - 1];
  const cited = page.citations.map((id) => atoms[id]).filter((atom): atom is WikiAtom => Boolean(atom));
  const disputed = cited.filter((atom) => atom.conflictWith.length > 0).length;

  const tally = new Map<string, number>();
  for (const atom of cited) {
    if (assistants.includes(atom.extractionGroup)) tally.set(atom.extractionGroup, (tally.get(atom.extractionGroup) ?? 0) + 1);
  }
  const contributors = [...tally].sort((a, b) => b[1] - a[1]);
  const rest = contributors.length - CONTRIBUTORS_SHOWN;

  return (
    <header className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {/* The page's biggest tag, on the same tinted chip as every Topic
            that stands on its own, here and under "Mentioned in". */}
        <TopicChip group={page.group} label={topic.subtype ?? topic.type} className="capitalize" />
        {page.hidden ? <Badge variant="warning">Hidden</Badge> : null}
      </div>

      <h1 className="font-heading text-3xl text-balance text-foreground">{page.title}</h1>

      {aliases.length ? (
        <p className="text-sm text-muted-foreground">Also known as {aliases.join(", ")}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-1 text-md text-foreground-low">
        {current?.sourceDay ? (
          <span className="inline-flex items-center gap-1 tabular-nums">
            <IconClock className="size-3.5" aria-hidden="true" />
            Updated {fmtDay(current.sourceDay)}
          </span>
        ) : null}

        {/* Sized with the Topic chips beside it rather than as a badge, so
            the meta line reads as one set of pills. */}
        {disputed ? (
          <Button
            variant="ghost"
            size="none"
            onClick={onDisputes}
            className="h-6 gap-1 rounded-full bg-warning/10 px-2 text-md text-warning hover:bg-warning/15"
          >
            <IconAlertTriangle className="size-3.5" aria-hidden="true" />
            {disputed} in dispute
          </Button>
        ) : null}

        {contributors.length ? (
          <span className="inline-flex flex-wrap items-center gap-1.5">
            From
            {contributors.slice(0, CONTRIBUTORS_SHOWN).map(([name]) => (
              <TopicChip key={name} group="agent" label={name} />
            ))}
            {rest > 0 ? <span>and {rest} more</span> : null}
          </span>
        ) : null}

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon-xs" aria-label="Page details" className="text-foreground-low hover:text-foreground">
              <IconInfoCircle className="size-3.5" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80 p-3 text-xs">
            <dl className="flex flex-col divide-y divide-border-subtle">
              <Field label="Slug">
                <span className="text-label-12-mono">{page.slug}</span>
              </Field>
              <Field label="Version">
                {current?.version ?? "none"} of {page.versions.length}
              </Field>
              <Field label="Composed by">{page.dreamRunId ?? "none"}</Field>
              <Field label="Composed">{fmtStamp(page.updatedAt)}</Field>
              <Field label="Topic">
                {[topic.type, topic.subtype, topic.status].filter(Boolean).join(" · ")}
              </Field>
              {contributors.length ? (
                <Field label="Extracted from">
                  {contributors.map(([name, count]) => `${name} ${count}`).join(", ")}
                </Field>
              ) : null}
            </dl>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
