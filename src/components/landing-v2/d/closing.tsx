import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Reveal } from "../reveal";
import styles from "./closing.module.css";
import { CLOSING_D, HERO_D, LINKS } from "./content";

// The last thing on the page: one panel, the page's two closing lines, and
// the one action they are asking for.
//
// It is the page's third use of a smear gradient and the only one with words
// on it, so it is the only one that has to be shaped. `closing.module.css`
// masks the field into an ellipse anchored under the panel's bottom edge:
// solid across the bottom where the button is, thinning up through the
// middle, gone by the top corners where the heading is. Nothing about the
// gradient file changes — the shape is the mask's, so this band uses the same
// artwork the format showcase and the cards use.
//
// `dusk` is the field: the coolest of the twelve and the only one that is
// already light where it is going to be used, which is what makes it the one
// to put words on. It is also the page's one cool close against a hero, a
// format band and three cards that all run warm.
//
// The button stays the ink default rather than the hero's tangerine. On a
// field this saturated a tangerine button sinks into its own hue, and the
// inversion is the bookend rather than an inconsistency: the hero puts a
// coloured button on paper, the page closes with a plain one on colour, same
// label, same size, same soft corner. In the dark mapping `--primary` is the
// near-white, so the same button arrives as a light pill and holds its
// contrast without a `dark:` variant anywhere in this file.
//
// None of the twelve gradients is used twice on the page: the format
// showcase has six, the team cards three, and this is the tenth.
const FIELD = "/img/gradients/dusk.webp";

export function ClosingD() {
  return (
    <section
      id="closing"
      aria-labelledby="closing-heading"
      className="scroll-mt-16 px-4 py-24 sm:px-6 md:py-40"
    >
      <div className="mx-auto max-w-6xl">
        {/* The panel IS the Reveal, as every card on the page is, so the band
            arrives in one movement rather than as a frame with its contents
            landing inside it. `isolate` keeps the field's stacking context to
            the panel; the card's radius and `overflow-hidden` do the clipping,
            so the field needs no radius of its own. */}
        <Reveal className="relative isolate overflow-hidden rounded-4xl bg-background md:rounded-5xl">
          <div
            aria-hidden="true"
            className={cn("absolute inset-0", styles.field)}
          >
            <Image
              src={FIELD}
              alt=""
              fill
              unoptimized
              sizes="(min-width: 1200px) 1152px, 100vw"
              className={cn("object-cover", styles.smear)}
            />
          </div>

          {/* Everything the reader gets, held in the panel's upper half where
              the field is still a tint. The ladder is the page's: 24px from
              the heading to the line under it, 40 from there to the button.
              The air above and below is deliberately not equal — 64 / 80 over
              the heading against 128 / 176 under the button — because the
              panel is not a centred box. The colour builds downward, so the
              words sit high where the ground is nearly paper and the bottom
              third is left to be colour with nothing on it, which is what
              gives the button something to stand in front of. */}
          <div className="relative flex flex-col items-center px-6 pt-16 pb-32 text-center md:px-10 md:pt-20 md:pb-44">
            {/* The copy and the scrim that holds it legible, in one box.
                The scrim is stretched out of that box to the panel's own top
                and side edges (the negative insets are this column's padding,
                each matching its breakpoint) and 64px past the last line,
                which is the length of its own fade. So the ground is solid
                behind every line of copy however many lines there are, and
                the colour is back by the time the eye reaches the button.

                The copy and the button each carry `relative`. The scrim is
                absolutely positioned, so it paints in the positioned layer,
                which is above every in-flow sibling: without it the layer
                washes over the button it is meant to stop short of and takes
                the label from 16:1 to 3.6:1. Positioned, and later in the
                document, they sit above it.

                `text-background` is not type: it hands the layer the panel's
                own background as `currentColor`, which is the colour the
                module's gradient is drawn in. */}
            {/* `w-full` is load-bearing: this is a shrink-to-fit flex item,
                so without it the box is the width of the longest line and the
                scrim's negative insets reach 24px past THAT, drawing a plain
                white rectangle across the field. Full width, they reach the
                panel's own edges and the layer has no side edges to see. */}
            <div className="relative flex w-full flex-col items-center">
              <div
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute -inset-x-6 -top-16 -bottom-16 text-background md:-inset-x-10 md:-top-20",
                  styles.scrim,
                )}
              />
              <h2
                id="closing-heading"
                className="relative max-w-3xl text-heading-display text-balance text-foreground"
              >
                {CLOSING_D.heading}
              </h2>
              <p className="relative mt-6 max-w-content text-lg text-pretty text-muted-foreground">
                {CLOSING_D.fine}
              </p>
            </div>
            {/* One action, the hero's primary, at the hero's size and shape:
                44px of button, which is a thumb on a phone, and a label that
                names a verb and an object with no mark beside it. Log in is
                in the header and again in the footer directly below this, so
                a second control here would only split the one thing the band
                is for. */}
            <Button
              asChild
              size="lg"
              shape="soft"
              className="relative mt-10 h-11 px-6 text-base"
            >
              <Link href={LINKS.start.href}>{HERO_D.primary}</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
