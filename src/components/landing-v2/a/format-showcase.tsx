"use client";

import Image from "next/image";
import { useState } from "react";
import {
  IconAppWindow,
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

import { FORMATS } from "./content";
import { SectionHeading } from "./section";
import { useTypewriter } from "./use-typewriter";

// One glyph per format, in the order content.ts lists them.
const FORMAT_ICONS = [
  IconAppWindow,
  IconWorld,
  IconVideo,
  IconPresentation,
  IconFileText,
  IconChartBar,
];

// One smear gradient per format, in the order content.ts lists them. The
// files live beside the brief cards' grounds in `public/img/gradients`, are
// 1024x768 each, and are ordered so neighbours never share a hue, including
// the pair Previous and Next wrap around between (the last and the first).
const FORMAT_GRADIENTS = [
  "iris",
  "lagoon",
  "ember",
  "orchid",
  "moss",
  "bronze",
];

// The formats, as the product shows them: a pill row of the six, then one
// panel that says what the format is on the left and stands in for the work
// on the right. The picture is a smear gradient with the format's glyph
// watermarked on it, and the composer drawn low in it as a picture of the
// request, not a control. The panel holds one height across all six, so
// nothing under it moves when a tab changes.
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
      className="scroll-mt-16 px-4 py-24 sm:px-6 md:py-40"
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
          className="mt-16 w-full gap-6 md:mt-20 md:gap-8"
        >
          {/* The track scrolls rather than wraps on a phone: `w-max` keeps the
              row at its natural width, so it starts at the left edge and runs
              past the gutter into the scroller instead of squeezing.

              52px of track below `sm`, not 48: the list's own `p-1` is taken
              off the pill inside it, so a 48px track draws a 40px pill and a
              thumb wants 44. This is the track height the other variants'
              tab rows already take. */}
          <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
            <TabsList
              aria-label={tabsLabel}
              className="w-max group-data-horizontal/tabs:h-13 sm:group-data-horizontal/tabs:h-9"
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
                        whole panel past the page gutter on a phone.

                        The title opens the column: the format's name is
                        already lit in the tab above and read out on the
                        picture beside it, so an eyebrow repeating it would be
                        the third time in one glance.

                        Padding reads with the tray, not against it: the
                        panel's own 8px frame plus 16 here is the page's 24px
                        phone card inset, plus 32 from `md` is its 40px
                        desktop one, so the copy starts on the same line as
                        the copy in the brief and team cards. The column is
                        centred in the panel's fixed height from `md`, so it
                        has no vertical padding of its own to keep. */}
                    <div className="flex min-h-72 min-w-0 flex-col justify-center gap-10 px-4 py-6 md:min-h-0 md:px-8 md:py-0">
                      <div className="flex flex-col gap-3">
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
                      className="relative h-56 overflow-hidden rounded-3xl sm:h-72 md:h-full"
                    >
                      {/* The ground. Absolute under everything else in the
                          well, and the well's height is set by the grid, so
                          the picture can never move anything as it arrives.
                          Only the open tab's panel is mounted, so this is one
                          19KB file at a time and it loads eagerly: waiting on
                          the lazy observer would flash the well white under a
                          white watermark on every tab change. Decorative: the
                          well's own `role="img"` and label carry what it
                          means, so the file stays out of the tree. */}
                      <Image
                        src={`/img/gradients/${FORMAT_GRADIENTS[index] ?? FORMAT_GRADIENTS[0]}.webp`}
                        alt=""
                        fill
                        unoptimized
                        loading="eager"
                        sizes="(min-width: 768px) 58vw, 100vw"
                        className="object-cover"
                      />
                      {/* The watermark is white on colour now, not ink on a
                          tint: at 55% it reads on every one of the six
                          grounds without competing with the composer. */}
                      <div className="absolute inset-x-0 top-0 bottom-28 flex items-center justify-center">
                        <Icon
                          className="size-14 text-white/55 drop-shadow-sm"
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

        {/* `lg` draws these at 40px, which is a pointer's button and a
            thumb's near miss, so below `sm` they take the 44px the pills
            above them take. */}
        <div className="mt-6 flex w-full items-center justify-between md:mt-8">
          <Button
            variant="outline"
            size="lg"
            className="h-11 sm:h-10"
            onClick={() => step(-1)}
          >
            <IconArrowLeft aria-hidden="true" />
            {previous}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-11 sm:h-10"
            onClick={() => step(1)}
          >
            {next}
            <IconArrowRight aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
}

// The composer as a picture: the request on top, the attach circle and the ink
// send disc below. It is drawn, not built: no control, and the `role="img"`
// ground above keeps the whole card out of the tree.
//
// The request types itself in, on mount and on every tab change, because the
// card is a picture of somebody asking. The finished line sits underneath it,
// laid out but not painted, so the card is its final height from the first
// frame and the composer never grows a line under the reader.
function RequestCard({ request }: { request: string }) {
  const { typed, done } = useTypewriter(request);
  return (
    <div className="absolute inset-x-4 bottom-4 mx-auto flex max-w-xl flex-col gap-3 rounded-2xl bg-background p-3.5 shadow-lg sm:inset-x-6 sm:bottom-6">
      {/* `aria-hidden` on both copies, so the half-typed line can never reach
          a reader: the ground's `aria-label` carries the whole request. */}
      <p
        aria-hidden="true"
        className="relative text-sm text-pretty text-foreground"
      >
        <span className="invisible">{request}</span>
        <span className="absolute inset-0">
          {typed}
          {done ? null : (
            <span className="ml-px inline-block h-3 w-px translate-y-0.5 bg-foreground/70 align-baseline" />
          )}
        </span>
      </p>
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
