import { Overline } from "@/components/ui/overline";

import { HOW_IT_WORKS } from "./content";
import { FeatureGrid } from "./feature-grid";
import { LandingSection } from "./section";

// The product's real sequence in four numbered steps, then every way a job
// can start, as a plain list under a hairline. The list keeps an explicit
// `role` because the preflight strips its markers, and some screen readers
// drop list semantics with them.
export function HowItWorks() {
  const { section, steps, startsFrom } = HOW_IT_WORKS;
  const labelId = `${section.id}-starts-from`;
  return (
    <LandingSection copy={section}>
      <FeatureGrid items={steps} numbered />
      <div className="mt-16 flex flex-col gap-3 border-t border-border-subtle pt-6 md:flex-row md:items-baseline md:gap-8">
        <Overline asChild>
          <p id={labelId}>{startsFrom.label}</p>
        </Overline>
        <ul
          role="list"
          aria-labelledby={labelId}
          className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground"
        >
          {startsFrom.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </LandingSection>
  );
}
