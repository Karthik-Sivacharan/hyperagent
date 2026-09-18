"use client";

import { IconChevronRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Overline } from "@/components/ui/overline";
import { renderInline, type InlineContext } from "@/components/wiki/wiki-body";
import { wikiAtomTypeIcon } from "@/components/wiki/topic-type";
import { fmtDay, fmtStamp } from "@/components/wiki/v1/format";
import { plainText } from "@/components/wiki/v1/text";
import type { WikiAtom, WikiPageVersion } from "@/lib/mock/wiki";

// Every revision of the page, newest first, one line each: the version, the
// source day it caught up to, its first change note, and how many atoms it
// added and retired. A revision opens in place to all its notes and those
// atoms. A note that only restates the two counts is left to the counts.

const COUNT_NOTE = /^\d+ atoms? added, \d+ superseded$/;

function DiffAtoms({
  label,
  ids,
  atoms,
  removed,
  onAtom,
}: {
  label: string;
  ids: string[];
  atoms: Record<string, WikiAtom>;
  removed?: boolean;
  onAtom: (id: string) => void;
}) {
  if (!ids.length) return null;
  return (
    <div className="flex flex-col gap-1">
      <Overline className="px-2">{label}</Overline>
      <ul className="flex flex-col">
        {ids.map((id) => {
          const atom = atoms[id];
          const Icon = wikiAtomTypeIcon(atom?.type ?? "");
          return (
            <li key={id}>
              <Button
                variant="ghost"
                size="none"
                onClick={() => onAtom(id)}
                className="h-auto w-full justify-start gap-2 rounded-md px-2 py-1 text-left text-xs font-normal hover:bg-tint-10"
              >
                <Icon className="size-3.5 text-foreground-low" aria-hidden="true" />
                <span
                  className={cn(
                    "min-w-0 flex-1 truncate",
                    removed ? "text-muted-foreground line-through" : "text-foreground",
                  )}
                >
                  {atom ? atom.title || atom.content : id}
                </span>
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function HistoryList({
  versions,
  atoms,
  ctx,
  onAtom,
}: {
  versions: WikiPageVersion[];
  atoms: Record<string, WikiAtom>;
  ctx: InlineContext;
  onAtom: (id: string) => void;
}) {
  const newestFirst = [...versions].reverse();

  return (
    <ol className="flex flex-col">
      {newestFirst.map((version, index) => {
        const added = version.addedAtomIds.length;
        const removed = version.removedAtomIds.length;
        const note = COUNT_NOTE.test(version.changeNote) ? "" : plainText(version.changeNote, ctx.links);
        return (
          <Collapsible key={version.version} asChild>
            <li className="flex flex-col">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="none"
                  className="group/row h-auto w-full justify-start gap-3 rounded-md px-2 py-1.5 text-left text-sm font-normal hover:bg-tint-10"
                >
                  <span className="w-7 shrink-0 text-label-12-mono text-foreground-low">v{version.version}</span>
                  <span className="w-12 shrink-0 text-xs text-foreground-low tabular-nums">{fmtDay(version.sourceDay)}</span>
                  <span className="min-w-0 flex-1 truncate text-foreground">{note}</span>
                  <span className="flex shrink-0 items-center gap-1">
                    {index === 0 ? <Badge variant="secondary">Current</Badge> : null}
                    {added ? (
                      <Badge variant="success">
                        +{added}
                        <span className="sr-only"> added</span>
                      </Badge>
                    ) : null}
                    {removed ? (
                      <Badge variant="destructive">
                        −{removed}
                        <span className="sr-only"> superseded</span>
                      </Badge>
                    ) : null}
                  </span>
                  <IconChevronRight
                    className="size-3.5 shrink-0 text-foreground-low transition-transform duration-(--duration-fast) ease-out-quart group-aria-expanded/row:rotate-90"
                    aria-hidden="true"
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="flex flex-col gap-3 pt-1 pr-2 pb-4 pl-10">
                <p className="text-xs text-foreground-low">
                  Revision {version.version}, {fmtStamp(version.createdAt)},{" "}
                  {version.dreamRunId ? `run ${version.dreamRunId}` : "no run recorded"}
                </p>
                {version.changeNotes.length ? (
                  <ul className="flex list-disc flex-col gap-1 pl-4 text-xs leading-5 text-foreground marker:text-foreground-low">
                    {version.changeNotes.map((text, noteIndex) => (
                      <li key={noteIndex}>{renderInline(text, ctx, `v${version.version}-n${noteIndex}`)}</li>
                    ))}
                  </ul>
                ) : null}
                <DiffAtoms label="Added" ids={version.addedAtomIds} atoms={atoms} onAtom={onAtom} />
                <DiffAtoms label="Superseded" ids={version.removedAtomIds} atoms={atoms} removed onAtom={onAtom} />
              </CollapsibleContent>
            </li>
          </Collapsible>
        );
      })}
    </ol>
  );
}
