import { cn } from "@/lib/utils";

// Phase 2: the brand skeleton, a tint that reads on the canvas and on cards in both themes.
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="skeleton" className={cn("animate-skeleton rounded-md bg-tint-10", className)} {...props} />;
}

export { Skeleton };
