import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import type { LandingAsset } from "./content";

type AssetSlotProps = {
  asset: LandingAsset;
  // frame: a card holding one skeleton (a picture of the product).
  // bare: the skeleton alone, for a picture inside a card that already exists.
  // lines: a few text lines (a quote still to be sourced).
  // logos: a row of short pills (customer logos).
  variant?: "frame" | "bare" | "lines" | "logos";
  // Size the slot here: an aspect ratio or a height. A frame fills it.
  className?: string;
};

// Every picture of the product on the landing page is a placeholder in v1:
// the brand skeleton (a tint that pulses, and holds still under reduced
// motion), named for what will replace it. `data-asset` is the id the next
// phase searches for; the asset's brief lives with its copy in content.ts.
export function AssetSlot({ asset, variant = "frame", className }: AssetSlotProps) {
  return (
    <div
      role="img"
      aria-label={asset.label}
      data-asset={asset.id}
      className={cn(
        variant === "frame" && "flex rounded-3xl bg-card p-2 shadow-card",
        variant === "bare" && "flex",
        className,
      )}
    >
      {variant === "frame" || variant === "bare" ? <Skeleton className="flex-1 rounded-xl" /> : null}
      {variant === "lines" ? (
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mt-2 h-3 w-40" />
        </div>
      ) : null}
      {variant === "logos" ? (
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          {[0, 1, 2, 3, 4].map((index) => (
            <Skeleton key={index} className="h-5 w-24 rounded-full" />
          ))}
        </div>
      ) : null}
    </div>
  );
}
