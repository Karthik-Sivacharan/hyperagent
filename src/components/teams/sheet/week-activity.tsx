"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { FleetAgent } from "@/lib/mock/teams";
import { PanelSection } from "@/components/agent-panel/panel-section";

// The agent's last seven days as a row of bars, one per day, today on the
// right. The bars add up to `runsThisWeek`, so the figure in the section
// header and the picture under it are the same number told two ways.
//
// THE NUMBERS ARE DERIVED, NOT STORED. The mock carries one weekly total per
// agent; the split across days comes from a small seeded generator keyed on
// the agent's id (FNV-1a into mulberry32), shaped by a working week (quiet
// weekend, busy Monday to Wednesday, today still in progress) and rounded by
// largest remainder so the parts sum to the total exactly. Same id, same
// bars, on the server and the client: no clock and no Math.random. A paused
// agent has nothing on its last two days (it hit its cap), an agent in error
// barely ran today. The mock's clock is Thursday 10 September 2026, which is
// what the pre-baked relative times in teams.ts are written against, so the
// seven days run Friday to today.
//
// THE MARKS (the dataviz method): one series, so no legend; thin bars with
// 3px rounded data-ends and flat feet on a hairline baseline; the past in
// the de-emphasis tone and today in ink; a day with no runs keeps a 2px stub
// so the week never has a hole. Hover reads a day out in the header, in
// place of the total, rather than floating a tooltip over a 44px chart; the
// full series is in the SVG's accessible name.

const DAYS = [
  { short: "Fri", long: "Friday" },
  { short: "Sat", long: "Saturday" },
  { short: "Sun", long: "Sunday" },
  { short: "Mon", long: "Monday" },
  { short: "Tue", long: "Tuesday" },
  { short: "Wed", long: "Wednesday" },
  { short: "Today", long: "Today" },
] as const;

/** Relative load of each day, Friday to today, before the per-agent jitter. */
const DAY_SHAPE = [1, 0.4, 0.3, 1.15, 1.2, 1.1, 0.75];

function seedOf(id: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Runs per day for the last seven days, Friday to today; sums to `runsThisWeek`. */
export function weekOf(agent: FleetAgent): number[] {
  const next = mulberry32(seedOf(agent.id));
  const weights = DAY_SHAPE.map((shape, day) => {
    if (agent.state === "paused" && day >= 5) return 0;
    const jitter = 0.55 + next() * 0.9;
    return shape * jitter * (agent.state === "error" && day === 6 ? 0.25 : 1);
  });
  const sum = weights.reduce((total, w) => total + w, 0);
  const total = agent.runsThisWeek;
  if (sum === 0 || total === 0) return weights.map(() => 0);

  const raw = weights.map((w) => (w / sum) * total);
  const counts = raw.map(Math.floor);
  let left = total - counts.reduce((acc, n) => acc + n, 0);
  const byRemainder = raw.map((value, day) => ({ day, rest: value - Math.floor(value) })).sort((a, b) => b.rest - a.rest || a.day - b.day);
  for (const { day } of byRemainder) {
    if (left === 0) break;
    counts[day] += 1;
    left -= 1;
  }
  return counts;
}

// The drawing, in its own units: seven 60-wide columns across the sheet's
// 420px of content, so it renders 1:1 at the resting width and scales
// down evenly on a phone.
const COL = 60;
const BAR = 20;
const PLOT = 40;
const TOP = 4;
const HEIGHT = TOP + PLOT;
const RADIUS = 3;
const STUB = 2;

function barPath(x: number, height: number): string {
  const base = HEIGHT;
  const top = base - height;
  const r = Math.min(RADIUS, height, BAR / 2);
  return `M${x} ${base}V${top + r}A${r} ${r} 0 0 1 ${x + r} ${top}H${x + BAR - r}A${r} ${r} 0 0 1 ${x + BAR} ${top + r}V${base}Z`;
}

const runs = (n: number) => `${n} ${n === 1 ? "run" : "runs"}`;

export function WeekActivitySection({ agent }: { agent: FleetAgent }) {
  const counts = weekOf(agent);
  const max = Math.max(...counts);
  const [active, setActive] = useState<number | null>(null);
  const today = counts.length - 1;

  const readout = active === null ? runs(agent.runsThisWeek) : `${DAYS[active].long} · ${runs(counts[active])}`;
  const summary = `Runs per day, last 7 days: ${counts.map((n, day) => `${DAYS[day].long} ${n}`).join(", ")}`;

  return (
    <PanelSection
      meta={{ id: "week", title: "Runs this week", empty: "" }}
      action={<span className="text-sm font-medium text-foreground tabular-nums">{readout}</span>}
    >
      <svg
        role="img"
        aria-label={summary}
        viewBox={`0 0 ${COL * counts.length} ${HEIGHT}`}
        className="block h-auto w-full overflow-visible"
        onPointerLeave={() => setActive(null)}
      >
        <line
          x1={0}
          x2={COL * counts.length}
          y1={HEIGHT - 0.5}
          y2={HEIGHT - 0.5}
          className="stroke-chart-grid"
          strokeWidth={1}
        />
        {counts.map((n, day) => {
          const height = max > 0 && n > 0 ? Math.max(STUB + 1, Math.round((n / max) * PLOT)) : STUB;
          const x = day * COL + (COL - BAR) / 2;
          return (
            <g key={DAYS[day].short}>
              <path
                d={barPath(x, height)}
                className={cn(
                  "transition-[fill] duration-(--duration-fast) ease-out-quart",
                  n === 0
                    ? "fill-chart-track"
                    : day === today
                      ? "fill-foreground"
                      : active === day
                        ? "fill-muted-foreground"
                        : "fill-muted-foreground/40",
                )}
              />
              {/* The hit target is the whole column, not the bar: a short
                  bar is still an easy thing to point at. */}
              <rect
                x={day * COL}
                y={0}
                width={COL}
                height={HEIGHT}
                fill="transparent"
                onPointerEnter={() => setActive(day)}
              />
            </g>
          );
        })}
      </svg>
      <div aria-hidden="true" className="mt-1.5 grid grid-cols-7 text-center text-xs text-foreground-low tabular-nums">
        {DAYS.map((day, index) => (
          <span
            key={day.short}
            className={cn(
              "transition-[color] duration-(--duration-fast) ease-out-quart",
              (active === index || (active === null && index === today)) && "text-foreground",
            )}
          >
            {day.short}
          </span>
        ))}
      </div>
    </PanelSection>
  );
}
