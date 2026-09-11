"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ActorId } from "@/components/teams/space/types";
import { SceneTip } from "@/components/teams/space/actors/character-card";
import { useScene } from "@/components/teams/space/scene/scene-context";
import { useCharacterDrag } from "@/components/teams/space/scene/use-drag";
import { FRAME, sheetUrl, spriteStyle, type SpriteFrame } from "@/components/teams/space/scene/world";

// One character (docs/plans/2026-09-11-teams-space-v1.md §3, §4): a real
// `Button` in the tab order, a tile wide and two tall, holding its sprite.
// The scene store positions the button (a translate and a z-index equal to
// its bottom edge, so it interleaves with the furniture) and swaps the
// sprite's frame, through refs; React renders it only when its words, its
// card or its dimming change.
//
// Its accessible name carries everything drawn around it. Click or Enter
// opens the agent sheet (level 3); a press that travels 4px is a drag
// instead (scene/use-drag.ts). Hover and keyboard focus report to the
// view's intent, which opens level 1 at once and level 2 after 250ms. The
// focus ring is the button's own.

/** The frame React first paints; the scene loop takes over before the first paint. */
const FIRST_FRAME: SpriteFrame = { col: 1, row: 0, flip: false };

export const Character = React.memo(function Character({
  id,
  label,
  dimmed,
  dragging,
  card,
  cardOpen,
  mapRef,
  onActivate,
  onHover,
  onFocusVisible,
  onBlurred,
  onDragStart,
}: {
  id: ActorId;
  label: string;
  dimmed: boolean;
  dragging: boolean;
  card: React.ReactNode;
  cardOpen: boolean;
  mapRef: React.RefObject<HTMLElement | null>;
  onActivate: (id: ActorId) => void;
  onHover: (id: ActorId | null) => void;
  onFocusVisible: (id: ActorId | null) => void;
  onBlurred: () => void;
  onDragStart: () => void;
}) {
  const { store, scale } = useScene();
  const rootRef = React.useRef<HTMLButtonElement>(null);
  const spriteRef = React.useRef<HTMLSpanElement>(null);
  const drag = useCharacterDrag(id, store, mapRef, onDragStart);

  React.useLayoutEffect(() => {
    if (!rootRef.current || !spriteRef.current) return;
    return store.bind(id, rootRef.current, spriteRef.current);
  }, [store, id]);

  const sheet = sheetUrl(id);
  const style = React.useMemo(() => spriteStyle(sheet, FIRST_FRAME, scale), [sheet, scale]);

  return (
    <SceneTip open={cardOpen} content={card}>
      <Button
        ref={rootRef}
        variant="ghost"
        size="none"
        data-actor={id}
        data-dragging={dragging || undefined}
        aria-label={label}
        className="absolute top-0 left-0 block touch-none rounded-md p-0 hover:bg-transparent aria-expanded:bg-transparent data-dragging:cursor-grabbing"
        style={{ width: FRAME.w * scale, height: FRAME.h * scale }}
        onClick={() => {
          if (drag.consumeClick()) return;
          onActivate(id);
        }}
        onPointerDown={drag.onPointerDown}
        onPointerMove={drag.onPointerMove}
        onPointerUp={drag.onPointerUp}
        onPointerCancel={drag.onPointerCancel}
        onLostPointerCapture={drag.onLostPointerCapture}
        onPointerEnter={() => onHover(id)}
        onPointerLeave={() => onHover(null)}
        onFocus={(event) => onFocusVisible(event.currentTarget.matches(":focus-visible") ? id : null)}
        onBlur={onBlurred}
      >
        {/* The loop owns this span's background-position and transform (the
            frame and its mirror); React sets the rest once per scale. */}
        <span
          ref={spriteRef}
          aria-hidden="true"
          className={cn(
            "pointer-events-none block transition-opacity duration-(--duration-normal) ease-out",
            dimmed && "opacity-40",
          )}
          style={style}
        />
      </Button>
    </SceneTip>
  );
});
