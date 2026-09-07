import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Phase 2: the brand section card. 22px corners, a hairline edge carried as a
// box-shadow instead of a ring, and the serif heading face on the title
// (docs/brand/design.md §5, §6, §15). Spacing keeps Hyperagent's 16px so page
// layouts do not move.
//
// Component sweep additions: `size="none"` zeroes `--card-spacing` (the page
// keeps its own padding), `variant="interactive"` is the hover lift every
// clickable card shares (slow duration, ease-out, `shadow-card-hover`), and
// `asChild` lets a link, a list item or a button be the shell.
const cardVariants = cva(
  "group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-3xl bg-card py-(--card-spacing) text-sm text-card-foreground shadow-card has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 *:[img:first-child]:rounded-t-3xl *:[img:last-child]:rounded-b-3xl",
  {
    variants: {
      size: {
        default: "[--card-spacing:--spacing(4)]",
        sm: "[--card-spacing:--spacing(3)]",
        none: "[--card-spacing:0]",
      },
      variant: {
        default: "",
        interactive: "transition-[box-shadow] duration-(--duration-slow) ease-out hover:shadow-card-hover",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  },
);

function Card({
  className,
  size = "default",
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof cardVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "div";

  return (
    <Comp
      data-slot="card"
      data-size={size}
      data-variant={variant}
      className={cn(cardVariants({ size, variant, className }))}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-description" className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("px-(--card-spacing)", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center border-t border-border-subtle bg-surface-secondary p-(--card-spacing)", className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent, cardVariants };
