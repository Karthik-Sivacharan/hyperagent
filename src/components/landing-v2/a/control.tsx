import { IconCoin, IconEye, IconHandStop, IconKey } from "@tabler/icons-react";

import { CONTROL } from "./content";
import { LandingSection } from "./section";

// One glyph per rule, in the order content.ts lists them.
const CONTROL_ICONS = [IconHandStop, IconKey, IconEye, IconCoin];

// Four quiet tiles on the raised surface, no border, no shadow: the rule, one
// sentence, and at the bottom the rule as the product would show it, one
// line on the card surface.
export function Control() {
  const { id, heading, items } = CONTROL;
  return (
    <LandingSection id={id} heading={heading}>
      <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => {
          const Icon = CONTROL_ICONS[index] ?? IconHandStop;
          return (
            <li
              key={item.title}
              className="flex flex-col gap-3 rounded-3xl bg-surface-raised p-6"
            >
              <Icon className="size-5 text-foreground-low" aria-hidden="true" />
              <h3 className="text-base font-medium text-foreground">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground">{item.body}</p>
              <p className="mt-auto rounded-xl bg-background px-3 py-2 text-md text-foreground shadow-edge">
                {item.example}
              </p>
            </li>
          );
        })}
      </ul>
    </LandingSection>
  );
}
