/**
 * The shape contract (types.ts) as checks. The test suite runs these over
 * every registered shape and the preview page lists any failures beside the
 * shape, so a drawing that breaks a rule is visible where it is judged.
 */

import {
  ALLOWED_COMMANDS,
  boundingBox,
  commandLetters,
  distanceToOutline,
  flattenPath,
  GlyphPathError,
  parsePath,
  pointInPolygon,
  signedArea,
  type PathCommand,
  type Point,
} from "./geometry";
import { GLYPH_BOX, MODULE, type EyeRect, type GlyphShape } from "./types";

/** Clear body required around each eye. The contract says "at least ~0.75
    module"; the check allows a hair under for rounding. */
export const EYE_MARGIN = 0.7 * MODULE;
/** Tolerance for "on the box edge", in units. */
const EPS = 0.05;
/** Tolerance for "on the topmost edge". */
const EDGE_EPS = 0.01;

/** The authored vertices: every command's endpoint, not the arc subdivisions
    (a corner round's points brush the top edge without being on it). */
function authoredVertices(commands: readonly PathCommand[]): Point[] {
  const out: Point[] = [];
  let x = 0;
  let y = 0;
  for (const cmd of commands) {
    if (cmd.type === "Z") continue;
    if (cmd.type === "H") x = cmd.x;
    else if (cmd.type === "V") y = cmd.y;
    else {
      x = cmd.x;
      y = cmd.y;
    }
    out.push({ x, y });
  }
  return out;
}

function eyeProbePoints(eye: EyeRect): Point[] {
  const { x, y, width: w, height: h } = eye;
  const points: Point[] = [];
  // The perimeter of the rect, a point every unit or so (corners included:
  // checking the square corners is stricter than the rounded ones).
  const steps = Math.max(4, Math.ceil(Math.max(w, h)));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    points.push({ x: x + w * t, y }, { x: x + w * t, y: y + h }, { x, y: y + h * t }, { x: x + w, y: y + h * t });
  }
  return points;
}

/** Every way `shape` breaks the contract; empty when it conforms. */
export function glyphIssues(shape: GlyphShape): string[] {
  const issues: string[] = [];
  const d = shape.body.trim();

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(shape.id)) issues.push(`id "${shape.id}" is not kebab-case`);

  const letters = commandLetters(d);
  const banned = [...new Set(letters.filter((l) => !(ALLOWED_COMMANDS as readonly string[]).includes(l)))];
  if (banned.length) issues.push(`uses ${banned.join(", ")}; only absolute M L H V A Z are allowed`);
  if (letters[0] !== "M") issues.push("does not start with M");
  if (letters[letters.length - 1] !== "Z") issues.push("does not end with Z");
  const moves = letters.filter((l) => l === "M" || l === "m").length;
  if (moves !== 1) issues.push(`has ${moves} subpaths; a body is one`);
  if (letters.filter((l) => l === "Z" || l === "z").length !== 1) issues.push("must close exactly once");
  if (issues.length) return issues;

  let outline: Point[];
  let vertices: Point[];
  try {
    const commands = parsePath(d);
    outline = flattenPath(commands);
    vertices = authoredVertices(commands);
  } catch (error) {
    return [error instanceof GlyphPathError ? error.message : String(error)];
  }

  if (signedArea(outline) <= 0) issues.push("runs counter-clockwise; bodies run clockwise (y down)");

  const box = boundingBox(outline);
  if (box.x < -EPS || box.y < -EPS || box.x + box.width > GLYPH_BOX + EPS || box.y + box.height > GLYPH_BOX + EPS) {
    issues.push(`leaves the ${GLYPH_BOX} box (bbox ${fmt(box.x)},${fmt(box.y)} ${fmt(box.width)}×${fmt(box.height)})`);
  }
  const dx = Math.abs(box.x + box.width / 2 - GLYPH_BOX / 2);
  const dy = Math.abs(box.y + box.height / 2 - GLYPH_BOX / 2);
  if (dx > 0.5 || dy > 0.5) issues.push(`is not centred in the box (off by ${fmt(dx)}, ${fmt(dy)})`);

  const start = outline[0];
  if (Math.abs(start.y - box.y) > EDGE_EPS) {
    issues.push("does not start on the topmost edge");
  } else {
    const leftmostTop = Math.min(...vertices.filter((p) => Math.abs(p.y - box.y) <= EDGE_EPS).map((p) => p.x));
    if (start.x - leftmostTop > EDGE_EPS) issues.push("does not start at the left end of the topmost edge");
  }

  shape.eyes.forEach((eye, index) => {
    const side = index === 0 ? "left" : "right";
    const probes = eyeProbePoints(eye);
    if (!probes.every((p) => pointInPolygon(p, outline))) {
      issues.push(`${side} eye is not inside the body`);
      return;
    }
    const clearance = Math.min(...probes.map((p) => distanceToOutline(p, outline)));
    if (clearance < EYE_MARGIN - EPS) {
      issues.push(`${side} eye has ${fmt(clearance / MODULE)} module of body around it; needs ~0.75`);
    }
  });
  if (shape.eyes[0].x >= shape.eyes[1].x) issues.push("eyes are not [left, right]");

  return issues;
}

const fmt = (v: number) => String(Math.round(v * 100) / 100);
