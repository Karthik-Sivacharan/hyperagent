// The one door between the scene and the world and sprites builders' files
// (docs/plans/2026-09-11-teams-space-v1.md §6): everything under scene/ and
// actors/ reads the map, the path finder, the seed and the sprite sheets
// from here, so a change in a teammate's shape is absorbed in this file.

import type { ActorId, Facing, Pose, Room, Seat, Tile } from "@/components/teams/space/types";
import * as map from "@/components/teams/space/world/map";
import * as path from "@/components/teams/space/world/path";
import * as seed from "@/components/teams/space/world/seed";
import * as sprites from "@/components/teams/space/world/sprites";

export { FloorCanvas } from "@/components/teams/space/world/floor-canvas";
export { FurnitureLayer } from "@/components/teams/space/world/furniture-layer";
export { RoomLabels } from "@/components/teams/space/world/room-labels";

export const TILE = map.TILE;
export const COLS = map.COLS;
export const ROWS = map.ROWS;
export const ROOMS: readonly Room[] = map.ROOMS;
export const SEATS: readonly Seat[] = map.SEATS;
export const SEED = seed.SEED;
export const AWAY_DESKS = seed.AWAY_DESKS;

export const tileKey = (t: Tile): string => path.tileKey(t);
export const isWalkable = (t: Tile): boolean => map.isWalkable(t);

/** The room a tile is in (a doorway belongs to the room it opens into), or null on a wall. */
export function roomOf(t: Tile): Room | null {
  return map.roomAt(t);
}

/** The tiles after `from` up to and including `to`; [] when they are the same, null when there is no way. */
export function pathTo(from: Tile, to: Tile): Tile[] | null {
  return path.findPath(from, to);
}

/** The walkable tile nearest `t` that nobody stands on. */
export function nearestFree(t: Tile, taken: Set<string>): Tile {
  return path.nearestWalkable(t, taken);
}

const seatByKey = new Map(SEATS.map((seat) => [tileKey(seat.tile), seat]));

export function seatAt(t: Tile): Seat | null {
  return seatByKey.get(tileKey(t)) ?? null;
}

export function seatOf(id: string | undefined | null): Seat | null {
  return id ? (map.SEAT_BY_ID[id] ?? null) : null;
}

// Sprites.

/** One frame of a character sheet, in art pixels (16 x 32: a tile wide, two tall). */
export const FRAME = { w: sprites.SHEET.frameW, h: sprites.SHEET.frameH } as const;

export type SpriteFrame = sprites.SpriteFrame;

/** The sheet's URL. */
export const sheetUrl = (id: ActorId): string => sprites.sheetFor(id);

export const frameOf = (pose: Pose, facing: Facing, step: number): SpriteFrame => sprites.frameFor(pose, facing, step);

/** A frame's background-position at a scale, for the loop's writes. */
export const framePosition = (frame: SpriteFrame, scale: number): string => sprites.framePosition(frame, scale);

/** The sprite element's style for one frame: size, sheet, position, pixelated. */
export const spriteStyle = (src: string, frame: SpriteFrame, scale: number) => sprites.spriteStyle(src, frame, scale);

/** How long each frame of a cycle shows, per pose. */
export const FRAME_MS: Record<Pose, number> = {
  walk: sprites.FRAME_MS,
  type: sprites.TYPE_FRAME_MS,
  read: sprites.TYPE_FRAME_MS,
  idle: sprites.FRAME_MS,
};

/**
 * Where a frame stands: the upstream sprite pack anchors its bottom-centre on the
 * tile's centre, so a standing frame rises 24 art px above the tile's top;
 * a typing or reading one is drawn SIT_DROP lower, into its chair.
 */
export const BASELINE = TILE / 2;
export const SIT_DROP = sprites.SITTING_OFFSET_PX;

/**
 * Art px from a frame's top to the top of the head, facing down or up: the
 * robots' antenna tips and Diego's spikes reach row 1, Karthik's and Sam's
 * hair row 3 (world/sprites.ts).
 */
export function headInset(id: ActorId): number {
  return id === "m-karthik" || id === "m-sam" ? 3 : 1;
}
