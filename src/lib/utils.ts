import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Phase 2: the brand's `cn()` (src/design/brand/utils.ts) folded in, so a
// caller's `font-book` (the 450 heading weight) beats a component's
// `font-medium` the way it does in the brand prototype. The
// brand's typography role classes (brand.css, "text-heading-*" and
// "text-label-*") are registered as their own group: tailwind-merge would
// otherwise read `text-label-12-caps` as a text colour and drop it whenever a
// `text-foreground-low` follows it in the same class list.
const twMerge = extendTailwindMerge<"text-role">({
  extend: {
    classGroups: {
      "font-weight": ["font-book"],
      "text-role": ["text-heading-display", "text-heading-lg", "text-label-14-mono", "text-label-12-mono", "text-label-12-caps"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
