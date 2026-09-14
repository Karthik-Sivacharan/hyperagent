import { Card } from "@/components/ui/card";

import { AssetSlot } from "./asset-slot";
import { RECEIPTS } from "./content";
import { LandingSection } from "./section";

// Cost and quality: the ledger (a placeholder) across two columns, and two
// cards beside it on how a run is scored and what it is charged.
export function ReceiptsSection() {
  const { section, ledger, notes } = RECEIPTS;
  return (
    <LandingSection copy={section}>
      <div className="grid gap-6 lg:grid-cols-3">
        <AssetSlot asset={ledger} className="aspect-4/3 lg:col-span-2 lg:aspect-auto lg:min-h-96" />
        <div className="flex flex-col gap-6">
          {notes.map((note) => (
            <Card key={note.title} size="none" className="gap-2 p-6">
              <h3 className="text-base font-semibold text-foreground">{note.title}</h3>
              <p className="text-base text-muted-foreground">{note.body}</p>
              {note.asset ? <AssetSlot asset={note.asset} variant="bare" className="mt-4 h-20" /> : null}
            </Card>
          ))}
        </div>
      </div>
    </LandingSection>
  );
}
