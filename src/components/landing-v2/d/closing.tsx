import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { CLOSING_D, HERO_D, LINKS } from "./content";

// The last thing on the page: one panel, the page's two closing lines, and
// the one action they are asking for.
//
// THE PANEL IS THE GRADIENT. Not a white card with colour rising into the
// bottom of it — the whole card is one of the twelve smears, edge to edge, and
// the words sit on top of it in light type. The split version read as two
// things stacked, a paper card and a colour band, with a seam across the
// middle where one became the other; this reads as one object.
//
// It gets there through `dark`, not through a colour written into this file.
// The class re-maps the brand's semantic tokens for this subtree alone
// (src/design/brand/brand.css): `--foreground` becomes the near-white,
// `--muted-foreground` the light grey that is checked against it, and
// `--primary` the near-white pill with dark type that the dark mapping uses
// for its buttons. So the heading, the line under it and the button all keep
// the same token names they had when the panel was paper, and not one colour
// here is hard-coded. `bg-background` under the field is the dark mapping's
// own near-black, which is what shows for the moment before the image paints.
//
// THE VEIL is the one thing the gradient itself cannot supply. These files are
// built to be looked at, not written on, and every one of them runs from a
// dark corner to a pale one — `dusk` has a navy top and a near-white pink at
// the bottom left. Light type over that pink is unreadable, so a flat scrim of
// the dark mapping's own background sits between the field and the words. Flat
// rather than shaped: a ramp would put its own seam back on the card, which is
// the thing this band just got rid of. The alpha is set by measurement, not by
// eye — see the note on it below.
const FIELD = "/img/gradients/dusk.webp";

export function ClosingD() {
  return (
    <section
      id="closing"
      aria-labelledby="closing-heading"
      className="scroll-mt-16 px-4 py-24 sm:px-6 md:py-40"
    >
      <div className="mx-auto max-w-6xl">
        {/* `dark` re-maps the tokens for this subtree; see the note above.
            `isolate` keeps the field's stacking context to the panel; the
            card's radius and `overflow-hidden` do the clipping, so neither the
            field nor the veil needs a radius of its own. */}
        <div className="dark relative isolate overflow-hidden rounded-4xl bg-background md:rounded-5xl">
          <Image
            src={FIELD}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 1200px) 1152px, 100vw"
            // `object-top`, not the default centre. The panel is a wide short
            // box and the file is 4:3, so `cover` shows a horizontal slice of
            // it and the slice is a real choice: centred, it lands on the pale
            // middle of the picture and the band reads as a generic pastel
            // wash. Anchored to the top, the slice carries the navy and the
            // cyan the top third of these files is built around, and the
            // diagonal reads as a diagonal. Every one of the twelve is darkest
            // and most saturated at the top, so this holds if the band is ever
            // pointed at a different one — and it is also the crop that needs
            // the least veil over it.
            className="object-cover object-top"
          />
          {/* The veil. `bg-background` is the dark mapping's near-black, so
              this is the same colour the panel falls back to rather than a
              black invented here.

              45% is measured, not chosen. The ground is a photograph, so the
              only honest number is the contrast against the lightest pixel
              actually behind a line, read off a screenshot rather than off a
              token pair. At 45% both lines clear 5:1 against that pixel, which
              is past the 4.5 floor the brand holds text to, and the picture is
              still a picture. Every step heavier buys contrast nobody needs by
              taking the colour the band exists to show. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-background/45"
          />

          {/* The copy and the action, centred, on even air top and bottom. The
              old panel was deliberately lopsided — the words were pushed up
              into the part of the card the colour had not reached yet — and
              with colour everywhere there is nothing left to push away from.
              The ladder inside is the page's: 24px from the heading to the
              line under it, 40 from there to the button. */}
          <div className="relative flex flex-col items-center px-6 py-24 text-center md:px-10 md:py-32">
            <h2
              id="closing-heading"
              className="max-w-3xl text-heading-display text-balance text-foreground"
            >
              {CLOSING_D.heading}
            </h2>
            {/* The foreground tier, not the muted one, and that is the
                measurement talking. The dark mapping has exactly two text
                tiers — near-white and a mid grey — and the mid grey is built
                for a flat surface: over this crop it reads 2.8:1 at a 40% veil
                and 4.45:1 even at 65%, so it never clears the floor at any
                veil that leaves the gradient looking like the gradient. The
                step down from the heading is carried by size instead, which
                here is a display cut against 18px and is not a subtle
                difference. */}
            <p className="mt-6 max-w-content text-lg text-pretty text-foreground">
              {CLOSING_D.fine}
            </p>
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
              className="mt-10 h-11 px-6 text-base"
            >
              <Link href={LINKS.start.href}>{HERO_D.primary}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
