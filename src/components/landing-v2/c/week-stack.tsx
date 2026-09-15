import { IconAlertCircle, IconCheck, IconClock } from "@tabler/icons-react";

import { Mark } from "@/components/brand/mark";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { STATUS_LABEL, WEEK, type WeekPicture } from "./content";
import { SectionHeading, SURFACE } from "./section";

// Three cards for one job's week, stacked with `position: sticky`: each one
// parks a step lower than the last (`top-28`, `top-32`, `top-36`), so the
// card before it keeps a sliver showing, and the heading stays beside them
// on a wide screen. Pure CSS: nothing listens to scroll. Every large figure
// is an example and says so.
const TOPS = ["lg:top-28", "lg:top-32", "lg:top-36"];

export function WeekStack() {
  const { section, cards, exampleNote } = WEEK;
  const headingId = `${section.id}-heading`;
  return (
    <section
      id={section.id}
      aria-labelledby={headingId}
      className="scroll-mt-16 px-4 sm:px-6"
    >
      <div className="mx-auto grid max-w-6xl gap-10 py-16 md:py-28 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
        <SectionHeading
          id={headingId}
          copy={section}
          className="self-start lg:sticky lg:top-28"
        />
        <ol role="list" className="flex flex-col gap-6">
          {cards.map((card, index) => (
            <li key={card.day} className={cn("lg:sticky", TOPS[index])}>
              <Card
                size="none"
                className={cn(
                  SURFACE,
                  "grid gap-8 p-6 sm:p-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:min-h-[26rem]",
                )}
              >
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <p className="text-label-12-caps text-foreground-low">
                      {card.day}
                    </p>
                    <p className="text-5xl font-medium! text-foreground tabular-nums">
                      {card.fact}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {card.factLabel}
                      <span className="text-foreground-low">
                        {" "}
                        ({exampleNote.toLowerCase()})
                      </span>
                    </p>
                  </div>
                  <p className="text-base text-pretty text-muted-foreground md:mt-auto">
                    {card.body}
                  </p>
                </div>
                <Picture picture={card.picture} />
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const FRAME = "rounded-3xl p-5 shadow-edge md:self-start";
const INNER = "flex h-full flex-col gap-4";

// The card's picture: the brief, the run list, or the report, each built
// from the primitives, named as one image with an inert inside.
function Picture({ picture }: { picture: WeekPicture }) {
  if (picture.kind === "brief") {
    return (
      <div role="img" aria-label={picture.label} className={FRAME}>
        <div inert className={INNER}>
          <Badge variant="secondary" className="self-start">
            <IconClock aria-hidden="true" />
            {picture.chip}
          </Badge>
          <p className="text-sm text-pretty text-foreground">{picture.text}</p>
          <p className="mt-auto text-xs text-foreground-low">{picture.by}</p>
        </div>
      </div>
    );
  }
  if (picture.kind === "runs") {
    return (
      <div role="img" aria-label={picture.label} className={FRAME}>
        <div inert className={INNER}>
          <ul
            role="list"
            className="flex flex-col divide-y divide-border-subtle"
          >
            {picture.rows.map((row) => (
              <li
                key={row.when}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 py-3 text-xs tabular-nums"
              >
                <span className="text-foreground-low">{row.when}</span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-sm text-foreground">
                    {row.job}
                  </span>
                  <span className="text-foreground-low">{row.took}</span>
                </span>
                {row.state === "needsYou" ? (
                  <span className="flex items-center gap-1 font-medium text-brand-accent">
                    <IconAlertCircle aria-hidden="true" className="size-3.5" />
                    {STATUS_LABEL.needsYou}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <IconCheck
                      aria-hidden="true"
                      className="size-3.5"
                      stroke={2.25}
                    />
                    {STATUS_LABEL.done}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  return (
    <div role="img" aria-label={picture.label} className={FRAME}>
      <div inert className={INNER}>
        <div className="flex items-start gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-tint-20 text-foreground">
            <Mark size={16} />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-sm">
              <span className="font-medium text-foreground">
                {picture.from}
              </span>
              <span className="ml-2 text-xs text-foreground-low tabular-nums">
                {picture.time}
              </span>
            </p>
            <p className="text-sm text-pretty text-foreground">
              {picture.text}
            </p>
            <p className="text-xs text-foreground-low tabular-nums">
              {picture.receipt}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
