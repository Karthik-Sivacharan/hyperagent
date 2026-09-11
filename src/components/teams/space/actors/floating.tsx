"use client";

import * as React from "react";
import type { Transition } from "motion/react";

import { DURATION, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useFollow } from "@/components/teams/space/scene/scene-context";
import type { FollowPoint, SceneStore } from "@/components/teams/space/scene/store";

// The chrome's shared parts. Chrome (tags, bubbles, the ask card) is not
// scaled with the art: it is set at its natural size in the stage's px
// space, on a zero-size point the scene store moves every frame something
// moves (`Floating`), and each piece hangs off that point with ordinary
// layout (`bottom-*`, `-translate-x-1/2`).

/** A point in stage px that follows `anchor`; its children hang off it. Takes no pointer. */
export function Floating({
  anchor,
  deps,
  className,
  style,
  children,
  ...props
}: {
  anchor: (store: SceneStore) => FollowPoint | null;
  deps: React.DependencyList;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
} & Pick<React.HTMLAttributes<HTMLDivElement>, "aria-hidden">) {
  const ref = useFollow<HTMLDivElement>(anchor, deps.join("|"));
  return (
    <div ref={ref} className={cn("pointer-events-none absolute top-0 left-0 size-0", className)} style={style} {...props}>
      {children}
    </div>
  );
}

/** A 12x6 caret pointing down, in the current colour. */
export function Caret({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" width="12" height="6" viewBox="0 0 12 6" className={cn("block shrink-0", className)}>
      <path d="M0 0H12L6 6Z" fill="currentColor" />
    </svg>
  );
}

/**
 * The ink surface's text remap, as the Tooltip primitive does it: text
 * inside a tag reads `--foreground` and `--muted-foreground` against ink.
 */
export const INK_VARS = {
  "--foreground": "var(--primary-foreground)",
  "--muted-foreground": "oklch(from var(--primary-foreground) l c h / 0.72)",
} as React.CSSProperties;

const enter: Transition = { duration: DURATION.enter, ease: EASE.out };
const exit: Transition = { duration: DURATION.exit, ease: EASE.out };

/** Opacity only: tags and reveals (plan §5). 140ms in, 90ms out. */
export const FADE = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: enter },
  exit: { opacity: 0, transition: exit },
} as const;

/**
 * The ask card and the bubbles: opacity with a 0.96 to 1 scale from their
 * bottom edge. MotionConfig reducedMotion="user" (teams-page.tsx) drops the
 * scale and keeps the fade.
 */
export const POP = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: enter },
  exit: { opacity: 0, scale: 0.96, transition: exit },
} as const;
