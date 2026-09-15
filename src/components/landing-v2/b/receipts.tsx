import { Badge } from "@/components/ui/badge";

import { RECEIPTS, type ReceiptRow } from "./content";
import { Section } from "./section";

// Two soft panels, each with a claim and the receipt that backs it: the
// scored run, then the same run itemised. Figures are tabular so the two
// columns read across.
export function Receipts() {
  const { section, cards } = RECEIPTS;
  return (
    <Section copy={section}>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <div
            key={card.title}
            className="flex flex-col gap-6 rounded-5xl bg-surface-secondary p-6 shadow-edge md:p-8"
          >
            <div className="flex flex-col gap-2">
              <h3 className="text-xl text-foreground">{card.title}</h3>
              <p className="max-w-md text-base text-pretty text-muted-foreground">
                {card.body}
              </p>
            </div>
            <Receipt receipt={card.receipt} />
          </div>
        ))}
      </div>
    </Section>
  );
}

type ReceiptData = {
  title: string;
  subtitle: string;
  rows: ReceiptRow[];
  state?: { label: string; text: string };
  total?: ReceiptRow;
};

function Receipt({ receipt }: { receipt: ReceiptData }) {
  return (
    <div className="mt-auto rounded-3xl bg-background p-5 shadow-card-soft">
      <p className="text-sm font-medium text-foreground">{receipt.title}</p>
      <p className="text-md text-foreground-low">{receipt.subtitle}</p>
      <dl className="mt-4">
        {receipt.rows.map((row) => (
          <div
            key={row.key}
            className="flex items-baseline justify-between gap-4 border-t border-border-subtle py-2.5 text-sm"
          >
            <dt className="text-muted-foreground">{row.key}</dt>
            <dd className="text-right text-foreground tabular-nums">
              {row.value}
            </dd>
          </div>
        ))}
        {receipt.total ? (
          <div className="flex items-baseline justify-between gap-4 border-t border-border-subtle py-2.5 text-sm font-medium">
            <dt className="text-foreground">{receipt.total.key}</dt>
            <dd className="text-foreground tabular-nums">
              {receipt.total.value}
            </dd>
          </div>
        ) : null}
      </dl>
      {receipt.state ? (
        <div className="mt-2 flex items-center gap-3 border-t border-border-subtle pt-3">
          <Badge variant="brand">{receipt.state.label}</Badge>
          <p className="text-sm text-muted-foreground">{receipt.state.text}</p>
        </div>
      ) : null}
    </div>
  );
}
