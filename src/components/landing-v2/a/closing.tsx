import Link from "next/link";

import { Button } from "@/components/ui/button";

import { CLOSING, LINKS } from "./content";

// The page's one dark surface. `dark` on the element makes brand.css re-map
// every token for this subtree, so the utilities below (and the buttons'
// ink, which becomes a light pill) follow without a single dark: variant.
// One short line on the left with the refrain under it, the hero's two
// actions on the right; on a phone they stack, 44px tall like the hero's.
export function Closing() {
  return (
    <section
      aria-labelledby="closing-heading"
      className="dark bg-background px-4 text-foreground sm:px-6"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 py-16 md:flex-row md:items-end md:justify-between md:py-24">
        <div className="flex max-w-content flex-col gap-3">
          <h2
            id="closing-heading"
            className="text-3xl text-balance text-foreground md:text-4xl"
          >
            {CLOSING.heading}
          </h2>
          <p className="text-lg text-muted-foreground">{CLOSING.fine}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <Button asChild size="lg" className="h-11 md:h-10">
            <Link href={LINKS.start.href}>{LINKS.start.label}</Link>
          </Button>
          <Button asChild size="lg" variant="ghost" className="h-11 md:h-10">
            <Link href={LINKS.logIn.href}>{LINKS.logIn.label}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
