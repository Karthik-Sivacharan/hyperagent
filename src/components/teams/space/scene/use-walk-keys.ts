"use client";

import * as React from "react";

import type { Facing } from "@/components/teams/space/types";
import type { SceneStore } from "@/components/teams/space/scene/store";

// The keyboard walks you (docs/plans/2026-09-11-teams-space-v1.md §4): the
// arrow keys or WASD, one tile per press, walking on while a key is held,
// whenever focus is in the map (the map itself or anything in it). With
// nothing focused at all (the page just loaded, or the reader clicked the
// empty ground), the keys walk too, since there is nothing else they could
// mean. Letting go, or focus leaving the map, stops at the next tile.
//
// `walkWhenIdle` is that second half, and it is only true when the office IS
// the page. It listens on `window` and calls preventDefault, so on a page
// where the office is one band among several the arrow keys would stop
// scrolling the document the moment this view mounted. Off, the returned
// `onKeyDown` still walks, and it fires only with focus inside the map, so
// nothing is taken from a reader who has not asked for it.

const KEY_DIR: Record<string, Facing> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  a: "left",
  s: "down",
  d: "right",
};

function dirOf(event: KeyboardEvent | React.KeyboardEvent): Facing | null {
  if (event.metaKey || event.ctrlKey || event.altKey) return null;
  return KEY_DIR[event.key] ?? KEY_DIR[event.key.toLowerCase()] ?? null;
}

function typingInto(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
}

export function useWalkKeys(
  store: SceneStore,
  mapRef: React.RefObject<HTMLElement | null>,
  onEscape: () => void,
  walkWhenIdle = true,
) {
  const escapeRef = React.useRef(onEscape);
  React.useEffect(() => {
    escapeRef.current = onEscape;
  });

  React.useEffect(() => {
    if (!walkWhenIdle) return;
    const idle = () => document.activeElement === null || document.activeElement === document.body;
    const down = (event: KeyboardEvent) => {
      if (!idle() || event.defaultPrevented) return;
      const dir = dirOf(event);
      if (!dir) return;
      event.preventDefault();
      store.press(dir, event.repeat);
    };
    const up = (event: KeyboardEvent) => {
      const dir = dirOf(event);
      if (dir) store.release(dir);
    };
    const stop = () => store.releaseAll();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", stop);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", stop);
    };
  }, [store, walkWhenIdle]);

  return React.useMemo(
    () => ({
      onKeyDown(event: React.KeyboardEvent) {
        if (event.key === "Escape") {
          escapeRef.current();
          return;
        }
        if (typingInto(event.target)) return;
        const dir = dirOf(event);
        if (!dir) return;
        event.preventDefault();
        store.press(dir, event.repeat);
      },
      onBlur(event: React.FocusEvent) {
        const next = event.relatedTarget;
        if (!(next instanceof Node) || !mapRef.current?.contains(next)) store.releaseAll();
      },
    }),
    [store, mapRef],
  );
}
