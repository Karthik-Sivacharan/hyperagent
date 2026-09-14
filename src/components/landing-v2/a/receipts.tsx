import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { A11Y, RECEIPTS, type RunRow } from "./content";
import { LandingSection } from "./section";

const STATE_VARIANT: Record<
  RunRow["state"],
  "success" | "brand" | "secondary"
> = {
  done: "success",
  waiting: "brand",
  running: "secondary",
};

const CELL = "px-4 py-3 align-top";
const NUMERIC = "text-right tabular-nums whitespace-nowrap";

// Cost and quality as a real table: one Monday morning's runs with time,
// agent, job, duration, cost, judge score and state, and a total row.
// Figures are tabular and right-aligned so the columns read down; the one
// row waiting on a person is the only brand tint in the table. Beside it,
// the two facts a buyer asks about: who scores a run and what a run costs.
export function Receipts() {
  const { id, heading, columns, states, rows, total, notes } = RECEIPTS;
  return (
    <LandingSection id={id} heading={heading}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] lg:items-start lg:gap-12">
        <dl className="flex flex-col gap-8">
          {notes.map((note) => (
            <div key={note.title} className="flex flex-col gap-1.5">
              <dt className="text-base font-medium text-foreground">
                {note.title}
              </dt>
              <dd className="text-base text-muted-foreground">{note.body}</dd>
            </div>
          ))}
        </dl>

        <div className="overflow-x-auto rounded-3xl bg-card shadow-card">
          <table className="w-full min-w-2xl text-sm text-foreground">
            <caption className="sr-only">{A11Y.runs}</caption>
            <thead>
              <tr className="text-label-12-caps text-foreground-low">
                <th
                  scope="col"
                  className={cn(CELL, "pt-4 text-left font-medium")}
                >
                  {columns.time}
                </th>
                <th
                  scope="col"
                  className={cn(CELL, "pt-4 text-left font-medium")}
                >
                  {columns.agent}
                </th>
                <th
                  scope="col"
                  className={cn(CELL, "pt-4 text-left font-medium")}
                >
                  {columns.job}
                </th>
                <th
                  scope="col"
                  className={cn(CELL, NUMERIC, "pt-4 font-medium")}
                >
                  {columns.duration}
                </th>
                <th
                  scope="col"
                  className={cn(CELL, NUMERIC, "pt-4 font-medium")}
                >
                  {columns.cost}
                </th>
                <th
                  scope="col"
                  className={cn(CELL, NUMERIC, "pt-4 font-medium")}
                >
                  {columns.score}
                </th>
                <th
                  scope="col"
                  className={cn(CELL, "pt-4 text-left font-medium")}
                >
                  {columns.state}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={`${row.time}-${row.job}`}
                  className="border-t border-border-subtle"
                >
                  <td className={cn(CELL, "text-foreground-low tabular-nums")}>
                    {row.time}
                  </td>
                  <td className={cn(CELL, "whitespace-nowrap")}>{row.agent}</td>
                  <td className={cn(CELL, "text-muted-foreground")}>
                    {row.job}
                  </td>
                  <td className={cn(CELL, NUMERIC)}>{row.duration}</td>
                  <td className={cn(CELL, NUMERIC)}>{row.cost}</td>
                  <td
                    className={cn(
                      CELL,
                      NUMERIC,
                      row.score === "" && "text-foreground-low",
                    )}
                  >
                    {row.score === "" ? "–" : row.score}
                  </td>
                  <td className={CELL}>
                    <Badge variant={STATE_VARIANT[row.state]}>
                      {states[row.state]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border-subtle bg-surface-secondary">
                <th
                  scope="row"
                  colSpan={3}
                  className={cn(CELL, "pb-4 text-left font-medium")}
                >
                  {total.label}
                </th>
                <td className={cn(CELL, NUMERIC, "pb-4 font-medium")}>
                  {total.duration}
                </td>
                <td className={cn(CELL, NUMERIC, "pb-4 font-medium")}>
                  {total.cost}
                </td>
                <td className={cn(CELL, NUMERIC, "pb-4 font-medium")}>
                  {total.score}
                </td>
                <td className={cn(CELL, "pb-4")} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </LandingSection>
  );
}
