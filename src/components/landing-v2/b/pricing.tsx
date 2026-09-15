import { creditLine, formatUsd, PRICING } from "./content";
import { Section } from "./section";

// v1's plan ladder and its three questions, on this variant's soft cards.
// Each plan gives three things: the price with its unit, what the credit
// comes to, and who it suits; the cards are equal peers with tabular
// figures. The questions stay open in columns, nothing to toggle.
export function Pricing() {
  const { section, unit, plans, more, faq } = PRICING;
  return (
    <Section copy={section}>
      <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <li
            key={plan.price}
            className="flex h-full flex-col gap-3 rounded-3xl bg-surface-secondary p-6 shadow-edge"
          >
            <p className="text-3xl text-foreground tabular-nums">
              {formatUsd(plan.price)}{" "}
              <span className="text-base font-normal text-foreground-low">
                {unit}
              </span>
            </p>
            <p className="text-sm text-muted-foreground tabular-nums">
              {creditLine(plan)}
            </p>
            <p className="mt-2 text-base text-foreground">{plan.fit}</p>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-md text-foreground-low">{more}</p>

      <div id={faq.id} className="mt-20 scroll-mt-20">
        <h3 className="text-xl text-foreground">{faq.heading}</h3>
        <dl className="mt-8 grid gap-8 md:grid-cols-3">
          {faq.items.map((item) => (
            <div key={item.question} className="flex flex-col gap-2">
              <dt className="text-base font-semibold text-foreground">
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
