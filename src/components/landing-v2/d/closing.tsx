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
// NOTHING SITS BETWEEN THE FIELD AND THE WORDS. There was a flat scrim over it
// for a while, dark enough to carry light type anywhere on the card, and it
// cost the picture exactly what it was there to protect: `dusk` at 45% under
// black is a duller `dusk`. The card now shows the file at full strength.
//
// What makes that safe is WHERE the words are rather than what is over them.
// Every one of these twelve runs dark at the top to pale at the bottom, and
// this one has a bright cyan streak through its middle. Measured against the
// real pixels, light type sitting centred in the card reads 3.9:1 on that
// streak, under the 4.5 floor, while the same type held up in the navy reads
// 8.4:1. So the copy is packed into the top of the panel and the bottom half
// is left to be colour with nothing on it. The button is the one thing that
// crosses into the streak, and it carries its own near-white fill.
//
// The phone is the exception, and it is scoped to the phone: a panel that
// narrow is nearly square, so the crop reaches the pale half of the file no
// matter where the copy sits, and a scrim under `md` is the only thing that
// answers it. Above `md` there is nothing over the picture at all.
//
// This is the shape the band had when it was a paper card with colour rising
// into it, and it is the same reasoning: words where the ground is quiet. What
// changed is that the quiet part is now the top of a photograph instead of the
// top of a sheet of paper.
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
          {/* A veil on the PHONE only. On a wide panel the copy sits in the
              navy and needs nothing over it, which is why there is no overlay
              from `md` up. A phone panel is nearly square, so `cover` reaches
              far enough down the 4:3 file that the pale half lands behind the
              second line whatever the padding does — measured, that line is
              unreadable there. Rather than darken the card everywhere for a
              case that only happens under 768px, the scrim is scoped to it.
              `bg-background` is the dark mapping's own near-black, so this is
              still not a colour invented in this file. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-background/40 md:hidden"
          />

          {/* Deliberately lopsided: 48 over the heading against 96 under the
              button, 64 / 192 from `md`. That is not a centred box that has
              drifted, it is the legibility argument above — the copy is held in
              the navy at the top of the frame and the bright half of the
              picture runs underneath it with nothing on it. The ladder inside
              is the page's: 24px from the heading to the line under it, 40
              from there to the button.

              The phone takes LESS bottom air, not more, and that is the same
              argument again rather than an exception to it. `cover` shows a
              horizontal slice of a 4:3 file, and how much of the file that
              slice spans depends on the box's aspect: the tall phone panel
              reaches far enough down the picture to put its pale half behind
              the copy, while a shorter one stays in the navy. So the panel is
              cut down there instead of being darkened. */}
          <div className="relative flex flex-col items-center px-6 pt-12 pb-24 text-center md:px-10 md:pt-16 md:pb-48">
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
