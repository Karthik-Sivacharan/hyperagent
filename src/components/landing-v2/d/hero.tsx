import Link from "next/link";

import { GLYPH_SETS, MorphingAgentGlyph } from "@/components/brand/agent-glyph";
import { Button } from "@/components/ui/button";

import { HERO_D, LINKS } from "./content";
import { HeroWindow } from "./hero-window";

// One agent glyph follows the word it stands for, so the line reads "Team
// of agents, and here is one, that ship real work". It is decorative, so the
// heading's text stays its accessible name. It walks four shapes from the
// original set, every other step of the loop (a block, then a curve, and so
// on), and rests on each for a little over two seconds: one mark changing
// calmly, not a flicker at the edge of the reader's eye.
//
// Bare, without its tile, and in the `accent` tone: the body itself takes the
// brand's graphics orange, so the mark reads as the one coloured thing in the
// line rather than as one more ink letterform, and the eyes stay holes punched
// to the paper. That is the page's whole orange budget bar the call to action
// below it, which is the rhyme: the mark in the line, the button under it.
//
// With no tile the SVG box IS the drawing box. It is sized and placed by eye
// against the capitals rather than by the baseline: 0.8em of box, whose body
// fills about 0.72em, lifted 0.12em so the box centres on the cap band
// (measured on the page: a bare inline glyph hangs 0.164em below the baseline,
// the cap is 0.71em, so the lift is 0.8/2 - 0.519).
//
// Room either side: the display cut carries -0.06em of tracking, which is
// subtracted from the word space AND from the glyph's own box, leaving it about
// 0.13em off the words. 8px before and 6px after, on top of the two word
// spaces, opens that to roughly 0.3em, a beat of its own. The two values differ
// on purpose: "agents" ends on a round s and "that" opens on a stem that brings
// its own side bearing, so equal numbers would not look equal. The word and the
// glyph share a no-wrap span, so a narrow screen can break the line anywhere but
// between them and the glyph is never left standing alone on a line.
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
// below as a desktop app window, which is the last thing in the band. The
// window runs wider than the text column (up to 1360px) so the app reads near
// its real size; the text above it keeps its measure.
//
// The headline takes the display cut the other variants' headlines take
// (`text-heading-display`: fluid 40 → 48px at the heading weight), so the
// page opens on one statement rather than a large-ish line.
//
// Spacing steps down from the window outwards, on the page's one ladder:
// 24px from the headline to the lede, 40px to the actions, then 64 / 80px to
// the window, which is the same step every section below takes from its
// heading to the thing it introduces. The band's own padding is the band step
// (96 / 160px), the same as the three sections and measured the same on both
// edges — the header above it is a hairline on the same paper, not a change
// of ground, so the hero does not get a shorter top than its neighbours.
export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="overflow-x-clip px-4 py-24 sm:px-6 md:py-40"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <h1
          id="hero-heading"
          className="max-w-4xl text-heading-display text-balance text-foreground"
        >
          {TITLE_BEFORE}
          <span className="whitespace-nowrap">
            {HERO_D.glyphAfter}{" "}
            <MorphingAgentGlyph
              sequence={GLYPH_SEQUENCE}
              hold={GLYPH_HOLD_MS}
              pace="expressive"
              tone="accent"
              tile={false}
              size={48}
              className="ms-2 me-1.5 inline-block size-[0.8em] -translate-y-[0.12em]"
            />
          </span>
          {TITLE_AFTER}
        </h1>

        <p className="mt-6 max-w-content text-lg text-pretty text-muted-foreground">
          {HERO_D.description}
        </p>

        {/* The brand's call to action as the signup flow draws it: the
            tangerine, soft-cornered large button and its quiet partner, the
            tinted row with a hairline. The label carries it alone, with no
            mark: two words on a 44px button, which is a thumb on a phone. */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            variant="brand"
            size="lg"
            shape="soft"
            className="h-11 px-6 text-base"
          >
            <Link href={LINKS.start.href}>{HERO_D.primary}</Link>
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

      <div className="mx-auto mt-16 max-w-[85rem] md:mt-20">
        <HeroWindow />
      </div>
    </section>
  );
}
