import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Phase 2: the brand button. Every control is a pill, the default is INK and
// `brand` (tangerine) is the single CTA; hover fills are tints, motion is the
// 150ms quart-out with press feedback under motion-safe (docs/brand/design.md
// §5, §8). The size API is Hyperagent's (default / xs / sm / lg / icon /
// icon-xs / icon-sm / icon-lg) with the phase-1 heights, so page layouts keep
// their metrics; only the skin changes.
//
// Component sweep additions: `tint` (the toolbar pill: rest tint-10, hover
// and open tint-15, text lifts to the first tier), `pill` (32px with the
// composer's 12px padding kept when the icon is a direct child), `icon-2xs`
// (the 22px message action, a 14px icon) and `none` (no height, padding or
// gap: the caller owns the shape; use only where no size family fits).
const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium text-sm select-none outline-none transition-[color,background-color,box-shadow,transform] duration-(--duration-fast) ease-out-quart focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-safe:active:scale-(--scale-press) disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-2 aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        brand: "bg-brand text-brand-foreground shadow-sm hover:bg-brand/90",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/30",
        outline: "bg-background text-foreground shadow-edge hover:bg-tint-10 aria-expanded:bg-tint-10",
        secondary: "bg-surface-secondary text-foreground hover:bg-tint-15 aria-expanded:bg-tint-15",
        ghost: "text-foreground hover:bg-tint-10 aria-expanded:bg-tint-10",
        tint: "bg-tint-10 text-muted-foreground hover:bg-tint-15 hover:text-foreground aria-expanded:bg-tint-15 aria-expanded:text-foreground",
        chip: "bg-chip text-chip-foreground hover:bg-accent hover:text-foreground aria-pressed:bg-primary aria-pressed:text-primary-foreground",
        link: "text-foreground underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-7 gap-1 px-2.5 text-xs has-[>svg]:px-2",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 px-6 has-[>svg]:px-4",
        pill: "h-8 gap-1.5 px-3 has-[>svg]:px-3",
        icon: "size-9 motion-safe:active:scale-(--scale-press-icon)",
        "icon-2xs": "size-5.5 motion-safe:active:scale-(--scale-press-icon) [&_svg:not([class*='size-'])]:size-3.5",
        "icon-xs": "size-6 motion-safe:active:scale-(--scale-press-icon)",
        "icon-sm": "size-8 motion-safe:active:scale-(--scale-press-icon)",
        "icon-lg": "size-10 motion-safe:active:scale-(--scale-press-icon)",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
