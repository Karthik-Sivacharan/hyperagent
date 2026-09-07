"use client";

import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import { Select as SelectPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import type { SelectOption } from "@/lib/mock/library";

// The small select triggers in the Library toolbar. Structure follows the
// dump (docs/reference/pages/library.html); the menu itself is never open in
// the capture. Phase 2: the trigger is the brand tint pill (rest tint-10,
// hover / open tint-15, press feedback under motion-safe), and the menu is
// the brand popover as ui/dropdown-menu.tsx draws it: 14px corners, glass
// shadow, hairline ring, 8px items with tint focus fills, the selected check
// in the accent (docs/brand/design.md §5, §6, §8, §12).
const TRIGGER =
  "flex h-8 w-fit cursor-pointer items-center justify-between gap-2 whitespace-nowrap rounded-full bg-tint-10 px-3 text-sm font-medium text-muted-foreground outline-none transition-[color,background-color,transform] duration-(--duration-normal) ease-out hover:bg-tint-15 hover:text-foreground aria-expanded:bg-tint-15 aria-expanded:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 motion-safe:active:scale-(--scale-press) disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-foreground-low *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0";

const CONTENT =
  "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-xl bg-popover p-1.5 text-popover-foreground shadow-lg ring-1 ring-border-subtle duration-(--duration-enter) ease-out-quart data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-(--duration-exit) data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2";

const ITEM =
  "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-sm outline-hidden transition-[color,background-color] duration-(--duration-instant) ease-out focus:bg-tint-10 focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0";

export function LibrarySelect({
  value,
  onValueChange,
  options,
  ariaLabel,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  ariaLabel: string;
  className?: string;
}) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
      <SelectPrimitive.Trigger
        data-slot="select-trigger"
        data-size="sm"
        aria-label={ariaLabel}
        className={cn(TRIGGER, className)}
      >
        <SelectPrimitive.Value data-slot="select-value" />
        <SelectPrimitive.Icon asChild>
          <IconChevronDown className="size-3.5 opacity-60" aria-hidden="true" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content data-slot="select-content" position="popper" sideOffset={4} className={CONTENT}>
          <SelectPrimitive.Viewport className="h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width) scroll-my-1">
            {options.map((option) => (
              <SelectPrimitive.Item key={option.value} value={option.value} data-slot="select-item" className={ITEM}>
                <span className="absolute right-2 flex size-3.5 items-center justify-center text-brand-accent">
                  <SelectPrimitive.ItemIndicator>
                    <IconCheck className="size-4" aria-hidden="true" />
                  </SelectPrimitive.ItemIndicator>
                </span>
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
