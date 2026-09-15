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

import { Mark } from "@/components/brand/mark";
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

// The mark sits after the headline's first word, so the line reads "Meet,
// the mark, your team of agents." The words stay A's; only the mark is new.
const [FIRST_WORD, ...REST_WORDS] = HERO.title.split(" ");

// Variant D's hero: everything on one centre axis. A pill that points
// further down the page, the headline with the brand mark set inline, a two
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
            <Mark className="inline-block size-[0.78em] align-[-0.06em]" />
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
