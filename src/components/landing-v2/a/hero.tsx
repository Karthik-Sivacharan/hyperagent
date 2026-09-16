import {
  IconBrandSlack,
  IconBrandTelegram,
  IconCalendarEvent,
  IconMail,
  IconMessage,
  IconUsers,
  IconWebhook,
} from "@tabler/icons-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { HERO, LINKS } from "./content";
import { HeroRun } from "./hero-run";

// One glyph per way a job can start, in the order content.ts lists them:
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

// The product is the hero. Above it, the cursor.com shape: the claim, an
// equal-size line under it in the second tier, one ink pill and the price;
// no eyebrow, weight kept at medium. Below, a flat tinted band (one step
// darker on the sand ladder) holds the browser window at ~80% width and
// crops its bottom edge, so the run reads as a window peeking up from a
// tray, the way devin.ai does it. Under the band, every way a job can start.
export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="px-4 pt-12 pb-16 sm:px-6 md:pt-20 md:pb-24"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6">
        <div className="flex max-w-4xl flex-col gap-1">
          <h1
            id="hero-heading"
            className="text-3xl font-medium text-balance text-foreground sm:text-4xl md:text-5xl"
          >
            {HERO.title}
          </h1>
          <p className="text-3xl font-medium text-pretty text-muted-foreground sm:text-4xl md:text-5xl">
            {HERO.sub}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button asChild size="lg" className="h-11 md:h-10">
            <Link href={LINKS.start.href}>{LINKS.start.label}</Link>
          </Button>
          <p className="text-md text-foreground-low">{HERO.fine}</p>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-6xl overflow-hidden rounded-4xl bg-neutral-200 px-4 pt-4 sm:px-10 sm:pt-10 md:mt-16">
        <HeroRun />
      </div>

      <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-3 md:flex-row md:items-baseline md:gap-8">
        <p className="shrink-0 text-sm whitespace-nowrap text-foreground-low">
          {HERO.startsFrom.label}
        </p>
        <ul
          role="list"
          className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground"
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
