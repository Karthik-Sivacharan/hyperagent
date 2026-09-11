"use client";

import * as React from "react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import type { FleetAgent, FleetRun } from "@/lib/mock/teams";
import type { ActorId } from "@/components/teams/space/types";
import { Floating, POP } from "@/components/teams/space/actors/floating";
import { useScene } from "@/components/teams/space/scene/scene-context";
import type { FollowPoint, SceneStore } from "@/components/teams/space/scene/store";

// Walk up to an ask (docs/plans/2026-09-11-teams-space-v1.md §4): when you
// stand next to an agent (1 tile) that needs a person, its first ask opens
// in a small card beside it: the ask, whose it is, `Review` (ink, inert in
// v1, as in the sheet) and `Open` (ghost, the sheet). One card at a time,
// the nearest agent's; walking away closes it. It is the first thing in the
// map's tab order, so after walking up with the arrow keys a single Tab
// reaches Review.
//
// WHERE IT HANGS. Above the agent's tag line (its own tag, or its group's),
// centred, or slid to either side with the caret still on the agent; else
// the same below its feet; else to its right, then its left: the first
// place that covers no tag, no bubble, neither you nor the agent, and stays
// on the map (the least covered one when none is clear). Every tag and
// bubble marks itself `data-obstacle`; the card measures them, and itself,
// each time something moves or the chrome changes (`store.nudge()`), and
// says where it went in `data-side`, which turns its caret and the corner
// it grows from.

const CARET = 6;
const GAP = 4;
/** Clear of a head bubble (24px, hung just past the sprite's edge) to either side. */
const SIDE_CLEAR = 30;
const EDGE = 4;
/** The caret's centre stays at least this far from the card's corners (the 14px radius). */
const CARET_INSET = 20;

type Side = "above" | "below" | "right" | "left";

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

function overlap(a: Rect, b: Rect): number {
  const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return w > 0 && h > 0 ? w * h : 0;
}

function placeCard(store: SceneStore, id: ActorId, you: ActorId, card: HTMLElement | null): FollowPoint | null {
  const box = store.box(id);
  const layer = card?.closest<HTMLElement>("[data-chrome]");
  if (!box || !card || !layer) return null;
  const origin = layer.getBoundingClientRect();
  const w = card.offsetWidth;
  const h = card.offsetHeight;

  // Everything the card must not cover, in stage px; and the top of the
  // agent's own tag, which the card sits over when it goes above.
  const obstacles: Rect[] = [];
  let ownTop = Infinity;
  for (const el of layer.querySelectorAll<HTMLElement>("[data-obstacle]")) {
    const r = el.getBoundingClientRect();
    const rect = { left: r.left - origin.left, top: r.top - origin.top, right: r.right - origin.left, bottom: r.bottom - origin.top };
    if (el.dataset.tagMembers?.split(" ").includes(id)) ownTop = Math.min(ownTop, rect.top);
    obstacles.push(rect);
  }
  for (const who of [id, you]) {
    const b = store.box(who);
    if (b) obstacles.push({ left: b.left, top: b.head, right: b.right, bottom: b.bottom });
  }
  if (ownTop === Infinity) ownTop = box.head - GAP - CARET - 24;

  const clampX = (left: number) => Math.min(Math.max(left, EDGE), layer.clientWidth - w - EDGE);
  // Above or below, the card may also slide to either side of the agent,
  // as far as keeps its caret on the card (CARET_INSET from a corner).
  const along = (side: Side, top: number) =>
    [box.cx - w / 2, box.cx - w + CARET_INSET, box.cx - CARET_INSET].map((left) => ({ side, left: clampX(left), top }));
  const candidates: { side: Side; left: number; top: number }[] = [
    ...along("above", ownTop - GAP - CARET - h),
    ...along("below", box.bottom + GAP + CARET),
    { side: "right", left: box.right + SIDE_CLEAR, top: box.head - 6 },
    { side: "left", left: box.left - SIDE_CLEAR - w, top: box.head - 6 },
  ];

  let best = candidates[0];
  let bestScore = Infinity;
  for (const c of candidates) {
    const rect = { left: c.left - 2, top: c.top - 2, right: c.left + w + 2, bottom: c.top + h + 2 };
    const outside =
      rect.left < 0 || rect.top < 0 || rect.right > layer.clientWidth || rect.bottom > layer.clientHeight;
    const score = outside ? Infinity : obstacles.reduce((sum, o) => sum + overlap(rect, o), 0);
    if (score < bestScore) {
      best = c;
      bestScore = score;
    }
    if (score === 0) break;
  }
  // Above or below, the caret points at the agent even when the card was
  // pushed in from the map's edge.
  const caret = Math.min(Math.max(box.cx - best.left, CARET_INSET), w - CARET_INSET);
  return { x: best.left, y: best.top, side: best.side, caret };
}

export function AskCard({
  agent,
  asks,
  ownerName,
  you,
  onOpen,
}: {
  agent: FleetAgent;
  asks: readonly FleetRun[];
  /** "Diego", or "you". */
  ownerName: string;
  /** Your id: the card never covers you either. */
  you: ActorId;
  onOpen: () => void;
}) {
  const { store } = useScene();
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [ask] = asks;

  // Placed once in a layout effect, before the tags that mount with it
  // (a group forming as you arrive) are placed: look again once they are.
  React.useEffect(() => store.nudge(), [store]);

  return (
    <Floating anchor={(s) => placeCard(s, agent.id, you, cardRef.current)} deps={[agent.id, you]} className="group/ask z-20">
      <motion.div
        {...POP}
        className="absolute top-0 left-0 group-data-[side=above]/ask:origin-bottom group-data-[side=below]/ask:origin-top group-data-[side=left]/ask:origin-right group-data-[side=right]/ask:origin-left"
      >
        <div
          ref={cardRef}
          role="group"
          aria-label={`${agent.name} needs you`}
          className="pointer-events-auto relative flex w-max max-w-60 flex-col rounded-xl bg-card p-3 shadow-md"
        >
          <p className="text-sm font-medium text-pretty text-foreground">{ask.needs ?? ask.title}</p>
          <p className="mt-0.5 text-md text-muted-foreground tabular-nums">
            For {ownerName}
            {asks.length > 1 ? `, +${asks.length - 1} more` : ""}
          </p>
          <div className="mt-3 flex gap-1.5">
            <Button size="sm">Review</Button>
            <Button size="sm" variant="ghost" onClick={onOpen}>
              Open
            </Button>
          </div>
          <AskCarets />
        </div>
      </motion.div>
    </Floating>
  );
}

/** One caret per side, each shown only on its side, pointing at the agent. */
function AskCarets() {
  const shared = "pointer-events-none absolute hidden text-card";
  return (
    <>
      <svg
        aria-hidden="true"
        width="12"
        height="6"
        viewBox="0 0 12 6"
        className={`${shared} top-full -translate-x-1/2 group-data-[side=above]/ask:block`}
        style={{ left: "var(--caret)" }}
      >
        <path d="M0 0H12L6 6Z" fill="currentColor" />
      </svg>
      <svg
        aria-hidden="true"
        width="12"
        height="6"
        viewBox="0 0 12 6"
        className={`${shared} bottom-full -translate-x-1/2 group-data-[side=below]/ask:block`}
        style={{ left: "var(--caret)" }}
      >
        <path d="M0 6H12L6 0Z" fill="currentColor" />
      </svg>
      <svg
        aria-hidden="true"
        width="6"
        height="12"
        viewBox="0 0 6 12"
        className={`${shared} top-3 right-full group-data-[side=right]/ask:block`}
      >
        <path d="M6 0V12L0 6Z" fill="currentColor" />
      </svg>
      <svg
        aria-hidden="true"
        width="6"
        height="12"
        viewBox="0 0 6 12"
        className={`${shared} top-3 left-full group-data-[side=left]/ask:block`}
      >
        <path d="M0 0V12L6 6Z" fill="currentColor" />
      </svg>
    </>
  );
}
