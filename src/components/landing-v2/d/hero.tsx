import {
  IconArrowRight,
  IconBrandSlack,
  IconBrandTelegram,
  IconCalendarEvent,
  IconMail,
  IconMessage,
  IconUsers,
  IconUsersPlus,
  IconWebhook,
} from "@tabler/icons-react";
import Link from "next/link";

import { GLYPH_SETS, MorphingAgentGlyph } from "@/components/brand/agent-glyph";
import { Button } from "@/components/ui/button";

import { HERO } from "../a/content";
import { BADGE, LINKS } from "./content";
import { HeroWindow } from "./hero-window";

// One glyph per way a job can start, in the order A's content lists them:
// you ask, Slack, Telegram, email, a webhook, a schedule, another agent.
const START_ICONS = [
  IconMessage,
  IconBrandSlack,
  IconBrandTelegram,
  IconMail,
  IconWebhook,
  IconCalendarEvent,
  IconUsers,
];

// Four agent glyphs sit after the headline's first word, so the line reads
// "Meet, the team itself, your team of agents." The words stay A's; the
// glyphs are decorative, so the heading's text stays its accessible name.
// Each loops the original set from a different place (0, 2, 4 and 6 steps
// in), so no two ever show the same shape, and each holds a little longer
// than the one before it, so they drift apart instead of changing in step.
//
// Bare, without their tiles: set in ink on the paper ground they read as
// four more letterforms of the line, where the sand tiles read as chips
// pasted into it. Each body is sized to the cap height and dropped onto the
// baseline (the drawing box sits a tenth of the glyph's edge inside it).
const [FIRST_WORD, ...REST_WORDS] = HERO.title.split(" ");
const ORIGINAL_IDS = GLYPH_SETS.original.map((shape) => shape.id);
const HERO_GLYPHS = [
  { offset: 0, hold: 1100 },
  { offset: 2, hold: 1250 },
  { offset: 4, hold: 1400 },
  { offset: 6, hold: 1550 },
].map(({ offset, hold }) => ({
  hold,
  sequence: [...ORIGINAL_IDS.slice(offset), ...ORIGINAL_IDS.slice(0, offset)],
}));

// Variant D's hero: everything on one centre axis. A pill that points
// further down the page, the headline with four agent glyphs set inline, a two
// line lede (the promise, then the price), two pill actions, and the product
// below as a desktop app window. Under the window, every way a job can start.
// The window runs wider than the text column (up to 1360px) so the app reads
// near its real size; the text and the row under it keep their measure.
//
// Spacing steps down from the window outwards: 20px inside the text block,
// 32px to the actions, 56 to 64px to the window.
export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="overflow-x-clip px-4 pt-12 pb-16 sm:px-6 md:pt-20 md:pb-24"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <Button
          asChild
          variant="outline"
          size="none"
          className="h-9 max-w-full gap-2.5 pr-1.5 pl-3.5 font-normal"
        >
          <a href={BADGE.link.href}>
            <span className="text-md font-medium text-foreground">
              {BADGE.lead}
            </span>
            <span
              aria-hidden="true"
              className="size-1 shrink-0 rounded-full bg-tint-40"
            />
            <span className="text-md text-muted-foreground">
              {BADGE.link.label}
            </span>
            <span
              aria-hidden="true"
              className="flex size-6 shrink-0 items-center justify-center rounded-full bg-tint-10 text-foreground"
            >
              <IconArrowRight
                className="size-3.5 motion-safe:transition-transform motion-safe:duration-(--duration-fast) motion-safe:ease-out-quart motion-safe:group-hover/button:translate-x-0.5"
                stroke={2.25}
              />
            </span>
          </a>
        </Button>

        <h1
          id="hero-heading"
          className="mt-5 max-w-4xl text-4xl font-medium text-balance text-foreground sm:text-5xl"
        >
          <span className="whitespace-nowrap">
            {FIRST_WORD}{" "}
            <span className="inline-flex gap-[0.1em]">
              {HERO_GLYPHS.map((glyph) => (
                <MorphingAgentGlyph
                  key={glyph.sequence[0]}
                  sequence={glyph.sequence}
                  hold={glyph.hold}
                  pace="expressive"
                  tile={false}
                  size={48}
                  className="size-[0.86em] translate-y-[0.1em]"
                />
              ))}
            </span>
          </span>{" "}
          {REST_WORDS.join(" ")}
        </h1>

        <p className="mt-5 max-w-content text-lg text-pretty text-muted-foreground">
          {HERO.sub} <span className="sm:block">{HERO.fine}</span>
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="h-11 px-6 text-base has-[>svg]:px-5"
          >
            <Link href={LINKS.start.href}>
              <IconUsersPlus className="size-4.5" aria-hidden="true" />
              {LINKS.start.label}
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="tint"
            className="h-11 px-6 text-base text-foreground"
          >
            <Link href={LINKS.logIn.href}>{LINKS.logIn.label}</Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-[85rem] md:mt-16">
        <HeroWindow />
      </div>

      <div className="mx-auto mt-10 flex max-w-5xl flex-col items-center gap-3 text-center">
        <p className="text-sm text-foreground-low">{HERO.startsFrom.label}</p>
        <ul
          role="list"
          className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
        >
          {HERO.startsFrom.items.map((item, index) => {
            const Icon = START_ICONS[index] ?? IconMessage;
            return (
              <li key={item} className="flex items-center gap-1.5">
                <Icon
                  className="size-4 text-foreground-low"
                  aria-hidden="true"
                />
                {item}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
