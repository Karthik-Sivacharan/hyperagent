"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Phase 2: brand switch. Ink when checked, a 20% tint track when unchecked; no
// status hue on a toggle (docs/brand/design.md §12). `size="sm"` is the 14x24
// track with a 12px thumb for a row inside a menu.
const switchVariants = cva(
  "group/switch peer inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent outline-none transition-[background-color,box-shadow] duration-(--duration-instant) ease-out data-[state=checked]:bg-primary data-[state=unchecked]:bg-tint-20 data-[state=unchecked]:hover:bg-tint-25 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        default: "h-[1.15rem] w-8",
        sm: "h-3.5 w-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & VariantProps<typeof switchVariants>) {
  return (
    <SwitchPrimitive.Root data-slot="switch" data-size={size} className={cn(switchVariants({ size, className }))} {...props}>
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-4 rounded-full bg-background shadow-xs ring-0 transition-transform duration-(--duration-instant) ease-out data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 data-[state=checked]:bg-primary-foreground group-data-[size=sm]/switch:size-3"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch, switchVariants };
