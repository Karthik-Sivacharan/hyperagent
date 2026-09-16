import type { ReactNode } from "react";

import { Overline } from "@/components/ui/overline";
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

// One band of the page: a hairline across the content column, the caps
// eyebrow, the two-tone heading and an optional intro, then the section's own
// layout. Sections part on space and one hairline, never on a change of
// ground: 96px above and below the hairline beside a pointer, 64px on a
// phone, the same scale the hero and the closing band keep. `scroll-mt-16`
// keeps an anchored section clear of the sticky header. The heading
// balances its lines and the intro never strands a word.
export function LandingSection({
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
      <div
        className={cn(
          "mx-auto max-w-6xl border-t border-border-subtle py-16 md:py-24",
          className,
        )}
      >
        <div className="flex max-w-content flex-col gap-4">
          <Overline asChild>
            <p>{copy.eyebrow}</p>
          </Overline>
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
        <div className="mt-12 md:mt-16">{children}</div>
      </div>
    </section>
  );
}
