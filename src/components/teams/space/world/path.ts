// Path finding on the office grid. `findPath` is a port of Pixel Agents'
// 4-connected BFS (webview-ui/src/office/layout/tileMap.ts), reshaped to
// read this map's `isWalkable` and to return null when there is no way.
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

import type { Tile } from "../types";
import { COLS, ROWS, isWalkable } from "./map";

export function tileKey(t: Tile): string {
  return `${t.x},${t.y}`;
}

// Up, down, left, right: the order Pixel Agents searches in.
const DIRS: readonly Tile[] = [
  { x: 0, y: -1 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
];

/**
 * The shortest 4-connected walk from `from` to `to` over walkable tiles:
 * every tile after `from` up to and including `to`. `[]` when they are the
 * same tile, `null` when `to` is not walkable or cannot be reached. `from`
 * itself need not be walkable (a character dropped on a wall still walks out).
 */
export function findPath(from: Tile, to: Tile): Tile[] | null {
  if (from.x === to.x && from.y === to.y) return [];
  if (!isWalkable(to)) return null;

  const startKey = tileKey(from);
  const endKey = tileKey(to);
  const parent = new Map<string, Tile>();
  const visited = new Set<string>([startKey]);
  const queue: Tile[] = [from];

  for (let head = 0; head < queue.length; head++) {
    const cur = queue[head];
    if (tileKey(cur) === endKey) {
      const path: Tile[] = [];
      let t: Tile | undefined = cur;
      while (t && tileKey(t) !== startKey) {
        path.push(t);
        t = parent.get(tileKey(t));
      }
      return path.reverse();
    }
    for (const d of DIRS) {
      const next = { x: cur.x + d.x, y: cur.y + d.y };
      const k = tileKey(next);
      if (visited.has(k) || !isWalkable(next)) continue;
      visited.add(k);
      parent.set(k, cur);
      queue.push(next);
    }
  }
  return null;
}

/**
 * The walkable tile nearest to `t` (itself when it is walkable and free),
 * searching outward ring by ring so a drop snaps to the closest floor.
 * `taken` holds `tileKey`s to avoid, such as tiles other characters stand on.
 * Ties go to the tile closest in straight-line distance, then top-left first.
 */
export function nearestWalkable(t: Tile, taken?: Set<string>): Tile {
  const cx = Math.min(COLS - 1, Math.max(0, Math.round(t.x)));
  const cy = Math.min(ROWS - 1, Math.max(0, Math.round(t.y)));
  const free = (c: Tile) => isWalkable(c) && !taken?.has(tileKey(c));
  if (free({ x: cx, y: cy })) return { x: cx, y: cy };

  const maxR = Math.max(COLS, ROWS);
  for (let r = 1; r <= maxR; r++) {
    let best: Tile | null = null;
    let bestD = Infinity;
    for (let y = cy - r; y <= cy + r; y++) {
      for (let x = cx - r; x <= cx + r; x++) {
        if (Math.max(Math.abs(x - cx), Math.abs(y - cy)) !== r) continue;
        const c = { x, y };
        if (!free(c)) continue;
        const d = (x - t.x) ** 2 + (y - t.y) ** 2;
        if (d < bestD) {
          bestD = d;
          best = c;
        }
      }
    }
    if (best) return best;
  }
  return { x: cx, y: cy };
}
