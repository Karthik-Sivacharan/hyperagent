import { creditLine, formatUsd } from "@/components/landing/content";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { PRICING } from "./content";
import { Section, SURFACE } from "./section";

// The plan ladder from v1's facts (four rungs and a note on the rest), on
// the page's one surface, then the three questions an owner asks before
// connecting their tools. Each plan card gives the price with its unit, what
// the credit comes to, and who it suits; the figures are tabular so the
// ladder lines up when read across. No CTA per card: the closing band that
// follows carries the one call to action.
export function Pricing() {
  const { section, unit, plans, more, faq } = PRICING;
  return (
    <Section copy={section}>
      <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <li key={plan.price}>
            <Card
              size="none"
              className={cn(SURFACE, "h-full gap-3 p-6 sm:p-8")}
            >
              <p className="text-3xl font-medium! text-foreground tabular-nums">
                {formatUsd(plan.price)}{" "}
                <span className="text-base font-normal text-foreground-low">
                  {unit}
                </span>
              </p>
              <p className="text-sm text-muted-foreground tabular-nums">
                {creditLine(plan)}
              </p>
              <p className="mt-2 text-base text-foreground">{plan.fit}</p>
            </Card>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-md text-foreground-low">{more}</p>

      <div
        id={faq.id}
        className="mt-20 scroll-mt-16 border-t border-border-subtle pt-10"
      >
        <h3 className="text-xl font-medium! text-foreground">{faq.heading}</h3>
        <dl className="mt-8 grid gap-8 md:grid-cols-3">
          {faq.items.map((item) => (
            <div key={item.question} className="flex flex-col gap-2">
              <dt className="text-base font-medium text-foreground">
                {item.question}
              </dt>
              <dd className="text-base text-pretty text-muted-foreground">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
