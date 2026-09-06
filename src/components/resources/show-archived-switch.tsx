"use client";

import { Archive } from "lucide-react";
import { Switch as SwitchPrimitive } from "radix-ui";

// "Show Archived" control from the Projects and Library headers. The site
// styles this switch itself (blue when on, zinc when off), not with the stock
// shadcn switch in ui/switch.tsx, so the radix primitive is dressed here with
// the dump's classes verbatim.
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
      <SwitchPrimitive.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        data-slot="switch"
        className="peer inline-flex h-[1.15rem] w-8 shrink-0 cursor-pointer items-center rounded-full border shadow-xs outline-none transition-all data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-zinc-500 border-border/50 hover:border-border dark:data-[state=unchecked]:border-zinc-400 data-[state=checked]:hover:bg-blue-700 data-[state=unchecked]:hover:bg-muted dark:data-[state=unchecked]:hover:bg-zinc-400 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <SwitchPrimitive.Thumb
          data-slot="switch-thumb"
          className="pointer-events-none block size-4 rounded-full bg-background shadow-sm ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 data-[state=checked]:bg-white dark:data-[state=unchecked]:bg-foreground"
        />
      </SwitchPrimitive.Root>
      <label
        data-slot="label"
        htmlFor={id}
        className="flex select-none items-center gap-2 font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 cursor-pointer text-muted-foreground text-sm"
      >
        <Archive className="mr-1 inline size-3.5" aria-hidden="true" />
        Show Archived
      </label>
    </div>
  );
}
