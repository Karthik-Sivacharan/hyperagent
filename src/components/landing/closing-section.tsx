import Link from "next/link";

import { Button } from "@/components/ui/button";

import { CLOSING, LINKS } from "./content";

// The page's one dark surface. `dark` on the element makes brand.css re-map
// every token for this subtree, so the utilities below (and the buttons'
// ink, which becomes a light pill) follow without a single dark: variant.
// One short line on the left, the hero's two actions on the right; on a
// phone they stack. The ring stays tangerine: `--ring` flips with the rest.
export function ClosingSection() {
  return (
    <section
      aria-labelledby="closing-heading"
      className="dark bg-background px-4 text-foreground sm:px-6"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 py-20 md:flex-row md:items-end md:justify-between md:py-32">
        <div className="flex max-w-content flex-col gap-3">
          <h2
            id="closing-heading"
            className="text-3xl text-foreground md:text-4xl"
          >
            {CLOSING.heading}
          </h2>
          <p className="text-lg text-muted-foreground">{CLOSING.fine}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link href={LINKS.start.href}>{LINKS.start.label}</Link>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <Link href={LINKS.logIn.href}>{LINKS.logIn.label}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
