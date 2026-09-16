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
// THE BOTTOM HALF OF THE FIELD CARRIES NOTHING. There was a flat scrim over
// the whole card for a while, dark enough to hold light type anywhere on it,
// and it cost the picture exactly what it was there to protect: `dusk` at 45%
// under black is a duller `dusk`. What is over the card now is graded, and it
// is gone by the bottom edge (see THE VEIL below).
//
// What makes that safe is WHERE the words are rather than what is over them,
// and the card is sized so that "centred" and "where the ground is quiet" are
// the same place. Every one of these twelve files runs dark at the top to pale
// at the bottom, and this one has a bright cyan streak through its middle.
// `cover` on a wide box shows a horizontal slice of a 4:3 file anchored at the
// top, so how far down the picture the slice reaches is decided by how TALL
// the panel is. That makes the padding a legibility control, not a taste one.
//
// Measured on the rendered pixels at 1456, copy centred in the panel:
//
//   panel 319px (64px of air)   heading 9.60   line 6.99
//   panel 351px (80)            heading 9.06   line 5.22
//   panel 367px (88)            heading 8.95   line 4.51   at the floor
//   panel 383px (96)            heading 8.73   line 3.90   FAILS
//   panel 447px (128)           heading 6.15   line 2.62   FAILS
//
// So 80px, and the card is 351px tall. Past about 88 the second line is off
// the navy and onto the streak and no amount of centring saves it. The two
// files this band could otherwise have used were measured at the taller sizes
// too, in case one of them was dark through its middle: `cypress` reads 2.20
// and `solstice` 2.21 on that line at 447px, both worse than `dusk`. There is
// no gradient in the set that carries centred type on a card that tall.
//
// The button is the one thing that reaches past the navy, and it carries its
// own near-white fill.
//
// THE VEIL IS SIZED BY THE CROP, AND THE CROP IS SIZED BY THE WIDTH. How far
// down the file `cover` reaches is set by the panel's ASPECT, and the panel is
// a fixed height inside a width that stops growing at 1152. At 1200 and up it
// shows the top 41% of the picture; at 1024, 49%; at 768, 65%; and on a phone
// the box is taller than it is wide, so `cover` scales by height and shows all
// of it. Centred copy therefore lands on a different part of the picture at
// every width. Measured on the rendered pixels with nothing over it:
//
//   1200+  heading 9.06   line 5.02   clears the floor on its own
//   1024   heading 7.70   line 3.01   FAILS
//    768   heading 3.86   line 1.86   FAILS
//    390   heading 3.60   line 2.80   FAILS, and failed before this change too
//
// That last row is worth saying out loud: the phone carried a flat 40% veil
// and was under the floor with it, on the live page, with the copy at the top
// of the card. This fixes it rather than preserving it.
//
// So there are three bands, and the veil is a GRADIENT in each: full strength
// past the copy, then out to nothing at the bottom edge, where the picture is
// at its palest and has nothing on it to protect.
//
//   1200 and up   none                heading 9.06   line 5.02
//   md to 1199    55%, out from 60%   heading 8.30   line 5.41  (at 768, the
//                                     worst of the band; 12.05 / 9.52 at 1199)
//   under md      70%, out from 70%   heading 6.71   line 6.22  (at 390)
//
// 1200 is not a round number chosen for looks: it is the width at which the
// page's `max-w-6xl` stops the panel growing, so it is the first width where
// the crop stops deepening and the picture can be shown as drawn.
//
// This is not the flat scrim the band used to carry and that an earlier pass
// took off. That one was 45% over the WHOLE card and the objection to it
// stands: it dulled the half of the picture the band exists to show. These
// leave that half alone, and above 1200 there is nothing over the card at
// all.
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
            field needs a radius of its own. */}
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
            // the least help over it.
            className="object-cover object-top"
          />
          {/* The graded veil; the measurements are in the note above. Full
              strength past the copy, then out to nothing at the bottom edge,
              so the palest part of the file is carrying no scrim at all.
              Heavier on a phone, and holding its strength further down, since
              the crop there shows the whole picture rather than its top third
              and the copy sits lower in the file because of it. Gone entirely
              from 1200, where the panel stops growing and the card carries
              centred type on the bare field.
              `bg-background` is the dark mapping's own near-black, so this is
              still not a colour invented in this file. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-b from-background/70 via-background/70 via-70% to-transparent md:from-background/55 md:via-background/55 md:via-60% min-[1200px]:hidden"
          />

          {/* Centred, and the air is what sets the card's height: there is no
              height on the panel, so 80px over and under the copy IS a 351px
              card. See the measurements above for why it is 80 and not 128 —
              the number is doing legibility work, not spacing work. The ladder
              inside is the page's: 24px from the heading to the line under it,
              40 from there to the button. */}
          <div className="relative flex flex-col items-center px-6 py-16 text-center md:px-10 md:py-20">
            <h2
              id="closing-heading"
              className="max-w-3xl text-heading-display text-balance text-foreground"
            >
              {CLOSING_D.heading}
            </h2>
            {/* The foreground tier, not the muted one, and that is the
                measurement talking. The dark mapping has exactly two text
                tiers — near-white and a mid grey — and the mid grey is built
                for a flat surface: on this ground it never cleared the 4.5
                floor at any treatment that left the gradient looking like the
                gradient. The
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
