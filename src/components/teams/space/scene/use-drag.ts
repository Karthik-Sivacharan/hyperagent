"use client";

import * as React from "react";

import type { ActorId } from "@/components/teams/space/types";
import type { SceneStore } from "@/components/teams/space/scene/store";

// Pick anyone up (docs/plans/2026-09-11-teams-space-v1.md §4, §5). A press on
// a character becomes a drag once the pointer has moved 4px, so a click still
// opens the sheet; from then on the sprite follows the pointer 1:1 (the
// offset where it was grabbed is kept), and the drop snaps it to the nearest
// free walkable tile, where the store settles it in 150ms. The click that a
// drop leaves behind is swallowed (`consumeClick`).

const THRESHOLD_PX = 4;

interface Press {
  pointerId: number;
  x0: number;
  y0: number;
  /** Pointer minus the sprite's top-left, in px. */
  dx: number;
  dy: number;
  map: DOMRect;
  active: boolean;
}

export function useCharacterDrag(
  id: ActorId,
  store: SceneStore,
  mapRef: React.RefObject<HTMLElement | null>,
  onStart: () => void,
) {
  const press = React.useRef<Press | null>(null);
  const swallow = React.useRef(false);

  return React.useMemo(() => {
    const end = (drop: boolean) => {
      const current = press.current;
      press.current = null;
      if (!current?.active) return;
      if (drop) swallow.current = true;
      store.endDrag(id);
    };
    return {
      onPointerDown(event: React.PointerEvent<HTMLElement>) {
        if (event.button !== 0 || !event.isPrimary) return;
        swallow.current = false;
        const map = mapRef.current?.getBoundingClientRect();
        const box = store.box(id);
        if (!map || !box) return;
        press.current = {
          pointerId: event.pointerId,
          x0: event.clientX,
          y0: event.clientY,
          dx: event.clientX - map.left - box.left,
          dy: event.clientY - map.top - box.top,
          map,
          active: false,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
      },
      onPointerMove(event: React.PointerEvent<HTMLElement>) {
        const current = press.current;
        if (!current || event.pointerId !== current.pointerId) return;
        if (!current.active) {
          if (Math.hypot(event.clientX - current.x0, event.clientY - current.y0) < THRESHOLD_PX) return;
          current.active = true;
          store.beginDrag(id);
          onStart();
        }
        store.dragTo(id, event.clientX - current.map.left - current.dx, event.clientY - current.map.top - current.dy);
      },
      onPointerUp(event: React.PointerEvent<HTMLElement>) {
        if (press.current?.pointerId === event.pointerId) end(true);
      },
      onPointerCancel(event: React.PointerEvent<HTMLElement>) {
        if (press.current?.pointerId === event.pointerId) end(false);
      },
      onLostPointerCapture(event: React.PointerEvent<HTMLElement>) {
        if (press.current?.pointerId === event.pointerId) end(false);
      },
      /** True once for the click a drop leaves behind; the caller ignores that click. */
      consumeClick() {
        const swallowed = swallow.current;
        swallow.current = false;
        return swallowed;
      },
    };
  }, [id, store, mapRef, onStart]);
}
