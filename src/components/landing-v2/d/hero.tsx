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

import { GLYPH_SETS, MorphingAgentGlyph } from "@/components/brand/agent-glyph";
import { Mark } from "@/components/brand/mark";
import { Button } from "@/components/ui/button";

import { HERO } from "../a/content";
import { HERO_D, LINKS } from "./content";
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

// One agent glyph follows the word it stands for, so the line reads "Team
// of agents, and here is one, that ship real work". It is decorative, so the
// heading's text stays its accessible name. It walks four shapes from the
// original set, every other step of the loop (a block, then a curve, and so
// on), and rests on each for a little over two seconds: one mark changing
// calmly, not a flicker at the edge of the reader's eye.
//
// Bare, without its tile: set in ink on the paper ground it reads as one
// more letterform of the line. The body is sized to the cap height and
// dropped onto the baseline (the drawing box sits a tenth of the glyph's
// edge inside it). The word and the glyph share a no-wrap span, so a narrow
// screen can break the line anywhere but between them.
const GLYPH_SEQUENCE = [0, 2, 4, 6].map((step) => GLYPH_SETS.original[step].id);
const GLYPH_HOLD_MS = 2200;
const [TITLE_BEFORE, TITLE_AFTER] = splitAround(
  HERO_D.title,
  HERO_D.glyphAfter,
);

function splitAround(title: string, word: string): [string, string] {
  const at = title.indexOf(word);
  if (at < 0) return [title, ""];
  return [title.slice(0, at), title.slice(at + word.length)];
}

// Variant D's hero: everything on one centre axis. The headline with its
// glyph, a short lede, the brand's two soft-cornered actions, and the product
// below as a desktop app window. Under the window, every way a job can start.
// The window runs wider than the text column (up to 1360px) so the app reads
// near its real size; the text and the row under it keep their measure.
//
// Spacing steps down from the window outwards: 20px from the headline to the
// lede, 32px to the actions, 56 to 64px to the window.
export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="overflow-x-clip px-4 pt-12 pb-16 sm:px-6 md:pt-20 md:pb-24"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <h1
          id="hero-heading"
          className="max-w-4xl text-4xl font-medium text-balance text-foreground sm:text-5xl"
        >
          {TITLE_BEFORE}
          <span className="whitespace-nowrap">
            {HERO_D.glyphAfter}{" "}
            <MorphingAgentGlyph
              sequence={GLYPH_SEQUENCE}
              hold={GLYPH_HOLD_MS}
              pace="expressive"
              tile={false}
              size={48}
              className="inline-block size-[0.86em] translate-y-[0.1em]"
            />
          </span>
          {TITLE_AFTER}
        </h1>

        <p className="mt-5 max-w-content text-lg text-pretty text-muted-foreground">
          {HERO_D.description}
        </p>

        {/* The brand's call to action as the signup flow draws it: the
            tangerine, soft-cornered large button with the mark before the
            label, and its quiet partner, the tinted row with a hairline.
            44px tall here so both are a thumb on a phone. */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            variant="brand"
            size="lg"
            shape="soft"
            className="h-11 px-6 text-base has-[>svg]:px-5"
          >
            <Link href={LINKS.start.href}>
              <Mark size={18} />
              {HERO_D.primary}
            </Link>
          </Button>
          <Button
            asChild
            variant="tint"
            size="lg"
            shape="soft"
            className="h-11 border border-input px-6 text-base text-foreground"
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
