import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { CLOSING, LINKS } from "./content";
import { SURFACE } from "./section";

// The closing band: one last surface holding the short line on the left
// and the hero's two actions on the right. On a phone they stack, 44px
// tall like the hero's. The actions never shrink, so on a tablet the
// heading gives way and the two pills stay on one row.
export function Closing() {
  return (
    <section
      aria-labelledby="closing-heading"
      className="px-4 pb-16 sm:px-6 md:pb-28"
    >
      <Card
        size="none"
        className={cn(
          SURFACE,
          "mx-auto max-w-6xl flex-col gap-8 p-6 sm:p-8 md:flex-row md:items-end md:justify-between md:p-12",
        )}
      >
        <div className="flex max-w-content flex-col gap-3">
          <h2
            id="closing-heading"
            className="text-3xl font-medium! text-balance text-foreground md:text-4xl"
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
      </Card>
    </section>
  );
}
