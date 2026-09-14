import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { Heading } from "./content";

// The heading template every section repeats, in the cursor.com shape:
// the claim, then a line under it at the SAME size in the second text tier.
// Hierarchy is colour, not size, and the weight stays at medium so a 32px
// line reads as a statement rather than a title. `text-3xl` carries the
// role's tracking; `font-medium` overrides the role's 600.
export function SectionHeading({
  id,
  heading,
  className,
}: {
  id?: string;
  heading: Heading;
  className?: string;
}) {
  return (
    <div className={cn("flex max-w-3xl flex-col gap-1", className)}>
      <h2
        id={id}
        className="text-2xl font-medium text-balance text-foreground md:text-3xl"
      >
        {heading.title}
      </h2>
      <p className="text-2xl font-medium text-pretty text-muted-foreground md:text-3xl">
        {heading.sub}
      </p>
    </div>
  );
}

// One band of the page. Sections part on padding alone, the way the
// reference pages do: no hairline, no change of ground; the section's own
// surface (a panel, a table, tiles) gives it its edges. `scroll-mt-16` keeps
// an anchored section clear of the sticky header.
export function LandingSection({
  id,
  heading,
  children,
  className,
}: {
  id: string;
  heading: Heading;
  children: ReactNode;
  className?: string;
}) {
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("scroll-mt-16 px-4 py-16 sm:px-6 md:py-24", className)}
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading id={headingId} heading={heading} />
        <div className="mt-10 md:mt-14">{children}</div>
      </div>
    </section>
  );
}
