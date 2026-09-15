import type { TablerIcon } from "@tabler/icons-react";

import { IconTile } from "@/components/ui/icon-tile";
import { GLASS } from "@/components/workspace/glass";
import { cn } from "@/lib/utils";

export type DockApp = {
  icon: TablerIcon;
  /** Ink for the one app the scene is about, raised sand for the rest. */
  tone?: "ink" | "raised";
  /** Has a window on the desktop: the dot under the tile. */
  open?: boolean;
};

// The dock along the desktop's bottom edge: the workspace dock's glass and
// shape (workspace/artifact-dock.tsx), holding generic app tiles instead of
// documents. A glyph from the icon set in a rounded tile, never a product's
// icon; the apps with a window open carry the dot.
export function Dock({ apps }: { apps: DockApp[] }) {
  return (
    <div className="absolute inset-x-0 bottom-4 flex justify-center">
      <div
        className={cn(
          "flex items-start gap-2 rounded-3xl px-2 pt-2 pb-1 shadow-md",
          GLASS,
        )}
      >
        {apps.map(({ icon: Icon, tone = "raised", open = false }, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <IconTile
              size="lg"
              shape="soft"
              tone="raised"
              className={cn(
                "shadow-md",
                tone === "ink"
                  ? "bg-foreground text-background"
                  : "text-foreground/75",
              )}
            >
              <Icon aria-hidden="true" stroke={1.75} className="size-6" />
            </IconTile>
            <span
              className={cn(
                "size-1 rounded-full bg-foreground/70",
                open ? "opacity-100" : "opacity-0",
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
