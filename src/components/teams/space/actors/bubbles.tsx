"use client";

import { motion, useIsPresent } from "motion/react";
import { IconProgressHelp } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import type { AgentState } from "@/lib/mock/teams";
import type { ActorId } from "@/components/teams/space/types";
import { TONE_GLYPH } from "@/components/teams/fleet/run-caption";
import { Floating, POP } from "@/components/teams/space/actors/floating";
import type { SceneStore } from "@/components/teams/space/scene/store";

// What sits on a character's head (docs/plans/2026-09-11-teams-space-v1.md
// §3, §4): small `bg-card` speech bubbles beside the head, under the tags.
//
//   ask     Needs you: IconProgressHelp in the accent, the only tangerine in
//           the view
//   state   the paused or error glyph, lifted out of a tag that merged into a
//           group, so a merge never hides that an agent is stuck
//   dots    the 2D-office static "…" at the lead of a live shared run
//
// A head has two slots: up and to the right (first), up and to the left.
// The bubble's sharp corner points at the head. They pop in (140ms, opacity
// and a 0.96 scale from that corner) and never loop.

export type BubbleKind = "ask" | "state" | "dots";
export type BubbleSlot = "right" | "left";

/** Bubbles hang 20px below the head's top, beside it, clear of the tag above. */
const DROP_PX = 20;

function slotOf(store: SceneStore, id: ActorId, slot: BubbleSlot) {
  const box = store.box(id);
  if (!box) return null;
  const inset = (box.right - box.left) * 0.2;
  return { x: slot === "right" ? box.right - inset : box.left + inset, y: box.head + DROP_PX };
}

export function HeadBubble({
  id,
  kind,
  slot,
  state,
  dimmed,
}: {
  id: ActorId;
  kind: BubbleKind;
  slot: BubbleSlot;
  /** For `state`: which glyph. */
  state?: AgentState;
  dimmed: boolean;
}) {
  const right = slot === "right";
  const tone = state === "paused" || state === "error" ? TONE_GLYPH[state] : null;
  const present = useIsPresent();
  return (
    <Floating anchor={(store) => slotOf(store, id, slot)} deps={[id, slot]}>
      <motion.div
        {...POP}
        className={cn("absolute bottom-0", right ? "left-0 origin-bottom-left" : "right-0 origin-bottom-right")}
      >
        <div
          aria-hidden="true"
          data-obstacle={present ? "" : undefined}
          className={cn(
            "flex h-6 min-w-6 items-center justify-center bg-card shadow-md transition-opacity duration-(--duration-normal) ease-out",
            right ? "rounded-full rounded-bl-xs" : "rounded-full rounded-br-xs",
            kind === "dots" && "gap-0.5 px-1.5",
            dimmed && "opacity-40",
          )}
        >
          {kind === "ask" ? <IconProgressHelp aria-hidden="true" className="size-4 text-brand-accent" /> : null}
          {kind === "state" && tone ? <tone.icon aria-hidden="true" className={cn("size-3.5", tone.className)} /> : null}
          {kind === "dots" ? (
            <>
              <span className="size-1 rounded-full bg-foreground" />
              <span className="size-1 rounded-full bg-foreground" />
              <span className="size-1 rounded-full bg-foreground" />
            </>
          ) : null}
        </div>
      </motion.div>
    </Floating>
  );
}
