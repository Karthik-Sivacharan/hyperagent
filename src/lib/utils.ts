import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Phase 2: the brand's `cn()` (src/design/brand/utils.ts) folded in, so the
// brand's one custom weight utility, `font-strong` (550, Vercel's weight for
// strong inside copy), conflicts with `font-medium` / `font-semibold` the way
// stock weights do instead of both surviving. The
// brand's typography role classes (brand.css, "text-heading-*" and
// "text-label-*") are registered as their own group: tailwind-merge would
// otherwise read `text-label-12-caps` as a text colour and drop it whenever a
// `text-foreground-low` follows it in the same class list.
//
// The brand's named shadows and radii (globals.css, "PHASE 2 BRIDGE") join
// the stock `shadow` and `rounded` groups: tailwind-merge only knows the
// t-shirt sizes, so `cn("shadow-edge", "shadow-md")` used to keep both and
// leave the cascade to decide. Modifiers still keep their own bucket
// (`shadow-card hover:shadow-card-hover` survives intact).
const twMerge = extendTailwindMerge<"text-role">({
  extend: {
    classGroups: {
      "font-weight": ["font-strong"],
      "text-role": ["text-heading-display", "text-heading-lg", "text-label-14-mono", "text-label-12-mono", "text-label-12-caps"],
      shadow: ["shadow-edge", "shadow-card", "shadow-card-hover", "shadow-hero", "shadow-avatar", "shadow-rim"],
      rounded: ["rounded-bubble", "rounded-hero", "rounded-squircle"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
