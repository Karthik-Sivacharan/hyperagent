import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconChartBar,
  IconDatabase,
  IconFileText,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";

import { DesktopWindow } from "../desktop-window";
import { Dock } from "../dock";
import {
  Bar,
  Pill,
  Row,
  RowText,
  WindowFooter,
  WindowHeader,
} from "../skeleton";

// Data & Analytics: the weekly metrics report. Behind, bookings over the last
// four weeks as a bar chart with its table; in front, the report with the four
// numbers against last week, the two that moved over 10% carrying a note.

// Weekly bookings (38,200, 38,650, 39,030, 41,380) on an axis from 34,000.
const WEEKS = [
  { height: "h-[47%]", latest: false },
  { height: "h-[52%]", latest: false },
  { height: "h-[56%]", latest: false },
  { height: "h-[82%]", latest: true },
];

function Chart() {
  return (
    <div className="flex gap-3 px-4 pt-7">
      <div className="flex h-40 w-7 shrink-0 flex-col justify-between">
        <Bar className="w-full" />
        <Bar className="w-5/6" />
        <Bar className="w-full" />
        <Bar className="w-5/6" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="relative flex h-40 items-end justify-around border-b border-border-subtle">
          <span className="absolute inset-x-0 top-0 border-t border-dashed border-border-subtle" />
          <span className="absolute inset-x-0 top-1/3 border-t border-dashed border-border-subtle" />
          <span className="absolute inset-x-0 top-2/3 border-t border-dashed border-border-subtle" />
          {WEEKS.map((week, i) => (
            <div
              key={i}
              className={cn(
                "relative w-[15%] rounded-t-md",
                week.height,
                week.latest ? "bg-foreground/70" : "bg-tint-20",
              )}
            >
              {week.latest ? (
                <span className="absolute -top-5.5 left-1/2 -translate-x-1/2 text-xs font-medium text-foreground tabular-nums">
                  41,380
                </span>
              ) : null}
            </div>
          ))}
        </div>
        <div className="flex justify-around">
          {WEEKS.map((week, i) => (
            <div key={i} className="flex w-[15%] justify-center">
              <Bar className={cn("w-3/4", week.latest && "bg-tint-20")} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// The weekly totals under the chart, one row a week, as skeleton cells.
function Table() {
  return (
    <div className="mx-4 mt-5 overflow-hidden rounded-lg shadow-edge">
      <div className="grid h-7 grid-cols-3 items-center gap-4 border-b border-border-subtle bg-surface-secondary px-3">
        <Bar className="w-1/2 bg-tint-20" />
        <Bar className="w-2/5 bg-tint-20" />
        <Bar className="w-1/2 bg-tint-20" />
      </div>
      {["w-3/5", "w-2/3", "w-1/2", "w-3/5"].map((width, i) => (
        <div
          key={i}
          className="grid h-7 grid-cols-3 items-center gap-4 border-b border-border-subtle px-3 last:border-b-0"
        >
          <Bar className={width} />
          <Bar className="w-1/3" />
          <Bar className="w-2/5" />
        </div>
      ))}
    </div>
  );
}

function LastFourWeeks() {
  return (
    <DesktopWindow className="top-[6%] left-[6%] h-[56%] w-[66%]">
      <WindowHeader
        title="Last 4 weeks"
        trailing={
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-surface-secondary px-2 py-0.5 text-xs font-medium text-foreground shadow-edge">
              Bookings
            </span>
            <Bar className="w-12" />
          </div>
        }
      />
      <Chart />
      <Table />
    </DesktopWindow>
  );
}

function Metric({
  name,
  value,
  change,
  up,
  good,
  note = false,
}: {
  name: string;
  value: string;
  change: string;
  up: boolean;
  good: boolean;
  /** Moved over 10%: the report explains it, a line under the name. */
  note?: boolean;
}) {
  const Arrow = up ? IconArrowUpRight : IconArrowDownRight;
  return (
    <Row
      trailing={
        <div className="flex shrink-0 items-center text-xs tabular-nums">
          <span className="w-16 text-right text-muted-foreground">{value}</span>
          <span
            className={cn(
              "flex w-14 items-center justify-end gap-0.5 font-medium",
              good ? "text-success" : "text-destructive",
            )}
          >
            <Arrow
              aria-hidden="true"
              stroke={2}
              className="size-3.5 shrink-0"
            />
            {change}
          </span>
        </div>
      }
    >
      <RowText>{name}</RowText>
      {note ? <Bar className="w-3/5" /> : null}
    </Row>
  );
}

function WeeklyMetrics() {
  return (
    <DesktopWindow className="top-[46%] left-[38%] w-[56%]">
      <WindowHeader
        title="Weekly metrics"
        trailing={<Pill tone="done">Ready</Pill>}
      />
      <Metric name="Bookings" value="41,380" change="6%" up good />
      <Metric
        name="Empty slots"
        value="2,150"
        change="14%"
        up={false}
        good
        note
      />
      <Metric
        name="New clinics"
        value="9"
        change="18%"
        up={false}
        good={false}
        note
      />
      <Metric name="Revenue" value="$184,200" change="3%" up good />
      <WindowFooter trailing="7 to 13 Sep">2 moved over 10%</WindowFooter>
    </DesktopWindow>
  );
}

export function DataScene() {
  return (
    <>
      <LastFourWeeks />
      <WeeklyMetrics />
      <Dock
        apps={[
          { icon: IconChartBar, tone: "ink", open: true },
          { icon: IconFileText, open: true },
          { icon: IconDatabase },
        ]}
      />
    </>
  );
}
