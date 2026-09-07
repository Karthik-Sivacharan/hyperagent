"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

// Phase 2: brand tooltip. Ink card, 10px corners, no border, sideOffset 6 as
// on the site; the foreground variables are remapped so nested text and kbd
// read on the ink surface.

function TooltipProvider({ delayDuration = 0, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />;
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 6,
  style,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "fade-in-0 zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 pointer-events-none z-50 w-fit max-w-[282px] origin-(--radix-tooltip-content-transform-origin) animate-in overflow-hidden whitespace-normal break-words rounded-lg bg-primary px-3 py-1.5 text-primary-foreground text-xs shadow-md duration-(--duration-enter) ease-out-quart data-[state=closed]:animate-out data-[state=closed]:duration-(--duration-exit)",
          className,
        )}
        style={
          {
            "--foreground": "var(--primary-foreground)",
            "--muted-foreground": "oklch(from var(--primary-foreground) l c h / 0.72)",
            ...style,
          } as React.CSSProperties
        }
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
