"use client";

import { IconArchive } from "@tabler/icons-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// "Show Archived" control from the Projects and Library headers. Phase 1
// dressed the raw radix switch with the site's blue/zinc classes; phase 2
// hands it to the shared brand switch (ink when on, a tint track when off,
// docs/brand/design.md §12) and the brand label, kept on the second text tier
// and lifting to the first on hover. The label keeps its 20px line (no
// `leading-none`): it sets the height of the header row on both pages.
export function ShowArchivedSwitch({
  checked,
  onCheckedChange,
  id = "show-archived",
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <Label
        htmlFor={id}
        className="cursor-pointer text-muted-foreground transition-[color] duration-(--duration-fast) ease-out-quart hover:text-foreground"
      >
        <IconArchive className="mr-1 inline size-3.5" aria-hidden="true" />
        Show Archived
      </Label>
    </div>
  );
}
