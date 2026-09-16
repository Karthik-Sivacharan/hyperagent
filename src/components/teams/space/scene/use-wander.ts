"use client";

import * as React from "react";

import type { ActorId, Tile } from "@/components/teams/space/types";
import type { SceneStore } from "@/components/teams/space/scene/store";
import { isWalkable, roomOf, seatAt, tileKey } from "@/components/teams/space/scene/world";

// A quiet loop that sends characters on short walks and brings them back, so
// an office nobody is driving still reads as an office rather than as a
// drawing of one. It is OFF on /teams, where the reader moves people
// themselves and a floor that rearranges itself under a drag would be a
// nuisance. It is on where the office is a picture, which today is the
// landing page's views band.
//
// WHAT IT DOES NOT DO is as much of the point. Nobody crosses the building,
// nobody visits anybody, and nothing is choreographed: a character gets up,
// goes a few tiles, stands there a moment and goes back to its chair. That is
// enough for the eye to catch movement somewhere on the floor every few
// seconds, which is all this is for. A scene that told a story would want
// watching, and this one sits under a heading somebody is trying to read.
//
// THE RULES IT KEEPS. At most three away from their desk at once, out of
// fourteen, so the floor never empties and the room still reads as people at
// work. Strolls stay inside a few tiles of home, so an agent wanders its own
// room and the hall outside it rather than turning up in Finance. Nobody
// stops on a chair, because sitting in someone else's seat would take their
// pose and their desk. And anyone in the meeting room stays in it: those four
// are in a meeting, the huddle tag over them says so, and a meeting that
// keeps dissolving would be a worse picture than a still one.
//
// REDUCED MOTION is the caller's business, and there is only one right answer:
// pass `false`. `walkTo` under reduced motion teleports rather than walks, so
// a wandering office would become characters popping between tiles, which is
// the opposite of what somebody asking for less motion wants.

/** Tiles from its chair a character may stroll. */
const RADIUS = 4;
/** ms between decisions. One character may set off per decision. */
const EVERY = 1100;
/** How long a character stands at the far end before heading back. */
const DWELL = { min: 2600, max: 5200 };
/** How many may be away from their chair at once. */
const AT_ONCE = 3;
/** Attempts to find a free tile to stroll to before giving up this turn. */
const TRIES = 24;

interface Trip {
  /** When the character may start back. */
  until: number;
}

function pickOne<T>(list: readonly T[]): T | null {
  return list.length === 0 ? null : list[Math.floor(Math.random() * list.length)];
}

/** A walkable, unoccupied, unseated tile within `RADIUS` of `from`. */
function strollFrom(from: Tile, taken: Set<string>): Tile | null {
  for (let i = 0; i < TRIES; i++) {
    const to = {
      x: from.x + Math.round((Math.random() * 2 - 1) * RADIUS),
      y: from.y + Math.round((Math.random() * 2 - 1) * RADIUS),
    };
    if (to.x === from.x && to.y === from.y) continue;
    if (!isWalkable(to) || seatAt(to) || taken.has(tileKey(to))) continue;
    return to;
  }
  return null;
}

/**
 * @param ids Every character that may wander. Stable across renders, or the
 *   loop restarts and everyone forgets where they live.
 */
export function useWander(store: SceneStore, ids: readonly ActorId[], enabled: boolean) {
  React.useEffect(() => {
    if (!enabled || ids.length === 0) return;

    // Home is wherever they are when the loop starts, which is the seed: the
    // chair they were placed in, or, for the one person standing in the hall,
    // the tile they were left on.
    const opening = store.getSnapshot();
    const home = new Map<ActorId, Tile>();
    const roam: ActorId[] = [];
    for (const id of ids) {
      const at = opening[id];
      if (!at) continue;
      home.set(id, { ...at.tile });
      if (roomOf(at.tile)?.id !== "meeting") roam.push(id);
    }

    const trips = new Map<ActorId, Trip>();

    const tick = () => {
      const snapshot = store.getSnapshot();
      const taken = new Set(Object.values(snapshot).map((at) => tileKey(at.tile)));
      const now = performance.now();

      // Anyone whose moment is up walks back to their chair. They are only
      // off the books once they are standing on it again, so a character
      // still on its way home still counts against `AT_ONCE`.
      for (const [id, trip] of trips) {
        const at = snapshot[id];
        const back = home.get(id);
        if (!at || at.moving || !back) continue;
        if (at.tile.x === back.x && at.tile.y === back.y) {
          trips.delete(id);
          continue;
        }
        if (now >= trip.until) store.walkTo(id, back);
      }

      if (trips.size >= AT_ONCE) return;
      const seated = roam.filter((id) => !trips.has(id) && snapshot[id] && !snapshot[id].moving);
      const who = pickOne(seated);
      const from = who ? home.get(who) : null;
      if (!who || !from) return;
      const to = strollFrom(from, taken);
      if (to && store.walkTo(who, to)) {
        trips.set(who, { until: now + DWELL.min + Math.random() * (DWELL.max - DWELL.min) });
      }
    };

    const timer = setInterval(tick, EVERY);
    return () => {
      clearInterval(timer);
      // Put everyone back, for the case where this is switched off rather
      // than unmounted: a floor frozen with three people standing in the hall
      // is a worse still picture than the one the seed draws.
      for (const id of trips.keys()) {
        const back = home.get(id);
        if (back) store.walkTo(id, back);
      }
    };
  }, [store, ids, enabled]);
}
