// The office floor plan (docs/plans/2026-09-11-teams-space-v1.md §2): 36 x 22
// tiles of 16 art px, an outer wall ring, a hall across the middle with the
// entrance on the left edge, three rooms above it and four below, every room
// opening onto the hall through a 2-tile door.
//
// Walls are the Pixel Agents pieces: 16 x 32, anchored to the bottom of their
// tile, so an east-west wall rises over the tile north of it. That tile is
// hidden behind the wall face and nobody can stand there (`isWalkable`); it
// is why every room's back wall reads as a tall facade. The one exception is
// the outer south wall, which is drawn low (only its cap shows) so the bottom
// rooms keep their last row.
//
// Everything here is plain data. The art layers (floor-canvas.tsx,
// furniture-layer.tsx, room-labels.tsx) render it; the actors walk on it.

import type { Room, RoomId, Seat, Tile } from "../types";

export const TILE = 16;
export const COLS = 36;
export const ROWS = 22;

/** Map width and height in art px (1x). */
export const MAP_W = COLS * TILE;
export const MAP_H = ROWS * TILE;

/*
 * The grid. `#` wall, `.` floor, `_` outside (the north wall's facade covers
 * it). Doors are the gaps in rows 9 and 14; the entrance is the gap in
 * column 0. Rows 8 and 13 sit behind the hall's walls: apart from the door
 * columns they are floor nobody can reach.
 *
 *            0         1         2         3
 *            012345678901234567890123456789012345
 */
const GRID = [
  "____________________________________", //  0 facade of the north wall
  "####################################", //  1 north wall
  "#............#........#............#", //  2 research | atlas | outbound
  "#............#........#............#", //  3
  "#............#........#............#", //  4
  "#............#........#............#", //  5
  "#............#........#............#", //  6
  "#............#........#............#", //  7
  "#............#........#............#", //  8 behind the hall wall
  "#####..##########..#####..##########", //  9 hall wall, three doors
  "...................................#", // 10 hall, entrance at column 0
  "...................................#", // 11
  "...................................#", // 12
  "...................................#", // 13 behind the hall wall
  "####..###########..#####..##..######", // 14 hall wall, four doors
  "#.........#........#......#........#", // 15 content | meeting | lounge | finance
  "#.........#........#......#........#", // 16
  "#.........#........#......#........#", // 17
  "#.........#........#......#........#", // 18
  "#.........#........#......#........#", // 19
  "#.........#........#......#........#", // 20
  "####################################", // 21 south wall, drawn low
] as const;

export type TileKind = "outside" | "wall" | "floor";

/** `KINDS[y][x]`: what each tile is made of. */
export const KINDS: TileKind[][] = GRID.map((row) =>
  Array.from(row, (ch) => (ch === "#" ? "wall" : ch === "." ? "floor" : "outside")),
);

if (process.env.NODE_ENV !== "production") {
  if (GRID.length !== ROWS || GRID.some((row) => row.length !== COLS)) {
    throw new Error(`space map: the grid must be ${COLS} x ${ROWS}`);
  }
}

export function inBounds(t: Tile): boolean {
  return t.x >= 0 && t.y >= 0 && t.x < COLS && t.y < ROWS;
}

export function kindAt(t: Tile): TileKind {
  return inBounds(t) ? KINDS[t.y][t.x] : "outside";
}

export function isWall(t: Tile): boolean {
  return kindAt(t) === "wall";
}

/** The outer south wall is drawn low (cap only), so it hides nothing. */
export function isLowWall(t: Tile): boolean {
  return t.y === ROWS - 1 && isWall(t);
}

/** Floor behind a wall face: the wall on the tile south of it rises over it. */
export function isBehindWall(t: Tile): boolean {
  const below = { x: t.x, y: t.y + 1 };
  return kindAt(t) === "floor" && isWall(below) && !isLowWall(below);
}

// ---------------------------------------------------------------------------
// Rooms

/** Interior bounds in tiles, walls excluded. Doorways belong to the room they open into. */
export const ROOMS: Room[] = [
  { id: "research", name: "Research", x: 1, y: 2, w: 12, h: 7 },
  { id: "atlas", name: "Atlas's office", x: 14, y: 2, w: 8, h: 7 },
  { id: "outbound", name: "Outbound", x: 23, y: 2, w: 12, h: 7 },
  { id: "hall", name: "Hall", x: 0, y: 10, w: 35, h: 4 },
  { id: "content", name: "Content", x: 1, y: 15, w: 9, h: 6 },
  { id: "meeting", name: "Meeting room", x: 11, y: 15, w: 8, h: 6 },
  { id: "lounge", name: "Lounge", x: 20, y: 15, w: 6, h: 6 },
  { id: "finance", name: "Finance ops", x: 27, y: 15, w: 8, h: 6 },
];

export const ROOM_BY_ID = Object.fromEntries(ROOMS.map((r) => [r.id, r])) as Record<RoomId, Room>;

/** A doorway: the gap tiles in a wall, and the room they open into. */
export interface Door {
  room: RoomId;
  /** The gap tiles, left to right (the entrance: top to bottom). */
  tiles: Tile[];
  /** The wall the door is in, as seen from its room. */
  side: "north" | "south" | "west";
}

export const DOORS: Door[] = [
  { room: "research", side: "south", tiles: [{ x: 5, y: 9 }, { x: 6, y: 9 }] },
  { room: "atlas", side: "south", tiles: [{ x: 17, y: 9 }, { x: 18, y: 9 }] },
  { room: "outbound", side: "south", tiles: [{ x: 24, y: 9 }, { x: 25, y: 9 }] },
  { room: "content", side: "north", tiles: [{ x: 4, y: 14 }, { x: 5, y: 14 }] },
  { room: "meeting", side: "north", tiles: [{ x: 17, y: 14 }, { x: 18, y: 14 }] },
  { room: "lounge", side: "north", tiles: [{ x: 24, y: 14 }, { x: 25, y: 14 }] },
  { room: "finance", side: "north", tiles: [{ x: 28, y: 14 }, { x: 29, y: 14 }] },
  {
    room: "hall",
    side: "west",
    tiles: [
      { x: 0, y: 10 },
      { x: 0, y: 11 },
      { x: 0, y: 12 },
    ],
  },
];

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function inRect(t: Tile, r: Rect): boolean {
  return t.x >= r.x && t.y >= r.y && t.x < r.x + r.w && t.y < r.y + r.h;
}

export function roomAt(t: Tile): Room | null {
  for (const room of ROOMS) if (inRect(t, room)) return room;
  for (const door of DOORS) {
    if (door.tiles.some((d) => d.x === t.x && d.y === t.y)) return ROOM_BY_ID[door.room];
  }
  return null;
}

// ---------------------------------------------------------------------------
// Floors and rugs (painted by floor-canvas.tsx)

/** A floor is a tinted 16 x 16 tile in public/space/floors/. */
export type FloorName = "wood" | "walnut" | "hall" | "carpet" | "tile";

/** Floor by room type, not by department: offices are oak, the meeting room carpet, the lounge tile. */
export const FLOOR_OF: Record<RoomId, FloorName> = {
  research: "wood",
  atlas: "walnut",
  outbound: "wood",
  hall: "hall",
  content: "wood",
  meeting: "carpet",
  lounge: "tile",
  finance: "wood",
};

export function floorAt(t: Tile): FloorName | null {
  if (kindAt(t) !== "floor") return null;
  const room = roomAt(t);
  return room ? FLOOR_OF[room.id] : null;
}

/** A rug: one of the carpet sheets in public/space/rugs/, auto-tiled over a rect. */
export type RugName = "oat" | "stone" | "mat";

export const RUGS: (Rect & { rug: RugName })[] = [
  { rug: "mat", x: 0, y: 10, w: 2, h: 3 },
  { rug: "stone", x: 19, y: 5, w: 3, h: 3 },
  { rug: "oat", x: 11, y: 15, w: 5, h: 6 },
  { rug: "oat", x: 20, y: 17, w: 4, h: 3 },
];

// ---------------------------------------------------------------------------
// Room signs (room-labels.tsx): each room's name on the wall face beside its
// door, like a plate by a doorway. One rule, so no plate is ambiguous: every
// sign starts at the tile edge just right of its door (`x`) and runs right,
// on the face of the hall wall in `wallRow`. The wall decor keeps clear of
// them, and no seat puts a head in front of one.

export const SIGNS: { room: RoomId; x: number; wallRow: number }[] = [
  { room: "research", x: 7, wallRow: 9 },
  { room: "atlas", x: 19, wallRow: 9 },
  { room: "outbound", x: 26, wallRow: 9 },
  { room: "content", x: 6, wallRow: 14 },
  { room: "meeting", x: 19, wallRow: 14 },
  { room: "lounge", x: 26, wallRow: 14 },
  { room: "finance", x: 30, wallRow: 14 },
];

// ---------------------------------------------------------------------------
// Furniture (furniture-layer.tsx)

/** Where a piece sits in the depth order. */
export type FurnitureLayer =
  /** Hung on a wall face (whiteboards, clocks, art): behind everyone. */
  | "wall"
  /** A chair: drawn just under whoever sits on it. */
  | "seat"
  /** Stands on the floor: sorted with the characters by its bottom edge. */
  | "stand"
  /** Sits on another piece (a coffee machine on a table): just above it. */
  | "surface";

export interface Furniture {
  id: string;
  /** Public path of the sprite. */
  src: string;
  /** Tile the sprite box's top-left corner sits on. */
  x: number;
  y: number;
  /** Sprite size in art px. */
  w: number;
  h: number;
  /** Art-px nudge, for sprites whose art is not centred on the grid. */
  dx?: number;
  dy?: number;
  /** Mirror horizontally. */
  flip?: boolean;
  /** Tiles it stops people walking on; none for wall pieces and chairs. */
  blocks?: Rect;
  layer: FurnitureLayer;
  /**
   * The depth line in art px: the bottom edge of the tile row the piece stands
   * on. furniture-layer.tsx sets `zIndex = z * scale`, so a character whose
   * feet line (`(tile.y + 1) * TILE * scale`) is lower draws in front of it.
   * Seats sit 1 below their row (the sitter wins), surface pieces 1 above
   * their host, wall pieces at 0.
   */
  z: number;
}

const F = "/space/furniture";

// Piece builders. `at` is the tile a piece stands on (its base, bottom-left);
// the sprite rises from there.

interface PieceOpts {
  dx?: number;
  dy?: number;
  flip?: boolean;
  /** Tiles blocked, as [w, h] measured up from the base row; default the sprite's width in tiles by 1. */
  block?: [number, number] | null;
}

function stand(id: string, name: string, at: Tile, w: number, h: number, o: PieceOpts = {}): Furniture {
  const tilesW = Math.ceil(w / TILE);
  const [bw, bh] = o.block === undefined ? [tilesW, 1] : (o.block ?? [0, 0]);
  const top = at.y + 1 - Math.ceil(h / TILE);
  return {
    id,
    src: `${F}/${name}.png`,
    x: at.x,
    y: top,
    w,
    h,
    dx: o.dx,
    dy: o.dy,
    flip: o.flip,
    blocks: bw && bh ? { x: at.x, y: at.y + 1 - bh, w: bw, h: bh } : undefined,
    layer: "stand",
    z: (at.y + 1) * TILE,
  };
}

/** Something resting on another piece that stands on `at`; drawn just above it. */
function surface(id: string, name: string, at: Tile, w: number, h: number, dx = 0, dy = 0): Furniture {
  const y = at.y + 1 - Math.ceil(h / TILE);
  return { id, src: `${F}/${name}.png`, x: at.x, y, w, h, dx, dy, layer: "surface", z: (at.y + 1) * TILE + 1 };
}

/** A prop on the meeting table at tile (x, y): drawn over the table, whatever row it is on. */
function onTable(id: string, name: string, x: number, y: number, dx = 0, dy = 0): Furniture {
  return { id, src: `${F}/${name}.png`, x, y, w: 16, h: 16, dx, dy, layer: "surface", z: (TABLE.y + TABLE.h) * TILE + 1 };
}

/** Hung on the face of the wall in `wallRow`: the sprite's top sits at the wall piece's top. */
function onWall(id: string, name: string, x: number, wallRow: number, w: number, h: number, dx = 0, dy = 0): Furniture {
  return { id, src: `${F}/${name}.png`, x, y: wallRow - 1, w, h, dx, dy, layer: "wall", z: 0 };
}

// ---------------------------------------------------------------------------
// Desks and seats. A desk is 2 x 2 tiles with its screen over one of them
// (desk-a: the left tile, desk-b: the right); a lead's desk is 3 x 2 with the
// screen in the middle. The chair sits under the screen, facing it (up).

type DeskKind = "a" | "b" | "lead";

interface DeskSpec {
  seat: string;
  room: RoomId;
  owner?: string;
  /** Desk top-left tile. */
  x: number;
  y: number;
  kind: DeskKind;
}

const DESKS: DeskSpec[] = [
  // Research: the lead's desk and three more.
  { seat: "desk-iris", room: "research", owner: "a-iris", x: 2, y: 2, kind: "lead" },
  { seat: "desk-scout", room: "research", owner: "a-scout", x: 7, y: 2, kind: "a" },
  { seat: "desk-gauge", room: "research", owner: "a-gauge", x: 10, y: 2, kind: "b" },
  { seat: "desk-research-4", room: "research", x: 10, y: 5, kind: "b" },
  // Atlas's office: Atlas and Priya.
  { seat: "desk-atlas", room: "atlas", owner: "a-atlas", x: 15, y: 2, kind: "lead" },
  { seat: "desk-priya", room: "atlas", owner: "m-priya", x: 19, y: 2, kind: "b" },
  // Outbound: Rook, Finch, Echo and Diego.
  { seat: "desk-rook", room: "outbound", owner: "a-rook", x: 27, y: 2, kind: "lead" },
  { seat: "desk-finch", room: "outbound", owner: "a-finch", x: 31, y: 2, kind: "a" },
  { seat: "desk-echo", room: "outbound", owner: "a-echo", x: 28, y: 5, kind: "a" },
  { seat: "desk-diego", room: "outbound", owner: "m-diego", x: 31, y: 5, kind: "b" },
  // Content: the lead's desk and three more.
  { seat: "desk-quill", room: "content", owner: "a-quill", x: 1, y: 15, kind: "lead" },
  { seat: "desk-cadence", room: "content", owner: "a-cadence", x: 7, y: 15, kind: "a" },
  { seat: "desk-mosaic", room: "content", owner: "a-mosaic", x: 1, y: 18, kind: "a" },
  { seat: "desk-content-4", room: "content", x: 7, y: 18, kind: "b" },
  // Finance ops: Ledger, Tally and Sam.
  { seat: "desk-ledger", room: "finance", owner: "a-ledger", x: 31, y: 15, kind: "lead" },
  { seat: "desk-tally", room: "finance", owner: "a-tally", x: 28, y: 18, kind: "a" },
  { seat: "desk-sam", room: "finance", owner: "m-sam", x: 31, y: 18, kind: "a" },
];

const SEAT_DX: Record<DeskKind, number> = { a: 0, b: 1, lead: 1 };

function deskPiece(d: DeskSpec): Furniture {
  const lead = d.kind === "lead";
  return {
    id: `${d.seat}-desk`,
    src: `${F}/${lead ? "lead-desk" : `desk-${d.kind}`}.png`,
    x: d.x,
    y: d.y,
    w: lead ? 48 : 32,
    h: 32,
    blocks: { x: d.x, y: d.y, w: lead ? 3 : 2, h: 2 },
    layer: "stand",
    z: (d.y + 2) * TILE,
  };
}

/** The meeting table (3 x 4 tiles) and its six seats. */
const TABLE: Rect = { x: 12, y: 16, w: 3, h: 4 };

const MEETING_SEATS: Seat[] = [
  { id: "meet-1", room: "meeting", tile: { x: 13, y: 15 }, facing: "down" },
  { id: "meet-2", room: "meeting", tile: { x: 11, y: 16 }, facing: "right" },
  { id: "meet-3", room: "meeting", tile: { x: 15, y: 16 }, facing: "left" },
  { id: "meet-4", room: "meeting", tile: { x: 11, y: 18 }, facing: "right" },
  { id: "meet-5", room: "meeting", tile: { x: 15, y: 18 }, facing: "left" },
  { id: "meet-6", room: "meeting", tile: { x: 13, y: 20 }, facing: "up" },
];

/** Every desk chair and meeting seat. Desk seats face their screen; meeting seats face the table. */
export const SEATS: Seat[] = [
  ...DESKS.map<Seat>((d) => ({
    id: d.seat,
    tile: { x: d.x + SEAT_DX[d.kind], y: d.y + 2 },
    facing: "up",
    room: d.room,
    ...(d.owner ? { owner: d.owner } : {}),
  })),
  ...MEETING_SEATS,
];

export const SEAT_BY_ID = Object.fromEntries(SEATS.map((s) => [s.id, s])) as Record<string, Seat>;

// Antea's office chair: one sprite for front and back (it is symmetric), a
// side view that faces left.
function chairFor(s: Seat): Furniture {
  const side = s.facing === "left" || s.facing === "right";
  return {
    id: `${s.id}-chair`,
    src: `${F}/${side ? "chair-side" : "chair"}.png`,
    flip: s.facing === "right",
    x: s.tile.x,
    y: s.tile.y,
    w: 16,
    h: 16,
    dy: s.facing === "up" ? 2 : 0,
    layer: "seat",
    z: (s.tile.y + 1) * TILE - 1,
  };
}

// ---------------------------------------------------------------------------
// The rooms' dressing. Order does not matter: depth comes from the layer and
// the bottom edge.

const DRESSING: Furniture[] = [
  // Research: charts and a whiteboard on the wall, a bookcase by the lead,
  // a big fig in the corner, a shared worktable behind Scout's chair.
  onWall("research-whiteboard", "whiteboard", 5, 1, 32, 32, 0, 3),
  onWall("research-graph", "wall-graph", 9, 1, 16, 16, 0, 12),
  onWall("research-note", "wall-note", 12, 1, 16, 16, 0, 12),
  stand("research-bookcase", "bookcase", { x: 5, y: 3 }, 32, 32, { dx: -8, block: [1, 2] }),
  stand("research-plant", "plant", { x: 6, y: 3 }, 16, 32),
  stand("research-bin", "bin", { x: 9, y: 3 }, 16, 16),
  stand("research-plant-2", "plant-2", { x: 12, y: 3 }, 16, 32),
  stand("research-fig", "large-plant", { x: 1, y: 7 }, 32, 48),
  stand("research-table", "side-table", { x: 7, y: 6 }, 32, 32),
  surface("research-papers", "papers", { x: 7, y: 6 }, 16, 16, 2, -9),
  surface("research-pot", "small-plant", { x: 8, y: 6 }, 16, 16, 0, -12),

  // Atlas's office: a bookcase, art, a clock; a fig left of the door and a
  // reading corner on a rug to its right.
  onWall("atlas-painting", "painting-large", 17, 1, 32, 32, 8, 0),
  onWall("atlas-clock", "clock", 21, 1, 16, 32),
  stand("atlas-bookcase", "bookcase", { x: 14, y: 3 }, 32, 32, { dx: -8, block: [1, 2] }),
  stand("atlas-plant", "plant", { x: 21, y: 3 }, 16, 32),
  stand("atlas-fig", "large-plant", { x: 14, y: 7 }, 32, 48, { dx: 4 }),
  stand("atlas-armchair", "armchair", { x: 19, y: 6 }, 32, 32, { dx: 2, block: [2, 1] }),
  stand("atlas-table", "small-table", { x: 21, y: 6 }, 16, 16),
  surface("atlas-mug", "mug", { x: 21, y: 6 }, 16, 16, -4, -4),

  // Outbound: printer and whiteboard by the door, charts, plants.
  onWall("outbound-whiteboard", "whiteboard", 24, 1, 32, 32, 0, 3),
  onWall("outbound-graph", "wall-graph", 30, 1, 16, 16, 0, 12),
  onWall("outbound-board", "board", 33, 1, 16, 16, 0, 12),
  stand("outbound-printer", "printer", { x: 23, y: 3 }, 32, 32, { block: [2, 2] }),
  stand("outbound-plant", "plant", { x: 26, y: 3 }, 16, 32),
  stand("outbound-bin", "bin", { x: 33, y: 3 }, 16, 16),
  stand("outbound-plant-2", "plant-2", { x: 34, y: 3 }, 16, 32),
  stand("outbound-cabinet", "cabinet-tall", { x: 23, y: 6 }, 32, 32, { dx: -8, block: [1, 1] }),
  stand("outbound-fig", "large-plant", { x: 33, y: 7 }, 32, 48),

  // Hall: art and a clock on its wall, plants, water by the far end.
  onWall("hall-painting", "painting-large", 11, 9, 32, 32),
  onWall("hall-clock", "clock", 14, 9, 16, 32),
  onWall("hall-painting-2", "painting", 31, 9, 16, 32),
  onWall("hall-painting-3", "painting-2", 33, 9, 16, 32),
  stand("hall-plant", "big-plant", { x: 2, y: 10 }, 32, 32, { dx: -4 }),
  stand("hall-plant-2", "plant-2", { x: 16, y: 10 }, 16, 32),
  stand("hall-plant-3", "plant", { x: 23, y: 10 }, 16, 32),
  stand("hall-water", "water-dispenser", { x: 34, y: 10 }, 32, 32, { dx: -8, block: [1, 1] }),
  stand("hall-bench", "bench", { x: 9, y: 12 }, 16, 16),
  stand("hall-bench-2", "bench", { x: 10, y: 12 }, 16, 16),
  stand("hall-bench-plant", "plant", { x: 11, y: 12 }, 16, 32),
  stand("hall-plant-4", "plant-2", { x: 31, y: 12 }, 16, 32),

  // Content: a whiteboard over Quill's desk, a bookcase, plants.
  onWall("content-whiteboard", "whiteboard", 1, 14, 32, 32, 8, 3),
  onWall("content-note", "wall-note-2", 9, 14, 16, 16, 0, 12),
  stand("content-bookcase", "bookcase", { x: 6, y: 16 }, 32, 32, { dx: -8, block: [1, 2] }),
  stand("content-plant", "plant-2", { x: 9, y: 16 }, 16, 32),
  stand("content-bin", "bin", { x: 3, y: 19 }, 16, 16),
  stand("content-plant-2", "plant", { x: 9, y: 20 }, 16, 32),

  // Meeting room: the big table on a rug, a whiteboard over it, plants.
  {
    id: "meeting-table",
    src: `${F}/meeting-table.png`,
    x: TABLE.x,
    y: TABLE.y,
    w: 48,
    h: 64,
    dy: -8,
    blocks: TABLE,
    layer: "stand",
    z: (TABLE.y + TABLE.h) * TILE,
  },
  onWall("meeting-whiteboard", "whiteboard", 11, 14, 32, 32, 6, 3),
  onTable("meeting-papers", "papers", 12, 16, 3, 2),
  onTable("meeting-mug", "mug", 13, 16, 2, 6),
  onTable("meeting-folders", "folders", 14, 17, -3, 4),
  onTable("meeting-papers-2", "papers", 12, 18, 4, 0),
  onTable("meeting-mug-2", "mug", 14, 18, -6, 8),
  stand("meeting-plant", "large-plant", { x: 17, y: 20 }, 32, 48, { block: [2, 1] }),
  stand("meeting-plant-2", "plant-2", { x: 16, y: 16 }, 16, 32),

  // Lounge: sofa and coffee table on a rug, an armchair, the coffee corner.
  onWall("lounge-painting", "painting", 23, 14, 16, 32),
  stand("lounge-sofa", "sofa", { x: 20, y: 16 }, 32, 32, { block: [2, 2] }),
  stand("lounge-table", "coffee-table", { x: 20, y: 18 }, 32, 32, { block: [2, 2] }),
  stand("lounge-chair", "sofa-side", { x: 22, y: 18 }, 32, 32, { dx: -8, block: [1, 1] }),
  stand("lounge-counter", "small-table", { x: 22, y: 15 }, 16, 16),
  surface("lounge-coffee", "coffee-machine", { x: 22, y: 15 }, 16, 16, 0, -7),
  stand("lounge-plant-2", "small-plant", { x: 23, y: 15 }, 16, 16),
  stand("lounge-water", "water-dispenser", { x: 25, y: 17 }, 32, 32, { dx: -8, block: [1, 1] }),
  stand("lounge-vending", "vending-machine", { x: 24, y: 20 }, 32, 32, { block: [2, 1] }),
  stand("lounge-plant", "plant-2", { x: 20, y: 20 }, 16, 32),

  // Finance ops: cabinets, a copier, the numbers on the wall.
  onWall("finance-clock", "wall-clock", 34, 14, 16, 16, 0, 12),
  stand("finance-cabinet", "cabinet-small", { x: 27, y: 15 }, 16, 16),
  stand("finance-cabinet-2", "cabinet-small", { x: 30, y: 16 }, 16, 16),
  stand("finance-plant", "plant-2", { x: 34, y: 16 }, 16, 32),
  stand("finance-copier", "copier", { x: 33, y: 19 }, 32, 32, { block: [2, 2] }),
  stand("finance-bin", "bin", { x: 30, y: 19 }, 16, 16),
];

export const FURNITURE: Furniture[] = [...DESKS.map(deskPiece), ...SEATS.map(chairFor), ...DRESSING];

// ---------------------------------------------------------------------------
// Walkability

const BLOCKED = new Set<string>();
for (const f of FURNITURE) {
  if (!f.blocks) continue;
  for (let y = f.blocks.y; y < f.blocks.y + f.blocks.h; y++) {
    for (let x = f.blocks.x; x < f.blocks.x + f.blocks.w; x++) BLOCKED.add(`${x},${y}`);
  }
}

/** Floor a character can stand on: not a wall, not behind one, not under furniture. Seats are walkable. */
export function isWalkable(t: Tile): boolean {
  if (kindAt(t) !== "floor") return false;
  if (isBehindWall(t)) return false;
  return !BLOCKED.has(`${t.x},${t.y}`);
}

