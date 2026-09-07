import * as React from "react";

import { cn } from "@/lib/utils";

// Phase 2: brand textarea; see input.tsx.
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-base transition-[color,border-color,box-shadow] duration-(--duration-fast) ease-out-quart outline-none placeholder:text-foreground-low hover:border-border-loud focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:bg-tint-5 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
