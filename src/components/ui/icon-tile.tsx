import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Phase 2: a small surface framing a glyph or a letter. Three axes: `size`
// (the author initial at 20px, the composer logo at 24px, the settings tile
// at 48px, the empty-state bubble at 64px), `shape` (8px, 14px or round) and
// `tone` (raised on the canvas with a hairline edge, a tint, or the
// brand-subtle surface for the one accented tile; docs/brand/design.md §5,
// §6). The icon inside keeps the caller's size.
const iconTileVariants = cva("flex shrink-0 items-center justify-center", {
  variants: {
    size: {
      xs: "size-5 text-[10px] font-medium",
      sm: "size-6",
      lg: "size-12",
      xl: "size-16",
    },
    shape: {
      rounded: "rounded-md",
      soft: "rounded-xl",
      circle: "rounded-full",
    },
    tone: {
      raised: "bg-background shadow-edge",
      tint: "bg-tint-10 text-muted-foreground",
      brand: "bg-brand-subtle text-brand-subtle-foreground",
    },
  },
  defaultVariants: {
    size: "sm",
    shape: "rounded",
    tone: "tint",
  },
});

function IconTile({
  className,
  size = "sm",
  shape = "rounded",
  tone = "tint",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof iconTileVariants>) {
  return (
    <div
      data-slot="icon-tile"
      data-size={size}
      data-tone={tone}
      className={cn(iconTileVariants({ size, shape, tone, className }))}
      {...props}
    />
  );
}

export { IconTile, iconTileVariants };
