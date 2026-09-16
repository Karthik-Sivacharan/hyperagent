import {
  IconChartBar,
  IconFileText,
  IconPresentation,
  IconVideo,
  IconWorld,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";

import { FORMATS } from "./content";
import { LandingSection } from "./section";

// One glyph per format, in the order content.ts lists them.
const FORMAT_ICONS = [
  IconWorld,
  IconVideo,
  IconPresentation,
  IconFileText,
  IconChartBar,
];

// What it delivers, from the product's own format tabs: five rows under
// hairlines rather than five identical cards. The name and one sentence on
// the left; on the right, the example jobs as outline chips.
export function Formats() {
  const { id, heading, items, examplesLabel } = FORMATS;
  return (
    <LandingSection id={id} heading={heading}>
      <ul
        role="list"
        className="flex flex-col divide-y divide-border-subtle border-y border-border-subtle"
      >
        {items.map((item, index) => {
          const Icon = FORMAT_ICONS[index] ?? IconFileText;
          const chipsId = `${id}-${item.id}-examples`;
          return (
            <li
              key={item.id}
              className="grid gap-4 py-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-start md:gap-8 md:py-7"
            >
              <div className="flex flex-col gap-1">
                <h3 className="flex items-center gap-2.5 text-lg font-medium text-foreground">
                  <Icon
                    className="size-5 text-foreground-low"
                    aria-hidden="true"
                  />
                  {item.name}
                </h3>
                <p className="text-base text-muted-foreground md:pl-7.5">
                  {item.body}
                </p>
              </div>
              <div className="flex flex-col gap-2 md:pt-1">
                <p id={chipsId} className="sr-only">
                  {examplesLabel}
                </p>
                <ul
                  role="list"
                  aria-labelledby={chipsId}
                  className="flex flex-wrap gap-2"
                >
                  {item.examples.map((example) => (
                    <li key={example}>
                      <Badge
                        variant="outline"
                        className="h-7 px-3 text-sm font-normal"
                      >
                        {example}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>
    </LandingSection>
  );
}
