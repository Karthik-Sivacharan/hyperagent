import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

// Phase 2: brand pills. Status variants are tinted chips with the status colour
// as text, the only sanctioned use of a status hue besides a small dot
// (docs/brand/design.md §15). Hyperagent's variant names are kept.
const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full px-2 text-xs font-medium whitespace-nowrap tabular-nums transition-[color,background-color] duration-(--duration-fast) ease-out-quart focus-visible:ring-2 focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary: "bg-tint-10 text-muted-foreground [a]:hover:bg-tint-15",
        destructive: "bg-destructive/10 text-destructive [a]:hover:bg-destructive/20",
        outline: "shadow-edge text-foreground [a]:hover:bg-tint-10",
        ghost: "text-muted-foreground hover:bg-tint-10 hover:text-foreground",
        link: "text-foreground underline-offset-4 hover:underline",
        brand: "bg-brand-subtle text-brand-subtle-foreground",
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
        info: "bg-info/10 text-info",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return <Comp data-slot="badge" data-variant={variant} className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
