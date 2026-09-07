import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Phase 2: brand textarea; see input.tsx. `variant="bare"` strips the box and
// switches to `field-sizing-fixed` so a caller's own height logic (the
// composer's auto-grow) wins.
const textareaVariants = cva(
  "flex field-sizing-content min-h-16 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-base transition-[color,border-color,box-shadow] duration-(--duration-fast) ease-out-quart outline-none placeholder:text-foreground-low hover:border-border-loud focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:bg-tint-5 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm",
  {
    variants: {
      variant: {
        default: "",
        bare: "min-h-0 field-sizing-fixed rounded-none border-0 p-0 shadow-none hover:border-transparent focus-visible:border-transparent focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Textarea({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"textarea"> & VariantProps<typeof textareaVariants>) {
  return (
    <textarea
      data-slot="textarea"
      data-variant={variant}
      className={cn(textareaVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Textarea, textareaVariants };
