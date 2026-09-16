import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// An app window on the demo desktop: three dots and a title-bar skeleton,
// then the body. A light surface with the photo-tile shadow and a hairline
// ring, the depth the landing's browser frame spends (a/thread-replica.tsx),
// so a window reads as lifted off the wallpaper. The scene places it: pass
// the position and size as `className` (absolute, in percent of the desktop).
// Windows later in the markup sit in front.
export function DesktopWindow({
  className,
  bodyClassName,
  children,
}: {
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute flex flex-col overflow-hidden rounded-xl bg-surface-elevated shadow-xl ring-1 ring-black/5",
        className,
      )}
    >
      <div className="relative flex h-8 shrink-0 items-center border-b border-border-subtle px-3">
        <div className="flex gap-1.5">
          <span className="size-2 rounded-full bg-tint-20" />
          <span className="size-2 rounded-full bg-tint-20" />
          <span className="size-2 rounded-full bg-tint-20" />
        </div>
        <span className="absolute top-1/2 left-1/2 h-2 w-1/4 -translate-1/2 rounded-full bg-tint-12" />
      </div>
      <div className={cn("flex min-h-0 flex-1 flex-col", bodyClassName)}>
        {children}
      </div>
    </div>
  );
}
