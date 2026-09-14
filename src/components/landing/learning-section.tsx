import { AssetSlot } from "./asset-slot";
import { LEARNING } from "./content";
import { LandingSection } from "./section";

// How the fleet improves: three plain definitions beside week one and week
// eight of one agent (a placeholder in v1).
export function LearningSection() {
  const { section, items, asset } = LEARNING;
  return (
    <LandingSection copy={section}>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center">
        <ul role="list" className="flex flex-col gap-8">
          {items.map((item) => (
            <li key={item.title} className="flex flex-col gap-1">
              <h3 className="text-base font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="text-base text-muted-foreground">{item.body}</p>
            </li>
          ))}
        </ul>
        <AssetSlot asset={asset} className="aspect-16/10" />
      </div>
    </LandingSection>
  );
}
