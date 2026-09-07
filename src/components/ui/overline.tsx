import * as React from "react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

// Phase 2: the third-tier caps group label the brand mandates for every group
// heading (docs/brand/design.md §4.1): the 12px caps role on the low text
// tier. Layout stays with the caller (`className`); `asChild` lets a heading
// or a menu label carry the `overline` slot, as the site emits it.
function Overline({ className, asChild = false, ...props }: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div";

  return <Comp data-slot="overline" className={cn("text-label-12-caps text-foreground-low", className)} {...props} />;
}

export { Overline };
