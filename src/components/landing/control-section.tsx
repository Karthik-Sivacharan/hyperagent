import { CONTROL } from "./content";
import { FeatureGrid } from "./feature-grid";
import { LandingSection } from "./section";

// Trust in the first half of the page: four product facts about what an
// agent may do alone, each with a small picture (placeholders in v1).
export function ControlSection() {
  return (
    <LandingSection copy={CONTROL.section}>
      <FeatureGrid items={CONTROL.items} />
    </LandingSection>
  );
}
