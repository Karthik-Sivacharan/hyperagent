"use client";

// The office's baked layer: floors, rugs and walls, painted once into a
// <canvas> at 1x (one canvas px per art px) and scaled up by CSS with
// `image-rendering: pixelated`, the way Gather draws its map. Furniture,
// characters and every label are DOM on top of it.
//
// The wall auto-tiling is a port of Pixel Agents' wallTiles.ts (the 4-bit
// neighbour mask picks one of 16 pieces) and the rugs follow its carpet
// renderer (a marching-squares piece centred on every tile corner):
//
// Pixel Agents v1.4.1, https://github.com/pixel-agents-hq/pixel-agents
// MIT License. Copyright (c) 2026 Pablo De Lucca.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
// The tints live in the PNGs (scripts/space/world-assets.mjs), so this file
// carries no colour of its own. The art is the same in both themes; in dark it
// is softened a touch (brightness only, never hue) so the lit room does not
// glare against the dark ground.

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

import { COLS, MAP_H, MAP_W, ROWS, RUGS, TILE, floorAt, isLowWall, isWall, type FloorName, type RugName } from "./map";

const FLOOR_NAMES: FloorName[] = ["wood", "walnut", "hall", "carpet", "tile"];
const RUG_NAMES: RugName[] = ["oat", "stone", "mat"];

/** The wall sheet: 4 x 4 pieces of 16 x 32, piece `mask` at column mask % 4, row mask / 4. */
const WALL_W = 16;
const WALL_H = 32;

/** N = 1, E = 2, S = 4, W = 8; off the map counts as not a wall. */
function wallMask(x: number, y: number): number {
  let mask = 0;
  if (isWall({ x, y: y - 1 })) mask |= 1;
  if (isWall({ x: x + 1, y })) mask |= 2;
  if (isWall({ x, y: y + 1 })) mask |= 4;
  if (isWall({ x: x - 1, y })) mask |= 8;
  return mask;
}

/** Marching-squares case of the corner at (jx, jy): which of its four tiles the rug covers (NW 1, NE 2, SE 4, SW 8). */
function rugCase(jx: number, jy: number, r: { x: number; y: number; w: number; h: number }): number {
  const on = (x: number, y: number) => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;
  return (on(jx - 1, jy - 1) ? 1 : 0) | (on(jx, jy - 1) ? 2 : 0) | (on(jx, jy) ? 4 : 0) | (on(jx - 1, jy) ? 8 : 0);
}

function load(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`space: could not load ${src}`));
    img.src = src;
  });
}

interface Sheets {
  floors: Record<FloorName, HTMLImageElement>;
  rugs: Record<RugName, HTMLImageElement>;
  wall: HTMLImageElement;
  shade: HTMLImageElement;
}

async function loadSheets(): Promise<Sheets> {
  const [floors, rugs, wall, shade] = await Promise.all([
    Promise.all(FLOOR_NAMES.map((n) => load(`/space/floors/${n}.png`))),
    Promise.all(RUG_NAMES.map((n) => load(`/space/rugs/${n}.png`))),
    load("/space/walls/wall.png"),
    load("/space/walls/shade.png"),
  ]);
  return {
    floors: Object.fromEntries(FLOOR_NAMES.map((n, i) => [n, floors[i]])) as Sheets["floors"],
    rugs: Object.fromEntries(RUG_NAMES.map((n, i) => [n, rugs[i]])) as Sheets["rugs"],
    wall,
    shade,
  };
}

function paint(ctx: CanvasRenderingContext2D, s: Sheets) {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, MAP_W, MAP_H);

  // Floors, one tile at a time. A pattern may span several tiles (the boards
  // are 2 x 2), so each tile takes its own cell of it.
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const floor = floorAt({ x, y });
      if (!floor) continue;
      const img = s.floors[floor];
      const sx = (x % Math.max(1, img.width / TILE)) * TILE;
      const sy = (y % Math.max(1, img.height / TILE)) * TILE;
      ctx.drawImage(img, sx, sy, TILE, TILE, x * TILE, y * TILE, TILE, TILE);
    }
  }

  // Rugs: a 16 x 16 piece centred on every corner the rug touches.
  for (const r of RUGS) {
    const sheet = s.rugs[r.rug];
    for (let jy = r.y; jy <= r.y + r.h; jy++) {
      for (let jx = r.x; jx <= r.x + r.w; jx++) {
        const c = rugCase(jx, jy, r);
        if (!c) continue;
        const sx = (c % 4) * TILE;
        const sy = Math.floor(c / 4) * TILE;
        ctx.drawImage(sheet, sx, sy, TILE, TILE, jx * TILE - TILE / 2, jy * TILE - TILE / 2, TILE, TILE);
      }
    }
  }

  // The soft shadow each wall face casts on the floor just in front of it.
  for (let y = 1; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (floorAt({ x, y }) && isWall({ x, y: y - 1 })) ctx.drawImage(s.shade, x * TILE, y * TILE);
    }
  }

  // Walls, top row first so each piece's face overlaps the one above it. A
  // piece stands on the bottom of its tile and rises one tile; the outer
  // south wall is dropped a tile so only its cap shows.
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (!isWall({ x, y })) continue;
      const mask = wallMask(x, y);
      const sx = (mask % 4) * WALL_W;
      const sy = Math.floor(mask / 4) * WALL_H;
      const top = isLowWall({ x, y }) ? y * TILE : (y + 1) * TILE - WALL_H;
      ctx.drawImage(s.wall, sx, sy, WALL_W, WALL_H, x * TILE, top, WALL_W, WALL_H);
    }
  }
}

export function FloorCanvas({ scale, className }: { scale: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    let live = true;
    loadSheets()
      .then((sheets) => {
        if (live) paint(ctx, sheets);
      })
      .catch((err: unknown) => console.error(err));
    return () => {
      live = false;
    };
  }, []);

  return (
    <canvas
      ref={ref}
      width={MAP_W}
      height={MAP_H}
      aria-hidden="true"
      className={cn("pointer-events-none absolute top-0 left-0 [image-rendering:pixelated] dark:brightness-90", className)}
      style={{ width: MAP_W * scale, height: MAP_H * scale }}
    />
  );
}
