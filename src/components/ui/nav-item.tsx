import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Phase 2: the sidebar row. A full-width pill with the chip motion (normal
// duration, ease-out), a tint hover fill and a stronger tint when active
// (docs/brand/design.md §5, §8); `muted` starts on the second text tier and
// lifts to the first on hover. `asChild` for links. The children (the icon
// box, the label, a trailing kbd or chevron) stay the caller's.
const navItemVariants = cva(
  "flex w-full cursor-pointer items-center gap-2 overflow-hidden rounded-full px-3.5 py-1.5 text-sm transition-[color,background-color] duration-(--duration-normal) ease-out",
  {
    variants: {
      tone: {
        default: "text-foreground hover:bg-tint-10",
        muted: "text-muted-foreground hover:bg-tint-10 hover:text-foreground",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  },
);

function NavItem({
  className,
  tone = "default",
  active = false,
  asChild = false,
  type = "button",
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof navItemVariants> & {
    asChild?: boolean;
    active?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="nav-item"
      data-active={active || undefined}
      type={asChild ? undefined : type}
      className={cn(navItemVariants({ tone }), active && "bg-tint-15 font-medium text-foreground hover:bg-tint-15", className)}
      {...props}
    />
  );
}

export { NavItem, navItemVariants };
