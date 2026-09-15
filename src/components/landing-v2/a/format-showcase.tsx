"use client";

import { useState } from "react";
import {
  IconArrowLeft,
  IconArrowRight,
  IconArrowUp,
  IconChartBar,
  IconFileText,
  IconPlus,
  IconPresentation,
  IconVideo,
  IconWorld,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { FORMATS } from "./content";
import { SectionHeading } from "./section";

// One glyph per format, in the order content.ts lists them.
const FORMAT_ICONS = [
  IconWorld,
  IconVideo,
  IconPresentation,
  IconFileText,
  IconChartBar,
];

// One ground per format, off the tint ladder and nothing else, so moving
// between tabs reads as a change of material rather than a change of hue.
// The order is deliberately not a ramp: neighbours differ most.
const FORMAT_GROUNDS = [
  "bg-tint-20",
  "bg-tint-12",
  "bg-tint-25",
  "bg-tint-15",
  "bg-surface-raised",
];

// The formats, as the product shows them: a pill row of the five, then one
// panel that says what the format is on the left and stands in for the work
// on the right. The picture is a tinted ground in v1, with the composer drawn
// low in it as a picture of the request, not a control. The panel holds one
// height across all five, so nothing under it moves when a tab changes.
//
// Everything in the band hangs off one left edge: the two-tone heading in the
// hero's display cut, the pill track, the panel and the Previous / Next row
// all start at the `max-w-6xl` container's left margin.
export function FormatShowcase() {
  const {
    id,
    heading,
    items,
    examplesLabel,
    tabsLabel,
    assetLabel,
    previous,
    next,
  } = FORMATS;
  const [value, setValue] = useState(items[0].id);
  const headingId = `${id}-heading`;

  function step(delta: number) {
    const at = items.findIndex((item) => item.id === value);
    const from = at === -1 ? 0 : at;
    setValue(items[(from + delta + items.length) % items.length].id);
  }

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="scroll-mt-16 px-4 py-20 sm:px-6 md:py-32"
    >
      <div className="mx-auto flex max-w-6xl flex-col">
        <SectionHeading
          id={headingId}
          heading={heading}
          cut="display"
          className="max-w-4xl"
        />

        <Tabs
          value={value}
          onValueChange={setValue}
          className="mt-12 w-full gap-6 md:mt-16 md:gap-8"
        >
          {/* The track scrolls rather than wraps on a phone: `w-max` keeps the
              row at its natural width, so it starts at the left edge and runs
              past the gutter into the scroller instead of squeezing. */}
          <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
            <TabsList
              aria-label={tabsLabel}
              className="w-max group-data-horizontal/tabs:h-12 sm:group-data-horizontal/tabs:h-9"
            >
              {items.map((item) => (
                <TabsTrigger key={item.id} value={item.id} className="px-4">
                  {item.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="rounded-4xl bg-background p-2 shadow-card">
            {items.map((item, index) => {
              const Icon = FORMAT_ICONS[index] ?? IconFileText;
              const chipsId = `${id}-${item.id}-examples`;
              return (
                <TabsContent
                  key={item.id}
                  value={item.id}
                  className="motion-safe:animate-fade-in"
                >
                  <div className="grid gap-2 md:h-104 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
                    {/* `min-w-0` lets the grid item shrink to its track:
                        without it the chip row's min-content width pushes the
                        whole panel past the page gutter on a phone. */}
                    <div className="flex min-h-72 min-w-0 flex-col justify-center gap-3 px-4 py-6 md:min-h-0 md:px-8 md:py-0">
                      <p className="text-md text-foreground-low">{item.name}</p>
                      <div className="flex flex-col gap-2">
                        <h3 className="text-2xl font-medium text-balance text-foreground md:text-3xl">
                          {item.title}
                        </h3>
                        <p className="text-base text-pretty text-muted-foreground">
                          {item.body}
                        </p>
                      </div>
                      <p id={chipsId} className="sr-only">
                        {examplesLabel}
                      </p>
                      <ul
                        role="list"
                        aria-labelledby={chipsId}
                        className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
                      >
                        {item.examples.map((example) => (
                          <li key={example}>
                            <Badge
                              variant="outline"
                              className="h-7 px-3 text-sm font-normal"
                            >
                              {example}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div
                      role="img"
                      aria-label={`${item.name}, ${assetLabel}. ${item.request}`}
                      className={cn(
                        "relative h-56 overflow-hidden rounded-3xl sm:h-72 md:h-full",
                        FORMAT_GROUNDS[index] ?? "bg-tint-10",
                      )}
                    >
                      <div className="absolute inset-x-0 top-0 bottom-28 flex items-center justify-center">
                        <Icon
                          className="size-14 text-foreground-low/35"
                          aria-hidden="true"
                        />
                      </div>
                      <RequestCard request={item.request} />
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </div>
        </Tabs>

        <div className="mt-6 flex w-full items-center justify-between md:mt-8">
          <Button variant="outline" size="lg" onClick={() => step(-1)}>
            <IconArrowLeft aria-hidden="true" />
            {previous}
          </Button>
          <Button variant="outline" size="lg" onClick={() => step(1)}>
            {next}
            <IconArrowRight aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
}

// The composer as a picture: the request on top, the attach circle and the ink
// send disc below. It is drawn, not built: no control, no state, and the
// `role="img"` ground above keeps the whole card out of the tree.
function RequestCard({ request }: { request: string }) {
  return (
    <div className="absolute inset-x-4 bottom-4 mx-auto flex max-w-xl flex-col gap-3 rounded-2xl bg-background p-3.5 shadow-lg sm:inset-x-6 sm:bottom-6">
      <p className="text-sm text-pretty text-foreground">{request}</p>
      <div className="flex items-center justify-between">
        <IconTile size="sm" shape="circle" tone="raised">
          <IconPlus
            className="size-3.5 text-muted-foreground"
            aria-hidden="true"
          />
        </IconTile>
        <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <IconArrowUp className="size-3.5" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}
