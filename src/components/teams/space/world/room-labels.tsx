// Each room's name, set like a small plate on its own wall beside its door
// (map.ts `SIGNS`). Quiet on purpose: people outrank places, so the labels sit
// at the wall's depth (zIndex 1) and every character and tag draws over them.
// Chrome, not art: they keep their natural size at any map scale. Hidden from
// assistive tech, since each character already announces its room.
//
// Render as direct children of the stage, beside FurnitureLayer.

import { cn } from "@/lib/utils";

import { ROOM_BY_ID, SIGNS, TILE } from "./map";

/** Gap between a plate and the door edge it starts from, in CSS px. */
const GAP = 6;

export function RoomLabels({ scale }: { scale: number }) {
  return (
    <>
      {SIGNS.map((s) => {
        // The wall face of `wallRow` runs from 8 art px below the top of the
        // row above it to the bottom of the wall row: centre the plate on it.
        const faceMid = ((s.wallRow - 1) * TILE + 20) * scale;
        const edge = s.x * TILE * scale;
        return (
          <span
            key={s.room}
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute z-1 flex h-5 -translate-y-1/2 select-none items-center whitespace-nowrap rounded-sm px-1.5",
              "bg-background/85 font-medium text-muted-foreground text-xs shadow-edge",
              s.align === "end" && "-translate-x-full",
            )}
            style={{ top: faceMid, left: s.align === "end" ? edge - GAP : edge + GAP }}
          >
            {ROOM_BY_ID[s.room].name}
          </span>
        );
      })}
    </>
  );
}
