"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AtomDrawer } from "@/components/wiki/atom-drawer";
import { TopicsOverTime } from "@/components/wiki/topics-over-time";
import {
  wikiGroupDot,
  type WikiAtom,
  type WikiConflict,
  type WikiGraphPage,
  type WikiRun,
  type WikiTopic,
} from "@/lib/mock/wiki";

// The job as it happened: 51 runs over a fortnight of source days, and the
// atoms of one Topic laid out across those days — a bar from validFrom to the
// day it was superseded or retracted, a dot for an episode that happened once.

const TYPE_FILL: Record<string, string> = {
  fact: "var(--chart-3)",
  preference: "var(--chart-5)",
  rule: "var(--chart-4)",
  episode: "var(--chart-1)",
  lesson: "var(--chart-6)",
};

const fmtInt = (value: number | undefined) => (value ?? 0).toLocaleString("en-US");

const fmtDay = (value: string | null) =>
  value
    ? new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    : "—";

const fmtStamp = (value: string | null) =>
  value
    ? `${new Date(value.slice(0, 19)).toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${value.slice(11, 16)}`
    : "—";

const PLURAL: Record<string, [string, string]> = {
  thread: ["thread", "threads"],
  document: ["document revision", "document revisions"],
  memory: ["saved memory", "saved memories"],
};

/** "12 threads · 3 saved memories" from the run's input counts. */
const inputSummary = (counts: Record<string, number>) =>
  Object.entries(counts)
    .map(([kind, count]) => `${count} ${(PLURAL[kind] ?? [kind, `${kind}s`])[count === 1 ? 0 : 1]}`)
    .join(" · ");

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

function RunDetail({
  run,
  atoms,
  onAtom,
}: {
  run: WikiRun;
  atoms: Record<string, WikiAtom>;
  onAtom: (id: string) => void;
}) {
  const atomButtons = (ids: string[]) =>
    ids.length ? (
      <div className="flex flex-wrap gap-1.5">
        {ids.map((id) => (
          <Button
            key={id}
            variant="ghost"
            size="none"
            onClick={() => onAtom(id)}
            disabled={!atoms[id]}
            title={atoms[id]?.content}
            className="h-auto max-w-full rounded-sm px-2 py-1 text-left text-xs font-normal whitespace-normal shadow-edge hover:bg-tint-10"
          >
            {atoms[id] ? clip(atoms[id].content, 90) : id}
          </Button>
        ))}
      </div>
    ) : (
      <p className="text-xs text-foreground-low">none</p>
    );

  return (
    <div className="grid gap-6 p-4 md:grid-cols-2">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1 text-xs">
          <span className="text-label-12-caps text-foreground-low">DreamRun</span>
          <span className="text-label-12-mono text-foreground">{run.id}</span>
          <span className="text-foreground-low">
            {fmtStamp(run.startedAt)} → {fmtStamp(run.finishedAt)} · {run.status} · {run.storeKind ?? "run"}
          </span>
          <span className="text-foreground-low">
            {fmtInt(run.tokenUsage.input)} in · {fmtInt(run.tokenUsage.output)} out · {run.tokenUsage.calls ?? 0} calls
            {run.tokenUsage.model ? ` · ${run.tokenUsage.model}` : ""}
          </span>
          {Object.keys(run.verdictCounts).length ? (
            <span className="text-foreground-low">
              verdicts:{" "}
              {Object.entries(run.verdictCounts)
                .map(([verdict, count]) => `${count} ${verdict}`)
                .join(" · ")}
              {run.aliasQuestions ? ` · ${run.aliasQuestions} alias questions` : ""}
            </span>
          ) : null}
        </div>

        {run.extractionGroups.length ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-label-12-caps text-foreground-low">Extraction groups</span>
            <div className="flex flex-wrap gap-1.5">
              {run.extractionGroups.map((group, index) => (
                <Badge key={`${group.agent}-${index}`} variant="outline">
                  {group.agent} · {group.events} inputs · {group.atomsAdded} atoms
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <span className="text-label-12-caps text-foreground-low">
            Inputs · {inputSummary(run.inputCounts) || "none"}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {run.inputLabels.map((label, index) => (
              <Badge key={`${label}-${index}`} variant="secondary">
                {label}
              </Badge>
            ))}
            {!run.inputLabels.length ? (
              <p className="text-xs text-foreground-low">No new source inputs; this run reconciled existing atoms.</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-label-12-caps text-foreground-low">Atoms added · {run.atomsAddedIds.length}</span>
          {atomButtons(run.atomsAddedIds)}
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-label-12-caps text-foreground-low">
            Atoms superseded or retracted · {run.atomsSupersededIds.length}
          </span>
          {atomButtons(run.atomsSupersededIds)}
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-label-12-caps text-foreground-low">
            Topics minted · {run.topicsMinted.length} / merged · {run.topicsMerged.length}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {run.topicsMinted.map((topic) => (
              <Badge key={topic.id} variant="outline" className="gap-1.5">
                <span className={cn("size-1.5 rounded-full", wikiGroupDot[topic.group])} aria-hidden="true" />
                {topic.title}
              </Badge>
            ))}
            {run.topicsMerged.map((topic) => (
              <Badge key={topic.id} variant="secondary">
                {topic.title} → {topic.into}
              </Badge>
            ))}
            {!run.topicsMinted.length && !run.topicsMerged.length ? (
              <p className="text-xs text-foreground-low">none</p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-label-12-caps text-foreground-low">Pages recomposed · {run.pagesRecomposed.length}</span>
          <div className="flex flex-wrap gap-1.5">
            {run.pagesRecomposed.map((page) => (
              <Badge key={page.slug} variant="outline" asChild>
                <Link href={`/wiki/${page.slug}`}>{page.title}</Link>
              </Badge>
            ))}
            {!run.pagesRecomposed.length ? <p className="text-xs text-foreground-low">none</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function RunFeed({
  runs,
  atoms,
  onAtom,
  job,
}: {
  runs: WikiRun[];
  atoms: Record<string, WikiAtom>;
  onAtom: (id: string) => void;
  job: { id: string; model: string; tokensIn: number; tokensOut: number; calls: number };
}) {
  const [openRun, setOpenRun] = useState<string | null>(null);
  const maxAdded = Math.max(1, ...runs.map((run) => run.atomsAddedIds.length));

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-foreground-low">
        One job ({job.id}) · {runs.length} runs, all succeeded · {fmtInt(job.tokensIn)} input / {fmtInt(job.tokensOut)}{" "}
        output tokens over {fmtInt(job.calls)} model calls · {job.model}
      </p>

      <div className="overflow-hidden rounded-md shadow-edge">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border-subtle bg-tint-5">
              <th className="w-10 px-3 py-2 text-label-12-caps text-foreground-low">#</th>
              <th className="w-28 px-3 py-2 text-label-12-caps text-foreground-low">source day</th>
              <th className="px-3 py-2 text-label-12-caps text-foreground-low">run</th>
              <th className="w-32 px-3 py-2 text-label-12-caps text-foreground-low">atoms</th>
              <th className="w-28 px-3 py-2 text-label-12-caps text-foreground-low">topics</th>
              <th className="w-16 px-3 py-2 text-label-12-caps text-foreground-low">pages</th>
              <th className="w-32 px-3 py-2 text-label-12-caps text-foreground-low">tokens in / out</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => {
              const open = openRun === run.id;
              return (
                <Fragment key={run.id}>
                  <tr className={cn("border-b border-border-subtle", open && "bg-tint-5")}>
                    <td className="px-3 py-2.5 align-top text-label-12-mono text-foreground-low">{run.sequence}</td>
                    <td className="px-3 py-2.5 align-top text-foreground-low tabular-nums">{fmtDay(run.sourceDay)}</td>
                    <td className="px-3 py-2.5 align-top">
                      <Button
                        variant="ghost"
                        size="none"
                        aria-expanded={open}
                        onClick={() => setOpenRun(open ? null : run.id)}
                        className="h-auto w-full flex-col items-start justify-start gap-1 rounded-sm text-left text-xs font-normal whitespace-normal hover:bg-transparent"
                      >
                        <span className="leading-5 text-foreground">{run.summary}</span>
                        <span className="text-foreground-low">
                          {inputSummary(run.inputCounts) || "no new inputs; reconciled existing atoms"}
                        </span>
                      </Button>
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      <span className="flex items-center gap-1.5 text-foreground tabular-nums">
                        <span
                          className="inline-block h-1.5 rounded-full bg-success"
                          style={{ width: `${Math.max(2, (run.atomsAddedIds.length / maxAdded) * 56)}px` }}
                          aria-hidden="true"
                        />
                        +{run.atomsAddedIds.length}
                      </span>
                      {run.atomsSupersededIds.length ? (
                        <span className="mt-1 flex items-center gap-1.5 text-muted-foreground tabular-nums">
                          <span
                            className="inline-block h-1.5 rounded-full bg-destructive"
                            style={{ width: `${Math.max(2, (run.atomsSupersededIds.length / maxAdded) * 56)}px` }}
                            aria-hidden="true"
                          />
                          −{run.atomsSupersededIds.length}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5 align-top text-foreground tabular-nums">
                      {run.topicsMinted.length ? `+${run.topicsMinted.length}` : ""}
                      {run.topicsMerged.length ? (
                        <span className="text-foreground-low"> {run.topicsMerged.length} merged</span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5 align-top text-foreground tabular-nums">
                      {run.pagesRecomposed.length || ""}
                    </td>
                    <td className="px-3 py-2.5 align-top text-foreground-low tabular-nums">
                      {fmtInt(run.tokenUsage.input)} / {fmtInt(run.tokenUsage.output)}
                      <span className="mt-0.5 block">{run.tokenUsage.calls ?? 0} calls</span>
                    </td>
                  </tr>
                  {open ? (
                    <tr className="border-b border-border-subtle bg-tint-5">
                      <td colSpan={7}>
                        <RunDetail run={run} atoms={atoms} onAtom={onAtom} />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const ROW = 22;
const TOP = 34;
const LEFT = 300;
const WIDTH = 940;

function TopicTimeline({
  topics,
  atoms,
  days,
  onAtom,
  topicId,
  setTopicId,
}: {
  topics: WikiTopic[];
  atoms: WikiAtom[];
  days: string[];
  onAtom: (id: string) => void;
  topicId: string;
  setTopicId: (id: string) => void;
}) {
  const [show, setShow] = useState("current");
  const topic = topics.find((entry) => entry.id === topicId);

  const rows = useMemo(() => {
    const onTopic = atoms.filter((atom) => !atom.tagged && atom.withheld.length === 0 && atom.topicIds.includes(topicId));
    const pool = show === "current" ? onTopic.filter((atom) => atom.status === "current") : onTopic;
    // A superseded atom is followed by what replaced it, so a chain reads down the rows.
    const byId = Object.fromEntries(pool.map((atom) => [atom.id, atom]));
    const placed = new Set<string>();
    const out: WikiAtom[] = [];
    const place = (atom: WikiAtom) => {
      if (placed.has(atom.id)) return;
      placed.add(atom.id);
      out.push(atom);
      const next = atom.supersededById ? byId[atom.supersededById] : undefined;
      if (next) place(next);
    };
    const byFrom = (a: WikiAtom, b: WikiAtom) => (a.validFrom ?? "").localeCompare(b.validFrom ?? "");
    for (const atom of pool.filter((a) => !a.supersedesIds.some((id) => byId[id])).sort(byFrom)) place(atom);
    for (const atom of [...pool].sort(byFrom)) place(atom);
    return out;
  }, [atoms, topicId, show]);

  const columnWidth = (WIDTH - LEFT - 12) / days.length;
  const height = TOP + Math.max(1, rows.length) * ROW + 16;
  const x = (value: string | null) => {
    if (!value) return LEFT;
    const index = days.indexOf(value.slice(0, 10));
    const minutes = value.length >= 16 ? (Number(value.slice(11, 13)) * 60 + Number(value.slice(14, 16))) / 1440 : 0;
    return LEFT + ((index < 0 ? days.length : index) + minutes) * columnWidth;
  };
  const endX = LEFT + days.length * columnWidth;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={topicId} onValueChange={setTopicId}>
          <SelectTrigger size="sm" className="w-72" aria-label="Topic">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[...topics]
              .sort((a, b) => b.atomCount - a.atomCount)
              .map((entry) => (
                <SelectItem key={entry.id} value={entry.id}>
                  {entry.title} ({entry.atomCount})
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {topic ? (
          <span className="flex items-center gap-2 text-xs text-foreground-low">
            <span className={cn("size-1.5 rounded-full", wikiGroupDot[topic.group])} aria-hidden="true" />
            {topic.type}
            {topic.subtype ? ` / ${topic.subtype}` : ""} · {rows.length} atoms shown
          </span>
        ) : null}
        <ToggleGroup type="single" value={show} onValueChange={(value) => value && setShow(value)} className="ml-auto">
          <ToggleGroupItem value="current">Current</ToggleGroupItem>
          <ToggleGroupItem value="all">All, with what ended</ToggleGroupItem>
        </ToggleGroup>
        {topic?.pageSlug ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/wiki/${topic.pageSlug}`}>Open page</Link>
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-foreground-low">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ background: TYPE_FILL.episode }} aria-hidden="true" />
          dot = an episode on its day
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-6 rounded-full" style={{ background: TYPE_FILL.fact }} aria-hidden="true" />
          bar = validFrom until it ends or the window closes
        </span>
        {(["fact", "preference", "rule", "lesson"] as const).map((type) => (
          <span key={type} className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full" style={{ background: TYPE_FILL[type] }} aria-hidden="true" />
            {type}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto rounded-md p-2 shadow-edge">
        <svg viewBox={`0 0 ${WIDTH} ${height}`} width="100%" style={{ minWidth: 860 }} role="img" aria-label="Atoms on this Topic over the source days">
          {days.map((day, index) => (
            <g key={day}>
              <line
                x1={LEFT + index * columnWidth}
                y1={TOP - 6}
                x2={LEFT + index * columnWidth}
                y2={height - 10}
                stroke="var(--border-subtle)"
              />
              <text x={LEFT + index * columnWidth + 3} y={TOP - 12} fill="var(--foreground-low)" fontSize="9">
                {day.slice(5)}
              </text>
            </g>
          ))}
          {rows.map((atom, index) => {
            const y = TOP + index * ROW;
            const ended = atom.status !== "current";
            const x1 = x(atom.validFrom);
            const x2 = ended ? Math.max(x1 + 2, x(atom.validTo)) : endX;
            return (
              <g key={atom.id} style={{ cursor: "pointer" }} onClick={() => onAtom(atom.id)}>
                <title>{atom.content}</title>
                <rect x={0} y={y} width={WIDTH} height={ROW} fill={index % 2 ? "var(--tint-5)" : "transparent"} />
                <text x={6} y={y + 15} fill={ended ? "var(--foreground-low)" : "var(--foreground)"} fontSize="11">
                  {clip(atom.content, 46)}
                </text>
                {atom.type === "episode" ? (
                  <circle cx={x1} cy={y + ROW / 2} r={4.5} fill={TYPE_FILL.episode} fillOpacity={ended ? 0.45 : 1} />
                ) : (
                  <>
                    <rect
                      x={x1}
                      y={y + 6}
                      width={Math.max(2, x2 - x1)}
                      height={10}
                      rx={3}
                      fill={TYPE_FILL[atom.type] ?? TYPE_FILL.fact}
                      fillOpacity={ended ? 0.3 : 0.9}
                    />
                    {ended ? <rect x={x2 - 1} y={y + 3} width={2} height={16} fill="var(--foreground-low)" /> : null}
                  </>
                )}
              </g>
            );
          })}
          {!rows.length ? (
            <text x={LEFT + 8} y={TOP + 14} fill="var(--foreground-low)" fontSize="11">
              No atom on this Topic at this setting.
            </text>
          ) : null}
        </svg>
      </div>

      {topic?.versions.length ? (
        <div className="flex flex-col gap-2 rounded-md p-3 shadow-edge">
          <span className="text-label-12-caps text-foreground-low">Topic history</span>
          <ul className="flex flex-col gap-2">
            {[...topic.versions].reverse().map((version) => (
              <li key={version.version} className="flex gap-2 text-xs">
                <Badge variant="secondary" className="shrink-0">
                  v{version.version}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="leading-5 text-foreground">{version.changeNote}</p>
                  <p className="text-foreground-low">
                    {fmtStamp(version.createdAt)}
                    {version.dreamRunId ? ` · ${version.dreamRunId}` : version.changedBy ? ` · ${version.changedBy}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function TimeView({
  runs,
  atoms,
  topics,
  pages,
  conflicts,
  days,
  dayFinalSeq,
  job,
}: {
  runs: WikiRun[];
  atoms: WikiAtom[];
  topics: WikiTopic[];
  pages: WikiGraphPage[];
  conflicts: WikiConflict[];
  days: string[];
  dayFinalSeq: number[];
  job: { id: string; model: string; tokensIn: number; tokensOut: number; calls: number };
}) {
  const [tab, setTab] = useState("graph");
  const [openAtom, setOpenAtom] = useState<string | null>(null);
  const [topicId, setTopicId] = useState(() => [...topics].sort((a, b) => b.atomCount - a.atomCount)[0]?.id ?? "");
  const byId = useMemo(() => Object.fromEntries(atoms.map((atom) => [atom.id, atom])), [atoms]);
  const topicTitles = useMemo(
    () => Object.fromEntries(topics.map((topic) => [topic.id, { title: topic.title, group: topic.group }])),
    [topics],
  );

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={tab} onValueChange={setTab} className="min-h-0">
        <TabsList>
          <TabsTrigger value="graph">Topics over time</TabsTrigger>
          <TabsTrigger value="topic">Topic atoms</TabsTrigger>
          <TabsTrigger value="runs">
            Run feed
            <Badge variant="secondary" className="ml-1.5">
              {runs.length}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "graph" ? (
        <TopicsOverTime
          atoms={atoms}
          topics={topics}
          pages={pages}
          runs={runs}
          conflicts={conflicts}
          days={days}
          dayFinalSeq={dayFinalSeq}
          onAtom={setOpenAtom}
          onTopic={(id) => {
            setTopicId(id);
            setTab("topic");
          }}
        />
      ) : null}
      {tab === "runs" ? <RunFeed runs={runs} atoms={byId} onAtom={setOpenAtom} job={job} /> : null}
      {tab === "topic" ? (
        <TopicTimeline
          topics={topics}
          atoms={atoms}
          days={days}
          onAtom={setOpenAtom}
          topicId={topicId}
          setTopicId={setTopicId}
        />
      ) : null}

      <AtomDrawer
        atomId={openAtom}
        atoms={byId}
        topicTitles={topicTitles}
        onOpenAtom={setOpenAtom}
        onClose={() => setOpenAtom(null)}
      />
    </div>
  );
}
