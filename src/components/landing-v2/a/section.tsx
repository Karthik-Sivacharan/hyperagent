import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { Heading } from "./content";

// The two cuts a heading block can take. `section` is the page default:
// `text-3xl` carries the role's tracking, and `font-medium` overrides the
// role's 600 so a 32px line reads as a statement rather than a title.
// `display` is the headline cut the heroes use (fluid 40 → 48px at the
// heading weight), for the one section that should open like a second hero.
const HEADING_CUT = {
  section: "text-2xl font-medium md:text-3xl",
  display: "text-heading-display",
} as const;

// The heading template every section repeats, in the cursor.com shape:
// the claim, then a line under it at the SAME size in the second text tier.
// Hierarchy is colour, not size.
export function SectionHeading({
  id,
  heading,
  cut = "section",
  className,
}: {
  id?: string;
  heading: Heading;
  cut?: keyof typeof HEADING_CUT;
  className?: string;
}) {
  const type = HEADING_CUT[cut];
  return (
    <div className={cn("flex max-w-3xl flex-col gap-1", className)}>
      <h2 id={id} className={cn(type, "text-balance text-foreground")}>
        {heading.title}
      </h2>
      <p className={cn(type, "text-pretty text-muted-foreground")}>
        {heading.sub}
      </p>
    </div>
  );
}

// One band of the page. Sections part on padding alone, the way the
// reference pages do: no hairline, no change of ground; the section's own
// surface (a panel, a table, tiles) gives it its edges. The rhythm is a lot
// of air between bands (80px, 128px from `md`) against a shorter gap from a
// heading to the thing it introduces, so the page reads as separated groups
// rather than one even column. The 16px phone gutter never moves.
// `scroll-mt-16` keeps an anchored section clear of the sticky header.
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
      className={cn("scroll-mt-16 px-4 py-20 sm:px-6 md:py-32", className)}
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading id={headingId} heading={heading} />
        <div className="mt-12 md:mt-16">{children}</div>
      </div>
    </section>
  );
}
