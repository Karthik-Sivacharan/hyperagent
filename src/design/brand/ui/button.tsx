import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/design/brand/utils";

// Brand: every control is a pill; the default button is INK, brand is the
// single CTA. Heights 32/40/48 (Vercel merge). Press feedback under motion-safe.
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full text-sm font-medium whitespace-nowrap select-none transition-[color,background-color,box-shadow,transform] duration-[var(--duration-fast)] ease-out-quart focus-ring motion-safe:active:scale-[var(--scale-press)] disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-2 aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        brand: "bg-brand text-brand-foreground shadow-sm hover:bg-brand/90",
        secondary: "bg-surface-secondary text-foreground hover:bg-tint-15 aria-expanded:bg-tint-15",
        outline: "bg-background text-foreground shadow-edge hover:bg-tint-10 aria-expanded:bg-tint-10",
        ghost: "text-foreground hover:bg-tint-10 aria-expanded:bg-tint-10",
        chip: "bg-chip text-chip-foreground hover:bg-accent hover:text-foreground aria-pressed:bg-primary aria-pressed:text-primary-foreground",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20",
        link: "text-foreground underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 gap-1.5 px-3.5 text-sm has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        default: "h-10 gap-2 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        lg: "h-12 gap-2 px-5 text-base has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        "icon-sm": "size-8 motion-safe:active:scale-[var(--scale-press-icon)]",
        icon: "size-10 motion-safe:active:scale-[var(--scale-press-icon)]",
        "icon-lg": "size-12 motion-safe:active:scale-[var(--scale-press-icon)]",
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
