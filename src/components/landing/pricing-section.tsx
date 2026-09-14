import { Card } from "@/components/ui/card";

import { creditLine, formatUsd, PRICING } from "./content";
import { LandingSection } from "./section";

// The real plan ladder from the docs (four rungs and a note on the rest),
// then the three questions an owner asks before connecting their tools.
//
// Each plan card gives three things and nothing else: the price with its
// unit, what the credit comes to, and who it suits. The cards are equal
// peers (same role, size and weight for every price, so a longer figure
// never resizes its neighbours) and the figures are tabular, so the ladder
// lines up when read across. There is no CTA per card: the closing band that
// follows carries the one call to action.
//
// The questions stay open in three columns rather than behind an accordion:
// nothing to toggle, so nothing to reach by keyboard, and a fear answered in
// plain words should not need a click to read.
export function PricingSection() {
  const { section, unit, plans, more, faq } = PRICING;
  return (
    <LandingSection copy={section}>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <li key={plan.price}>
            <Card size="none" className="h-full gap-3 p-6">
              <p className="text-3xl text-foreground tabular-nums">
                {formatUsd(plan.price)}{" "}
                <span className="text-base font-normal text-foreground-low">{unit}</span>
              </p>
              <p className="text-sm text-muted-foreground tabular-nums">{creditLine(plan)}</p>
              <p className="mt-2 text-base text-foreground">{plan.fit}</p>
            </Card>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-md text-foreground-low">{more}</p>

      <div id={faq.id} className="mt-20 scroll-mt-16 border-t border-border-subtle pt-10">
        <h3 className="text-xl text-foreground">{faq.heading}</h3>
        <dl className="mt-8 grid gap-8 md:grid-cols-3">
          {faq.items.map((item) => (
            <div key={item.question} className="flex flex-col gap-2">
              <dt className="text-base font-semibold text-foreground">{item.question}</dt>
              <dd className="text-base text-muted-foreground">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </LandingSection>
  );
}
