// The contract between the three builders of the /teams office view
// (docs/plans/2026-09-11-teams-space-v1.md §6). `world/` owns the map, the
// path finder, the seed and the art layers; `world/sprites.ts` owns the
// character sheets; `scene/` and `actors/` own everything that moves or is
// clicked. All of them speak in tiles; `px = tile * TILE * scale`.

/** Tile coordinates: integers, x to the right, y down, (0, 0) the map's top-left tile. */
export interface Tile {
  x: number;
  y: number;
}

export type Facing = "down" | "up" | "left" | "right";

/** What a character's body is doing; picks the sprite frames. */
export type Pose = "idle" | "walk" | "type" | "read";

/** A FleetAgent.id ("a-…") or a TeamMember.id ("m-…"). */
export type ActorId = string;

export type RoomId = "research" | "atlas" | "outbound" | "hall" | "content" | "meeting" | "lounge" | "finance";

export interface Room {
  id: RoomId;
  /** Shown near the door: "Research", "Meeting room". */
  name: string;
  /** Interior bounds in tiles, walls excluded. */
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A desk chair or a meeting seat: where a character sits and which way it faces. */
export interface Seat {
  id: string;
  tile: Tile;
  facing: Facing;
  room: RoomId;
  /** The actor whose desk this is, if it is anyone's. */
  owner?: ActorId;
}

/** Where a character starts: a tile, a facing and, when seated, the seat. */
export interface Placement {
  tile: Tile;
  facing: Facing;
  seat?: string;
}
