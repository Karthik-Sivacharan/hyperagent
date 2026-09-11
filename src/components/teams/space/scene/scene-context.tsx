"use client";

import * as React from "react";

import type { SceneSnapshot, SceneStore } from "@/components/teams/space/scene/store";

// The store and the stage's scale, for every character and piece of chrome
// under the stage. The snapshot hook re-renders a reader only when a
// character's committed tile, facing, seat or motion changes, never per frame.

interface SceneContextValue {
  store: SceneStore;
  scale: number;
}

const SceneContext = React.createContext<SceneContextValue | null>(null);

export const SceneProvider = SceneContext.Provider;

export function useScene(): SceneContextValue {
  const value = React.useContext(SceneContext);
  if (!value) throw new Error("useScene must be used inside <SceneProvider>");
  return value;
}

export function useSceneSnapshot(store: SceneStore): SceneSnapshot {
  return React.useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}

/**
 * Keeps the element translated to `anchor()` in stage px while characters
 * move. `anchor` is read every frame something moves, so it must be cheap.
 * `anchorKey` names what it reads (the ids it follows): when the key
 * changes, the element is placed again at once, before paint.
 */
export function useFollow<T extends HTMLElement>(
  anchor: (store: SceneStore) => { x: number; y: number } | null,
  anchorKey: string,
) {
  const { store } = useScene();
  const ref = React.useRef<T>(null);
  const latest = React.useRef(anchor);
  React.useLayoutEffect(() => {
    latest.current = anchor;
  });
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    return store.follow(el, () => latest.current(store));
  }, [store, anchorKey]);
  return ref;
}
