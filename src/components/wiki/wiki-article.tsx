"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WikiBody, type InlineContext, renderInline } from "@/components/wiki/wiki-body";
import { wikiGroupDot } from "@/components/wiki/topic-type";
import type { WikiAtom, WikiPage, WikiTopic } from "@/lib/mock/wiki";

// One composed page: the body dreaming wrote, the atoms the current revision
// cites, and the revision history with the atoms each revision added and
// retired. Every atom in here opens the drawer.

const fmtDay = (value: string | null) =>
  value
    ? new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "—";

const fmtStamp = (value: string | null) =>
  value
    ? `${new Date(value.slice(0, 19)).toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${value.slice(11, 16)}`
    : "—";

function CitedAtom({ atom, number, onAtom }: { atom: WikiAtom | undefined; number: number; onAtom: () => void }) {
  return (
    <li className="flex gap-3">
      <span className="w-5 shrink-0 pt-0.5 text-right text-label-12-mono text-foreground-low tabular-nums">{number}</span>
      <Button
        variant="ghost"
        size="none"
        onClick={onAtom}
        className="h-auto min-w-0 flex-1 flex-col items-start justify-start gap-1 rounded-md p-2.5 text-left text-sm font-normal whitespace-normal shadow-edge hover:bg-tint-10"
      >
        <span className="leading-5 text-foreground">{atom?.content ?? "—"}</span>
        <span className="flex flex-wrap items-center gap-1.5 text-label-12-mono text-foreground-low">
          {atom ? (
            <>
              <span>{atom.type}</span>
              {atom.status !== "current" ? <span>· {atom.statusLabel}</span> : null}
              <span>· {fmtDay(atom.validFrom)}</span>
            </>
          ) : null}
        </span>
      </Button>
    </li>
  );
}

function DiffAtoms({
  ids,
  atoms,
  removed,
  onAtom,
}: {
  ids: string[];
  atoms: Record<string, WikiAtom>;
  removed?: boolean;
  onAtom: (id: string) => void;
}) {
  if (!ids.length) return <p className="text-xs text-foreground-low">none</p>;
  return (
    <ul className="flex flex-col gap-1">
      {ids.map((id) => (
        <li key={id}>
          <Button
            variant="ghost"
            size="none"
            onClick={() => onAtom(id)}
            className="h-auto w-full items-start justify-start gap-2 rounded-sm px-2 py-1.5 text-left text-xs font-normal whitespace-normal hover:bg-tint-10"
          >
            <span className={cn("shrink-0", removed ? "text-destructive" : "text-success")}>{removed ? "−" : "+"}</span>
            <span className={cn("min-w-0 flex-1 leading-5", removed ? "text-muted-foreground line-through" : "text-foreground")}>
              {atoms[id]?.content ?? id}
            </span>
          </Button>
        </li>
      ))}
    </ul>
  );
}

export function WikiArticle({
  page,
  topic,
  atoms,
  ctx,
  onAtom,
  groupLabels,
}: {
  page: WikiPage;
  topic: WikiTopic;
  atoms: Record<string, WikiAtom>;
  ctx: InlineContext;
  onAtom: (id: string) => void;
  groupLabels: Record<string, string>;
}) {
  const [tab, setTab] = useState("page");
  const [openVersion, setOpenVersion] = useState<number | null>(null);
  const current = page.versions[page.versions.length - 1];

  return (
    <article className="flex min-w-0 flex-col gap-4">
      <div className="flex items-center gap-2 text-label-12-caps text-foreground-low">
        <span className={cn("size-1.5 rounded-full", wikiGroupDot[page.group])} aria-hidden="true" />
        {groupLabels[page.group] ?? groupLabels.concept} · Topic page · workspace-shared
      </div>

      <h1 className="font-heading text-2xl text-foreground">{page.title}</h1>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-foreground-low">
        <span className="text-label-12-mono">{page.slug}</span>
        <span>· version {current?.version ?? "—"} of {page.versions.length}</span>
        <span>· composed by {page.dreamRunId ?? "—"}</span>
        <span>· {fmtStamp(page.updatedAt)}</span>
      </div>

      {page.hidden ? (
        <p className="rounded-md bg-warning/10 p-3 text-xs leading-5 text-foreground">
          <span className="font-medium">Hidden page.</span> Its Topic is {topic.status}
          {topic.mergedIntoTitle ? ` into ${topic.mergedIntoTitle}` : ""}. The page left listings, search and recall at
          that moment; this last version stays readable as history.
        </p>
      ) : null}

      <p className="text-sm leading-6 text-muted-foreground">{page.summary}</p>

      <Tabs value={tab} onValueChange={setTab} className="min-h-0">
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

      {tab === "page" ? <WikiBody content={page.content} ctx={ctx} /> : null}

      {tab === "sources" ? (
        <div className="flex flex-col gap-3">
          <ol className="flex flex-col gap-2">
            {page.citations.map((id, index) => (
              <CitedAtom key={id} atom={atoms[id]} number={index + 1} onAtom={() => onAtom(id)} />
            ))}
          </ol>
          <p className="text-xs text-foreground-low">
            {page.citations.length} distinct atoms cited by the current revision. Open one to see where it came from.
          </p>
        </div>
      ) : null}

      {tab === "history" ? (
        <ul className="flex flex-col gap-1">
          {[...page.versions].reverse().map((version, index) => {
            const open = openVersion === version.version;
            return (
              <li key={version.version} className="flex flex-col">
                <Button
                  variant="ghost"
                  size="none"
                  onClick={() => setOpenVersion(open ? null : version.version)}
                  aria-expanded={open}
                  className="h-auto w-full items-start justify-start gap-3 rounded-sm px-2 py-2 text-left text-xs font-normal whitespace-normal hover:bg-tint-10"
                >
                  <span className="w-8 shrink-0 text-label-12-mono text-foreground-low">v{version.version}</span>
                  <span className="w-24 shrink-0 text-foreground-low tabular-nums">{fmtDay(version.sourceDay)}</span>
                  <span className="min-w-0 flex-1 leading-5 text-foreground">
                    {renderInline(version.changeNote, ctx, `v${version.version}`)}
                    {version.changeNoteCount > 1 ? (
                      <span className="text-foreground-low"> (+{version.changeNoteCount - 1} more)</span>
                    ) : null}
                  </span>
                  {index === 0 ? <Badge variant="secondary">current</Badge> : null}
                </Button>
                {open ? (
                  <div className="mb-2 ml-8 flex flex-col gap-3 rounded-md p-3 shadow-edge">
                    <p className="text-xs text-foreground-low">
                      Revision {version.version} · {fmtStamp(version.createdAt)} ·{" "}
                      {version.dreamRunId ? `run ${version.dreamRunId}` : "no run recorded"}
                    </p>
                    {version.changeNotes.length ? (
                      <ul className="flex flex-col gap-1 text-xs leading-5 text-foreground">
                        {version.changeNotes.map((note, noteIndex) => (
                          <li key={noteIndex}>• {renderInline(note, ctx, `v${version.version}-n${noteIndex}`)}</li>
                        ))}
                      </ul>
                    ) : null}
                    <div className="flex flex-col gap-1">
                      <span className="text-label-12-caps text-foreground-low">Atoms this revision added</span>
                      <DiffAtoms ids={version.addedAtomIds} atoms={atoms} onAtom={onAtom} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-label-12-caps text-foreground-low">Atoms it superseded</span>
                      <DiffAtoms ids={version.removedAtomIds} atoms={atoms} removed onAtom={onAtom} />
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </article>
  );
}
