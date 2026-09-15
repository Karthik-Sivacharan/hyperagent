import {
  CENTRE,
  CONCAVE_RADIUS,
  CORNER_RADIUS as r,
  EYE_ROW_Y,
  HALF,
  OPTICAL_SCALE,
  eyePair,
  scaleBody,
} from "../../grammar";
import type { GlyphShape } from "../../types";

/** Tooth half-width: the teeth are 3.4 modules wide. */
const w = 17;
/** Round at the bottom of each gap between teeth. */
const g = CONCAVE_RADIUS;

const TEETH = 8;
const HALF_STEP = Math.PI / TEETH; // 22.5°

type P = readonly [number, number];
const at = (u: P, n: P, along: number, across: number): P => [
  CENTRE + u[0] * along + n[0] * across,
  CENTRE + u[1] * along + n[1] * across,
];
const fmt = (p: P) => `${p[0]} ${p[1]}`;

// Tooth i points along angle -90° + 45° · i; `n` is its clockwise side.
const tooth = (i: number) => {
  const a = -Math.PI / 2 + (2 * HALF_STEP) * i;
  const u: P = [Math.cos(a), Math.sin(a)];
  const n: P = [-Math.sin(a), Math.cos(a)];
  return { u, n };
};

// Each gap is a 45° wedge between two tooth sides. Its round's centre sits
// on the bisector; the tangent points are that centre's feet on both sides.
const gapCentreDistance = w / Math.sin(HALF_STEP) + g / Math.sin(HALF_STEP);
const gapFoot = gapCentreDistance * Math.cos(HALF_STEP);

function outline(): string {
  const parts: string[] = [];
  for (let i = 0; i < TEETH; i++) {
    const { u, n } = tooth(i);
    const next = tooth(i + 1);
    if (i === 0) parts.push(`M ${fmt(at(u, n, HALF, -(w - r)))}`);
    parts.push(
      `L ${fmt(at(u, n, HALF, w - r))}`,
      `A ${r} ${r} 0 0 1 ${fmt(at(u, n, HALF - r, w))}`,
      `L ${fmt(at(u, n, gapFoot, w))}`,
      `A ${g} ${g} 0 0 0 ${fmt(at(next.u, next.n, gapFoot, -w))}`,
      `L ${fmt(at(next.u, next.n, HALF - r, -w))}`,
      `A ${r} ${r} 0 0 1 ${fmt(at(next.u, next.n, HALF, -(w - r)))}`,
    );
  }
  // The last corner arc lands back on the start point.
  return `${parts.join(" ")} Z`;
}

/**
 * Eight rectangular teeth at 45° steps, each a 3.4-module bar reaching the
 * edge of the box, with round gaps between them.
 */
export const cog: GlyphShape = {
  id: "cog",
  name: "Cog",
  set: "study",
  body: scaleBody(outline(), OPTICAL_SCALE.full),
  eyes: eyePair(EYE_ROW_Y),
  entry: { rotate: -12 },
  archetype: "A worker that keeps processes turning.",
};
