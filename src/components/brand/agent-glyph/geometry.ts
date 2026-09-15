/**
 * Outline geometry for the agent glyphs. Pure TypeScript, no DOM: it runs in
 * the browser for the tween and in node for the tests.
 *
 * The pipeline a morph uses, in order:
 *
 *   parsePath      the authored `body` string → absolute commands
 *   flattenPath    commands → a dense polyline (arcs subdivided finely)
 *   ensureClockwise
 *   resample       polyline → N points evenly spaced by arc length
 *   correspond     pairs source and target points: the cyclic shift that
 *                  minimises the summed squared distance (`alignOffset`),
 *                  then a banded warp so a tooth or a slot on one side can
 *                  share partners instead of folding across the silhouette
 *   lerpPoints     the in-between polygon at a given progress
 *   smoothClosed   softens that polygon toward the middle of the tween
 *
 * Only the tween draws a sampled polygon. A glyph at rest always draws its
 * authored `body`, so every still frame is the crisp drawing.
 */

import type { EyeRect } from "./types";

export type Point = { x: number; y: number };

export type PathCommand =
  | { type: "M"; x: number; y: number }
  | { type: "L"; x: number; y: number }
  | { type: "H"; x: number }
  | { type: "V"; y: number }
  | {
      type: "A";
      rx: number;
      ry: number;
      rotation: number;
      largeArc: boolean;
      sweep: boolean;
      x: number;
      y: number;
    }
  | { type: "Z" };

export type BBox = { x: number; y: number; width: number; height: number };

/** Points per sampled outline. Enough that a 1-module slot keeps ~4 points
    across its mouth on the longest outline; cheap enough to align in well
    under a millisecond. */
export const SAMPLE_COUNT = 240;

/** The command letters a glyph body may use (types.ts rule 1). */
export const ALLOWED_COMMANDS = ["M", "L", "H", "V", "A", "Z"] as const;

export class GlyphPathError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GlyphPathError";
  }
}

/* ------------------------------------------------------------------ parse */

const ARG_COUNT: Record<string, number> = { M: 2, L: 2, H: 1, V: 1, A: 7, Z: 0 };

function isSeparator(ch: string) {
  return ch === " " || ch === "," || ch === "\n" || ch === "\t" || ch === "\r";
}

/** The command letters in `d`, in order, exactly as written. */
export function commandLetters(d: string): string[] {
  return d.match(/[A-Za-z]/g) ?? [];
}

/**
 * Parses an absolute `M L H V A Z` path. Implicit repeats are honoured (extra
 * pairs after `M` are line-tos) and arc flags may be written without
 * separators (`A5 5 0 015 5`). Any other command, relative or not, throws.
 */
export function parsePath(d: string): PathCommand[] {
  const out: PathCommand[] = [];
  let i = 0;
  const n = d.length;

  const skip = () => {
    while (i < n && isSeparator(d[i])) i++;
  };

  const readNumber = (): number => {
    skip();
    const match = /^[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/.exec(d.slice(i));
    if (!match) throw new GlyphPathError(`Expected a number at ${i} in "${d.slice(i, i + 12)}"`);
    i += match[0].length;
    return Number(match[0]);
  };

  const readFlag = (): boolean => {
    skip();
    const ch = d[i];
    if (ch !== "0" && ch !== "1") throw new GlyphPathError(`Expected an arc flag at ${i}`);
    i++;
    return ch === "1";
  };

  const hasNumberAhead = () => {
    skip();
    return i < n && /[-+.\d]/.test(d[i]);
  };

  let command: string | null = null;
  while (true) {
    skip();
    if (i >= n) break;
    const ch = d[i];
    if (/[A-Za-z]/.test(ch)) {
      if (!(ch in ARG_COUNT)) {
        throw new GlyphPathError(`Command "${ch}" is not allowed; bodies use absolute M L H V A Z only`);
      }
      command = ch;
      i++;
    } else if (command === null || command === "Z") {
      throw new GlyphPathError(`Expected a command at ${i} in "${d.slice(i, i + 12)}"`);
    }

    // One command, then as many implicit repeats as numbers follow.
    let first = true;
    do {
      switch (command) {
        case "M": {
          const x = readNumber();
          const y = readNumber();
          out.push(first ? { type: "M", x, y } : { type: "L", x, y });
          break;
        }
        case "L":
          out.push({ type: "L", x: readNumber(), y: readNumber() });
          break;
        case "H":
          out.push({ type: "H", x: readNumber() });
          break;
        case "V":
          out.push({ type: "V", y: readNumber() });
          break;
        case "A": {
          const rx = readNumber();
          const ry = readNumber();
          const rotation = readNumber();
          const largeArc = readFlag();
          const sweep = readFlag();
          out.push({ type: "A", rx, ry, rotation, largeArc, sweep, x: readNumber(), y: readNumber() });
          break;
        }
        case "Z":
          out.push({ type: "Z" });
          break;
      }
      first = false;
    } while (command !== "Z" && hasNumberAhead());
  }
  return out;
}

/* --------------------------------------------------------------- flatten */

/** Largest angle step when an arc is subdivided: 2 degrees keeps the chord
    within 0.02 units of a 7-module radius. */
const ARC_STEP = Math.PI / 90;

function vectorAngle(ux: number, uy: number, vx: number, vy: number) {
  const sign = ux * vy - uy * vx < 0 ? -1 : 1;
  const dot = ux * vx + uy * vy;
  const len = Math.hypot(ux, uy) * Math.hypot(vx, vy);
  return sign * Math.acos(Math.min(1, Math.max(-1, dot / len)));
}

/**
 * Pushes the points of an SVG elliptical arc from (x0, y0) to (x, y) onto
 * `out`, excluding the start point. Endpoint → centre conversion per the SVG
 * implementation notes (F.6.5), radii scaled up when they cannot span the
 * chord (F.6.6).
 */
function arcPoints(
  out: Point[],
  x0: number,
  y0: number,
  cmd: Extract<PathCommand, { type: "A" }>,
) {
  let rx = Math.abs(cmd.rx);
  let ry = Math.abs(cmd.ry);
  const { x, y } = cmd;
  if (x0 === x && y0 === y) return;
  if (rx === 0 || ry === 0) {
    out.push({ x, y });
    return;
  }
  const phi = (cmd.rotation * Math.PI) / 180;
  const cos = Math.cos(phi);
  const sin = Math.sin(phi);
  const dx = (x0 - x) / 2;
  const dy = (y0 - y) / 2;
  const x1p = cos * dx + sin * dy;
  const y1p = -sin * dx + cos * dy;

  const lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lambda > 1) {
    const s = Math.sqrt(lambda);
    rx *= s;
    ry *= s;
  }
  const num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
  const den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
  const coef = (cmd.largeArc !== cmd.sweep ? 1 : -1) * Math.sqrt(Math.max(0, num / den));
  const cxp = (coef * rx * y1p) / ry;
  const cyp = (-coef * ry * x1p) / rx;
  const cx = cos * cxp - sin * cyp + (x0 + x) / 2;
  const cy = sin * cxp + cos * cyp + (y0 + y) / 2;

  const theta1 = vectorAngle(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
  let delta = vectorAngle((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
  if (!cmd.sweep && delta > 0) delta -= 2 * Math.PI;
  if (cmd.sweep && delta < 0) delta += 2 * Math.PI;

  const steps = Math.max(2, Math.ceil(Math.abs(delta) / ARC_STEP));
  for (let s = 1; s < steps; s++) {
    const t = theta1 + (delta * s) / steps;
    const ct = Math.cos(t);
    const st = Math.sin(t);
    out.push({ x: cx + rx * cos * ct - ry * sin * st, y: cy + rx * sin * ct + ry * cos * st });
  }
  // Land exactly on the authored endpoint rather than a rounded cosine.
  out.push({ x, y });
}

/**
 * The outline as one dense closed polyline (the closing point is not
 * repeated). Throws unless the path is exactly one subpath.
 */
export function flattenPath(commands: readonly PathCommand[]): Point[] {
  const out: Point[] = [];
  let cx = 0;
  let cy = 0;
  let started = false;
  let closed = false;
  for (const cmd of commands) {
    if (closed) throw new GlyphPathError("A body is one closed subpath; nothing may follow Z");
    switch (cmd.type) {
      case "M":
        if (started) throw new GlyphPathError("A body is one subpath; found a second M");
        started = true;
        cx = cmd.x;
        cy = cmd.y;
        out.push({ x: cx, y: cy });
        break;
      case "L":
      case "H":
      case "V": {
        if (!started) throw new GlyphPathError("A body must start with M");
        const nx = cmd.type === "V" ? cx : cmd.x;
        const ny = cmd.type === "H" ? cy : cmd.y;
        if (nx !== cx || ny !== cy) out.push({ x: nx, y: ny });
        cx = nx;
        cy = ny;
        break;
      }
      case "A":
        if (!started) throw new GlyphPathError("A body must start with M");
        arcPoints(out, cx, cy, cmd);
        cx = cmd.x;
        cy = cmd.y;
        break;
      case "Z":
        closed = true;
        break;
    }
  }
  if (!started) throw new GlyphPathError("A body must start with M");
  // Drop a trailing point that repeats the start (an explicit return before Z).
  const last = out[out.length - 1];
  if (out.length > 1 && Math.hypot(last.x - out[0].x, last.y - out[0].y) < 1e-6) out.pop();
  return out;
}

/* ------------------------------------------------------ measure & sample */

/** Shoelace area. Positive means clockwise on screen (y grows downward). */
export function signedArea(points: readonly Point[]): number {
  let sum = 0;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    sum += points[j].x * points[i].y - points[i].x * points[j].y;
  }
  return sum / 2;
}

export function isClockwise(points: readonly Point[]): boolean {
  return signedArea(points) > 0;
}

/** The same outline running clockwise, keeping its first point first. */
export function ensureClockwise(points: readonly Point[]): Point[] {
  if (isClockwise(points)) return points.slice();
  return [points[0], ...points.slice(1).reverse()];
}

export function perimeter(points: readonly Point[]): number {
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    sum += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return sum;
}

export function boundingBox(points: readonly Point[]): BBox {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/**
 * `count` points evenly spaced by arc length around a closed polyline,
 * starting at its first point.
 */
export function resample(points: readonly Point[], count = SAMPLE_COUNT): Point[] {
  const total = perimeter(points);
  const step = total / count;
  const out: Point[] = [];
  let segment = 0;
  let walked = 0; // arc length at the start of `segment`
  for (let k = 0; k < count; k++) {
    const target = k * step;
    let a = points[segment];
    let b = points[(segment + 1) % points.length];
    let len = Math.hypot(b.x - a.x, b.y - a.y);
    while (walked + len < target && segment < points.length - 1) {
      walked += len;
      segment++;
      a = points[segment];
      b = points[(segment + 1) % points.length];
      len = Math.hypot(b.x - a.x, b.y - a.y);
    }
    const t = len === 0 ? 0 : Math.min(1, (target - walked) / len);
    out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  }
  return out;
}

/** Even-odd point-in-polygon (the outlines have no holes, so the rules agree). */
export function pointInPolygon(p: Point, polygon: readonly Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

/** Shortest distance from `p` to the polygon's edges. */
export function distanceToOutline(p: Point, polygon: readonly Point[]): number {
  let best = Infinity;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[j];
    const b = polygon[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
    const d = Math.hypot(p.x - (a.x + dx * t), p.y - (a.y + dy * t));
    if (d < best) best = d;
  }
  return best;
}

/* ------------------------------------------------------ align & tween */

/**
 * The shift `k` that minimises Σ |from[i] − to[(i + k) mod N]|²: which point
 * on the target each source point should travel to. Both lists must be the
 * same length and wind the same way.
 */
export function alignOffset(from: readonly Point[], to: readonly Point[]): number {
  const n = from.length;
  if (to.length !== n) throw new GlyphPathError("alignOffset needs equal-length outlines");
  let bestK = 0;
  let best = Infinity;
  for (let k = 0; k < n; k++) {
    let sum = 0;
    for (let i = 0; i < n && sum < best; i++) {
      const b = to[(i + k) % n];
      const dx = from[i].x - b.x;
      const dy = from[i].y - b.y;
      sum += dx * dx + dy * dy;
    }
    if (sum < best) {
      best = sum;
      bestK = k;
    }
  }
  return bestK;
}

/** How far (as a fraction of the outline) warping may slide a point against
    its shifted partner. */
const WARP_BAND = 1 / 6;
/** Cost of a non-diagonal warp step, in squared sample spacings: enough to
    stop a whole feature collapsing onto one point, small enough to let a slot
    or a tooth keep its partner. */
const WARP_PENALTY = 1;

/**
 * Pairs every point of `from` with a point of `to` so the two can be lerped.
 *
 * First the cyclic shift (`alignOffset`) lines the outlines up as a whole.
 * Then a banded dynamic time warp lets the pairing slide locally: where one
 * outline has a tooth or a slot the other lacks, several points on one side
 * can share a partner instead of being dragged across the silhouette, which
 * is what otherwise folds the in-betweens into spikes and slivers. The warped
 * path is resampled back to `count` evenly spaced pairs, so each list stays
 * on its own outline and every frame has the same number of points.
 */
export function correspond(
  from: readonly Point[],
  to: readonly Point[],
  count = from.length,
): { from: Point[]; to: Point[] } {
  const n = from.length;
  if (to.length !== n) throw new GlyphPathError("correspond needs equal-length outlines");
  const a = from;
  const b = rotate(to, alignOffset(from, to));

  const band = Math.max(1, Math.floor(n * WARP_BAND));
  const width = 2 * band + 1;
  const spacing = perimeter(a) / n;
  const penalty = WARP_PENALTY * spacing * spacing;
  const cost = new Float64Array(n * width).fill(Infinity);
  const move = new Uint8Array(n * width); // 0 diagonal, 1 from i-1, 2 from j-1
  const at = (i: number, j: number) => i * width + (j - i + band);
  const inBand = (i: number, j: number) => j >= 0 && j < n && Math.abs(j - i) <= band;

  for (let i = 0; i < n; i++) {
    for (let j = Math.max(0, i - band); j <= Math.min(n - 1, i + band); j++) {
      const dx = a[i].x - b[j].x;
      const dy = a[i].y - b[j].y;
      const local = dx * dx + dy * dy;
      if (i === 0 && j === 0) {
        cost[at(0, 0)] = local;
        continue;
      }
      let best = Infinity;
      let step = 0;
      if (i > 0 && j > 0 && inBand(i - 1, j - 1) && cost[at(i - 1, j - 1)] < best) {
        best = cost[at(i - 1, j - 1)];
        step = 0;
      }
      if (i > 0 && inBand(i - 1, j) && cost[at(i - 1, j)] + penalty < best) {
        best = cost[at(i - 1, j)] + penalty;
        step = 1;
      }
      if (j > 0 && inBand(i, j - 1) && cost[at(i, j - 1)] + penalty < best) {
        best = cost[at(i, j - 1)] + penalty;
        step = 2;
      }
      cost[at(i, j)] = best + local;
      move[at(i, j)] = step;
    }
  }

  const pathA: Point[] = [];
  const pathB: Point[] = [];
  for (let i = n - 1, j = n - 1; ; ) {
    pathA.push(a[i]);
    pathB.push(b[j]);
    if (i === 0 && j === 0) break;
    const step = move[at(i, j)];
    if (step === 0) {
      i--;
      j--;
    } else if (step === 1) i--;
    else j--;
  }
  pathA.reverse();
  pathB.reverse();

  // The path is open (it ends one step short of its start); close it, then
  // resample by the mean of the two outlines' arc lengths.
  pathA.push(pathA[0]);
  pathB.push(pathB[0]);
  const lengths = [0];
  for (let k = 1; k < pathA.length; k++) {
    const la = Math.hypot(pathA[k].x - pathA[k - 1].x, pathA[k].y - pathA[k - 1].y);
    const lb = Math.hypot(pathB[k].x - pathB[k - 1].x, pathB[k].y - pathB[k - 1].y);
    lengths.push(lengths[k - 1] + (la + lb) / 2);
  }
  const total = lengths[lengths.length - 1];
  const outA: Point[] = [];
  const outB: Point[] = [];
  let k = 1;
  for (let s = 0; s < count; s++) {
    const target = (s * total) / count;
    while (k < lengths.length - 1 && lengths[k] < target) k++;
    const span = lengths[k] - lengths[k - 1];
    const t = span === 0 ? 0 : (target - lengths[k - 1]) / span;
    outA.push({ x: lerp(pathA[k - 1].x, pathA[k].x, t), y: lerp(pathA[k - 1].y, pathA[k].y, t) });
    outB.push({ x: lerp(pathB[k - 1].x, pathB[k].x, t), y: lerp(pathB[k - 1].y, pathB[k].y, t) });
  }
  return { from: outA, to: outB };
}

/** `to` rotated so index i pairs with `from[i]`. */
export function rotate<T>(list: readonly T[], offset: number): T[] {
  const n = list.length;
  return Array.from({ length: n }, (_, i) => list[(i + offset) % n]);
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function lerpPoints(from: readonly Point[], to: readonly Point[], t: number): Point[] {
  return from.map((p, i) => ({ x: lerp(p.x, to[i].x, t), y: lerp(p.y, to[i].y, t) }));
}

export function lerpRect(a: EyeRect, b: EyeRect, t: number): EyeRect {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    width: lerp(a.width, b.width, t),
    height: lerp(a.height, b.height, t),
    radius: lerp(a.radius, b.radius, t),
  };
}

export function lerpBox(a: BBox, b: BBox, t: number): BBox {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    width: lerp(a.width, b.width, t),
    height: lerp(a.height, b.height, t),
  };
}

/**
 * `passes` rounds of [¼ ½ ¼] neighbour averaging around a closed outline: a
 * cheap Gaussian (σ ≈ √(passes / 2) points) that melts thin spikes and
 * slivers into the body without moving the broad silhouette much.
 */
export function smoothClosed(points: readonly Point[], passes: number): Point[] {
  const n = points.length;
  let xs = points.map((p) => p.x);
  let ys = points.map((p) => p.y);
  for (let pass = 0; pass < passes; pass++) {
    const nx = new Array<number>(n);
    const ny = new Array<number>(n);
    for (let i = 0; i < n; i++) {
      const prev = (i + n - 1) % n;
      const next = (i + 1) % n;
      nx[i] = (xs[prev] + 2 * xs[i] + xs[next]) / 4;
      ny[i] = (ys[prev] + 2 * ys[i] + ys[next]) / 4;
    }
    xs = nx;
    ys = ny;
  }
  return xs.map((x, i) => ({ x, y: ys[i] }));
}

const round = (v: number) => Math.round(v * 100) / 100;

/** A closed polygon as an absolute `M … L … Z` path. */
export function polygonToPath(points: readonly Point[]): string {
  if (points.length === 0) return "";
  let d = `M${round(points[0].x)} ${round(points[0].y)}`;
  for (let i = 1; i < points.length; i++) d += `L${round(points[i].x)} ${round(points[i].y)}`;
  return `${d}Z`;
}

/* ------------------------------------------------------------- outline */

export type Outline = {
  /** The dense polyline, clockwise, starting at the authored `M`. */
  dense: Point[];
  /** `SAMPLE_COUNT` points evenly spaced by arc length, clockwise. */
  samples: Point[];
  bbox: BBox;
  /** Positive: clockwise as authored. */
  area: number;
};

/** Everything the runtime needs from one authored body. */
export function buildOutline(body: string, count = SAMPLE_COUNT): Outline {
  const flat = flattenPath(parsePath(body));
  const area = signedArea(flat);
  const dense = ensureClockwise(flat);
  return { dense, samples: resample(dense, count), bbox: boundingBox(dense), area };
}
