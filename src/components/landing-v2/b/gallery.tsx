"use client";

import { useState } from "react";
import { IconArrowUp, IconPlus } from "@tabler/icons-react";

import { IconTile } from "@/components/ui/icon-tile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { A11Y, WORK, type WorkItem } from "./content";
import { OutputReplica } from "./output-replicas";
import { Section } from "./section";
import { MetaLine } from "./thread-parts";

// The reference's output gallery: a pill row of formats, then a grid of 1:1
// tinted squares, each with the finished work cropped at the top right and
// a floating white request card low in the square (a replica of our
// composer, not a control) showing the one line that produced it. Under
// each square, the outcome and what it took. Switching a tab swaps the grid
// at once, as the reference does.
export function Gallery() {
  const { section, tabs, composer, meta } = WORK;
  const [tab, setTab] = useState<string>(tabs[0].value);
  const active = tabs.find((t) => t.value === tab) ?? tabs[0];

  return (
    <Section copy={section}>
      <Tabs value={tab} onValueChange={setTab} className="gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
            <TabsList
              aria-label={A11Y.formats}
              className="group-data-horizontal/tabs:h-13 sm:group-data-horizontal/tabs:h-9"
            >
              {tabs.map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="px-4">
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <p className="max-w-md text-sm text-muted-foreground md:text-right">
            {active.line}
          </p>
        </div>

        {tabs.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            <ul
              role="list"
              aria-label={A11Y.gallery}
              className="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4"
            >
              {t.items.map((item, index) => (
                <li key={item.title} className="flex flex-col gap-3">
                  <div
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-3xl",
                      index % 2 === 0 ? "bg-surface-raised" : "bg-tint-20",
                    )}
                  >
                    <OutputReplica format={t.value} />
                    <RequestCard
                      item={item}
                      attach={composer.attach}
                      send={composer.send}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 px-1">
                    <p className="text-base font-medium text-foreground">
                      {item.title}
                    </p>
                    <MetaLine
                      className="text-md text-foreground-low tabular-nums"
                      parts={[
                        `${meta.duration} ${item.duration}`,
                        `${meta.cost} ${item.cost}`,
                      ]}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </TabsContent>
        ))}
      </Tabs>
    </Section>
  );
}

// The composer as a picture: the request on top, the attach circle and the
// ink send disc below. The text is the one thing the square says; the two
// discs are decoration and stay out of the tree.
function RequestCard({
  item,
  attach,
  send,
}: {
  item: WorkItem;
  attach: string;
  send: string;
}) {
  return (
    <div className="absolute inset-x-4 bottom-4 flex flex-col gap-3 rounded-2xl bg-background p-3.5 shadow-lg">
      <p className="text-sm text-pretty text-foreground">{item.request}</p>
      <div className="flex items-center justify-between">
        <IconTile
          size="sm"
          shape="circle"
          tone="raised"
          aria-hidden="true"
          title={attach}
        >
          <IconPlus className="size-3.5 text-muted-foreground" />
        </IconTile>
        <span
          aria-hidden="true"
          title={send}
          className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground"
        >
          <IconArrowUp className="size-3.5" />
        </span>
      </div>
    </div>
  );
}
