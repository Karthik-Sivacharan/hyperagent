import Link from "next/link";

import { Button } from "@/components/ui/button";

import { CLOSING_D, HERO_D, LINKS } from "./content";

// Variant A's closing band, forked for D: same dark surface, D's own copy and
// D's button shape. `dark` on the element makes brand.css re-map every token
// for this subtree, so the utilities below (and the buttons' ink, which
// becomes a light pill) follow without a single dark: variant. This is the
// page's one dark band and the last thing before the footer, which continues
// the same ground.
//
// The heading takes the display cut the sections above it take
// (`text-heading-display`, the same class SectionHeading's `display` sets), on
// the same `max-w-6xl` left edge, so the page closes in the type system it
// opened in. The line under it stays the quiet meta tier rather than a second
// display line: it is fine print beside two buttons, not a subhead.
//
// The two actions repeat the hero's, label for label, per the voice doc §7,
// and take the `soft` corner the header and the hero already use, so every
// call to action on the page is one control at three sizes. On a phone they
// stack, 44px tall like the hero's.
export function ClosingD() {
  return (
    <section
      aria-labelledby="closing-heading"
      className="dark bg-background px-4 text-foreground sm:px-6"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 py-16 md:flex-row md:items-end md:justify-between md:py-24">
        <div className="flex max-w-3xl flex-col gap-3">
          <h2
            id="closing-heading"
            className="text-heading-display text-balance text-foreground"
          >
            {CLOSING_D.heading}
          </h2>
          <p className="text-lg text-pretty text-muted-foreground">
            {CLOSING_D.fine}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <Button asChild size="lg" shape="soft" className="h-11 md:h-10">
            <Link href={LINKS.start.href}>{HERO_D.primary}</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            shape="soft"
            className="h-11 md:h-10"
          >
            <Link href={LINKS.logIn.href}>{LINKS.logIn.label}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
