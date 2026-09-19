"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerSkipBack,
  IconPlayerSkipForward,
  IconChevronLeft,
  IconChevronRight,
  IconArrowUpRight,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ALPHA_DECAY,
  ALPHA_MIN,
  GRAPH_HEIGHT,
  GRAPH_WIDTH,
  LENSES,
  REHEAT,
  activeAt,
  buildGraphModel,
  cardOpen,
  edgeWeightAt,
  ensurePositions,
  layoutTick,
  visibleGraph,
  type AtomEdge,
  type DisputeEdge,
  type LensId,
  type PageEdge,
  type Point,
} from "@/components/wiki/graph-model";
import { wikiGroupDot } from "@/components/wiki/topic-type";
import type { WikiAtom, WikiConflict, WikiGraphPage, WikiGroupId, WikiRun, WikiTopic } from "@/lib/mock/wiki";

// Topics over time: the graph of what the workspace knew at a frame, played
// back over the window. Ported from the prototype — same force layout, same
// three lenses, same transport. React owns the element set for a frame; the
// simulation writes transforms straight to the DOM, so a tick never re-renders.

const SPEEDS = [
  { value: 1200, label: "slow" },
  { value: 700, label: "normal" },
  { value: 300, label: "fast" },
];

/** Group dot colours as SVG paint: the same six categorical tokens the dots use. */
const GROUP_FILL: Record<WikiGroupId, string> = {
  workspace: "var(--chart-2)",
  person: "var(--chart-3)",
  agent: "var(--chart-1)",
  organization: "var(--chart-4)",
  team: "var(--chart-4)",
  project: "var(--chart-5)",
  system: "var(--chart-6)",
  process: "var(--chart-4)",
  location: "var(--chart-3)",
  product: "var(--chart-6)",
  concept: "var(--chart-2)",
};

const fmtDay = (value: string | null | undefined) =>
  value
    ? new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "—";

const fmtInt = (value: number) => value.toLocaleString("en-US");
const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

export function TopicsOverTime({
  atoms,
  topics,
  pages,
  runs,
  conflicts,
  days,
  dayFinalSeq,
  onAtom,
  onTopic,
  groupLabels,
}: {
  atoms: WikiAtom[];
  topics: WikiTopic[];
  pages: WikiGraphPage[];
  runs: WikiRun[];
  conflicts: WikiConflict[];
  days: string[];
  dayFinalSeq: number[];
  onAtom: (id: string) => void;
  onTopic: (id: string) => void;
  groupLabels: Record<string, string>;
}) {
  const [mode, setMode] = useState<"day" | "run">("day");
  const [day, setDay] = useState(0);
  const [runSeq, setRunSeq] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(700);
  const [lens, setLens] = useState<LensId>("atoms");
  const [minWeight, setMinWeight] = useState(LENSES.atoms.defaultMin);
  const [pagesOnly, setPagesOnly] = useState(false);
  const [hideHubs, setHideHubs] = useState(false);
  const [hiddenGroups, setHiddenGroups] = useState<Set<string>>(new Set());
  const [hovered, setHovered] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);

  const model = useMemo(
    () => buildGraphModel({ atoms, topics, pages, conflicts }),
    [atoms, topics, pages, conflicts],
  );
  const byId = useMemo(() => Object.fromEntries(atoms.map((atom) => [atom.id, atom])), [atoms]);

  const seq = mode === "run" ? runSeq : dayFinalSeq[day];
  const previousSeq = mode === "run" ? seq - 1 : day > 0 ? dayFinalSeq[day - 1] : 0;

  const vis = useMemo(
    () => visibleGraph(model, { seq, lens, minWeight, hiddenGroups, hideHubs, pagesOnly }),
    [model, seq, lens, minWeight, hiddenGroups, hideHubs, pagesOnly],
  );

  // ---- the simulation: positions live in a ref, ticks write attributes straight to the DOM
  const positions = useRef(new Map<string, Point>());
  const alpha = useRef(0);
  const nodeEls = useRef(new Map<string, SVGGElement>());
  const edgeEls = useRef(new Map<string, SVGGElement>());
  // Hover freezes the layout, so it must not re-run the effect (that would
  // reheat the simulation every time the pointer crosses a node).
  const hoveredRef = useRef<string | null>(null);
  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  useEffect(() => {
    const fresh = positions.current.size === 0;
    ensurePositions(vis, positions.current);
    // A cold graph opens at full alpha and expands out of its seed cloud; a
    // frame change only reheats. The first repulsion burst is absorbed before
    // the first paint, so the view never flashes as a clump.
    if (fresh) {
      layoutTick(vis, positions.current, 8, 1);
      alpha.current = 1;
    } else {
      alpha.current = Math.max(alpha.current, REHEAT);
    }

    const paint = () => {
      for (const { node } of vis.nodes) {
        const element = nodeEls.current.get(node.id);
        const point = positions.current.get(node.id);
        if (element && point) {
          element.setAttribute("transform", `translate(${point.x.toFixed(1)},${point.y.toFixed(1)})`);
        }
      }
      for (const { edge, key } of vis.edges) {
        const element = edgeEls.current.get(key);
        const e = edge as AtomEdge;
        const pa = positions.current.get(e.a);
        const pb = positions.current.get(e.b);
        if (!element || !pa || !pb) continue;
        for (const line of element.querySelectorAll("line")) {
          line.setAttribute("x1", pa.x.toFixed(1));
          line.setAttribute("y1", pa.y.toFixed(1));
          line.setAttribute("x2", pb.x.toFixed(1));
          line.setAttribute("y2", pb.y.toFixed(1));
        }
      }
    };

    let raf = 0;
    const loop = () => {
      // The layout freezes under the pointer: hovering changes strokes, never geometry.
      if (alpha.current > ALPHA_MIN && !hoveredRef.current) {
        const moved = layoutTick(vis, positions.current, 2, alpha.current);
        alpha.current *= ALPHA_DECAY;
        if (moved < 0.02) alpha.current = 0;
      }
      paint();
      raf = alpha.current > ALPHA_MIN ? requestAnimationFrame(loop) : 0;
    };

    paint();
    if (alpha.current > ALPHA_MIN) raf = requestAnimationFrame(loop);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [vis]);

  // ---- playback
  const lastFrameIndex = mode === "run" ? runs.length : days.length - 1;
  const frameIndex = mode === "run" ? runSeq : day;
  const step = (delta: number) => {
    if (mode === "run") setRunSeq((current) => Math.min(runs.length, Math.max(1, current + delta)));
    else setDay((current) => Math.min(days.length - 1, Math.max(0, current + delta)));
  };

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      if (mode === "run") {
        setRunSeq((current) => {
          if (current >= runs.length) {
            setPlaying(false);
            return current;
          }
          return current + 1;
        });
      } else {
        setDay((current) => {
          if (current >= days.length - 1) {
            setPlaying(false);
            return current;
          }
          return current + 1;
        });
      }
    }, speed);
    return () => window.clearInterval(timer);
  }, [playing, speed, mode, runs.length, days.length]);

  const play = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (frameIndex >= lastFrameIndex) {
      if (mode === "run") setRunSeq(1);
      else setDay(0);
    }
    setPlaying(true);
  };

  // ---- what changed at this frame
  const run = runs[seq - 1];
  const servable = useMemo(() => atoms.filter((atom) => !atom.withheld.length), [atoms]);
  const learned = useMemo(() => {
    const pool =
      mode === "run"
        ? (run?.atomsAddedIds ?? []).map((id) => byId[id]).filter(Boolean)
        : servable.filter((atom) => atom.dayIdx === day);
    return pool
      .filter((atom) => !atom.withheld.length && activeAt(atom, seq))
      .sort((a, b) => (a.validFrom ?? "").localeCompare(b.validFrom ?? ""));
  }, [mode, run, byId, servable, day, seq]);

  const retired = useMemo(() => {
    const pool =
      mode === "run"
        ? (run?.atomsSupersededIds ?? []).map((id) => byId[id]).filter(Boolean)
        : servable.filter(
            (atom) => atom.retiredSeq != null && runs[atom.retiredSeq - 1]?.sourceDay === days[day],
          );
    return pool
      .filter((atom) => !atom.withheld.length)
      .sort((a, b) => (a.validTo ?? "").localeCompare(b.validTo ?? ""));
  }, [mode, run, byId, servable, runs, days, day]);

  const liveCount = servable.filter((atom) => activeAt(atom, seq)).length;
  const newAtoms = servable.filter((atom) => (mode === "run" ? atom.createdSeq === seq : atom.dayIdx === day)).length;
  const nodeIdsAtFrame = new Set(model.nodes.filter((node) => node.firstSeq <= seq).map((node) => node.id));
  const newConnections = model.lenses[lens].filter(
    (edge) =>
      nodeIdsAtFrame.has(edge.a) &&
      nodeIdsAtFrame.has(edge.b) &&
      edgeWeightAt(edge, lens, seq) >= 1 &&
      edgeWeightAt(edge, lens, previousSeq) === 0,
  ).length;
  const topicsTouched = model.nodes.filter(
    (node) =>
      node.firstSeq <= seq &&
      node.atoms.some(
        (atom) =>
          (atom.createdSeq > previousSeq && atom.createdSeq <= seq) ||
          (atom.retiredSeq != null && atom.retiredSeq > previousSeq && atom.retiredSeq <= seq),
      ),
  ).length;

  const frameLabel =
    mode === "run"
      ? `${run?.id ?? ""} · ${fmtDay(run?.sourceDay)}`
      : `${fmtDay(days[day])} · day ${day + 1} of ${days.length}`;
  const feedTitle =
    mode === "run"
      ? `${run?.id ?? ""} · ${run?.summary ?? ""}`
      : (() => {
          const today = runs.filter((entry) => entry.sourceDay === days[day]);
          return `${fmtDay(days[day])} · ${today.length} run${today.length === 1 ? "" : "s"}${today.length ? ` (${today.map((entry) => entry.id).join(", ")})` : " (none; state carried forward)"}`;
        })();

  const groupsPresent = [...new Set(model.nodes.map((node) => node.group))];
  const selected = selectedEdge ? vis.edges.find((entry) => entry.key === selectedEdge) : undefined;
  const openCards = model.cards.filter((card) => cardOpen(card, seq)).sort((a, b) => b.appearSeq - a.appearSeq);

  const neighbours = useMemo(() => {
    if (!hovered) return new Set<string>();
    const set = new Set<string>([hovered]);
    for (const { edge } of vis.edges) {
      const e = edge as AtomEdge;
      if (e.a === hovered) set.add(e.b);
      if (e.b === hovered) set.add(e.a);
    }
    return set;
  }, [hovered, vis]);

  const toggleGroup = (id: string) =>
    setHiddenGroups((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="flex flex-col gap-4">
      {/* transport */}
      <div className="flex flex-wrap items-center gap-3 rounded-md p-3 shadow-edge">
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(value) => {
            if (!value) return;
            setPlaying(false);
            setMode(value as "day" | "run");
          }}
        >
          <ToggleGroupItem value="day">By day</ToggleGroupItem>
          <ToggleGroupItem value="run">By run</ToggleGroupItem>
        </ToggleGroup>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Jump to start"
            onClick={() => {
              setPlaying(false);
              if (mode === "run") setRunSeq(1);
              else setDay(0);
            }}
          >
            <IconPlayerSkipBack className="size-4" aria-hidden="true" />
          </Button>
          <Button variant="default" size="sm" onClick={play}>
            {playing ? (
              <IconPlayerPause className="size-4" aria-hidden="true" />
            ) : (
              <IconPlayerPlay className="size-4" aria-hidden="true" />
            )}
            {playing ? "Pause" : "Play"}
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Jump to end"
            onClick={() => {
              setPlaying(false);
              if (mode === "run") setRunSeq(runs.length);
              else setDay(days.length - 1);
            }}
          >
            <IconPlayerSkipForward className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Previous frame"
          onClick={() => {
            setPlaying(false);
            step(-1);
          }}
        >
          <IconChevronLeft className="size-4" aria-hidden="true" />
        </Button>

        <Slider
          className="min-w-40 flex-1"
          aria-label={mode === "run" ? "Run" : "Day"}
          min={mode === "run" ? 1 : 0}
          max={lastFrameIndex}
          step={1}
          value={[frameIndex]}
          onValueChange={([value]) => {
            setPlaying(false);
            if (mode === "run") setRunSeq(value);
            else setDay(value);
          }}
        />

        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Next frame"
          onClick={() => {
            setPlaying(false);
            step(1);
          }}
        >
          <IconChevronRight className="size-4" aria-hidden="true" />
        </Button>

        <span className="text-sm text-foreground tabular-nums">{frameLabel}</span>

        <ToggleGroup
          type="single"
          value={String(speed)}
          onValueChange={(value) => value && setSpeed(Number(value))}
          className="ml-auto"
        >
          {SPEEDS.map((entry) => (
            <ToggleGroupItem key={entry.value} value={String(entry.value)}>
              {entry.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* scope totals */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border-subtle pb-4">
        <div className="flex flex-col">
          <span className="text-xs text-foreground-low">{mode === "run" ? frameLabel : fmtDay(days[day])}</span>
          <span className="font-heading text-base text-foreground">
            What changed {mode === "run" ? "in this run" : "this day"} · scope totals
          </span>
        </div>
        <div className="flex flex-wrap gap-6">
          {[
            [newAtoms, "new atoms"],
            [retired.length, "superseded / ended"],
            [newConnections, "new connections"],
            [topicsTouched, "Topics touched"],
          ].map(([value, label]) => (
            <div key={label as string} className="flex flex-col">
              <span className="font-heading text-2xl text-foreground tabular-nums">{fmtInt(value as number)}</span>
              <span className="text-xs text-foreground-low">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* lens controls */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          nodes:
          <ToggleGroup
            type="single"
            value={pagesOnly ? "pages" : "all"}
            onValueChange={(value) => {
              if (!value) return;
              setSelectedEdge(null);
              setPagesOnly(value === "pages");
            }}
          >
            <ToggleGroupItem value="pages">Pages</ToggleGroupItem>
            <ToggleGroupItem value="all">All Topics</ToggleGroupItem>
          </ToggleGroup>
        </span>
        <span className="flex items-center gap-2">
          connected when:
          <ToggleGroup
            type="single"
            value={lens}
            onValueChange={(value) => {
              if (!value) return;
              setSelectedEdge(null);
              setLens(value as LensId);
              setMinWeight(LENSES[value as LensId].defaultMin);
            }}
          >
            {(Object.keys(LENSES) as LensId[]).map((id) => (
              <ToggleGroupItem key={id} value={id}>
                {LENSES[id].label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </span>
        <span className="flex items-center gap-2">
          <span>{LENSES[lens].weightLabel}</span>
          <Slider
            className="w-24"
            aria-label={LENSES[lens].weightLabel}
            min={1}
            max={LENSES[lens].max}
            step={1}
            value={[Math.min(LENSES[lens].max, minWeight)]}
            onValueChange={([value]) => setMinWeight(value)}
          />
          <span className="font-medium text-foreground tabular-nums">{minWeight}</span>
        </span>
        <span className="flex items-center gap-2">
          <Checkbox id="hubs" checked={hideHubs} onCheckedChange={(checked) => setHideHubs(checked === true)} />
          <Label htmlFor="hubs" className="text-xs font-normal text-muted-foreground">
            hide hub Topics
          </Label>
        </span>
      </div>

      {/* legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span className="tabular-nums">{fmtInt(liveCount)} atoms active at this frame</span>
        <span className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-2">
          {groupsPresent.map((id) => (
            <Button
              key={id}
              variant="ghost"
              size="none"
              onClick={() => toggleGroup(id)}
              aria-pressed={!hiddenGroups.has(id)}
              className={cn(
                "h-auto gap-1.5 rounded-sm px-1.5 py-0.5 text-xs font-normal hover:bg-tint-10",
                hiddenGroups.has(id) ? "text-foreground-low line-through" : "text-muted-foreground",
              )}
            >
              <span className={cn("size-1.5 rounded-full", wikiGroupDot[id])} aria-hidden="true" />
              {groupLabels[id] ?? groupLabels.concept}
            </Button>
          ))}
          {!pagesOnly ? (
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full border border-dashed border-foreground-low" aria-hidden="true" />
              no page yet
            </span>
          ) : null}
          <span className="flex items-center gap-1.5">
            <span
              className="size-1.5 rounded-full bg-background ring-3 ring-foreground-low/25"
              aria-hidden="true"
            />
            soft ring = updated {mode === "run" ? "this run" : "this day"}
          </span>
          {lens === "dispute" ? (
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-4 border-t-2 border-dashed border-destructive" aria-hidden="true" />
              dashed = one open conflict
            </span>
          ) : null}
        </span>
      </div>

      {lens === "dispute" ? (
        <p className="max-w-[96ch] text-xs leading-5 text-muted-foreground">
          A dispute is two current atoms that contradict each other: reconciliation kept both and recorded the conflict
          instead of picking a winner. The badge on a Topic counts the open conflicts touching it at this frame; a
          dashed edge is one open conflict whose two sides sit on these two Topics.
        </p>
      ) : null}

      {/* the graph */}
      <div className="relative overflow-hidden rounded-md shadow-edge">
        <svg
          viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
          className={cn("w-full", hovered && "[&_.node:not(.hov):not(.nb)]:opacity-35")}
          style={{ maxHeight: 660 }}
          role="img"
          aria-label="Topics and their connections at this frame"
        >
          <g>
            {vis.edges.map(({ edge, weight, key }) => {
              const e = edge as AtomEdge;
              const near = hovered ? e.a === hovered || e.b === hovered : false;
              return (
                <g
                  key={key}
                  ref={(element) => {
                    if (element) edgeEls.current.set(key, element);
                    else edgeEls.current.delete(key);
                  }}
                  className="cursor-pointer"
                  onClick={() => setSelectedEdge(selectedEdge === key ? null : key)}
                >
                  <line
                    stroke={lens === "dispute" ? "var(--destructive)" : "var(--foreground)"}
                    strokeOpacity={selectedEdge === key ? 0.9 : near ? 0.5 : lens === "dispute" ? 0.7 : 0.16}
                    strokeWidth={Math.min(3.7, 0.65 + 0.15 * weight + 0.5 * Math.sqrt(weight))}
                    strokeDasharray={lens === "dispute" ? "6 4" : undefined}
                  />
                  <line stroke="transparent" strokeWidth={12} />
                </g>
              );
            })}
          </g>
          <g>
            {vis.nodes.map(({ node, count, r, disputes }) => {
              const solid = node.pageSeq != null && node.pageSeq <= seq;
              const colour = GROUP_FILL[node.group] ?? GROUP_FILL.concept;
              const touched = node.atoms.some(
                (atom) =>
                  (atom.createdSeq > previousSeq && atom.createdSeq <= seq) ||
                  (atom.retiredSeq != null && atom.retiredSeq > previousSeq && atom.retiredSeq <= seq),
              );
              return (
                <g
                  key={node.id}
                  ref={(element) => {
                    if (element) nodeEls.current.set(node.id, element);
                    else nodeEls.current.delete(node.id);
                  }}
                  className={cn(
                    "node cursor-pointer",
                    hovered === node.id && "hov",
                    hovered && neighbours.has(node.id) && "nb",
                  )}
                  onMouseEnter={() => setHovered(node.id)}
                  onMouseLeave={() => setHovered((current) => (current === node.id ? null : current))}
                  onClick={() => onTopic(node.id)}
                >
                  <title>
                    {`${node.topic.title} · ${count} active atoms${solid ? " · page composed" : " · no page yet"}`}
                  </title>
                  {touched ? (
                    <circle r={r + 4} fill="none" stroke={colour} strokeWidth={3} strokeOpacity={0.35} />
                  ) : null}
                  <circle
                    r={r}
                    fill={solid ? colour : "var(--background)"}
                    fillOpacity={solid ? 0.72 : 1}
                    stroke={solid ? "var(--background)" : "var(--foreground-low)"}
                    strokeWidth={1.5}
                    strokeDasharray={solid ? undefined : "3 2"}
                  />
                  {disputes ? (
                    <g transform={`translate(${(r * 0.75).toFixed(1)},${(-r * 0.75).toFixed(1)})`}>
                      <circle r={7} fill="var(--destructive)" stroke="var(--background)" strokeWidth={1.5} />
                      <text y={2.5} textAnchor="middle" fontSize={8.5} fontWeight={600} fill="var(--destructive-foreground, #fff)">
                        {disputes}
                      </text>
                    </g>
                  ) : null}
                  <text
                    y={r + 11}
                    textAnchor="middle"
                    fontSize={10}
                    fill={hovered === node.id ? "var(--foreground)" : "var(--muted-foreground)"}
                  >
                    {clip(node.topic.title, 22)}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
        <p className="absolute right-3 bottom-2 text-xs text-foreground-low">
          {vis.nodes.length} Topics · {vis.edges.length} connections at this frame · {LENSES[lens].label}
        </p>
      </div>

      {/* the selected connection */}
      {selected ? (
        <EdgePanel
          entry={selected}
          lens={lens}
          seq={seq}
          topics={topics}
          onAtom={onAtom}
          onClose={() => setSelectedEdge(null)}
        />
      ) : null}

      {/* what the frame learned and retired */}
      {lens === "dispute" ? (
        <section className="flex flex-col gap-2 rounded-md p-3 shadow-edge">
          <div className="flex items-center gap-2">
            <span className="text-label-12-caps text-foreground-low">Disputes at this frame</span>
            <Badge variant="secondary">{openCards.length}</Badge>
            <span className="ml-auto text-xs text-foreground-low">
              one row per retained conflict; both sides stay current until a later run settles it
            </span>
          </div>
          {openCards.length ? (
            <ul className="flex flex-col gap-2">
              {openCards.map((card) => (
                <li key={card.id} className="flex flex-col gap-1 rounded-sm p-2.5 shadow-edge">
                  {card.sides.map((side, index) => (
                    <div key={index} className="flex gap-2 text-xs">
                      <Badge variant="outline" className="shrink-0">
                        side {index === 0 ? "A" : "B"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="none"
                        onClick={() => onAtom(side[0].id)}
                        className="h-auto min-w-0 flex-1 justify-start text-left text-xs leading-5 font-normal whitespace-normal hover:bg-transparent"
                      >
                        {side[0].content}
                      </Button>
                    </div>
                  ))}
                  <span className="flex flex-wrap items-center gap-1.5">
                    {card.topics.map((id) => {
                      const topic = topics.find((entry) => entry.id === id);
                      return (
                        <Badge key={id} variant="outline" className="gap-1.5">
                          <span
                            className={cn("size-1.5 rounded-full", wikiGroupDot[topic?.group ?? "concept"])}
                            aria-hidden="true"
                          />
                          {topic?.title ?? id}
                        </Badge>
                      );
                    })}
                    <span className="text-label-12-mono text-foreground-low">{card.id}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-foreground-low">No open conflict at this frame.</p>
          )}
        </section>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Feed
            title={`Learned ${mode === "run" ? "in this run" : "this day"}`}
            count={learned.length}
            note={feedTitle}
            empty="Nothing learned at this frame."
            atoms={learned}
            onAtom={onAtom}
          />
          <Feed
            title={`Superseded or retracted ${mode === "run" ? "in this run" : "this day"}`}
            count={retired.length}
            note="retired by a run at this frame, whenever the atom was learned"
            empty="Nothing retired at this frame."
            atoms={retired}
            onAtom={onAtom}
            successorOf={(atom) => (atom.supersededById ? byId[atom.supersededById] : undefined)}
          />
        </div>
      )}
    </div>
  );
}

function Feed({
  title,
  count,
  note,
  empty,
  atoms,
  onAtom,
  successorOf,
}: {
  title: string;
  count: number;
  note: string;
  empty: string;
  atoms: WikiAtom[];
  onAtom: (id: string) => void;
  successorOf?: (atom: WikiAtom) => WikiAtom | undefined;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-2 rounded-md p-3 shadow-edge">
      <div className="flex items-center gap-2">
        <span className="text-label-12-caps text-foreground-low">{title}</span>
        <Badge variant="secondary">{count}</Badge>
        <span className="ml-auto truncate text-xs text-foreground-low" title={note}>
          {note}
        </span>
      </div>
      {atoms.length ? (
        <ul className="flex max-h-96 flex-col gap-1 overflow-y-auto">
          {atoms.map((atom, index) => {
            const successor = successorOf?.(atom);
            return (
              <li
                key={atom.id}
                className="flex items-start gap-2 rounded-sm p-2 motion-safe:animate-fade-in"
                style={{ animationDelay: `${Math.min(index, 14) * 35}ms` }}
              >
                <div className="min-w-0 flex-1">
                  <span className={cn("block text-xs leading-5", successor ? "text-muted-foreground line-through" : "text-foreground")}>
                    {atom.content}
                  </span>
                  {successor ? (
                    <span className="mt-0.5 block text-xs text-foreground-low">
                      → replaced by:{" "}
                      <Button
                        variant="ghost"
                        size="none"
                        onClick={() => onAtom(successor.id)}
                        className="h-auto text-left text-xs font-normal whitespace-normal text-foreground underline decoration-border underline-offset-4 hover:bg-transparent hover:decoration-brand-accent"
                      >
                        {clip(successor.content, 100)}
                      </Button>
                    </span>
                  ) : null}
                </div>
                <Badge variant="outline" className="shrink-0">
                  {atom.type}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Open ${atom.id}`}
                  onClick={() => onAtom(atom.id)}
                  className="shrink-0"
                >
                  <IconArrowUpRight className="size-3.5" aria-hidden="true" />
                </Button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-xs text-foreground-low">{empty}</p>
      )}
    </section>
  );
}

function EdgePanel({
  entry,
  lens,
  seq,
  topics,
  onAtom,
  onClose,
}: {
  entry: { edge: AtomEdge | PageEdge | DisputeEdge; weight: number; key: string };
  lens: LensId;
  seq: number;
  topics: WikiTopic[];
  onAtom: (id: string) => void;
  onClose: () => void;
}) {
  const title = (id: string) => topics.find((topic) => topic.id === id)?.title ?? id;
  const edge = entry.edge as AtomEdge & PageEdge & DisputeEdge;

  const atomList = (list: WikiAtom[]) => (
    <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
      {list
        .filter((atom) => atom.createdSeq <= seq)
        .sort((a, b) => (a.validFrom ?? "").localeCompare(b.validFrom ?? ""))
        .map((atom) => (
          <li key={atom.id}>
            <Button
              variant="ghost"
              size="none"
              onClick={() => onAtom(atom.id)}
              className={cn(
                "h-auto w-full justify-start rounded-sm p-2 text-left text-xs leading-5 font-normal whitespace-normal hover:bg-tint-10",
                activeAt(atom, seq) ? "text-foreground" : "text-muted-foreground line-through",
              )}
            >
              {atom.content}
            </Button>
          </li>
        ))}
    </ul>
  );

  let head = "";
  let body: React.ReactNode = null;
  if (lens === "atoms") {
    head = `${edge.atoms.filter((atom) => activeAt(atom, seq)).length} shared atoms active at this frame (${edge.atoms.length} ever)`;
    body = atomList(edge.atoms);
  } else if (lens === "pages") {
    head = `${edge.count} mentions across the two pages`;
    body = (
      <>
        <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
          {edge.dirs.map((dir, index) => (
            <li key={index}>
              {title(dir.from)}’s page → {title(dir.to)}: {dir.wikilinks} wikilink{dir.wikilinks === 1 ? "" : "s"},{" "}
              {dir.cites} cited atom{dir.cites === 1 ? "" : "s"} linked to it
            </li>
          ))}
        </ul>
        {edge.atoms.length ? atomList(edge.atoms) : null}
      </>
    );
  } else {
    const open = edge.cards.filter((card) => cardOpen(card, seq));
    head = `${open.length} open conflict${open.length === 1 ? "" : "s"} between these Topics`;
    body = (
      <div className="flex flex-col gap-3">
        {open.map((card) => (
          <div key={card.id} className="flex flex-col gap-1">
            <span className="text-xs text-foreground-low">
              {card.id} · reconciliation declined to pick a side
              {card.others.length ? ` · also touches ${card.others.map(title).join(", ")}` : ""}
            </span>
            {atomList(card.atoms)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-2 rounded-md p-3 shadow-edge">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-sm text-foreground">
            {title(edge.a)} × {title(edge.b)}
          </h3>
          <p className="text-xs text-foreground-low">{head}</p>
        </div>
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
      {body}
    </section>
  );
}
