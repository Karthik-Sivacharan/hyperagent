import { IconAlertCircle, IconCheck } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { RECEIPTS, STATUS_LABEL } from "./content";
import { Section, SURFACE } from "./section";

// Cost and quality: one night of runs as a log in the smallest text role
// with tabular figures (no mono: the brand reserves it for identifiers),
// one row waiting on a person, a total, and two notes beside it on how a
// run is scored and what it is charged. The log is a real table, so a
// screen reader gets the column names; on a phone it scrolls inside its
// card and the job column steps aside.
export function Receipts() {
  const { section, log, notes } = RECEIPTS;
  const cell = "px-3 py-2.5 first:pl-0 last:pr-0";
  return (
    <Section copy={section}>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card
          size="none"
          className={cn(SURFACE, "gap-5 p-6 sm:p-8 lg:col-span-2")}
        >
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-base font-medium text-foreground">
              {log.title}
            </h3>
            <Badge variant="secondary">{log.count}</Badge>
            <span className="ml-auto text-xs text-foreground-low">
              {log.note}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-md border-collapse text-xs text-foreground tabular-nums">
              <thead>
                <tr className="border-b border-border-subtle text-left text-foreground-low">
                  <th scope="col" className={cn(cell, "font-medium")}>
                    {log.columns.time}
                  </th>
                  <th scope="col" className={cn(cell, "font-medium")}>
                    {log.columns.agent}
                  </th>
                  <th
                    scope="col"
                    className={cn(cell, "hidden font-medium md:table-cell")}
                  >
                    {log.columns.job}
                  </th>
                  <th
                    scope="col"
                    className={cn(cell, "text-right font-medium")}
                  >
                    {log.columns.took}
                  </th>
                  <th
                    scope="col"
                    className={cn(cell, "text-right font-medium")}
                  >
                    {log.columns.cost}
                  </th>
                  <th
                    scope="col"
                    className={cn(cell, "text-right font-medium")}
                  >
                    {log.columns.score}
                  </th>
                  <th scope="col" className={cn(cell, "font-medium")}>
                    {log.columns.state}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {log.rows.map((row) => (
                  <tr key={row.time}>
                    <td className={cn(cell, "text-foreground-low")}>
                      {row.time}
                    </td>
                    <td className={cn(cell, "whitespace-nowrap")}>
                      {row.agent}
                    </td>
                    <td
                      className={cn(
                        cell,
                        "hidden text-muted-foreground md:table-cell",
                      )}
                    >
                      {row.job}
                    </td>
                    <td className={cn(cell, "text-right whitespace-nowrap")}>
                      {row.took}
                    </td>
                    <td className={cn(cell, "text-right")}>{row.cost}</td>
                    <td className={cn(cell, "text-right")}>{row.score}</td>
                    <td className={cell}>
                      {row.state === "needsYou" ? (
                        <span className="flex items-center gap-1 font-medium whitespace-nowrap text-brand-accent">
                          <IconAlertCircle
                            aria-hidden="true"
                            className="size-3.5"
                          />
                          {STATUS_LABEL.needsYou}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <IconCheck
                            aria-hidden="true"
                            className="size-3.5"
                            stroke={2.25}
                          />
                          {STATUS_LABEL[row.state]}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border-subtle font-medium">
                  <th scope="row" colSpan={2} className={cn(cell, "text-left")}>
                    {log.total.label}
                  </th>
                  <td className={cn(cell, "hidden md:table-cell")} />
                  <td className={cn(cell, "text-right whitespace-nowrap")}>
                    {log.total.took}
                  </td>
                  <td className={cn(cell, "text-right")}>{log.total.cost}</td>
                  <td className={cn(cell, "text-right")}>
                    {log.total.score}
                    <span className="ml-1 font-normal text-foreground-low">
                      {log.total.scoreLabel}
                    </span>
                  </td>
                  <td className={cell} />
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
        <div className="flex flex-col gap-6">
          {notes.map((note) => (
            <Card
              key={note.title}
              size="none"
              className={cn(SURFACE, "flex-1 gap-2 p-6 sm:p-8")}
            >
              <h3 className="text-base font-medium text-foreground">
                {note.title}
              </h3>
              <p className="text-base text-pretty text-muted-foreground">
                {note.body}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
}
