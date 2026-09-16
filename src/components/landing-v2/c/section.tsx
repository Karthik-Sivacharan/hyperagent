import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { SectionCopy, TwoTone } from "./content";

// A heading in two tones: the claim in the first text tier and its
// continuation in the second, at the same size.
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

// The 112px rhythm the "Ink" page keeps between sections (64px on a phone),
// with no hairline and no eyebrow: sections part on space alone, and the
// heading at medium weight carries the turn. `scroll-mt-16` keeps an
// anchored section clear of the sticky header.
export function Section({
  copy,
  children,
  className,
}: {
  copy: SectionCopy;
  children: ReactNode;
  className?: string;
}) {
  const headingId = `${copy.id}-heading`;
  return (
    <section
      id={copy.id}
      aria-labelledby={headingId}
      className="scroll-mt-16 px-4 sm:px-6"
    >
      <div className={cn("mx-auto max-w-6xl py-16 md:py-28", className)}>
        <SectionHeading id={headingId} copy={copy} />
        <div className="mt-10 md:mt-14">{children}</div>
      </div>
    </section>
  );
}

// The heading block alone, for a section that lays it out itself.
export function SectionHeading({
  id,
  copy,
  className,
}: {
  id: string;
  copy: SectionCopy;
  className?: string;
}) {
  return (
    <div className={cn("flex max-w-content flex-col gap-4", className)}>
      <h2
        id={id}
        className="text-3xl font-medium text-balance text-foreground md:text-4xl"
      >
        <TwoToneText heading={copy.heading} />
      </h2>
      {copy.intro ? (
        <p className="text-lg text-pretty text-muted-foreground">
          {copy.intro}
        </p>
      ) : null}
    </div>
  );
}

// Every surface on the page: one colour, one hairline, the largest radius,
// 32px of padding. Cards pass it to the Card primitive as a className.
export const SURFACE = "rounded-5xl bg-card shadow-edge";
