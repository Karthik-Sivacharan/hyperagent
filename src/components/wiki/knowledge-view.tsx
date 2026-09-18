"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SearchInput } from "@/components/patterns/search-input";
import { AtomDrawer } from "@/components/wiki/atom-drawer";
import { wikiGroupDot } from "@/components/wiki/topic-type";
import type { WikiAtom, WikiGroupId, WikiTopic } from "@/lib/mock/wiki";

// Every atom in the store, under the filters the serving paths use: type,
// the agent group that extracted it, scope, Topic, validity and source kind.
// The default list is what a serving path may return; the audit switch adds
// the atoms withheld because their Topic is excluded. Sensitivity-tagged
// atoms are counted and never listed, here included.

const TYPES = ["fact", "preference", "rule", "episode", "lesson"];
const STATES = ["current", "superseded", "retracted", "invalidated"];
const SOURCES = [
  { id: "thread", label: "thread" },
  { id: "document", label: "document" },
  { id: "memory", label: "saved memory" },
];
const ANY = "any";
const PAGE_SIZE = 60;

const fmtDay = (value: string | null) =>
  value
    ? new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "—";

const statusVariant = (status: string) =>
  status === "current" ? "success" : status === "retracted" ? "destructive" : "secondary";

function Filter({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger size="sm" className="w-auto min-w-40" aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  );
}

export function KnowledgeView({
  atoms,
  topics,
  agents,
  groupLabels,
}: {
  atoms: WikiAtom[];
  topics: WikiTopic[];
  agents: { id: string; name: string }[];
  groupLabels: { id: WikiGroupId; label: string }[];
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState(ANY);
  const [extractedBy, setExtractedBy] = useState(ANY);
  const [scope, setScope] = useState(ANY);
  const [group, setGroup] = useState(ANY);
  const [topicId, setTopicId] = useState(ANY);
  const [state, setState] = useState(ANY);
  const [source, setSource] = useState(ANY);
  const [audit, setAudit] = useState(false);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [openAtom, setOpenAtom] = useState<string | null>(null);

  const byId = useMemo(() => Object.fromEntries(atoms.map((atom) => [atom.id, atom])), [atoms]);
  const topicTitles = useMemo(
    () => Object.fromEntries(topics.map((topic) => [topic.id, { title: topic.title, group: topic.group }])),
    [topics],
  );
  const taggedCount = useMemo(() => atoms.filter((atom) => atom.tagged).length, [atoms]);
  const withheldCount = useMemo(() => atoms.filter((atom) => atom.withheld.length && !atom.tagged).length, [atoms]);

  const list = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return atoms
      .filter((atom) => !atom.tagged && (audit || atom.withheld.length === 0))
      .filter((atom) => (type === ANY ? true : atom.type === type))
      .filter((atom) => (extractedBy === ANY ? true : atom.extractionGroup === extractedBy))
      .filter((atom) => (scope === ANY ? true : scope === "private" ? Boolean(atom.namedAgent) : !atom.namedAgent))
      .filter((atom) => (group === ANY ? true : atom.topicIds.some((id) => topicTitles[id]?.group === group)))
      .filter((atom) => (topicId === ANY ? true : atom.topicIds.includes(topicId)))
      .filter((atom) => (state === ANY ? true : state === "withheld" ? atom.withheld.length > 0 : atom.status === state))
      .filter((atom) => (source === ANY ? true : atom.sources.some((entry) => entry.kind === source)))
      .filter((atom) =>
        needle ? `${atom.content} ${atom.appliesWhen} ${atom.id}`.toLowerCase().includes(needle) : true,
      )
      .sort((a, b) => (b.validFrom ?? "").localeCompare(a.validFrom ?? ""));
  }, [atoms, audit, query, type, extractedBy, scope, group, topicId, state, source, topicTitles]);

  const typeCounts = TYPES.map((id) => [id, list.filter((atom) => atom.type === id).length] as const);
  const currentCount = list.filter((atom) => atom.status === "current").length;
  const reset = () => {
    setQuery("");
    setType(ANY);
    setExtractedBy(ANY);
    setScope(ANY);
    setGroup(ANY);
    setTopicId(ANY);
    setState(ANY);
    setSource(ANY);
    setLimit(PAGE_SIZE);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          placeholder="Search atom content"
          aria-label="Search atom content"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-8 w-56"
        />
        <Filter label="all types" value={type} onChange={setType}>
          <SelectItem value={ANY}>all types</SelectItem>
          {TYPES.map((id) => (
            <SelectItem key={id} value={id}>
              type: {id}
            </SelectItem>
          ))}
        </Filter>
        <Filter label="extracted by any agent" value={extractedBy} onChange={setExtractedBy}>
          <SelectItem value={ANY}>extracted by any agent</SelectItem>
          {agents.map((agent) => (
            <SelectItem key={agent.id} value={agent.name}>
              extracted by {agent.name}
            </SelectItem>
          ))}
          <SelectItem value="workspace group">extracted by the workspace group</SelectItem>
        </Filter>
        <Filter label="any scope" value={scope} onChange={setScope}>
          <SelectItem value={ANY}>any scope</SelectItem>
          <SelectItem value="shared">workspace-shared</SelectItem>
          <SelectItem value="private">agent-private</SelectItem>
        </Filter>
        <Filter label="all Topic types" value={group} onChange={setGroup}>
          <SelectItem value={ANY}>all Topic types</SelectItem>
          {groupLabels.map((entry) => (
            <SelectItem key={entry.id} value={entry.id}>
              {entry.label}
            </SelectItem>
          ))}
        </Filter>
        <Filter label="all Topics" value={topicId} onChange={setTopicId}>
          <SelectItem value={ANY}>all Topics</SelectItem>
          {groupLabels.map((entry) => {
            const options = topics.filter((topic) => topic.group === entry.id && (group === ANY || group === entry.id));
            if (!options.length) return null;
            return (
              <SelectGroup key={entry.id}>
                <SelectLabel>{entry.label}</SelectLabel>
                {options.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.title} ({topic.atomCount})
                  </SelectItem>
                ))}
              </SelectGroup>
            );
          })}
        </Filter>
        <Filter label="any validity" value={state} onChange={setState}>
          <SelectItem value={ANY}>any validity</SelectItem>
          {STATES.map((id) => (
            <SelectItem key={id} value={id}>
              {id}
            </SelectItem>
          ))}
          {audit ? <SelectItem value="withheld">withheld</SelectItem> : null}
        </Filter>
        <Filter label="any source" value={source} onChange={setSource}>
          <SelectItem value={ANY}>any source</SelectItem>
          {SOURCES.map((entry) => (
            <SelectItem key={entry.id} value={entry.id}>
              from a {entry.label}
            </SelectItem>
          ))}
        </Filter>
        <Button variant="outline" size="sm" onClick={reset}>
          Reset
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Switch id="audit" checked={audit} onCheckedChange={(checked) => setAudit(checked === true)} />
        <Label htmlFor="audit" className="text-xs font-normal text-muted-foreground">
          History and audit view: include the {withheldCount} atoms withheld because their Topic is excluded
        </Label>
      </div>

      <div className="flex flex-wrap gap-2">
        {typeCounts.map(([id, count]) => (
          <div key={id} className="flex min-w-28 flex-col rounded-md px-3 py-2 shadow-edge">
            <span className="font-heading text-lg text-foreground tabular-nums">{count.toLocaleString("en-US")}</span>
            <span className="text-label-12-caps text-foreground-low">{id} atoms</span>
          </div>
        ))}
        <div className="flex min-w-28 flex-col rounded-md bg-tint-5 px-3 py-2 shadow-edge">
          <span className="font-heading text-lg text-foreground tabular-nums">{currentCount.toLocaleString("en-US")}</span>
          <span className="text-label-12-caps text-foreground-low">
            current of {list.length.toLocaleString("en-US")} shown
          </span>
        </div>
      </div>

      <p className="text-xs text-foreground-low">
        {taggedCount} atoms carry a sensitivity tag and are served nowhere, this view included; only their count is
        shown.
      </p>

      <div className="overflow-hidden rounded-md shadow-edge">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border-subtle bg-tint-5">
              <th className="w-24 px-3 py-2 text-label-12-caps text-foreground-low">type</th>
              <th className="px-3 py-2 text-label-12-caps text-foreground-low">content</th>
              <th className="w-64 px-3 py-2 text-label-12-caps text-foreground-low">topics</th>
              <th className="w-28 px-3 py-2 text-label-12-caps text-foreground-low">validFrom</th>
              <th className="w-32 px-3 py-2 text-label-12-caps text-foreground-low">status</th>
            </tr>
          </thead>
          <tbody>
            {list.slice(0, limit).map((atom) => (
              <tr
                key={atom.id}
                className="cursor-pointer border-b border-border-subtle transition-colors duration-(--duration-fast) ease-out-quart last:border-0 hover:bg-tint-10"
                onClick={() => setOpenAtom(atom.id)}
              >
                <td className="px-3 py-2.5 align-top">
                  <Badge variant="outline">{atom.type}</Badge>
                </td>
                <td className="px-3 py-2.5 align-top">
                  <Button
                    variant="ghost"
                    size="none"
                    onClick={() => setOpenAtom(atom.id)}
                    className={cn(
                      "h-auto w-full justify-start rounded-sm text-left text-xs leading-5 font-normal whitespace-normal hover:bg-transparent",
                      atom.status !== "current" ? "text-muted-foreground line-through" : "text-foreground",
                    )}
                  >
                    {atom.content}
                  </Button>
                  {atom.withheld.length || atom.namedAgent ? (
                    <span className="mt-1 flex flex-wrap gap-1">
                      {atom.namedAgent ? <Badge variant="secondary">private to {atom.namedAgent}</Badge> : null}
                      {atom.withheld.map((reason) => (
                        <Badge key={reason} variant="warning">
                          withheld · {reason}
                        </Badge>
                      ))}
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-2.5 align-top">
                  <span className="flex flex-wrap gap-1">
                    {atom.topicIds.slice(0, 3).map((id) => (
                      <Badge key={id} variant="outline" className="gap-1.5">
                        <span
                          className={cn("size-1.5 rounded-full", wikiGroupDot[topicTitles[id]?.group ?? "concept"])}
                          aria-hidden="true"
                        />
                        {topicTitles[id]?.title ?? id}
                      </Badge>
                    ))}
                    {atom.topicIds.length > 3 ? (
                      <span className="text-foreground-low">+{atom.topicIds.length - 3}</span>
                    ) : null}
                  </span>
                </td>
                <td className="px-3 py-2.5 align-top text-foreground-low tabular-nums">
                  {fmtDay(atom.validFrom)}
                  <span className="mt-0.5 block">{atom.extractionGroup}</span>
                </td>
                <td className="px-3 py-2.5 align-top">
                  <Badge variant={statusVariant(atom.status)}>{atom.statusLabel}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 ? <p className="p-4 text-xs text-foreground-low">No atoms match these filters.</p> : null}
        {list.length > limit ? (
          <div className="flex justify-center border-t border-border-subtle p-3">
            <Button variant="outline" size="sm" onClick={() => setLimit((current) => current + PAGE_SIZE * 2)}>
              Show more of the {(list.length - limit).toLocaleString("en-US")} remaining
            </Button>
          </div>
        ) : null}
      </div>

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
