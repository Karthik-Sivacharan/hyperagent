import { IconAlertCircle } from "@tabler/icons-react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

import { CONTROL } from "./content";
import { Section, SURFACE } from "./section";

// Four tiles on what an agent may do alone. Each ends in a small picture of
// the setting it describes: the autonomy switch as the brand's joined
// toggle track (inert, one image), and three tiles of key and value rows.
// The one pending change is the tile row's only chroma.
export function Control() {
  const { section, autonomy, tiles } = CONTROL;
  return (
    <Section copy={section}>
      <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <li>
          <Tile title={autonomy.title} body={autonomy.body}>
            <div role="img" aria-label={autonomy.picture.label}>
              <div inert className="flex flex-col gap-4">
                <ToggleGroup
                  type="single"
                  value={autonomy.picture.selected}
                  spacing={0}
                  size="sm"
                  className="w-full"
                >
                  {autonomy.picture.options.map((option) => (
                    <ToggleGroupItem
                      key={option.value}
                      value={option.value}
                      className="flex-1"
                    >
                      {option.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <dl className="flex flex-col gap-1 text-xs">
                  <dt className="text-foreground-low">
                    {autonomy.picture.ruleLabel}
                  </dt>
                  <dd className="text-foreground">{autonomy.picture.rule}</dd>
                </dl>
              </div>
            </div>
          </Tile>
        </li>
        {tiles.map((tile) => (
          <li key={tile.title}>
            <Tile title={tile.title} body={tile.body}>
              <dl className="flex flex-col divide-y divide-border-subtle text-xs">
                {tile.rows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-baseline justify-between gap-3 py-2"
                  >
                    <dt className="text-foreground-low">{row.label}</dt>
                    <dd
                      className={cn(
                        "text-right tabular-nums",
                        "needsYou" in row && row.needsYou
                          ? "flex items-center gap-1 font-medium text-brand-accent"
                          : "text-foreground",
                      )}
                    >
                      {"needsYou" in row && row.needsYou ? (
                        <IconAlertCircle
                          aria-hidden="true"
                          className="size-3.5"
                        />
                      ) : null}
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Tile>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function Tile({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <Card size="none" className={cn(SURFACE, "h-full gap-2 p-6 sm:p-8")}>
      <h3 className="text-base font-medium text-foreground">{title}</h3>
      <p className="text-sm text-pretty text-muted-foreground">{body}</p>
      <div className="mt-auto pt-6">{children}</div>
    </Card>
  );
}
