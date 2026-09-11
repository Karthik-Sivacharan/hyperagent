import { cn } from "@/lib/utils";

// The one line that says the map can be walked (docs/plans/2026-09-11-teams-space-v1.md
// §4). It sits in the toolbar ABOVE the office, not in a corner of the map:
// the map fills the view area below at whole-number scale (704px of about 731
// at 1456x868), so a row in the flow under the toolbar would cost it the 2x
// scale, and a chip over the art reads as part of the art. The map names it
// as its description, so a screen reader hears it on arriving.

export const SPACE_HINT_ID = "space-hint";

export function SpaceHint({ className }: { className?: string }) {
  return (
    <p
      id={SPACE_HINT_ID}
      className={cn(
        "rounded-full bg-card px-3 py-1 text-sm font-medium whitespace-nowrap text-foreground shadow-xs",
        className,
      )}
    >
      Arrow keys to walk. Drag anyone to move them.
    </p>
  );
}
