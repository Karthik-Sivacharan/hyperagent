"use client";

import { Archive } from "lucide-react";
import { Switch } from "@/components/ui/switch";

// "Show Archived" control from the Projects and Library headers. Phase 1
// dressed the raw radix switch with the site's blue/zinc classes; phase 2
// hands it to the shared brand switch (ink when on, a tint track when off,
// docs/brand/design.md §12) and keeps the label on the second text tier.
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
      <label
        data-slot="label"
        htmlFor={id}
        className="flex cursor-pointer select-none items-center gap-2 text-sm font-medium text-muted-foreground transition-[color] duration-(--duration-fast) ease-out-quart peer-disabled:cursor-not-allowed peer-disabled:opacity-50 hover:text-foreground"
      >
        <Archive className="mr-1 inline size-3.5" aria-hidden="true" />
        Show Archived
      </label>
    </div>
  );
}
