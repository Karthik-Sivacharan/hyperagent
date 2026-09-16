"use client";

import Link from "next/link";
import { useState } from "react";
import { IconArrowRight } from "@tabler/icons-react";

import { ToolIconRow } from "@/components/signup/tool-icon-row";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { SectionHeading } from "../a/section";
import { ROSTER, type RosterAgent } from "./roster-content";

// The band directly under the hero: who is actually on the team.
//
// The hero says "a team of agents" and shows the app they live in. A reader
// who believes that sentence has exactly one question next, which is "doing
// what, for me?", and every band further down the page answers a different
// one. So this goes second: five tabs naming the functions an owner already
// staffs, and under each, eight agents with a name, a job and the tools they
// would touch.
//
// It wears the page's grammar, not a new one. The two-tone heading takes the
// display cut flush on the container's left edge, the way the format showcase
// and the brief cards do; the pill track is the same `Tabs` the format
// showcase uses, with the same phone-scroll treatment; the control under the
// grid sits on the same line the showcase's Previous / Next pair sits on.
//
// TWO ROWS OF FOUR, from `xl`. Eight agents side by side in two ranks is the
// message the copy is making — a department, not a sample — and four across
// is the widest the grid can go while a card still holds its two-line
// description without cutting it (a 273px card at the container's 1152px
// cap). Below that it is two columns, and on a phone one. The break is at
// `xl` rather than `lg` because at 1024 the four tracks come out at 229px,
// which clamps the longest descriptions mid-word.
//
// The band is taller than its neighbours because of it, and that is the trade
// being made: this is the only place on the page where the reader is meant to
// scan a list rather than read a statement, so it gets the room a list needs.
export function AgentRoster() {
  const { id, heading, tabsLabel, action, categories } = ROSTER;
  const [value, setValue] = useState(categories[0].id);
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="scroll-mt-16 px-4 py-24 sm:px-6 md:py-40"
    >
      <div className="mx-auto flex max-w-6xl flex-col">
        {/* The heading, the roster, then the line of controls under it — the
            same three parts the format showcase lays out, in the same order.
            Neither band animates them in any more. */}
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
          {/* The track scrolls rather than wraps on a phone: `w-max` keeps
              the row at its natural width so it runs past the gutter into
              the scroller instead of squeezing. 52px of track below `sm`,
              not 48, because the list's own `p-1` comes off the pill inside
              it and a thumb wants 44. Both numbers are the format
              showcase's; two tab rows on one page measure the same. */}
          <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
            <TabsList
              aria-label={tabsLabel}
              className="w-max group-data-horizontal/tabs:h-13 sm:group-data-horizontal/tabs:h-9"
            >
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="px-4"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {categories.map((category) => (
            <TabsContent
              key={category.id}
              value={category.id}
              className="motion-safe:animate-fade-in"
            >
              <ul
                role="list"
                aria-label={category.listLabel}
                className="grid gap-4 sm:grid-cols-2 md:gap-5 xl:grid-cols-4"
              >
                {category.agents.map((agent) => (
                  <AgentTile key={agent.id} agent={agent} />
                ))}
              </ul>
            </TabsContent>
          ))}
        </Tabs>

        {/* The band's one action, on the same left edge as everything above
            it. There is no caption beside it: the roster carries the word
            "example" in each grid's accessible name (`listLabel`) and nowhere
            on the face of the page, which is the design owner's call.
            `lg` draws an outline button at 40px, which is a pointer's button
            and a thumb's near miss, so below `sm` it takes the 44px the pills
            above it take. */}
        <div className="mt-6 flex w-full md:mt-8">
          <Button asChild variant="outline" size="lg" className="h-11 sm:h-10">
            <Link href={action.href}>
              {action.label}
              <IconArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// One agent.
//
// The card is the signup flow's suggested-agent tile with its control taken
// out. It keeps that card's skin and its anatomy exactly — `bg-tint-7` on a
// `size="none"` Card, 16px of padding, the `after:` rim light,
// `shadow-card-soft`, a title over a two-line description with the tool run on
// the floor — because the two are the same object in two places, and a reader
// who signs up should meet a card they have already seen. What it drops is
// everything that made that one a control: the `<button>`, `aria-pressed`, the
// pending skeleton layer, the picked fill. NOTHING HERE IS CLICKABLE, so
// nothing lifts, tints or changes its cursor on hover; a lift on a card that
// is not a link promises a click that is not there. The band's one action is
// the button under the grid.
//
// NOTHING ON THIS CARD IS A HOVER STATE, and nothing on it is clickable: no
// lift, no tint, no change of cursor. A card that is not a link must not
// promise a click, and the band's one action is the button under the grid. The
// card wore an agent glyph for a while, beside the name and then arriving in
// the top right corner on hover; both are out by the design owner's call on
// 2026-09-15, so the card is the name, the job and the tools and nothing else.
//
// `truncate` on the title is a safety net rather than a working part: the
// longest name on the roster measures 145px against the 241px a card gives it
// at the narrowest column the grid draws.
function AgentTile({ agent }: { agent: RosterAgent }) {
  return (
    <Card
      asChild
      size="none"
      className={cn(
        // `h-full` so a row of these squares up on the tallest card rather
        // than each sitting at its own height, and `mt-auto` below keeps every
        // tool run on the card's floor when a shorter description leaves the
        // stretched card with room to spare.
        "relative h-full gap-3 bg-tint-7 p-4 shadow-card-soft",
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-3xl after:shadow-rim-soft",
      )}
    >
      <li>
        <h3 className="truncate font-heading text-base leading-snug font-medium text-foreground">
          {agent.name}
        </h3>
        {/* Two lines, so a row of cards is never ragged. The copy is written
            to land inside them at the narrowest column the grid draws. */}
        <p className="line-clamp-2 text-sm text-pretty text-muted-foreground">
          {agent.description}
        </p>
        <ToolIconRow toolIds={agent.toolIds} className="mt-auto" />
      </li>
    </Card>
  );
}
