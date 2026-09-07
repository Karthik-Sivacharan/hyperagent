import type { TablerIcon } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

// Centered empty state shared by the resource pages. Two looks appear on
// the site: "bubble" (Projects, Agents) puts the icon in a round tile with an
// xl heading; "plain" (Library, Memories) shows a large bare icon with an lg
// heading. Phase 2 keeps both layouts and re-skins them: the bubble tile is a
// tint disc with the icon on the second text tier (no ink glass), the title
// sits on the first tier in the brand display face, the description on the
// second, and the plain icon drops to the third tier (docs/brand/design.md
// §4.1, §12). The action the caller passes is the ink button.
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "bubble",
}: {
  icon: TablerIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  variant?: "bubble" | "plain";
}) {
  const bubble = variant === "bubble";
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {bubble ? (
        <div className="flex size-16 items-center justify-center rounded-full bg-tint-10 text-muted-foreground">
          <Icon className="size-8" aria-hidden="true" />
        </div>
      ) : (
        <Icon className="size-12 text-foreground-low" aria-hidden="true" />
      )}
      <h2 className={cn("mt-4 font-heading text-foreground", bubble ? "text-xl" : "text-heading-lg")}>
        {title}
      </h2>
      <p className={cn("mt-2 text-muted-foreground", bubble ? "max-w-md" : "text-sm")}>{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
