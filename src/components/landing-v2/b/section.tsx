import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { SectionCopy, TwoTone } from "./content";

// A heading in two tones: the claim in the first text tier, its
// continuation in the second, at the same size. Hierarchy is colour, not
// weight, the way the editorial references do it.
export function TwoToneText({ heading }: { heading: TwoTone }) {
  return (
    <>
      {heading.lead}
      {heading.rest ? (
        <>
          {" "}
          <span className="text-muted-foreground">{heading.rest}</span>
        </>
      ) : null}
    </>
  );
}

// One band of the page. Sections part on space alone: no hairlines between
// them, no change of ground. The rhythm is the reference's 160 / 40: a lot
// of air above a display heading, a short gap between the heading block and
// what it introduces. `scroll-mt-20` keeps an anchored section clear of the
// sticky header.
export function Section({
  copy,
  children,
  className,
  headingClassName,
}: {
  copy: SectionCopy;
  children: ReactNode;
  className?: string;
  headingClassName?: string;
}) {
  const headingId = `${copy.id}-heading`;
  return (
    <section
      id={copy.id}
      aria-labelledby={headingId}
      className={cn("scroll-mt-20 px-4 py-20 sm:px-6 md:py-32", className)}
    >
      <div className="mx-auto max-w-6xl">
        <div
          className={cn("flex max-w-content flex-col gap-4", headingClassName)}
        >
          <h2
            id={headingId}
            className="text-3xl text-balance text-foreground md:text-4xl"
          >
            <TwoToneText heading={copy.heading} />
          </h2>
          {copy.intro ? (
            <p className="text-lg text-pretty text-muted-foreground">
              {copy.intro}
            </p>
          ) : null}
        </div>
        <div className="mt-10 md:mt-12">{children}</div>
      </div>
    </section>
  );
}
