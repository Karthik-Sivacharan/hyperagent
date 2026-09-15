import Link from "next/link";

import { Button } from "@/components/ui/button";

import { CLOSING, LINKS } from "./content";

// The close, kept light like the rest of the page: one deeper panel with a
// short line on the left and the hero's two actions on the right. On a
// phone they stack and the pills stay 44px.
export function Closing() {
  return (
    <section
      aria-labelledby="closing-heading"
      className="px-4 pb-20 sm:px-6 md:pb-32"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 rounded-5xl bg-surface-raised px-6 py-12 shadow-edge md:flex-row md:items-end md:justify-between md:px-14 md:py-20">
        <div className="flex max-w-content flex-col gap-3">
          <h2
            id="closing-heading"
            className="text-3xl text-balance text-foreground md:text-4xl"
          >
            {CLOSING.heading}
          </h2>
          <p className="text-lg text-pretty text-muted-foreground">
            {CLOSING.fine}
          </p>
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
