import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Phase 2: brand input. The outline is the `input` token (a 20% sand tint,
// docs/brand/design.md §3.2), the placeholder sits on the third text tier and
// focus is the brand ring. `variant="bare"` strips the box (no height,
// padding, border, radius or ring) for a field that lives inside another
// shell: a search row in a menu, the composer.
const inputVariants = cva(
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-[color,border-color,box-shadow] duration-(--duration-fast) ease-out-quart outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-foreground-low hover:border-border-loud focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-tint-5 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm",
  {
    variants: {
      variant: {
        default: "",
        bare: "h-auto rounded-none border-0 px-0 py-0 shadow-none hover:border-transparent focus-visible:border-transparent focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Input({
  className,
  type,
  variant = "default",
  ...props
}: React.ComponentProps<"input"> & VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      data-variant={variant}
      className={cn(inputVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Input, inputVariants };
