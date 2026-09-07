import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Verbatim copy of brand/src/lib/utils.ts. It differs from Hyperagent's
// `@/lib/utils` in one way that the ui/ copies depend on:
//
// tailwind-merge only knows Tailwind's stock utilities. Teach it the design
// system's custom weight (design.md §4: 450 `font-book`, the heading weight) so a
// component's `font-medium` base loses to a caller's `font-book` instead of
// both surviving (and the base winning by source order).
//
// Phase 2 can either fold this `extend` into `@/lib/utils` or keep pointing the
// Brand components here.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-weight": ["font-book"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
