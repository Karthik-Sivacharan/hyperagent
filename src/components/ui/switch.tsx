"use client"

import * as React from "react"
import { cn } from "cn"
import { Switch as SwitchPrimitive } from "radix-ui"

// hyperagent.com's switch (docs/reference/overlays/composer-thread-settings-menu.html,
// the "Fast inference" toggle): blue when checked, zinc track when unchecked.

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-[1.15rem] w-8 shrink-0 cursor-pointer items-center rounded-full border shadow-xs outline-none transition-all data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-zinc-500 border-border/50 hover:border-border dark:data-[state=unchecked]:border-zinc-400 data-[state=checked]:hover:bg-blue-700 data-[state=unchecked]:hover:bg-muted dark:data-[state=unchecked]:hover:bg-zinc-400 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-4 rounded-full bg-background shadow-sm ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 data-[state=checked]:bg-white dark:data-[state=unchecked]:bg-foreground"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
