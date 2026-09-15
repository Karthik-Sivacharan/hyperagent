import { describe, expect, it } from "vitest";

import {
  BLINK_SCALE,
  blinkEyes,
  cubicBezier,
  defaultPace,
  entryTransform,
  frameAt,
  GLYPH_PACES,
  PACE_TIMING,
  planTransition,
  restSnapshot,
  snapshotOf,
  TRANSITION_MS,
} from "./choreography";
import {
  alignOffset,
  boundingBox,
  buildOutline,
  commandLetters,
  correspond,
  distanceToOutline,
  ensureClockwise,
  flattenPath,
  GlyphPathError,
  isClockwise,
  parsePath,
  perimeter,
  pointInPolygon,
  polygonToPath,
  resample,
  rotate,
  SAMPLE_COUNT,
  signedArea,
  smoothClosed,
} from "./geometry";
import { ALL_GLYPHS, GLYPH_SETS, findGlyph, getGlyph } from "./registry";
import type { GlyphShape } from "./types";
import { glyphIssues } from "./validate";

// Two contract-conformant outlines so the engine is tested before (and
// independently of) the drawn sets: a rounded square, and an arch on two
// legs with a round-topped slot. Neither is registered.
const eye = (cx: number, cy: number) => ({ x: cx - 7, y: cy - 7, width: 14, height: 14, radius: 2.5 });

const roundedSquare: GlyphShape = {
  id: "fixture-square",
  name: "Square",
  set: "study",
  body: "M 14 10 H 126 A 4 4 0 0 1 130 14 V 126 A 4 4 0 0 1 126 130 H 14 A 4 4 0 0 1 10 126 V 14 A 4 4 0 0 1 14 10 Z",
  eyes: [eye(52.5, 60), eye(87.5, 60)],
  entry: { scaleX: 1.1 },
};

const arch: GlyphShape = {
  id: "fixture-arch",
  name: "Arch",
  set: "study",
  body: "M 70 0 A 70 70 0 0 1 140 70 V 140 H 75 V 105 A 5 5 0 0 0 65 105 V 140 H 0 V 70 A 70 70 0 0 1 70 0 Z",
  eyes: [eye(52.5, 50), eye(87.5, 50)],
};

const FIXTURES = [roundedSquare, arch];

describe("parsePath", () => {
  it("reads absolute M L H V A Z", () => {
    expect(parsePath("M1 2 L3 4 H5 V6 A7 8 15 1 0 9 10 Z")).toEqual([
      { type: "M", x: 1, y: 2 },
      { type: "L", x: 3, y: 4 },
      { type: "H", x: 5 },
      { type: "V", y: 6 },
      { type: "A", rx: 7, ry: 8, rotation: 15, largeArc: true, sweep: false, x: 9, y: 10 },
      { type: "Z" },
    ]);
  });

  it("honours implicit repeats, compact arc flags, decimals and exponents", () => {
    expect(parsePath("M0,0 10,0 H.5 A5 5 0 015 5 V1e1 Z")).toEqual([
      { type: "M", x: 0, y: 0 },
      { type: "L", x: 10, y: 0 },
      { type: "H", x: 0.5 },
      { type: "A", rx: 5, ry: 5, rotation: 0, largeArc: false, sweep: true, x: 5, y: 5 },
      { type: "V", y: 10 },
      { type: "Z" },
    ]);
  });

  it("rejects curves and relative commands", () => {
    expect(() => parsePath("M0 0 C1 1 2 2 3 3 Z")).toThrow(GlyphPathError);
    expect(() => parsePath("M0 0 l10 0 Z")).toThrow(GlyphPathError);
    expect(() => parsePath("0 0 L1 1")).toThrow(GlyphPathError);
  });
});

describe("flattenPath", () => {
  it("rejects a second subpath", () => {
    expect(() => flattenPath(parsePath("M0 0 H10 V10 Z M20 20 H30 V30 Z"))).toThrow(GlyphPathError);
  });

  it("puts every arc point on its circle and lands on the endpoint", () => {
    const points = flattenPath(parsePath("M 0 70 A 70 70 0 0 1 140 70 Z"));
    for (const p of points) expect(Math.hypot(p.x - 70, p.y - 70)).toBeCloseTo(70, 6);
    expect(points[points.length - 1]).toEqual({ x: 140, y: 70 });
    // Clockwise on screen from the left goes over the top.
    expect(Math.min(...points.map((p) => p.y))).toBeCloseTo(0, 2);
    expect(signedArea(points)).toBeCloseTo((Math.PI * 70 * 70) / 2, -1);
  });

  it("scales radii that cannot span the chord", () => {
    const points = flattenPath(parsePath("M 0 0 A 1 1 0 0 1 20 0 Z"));
    expect(Math.min(...points.map((p) => p.y))).toBeCloseTo(-10, 4);
  });
});

describe("sampling", () => {
  const square = flattenPath(parsePath("M0 0 H100 V100 H0 Z"));

  it("reads screen-clockwise as positive area and can flip a reversed outline", () => {
    expect(isClockwise(square)).toBe(true);
    const reversed = [square[0], ...square.slice(1).reverse()];
    expect(isClockwise(reversed)).toBe(false);
    const fixed = ensureClockwise(reversed);
    expect(isClockwise(fixed)).toBe(true);
    expect(fixed[0]).toEqual(square[0]);
  });

  it("spaces N samples evenly from the start point", () => {
    const samples = resample(square, 40);
    expect(samples).toHaveLength(40);
    expect(samples[0]).toEqual({ x: 0, y: 0 });
    expect(samples[10]).toEqual({ x: 100, y: 0 });
    expect(samples[25].x).toBeCloseTo(50, 9);
    expect(samples[25].y).toBeCloseTo(100, 9);
    expect(perimeter(samples)).toBeCloseTo(400, 9);
  });

  it("finds the offset that undoes a rotation of the list", () => {
    const samples = resample(buildOutline(arch.body).dense, SAMPLE_COUNT);
    expect(alignOffset(samples, rotate(samples, 37))).toBe(SAMPLE_COUNT - 37);
  });

  it("pairs an outline with a rotated copy of itself point for point", () => {
    const samples = buildOutline(arch.body).samples;
    const pairs = correspond(samples, rotate(samples, 90));
    expect(pairs.from).toHaveLength(SAMPLE_COUNT);
    expect(pairs.to).toHaveLength(SAMPLE_COUNT);
    const worst = Math.max(...pairs.from.map((p, i) => Math.hypot(p.x - pairs.to[i].x, p.y - pairs.to[i].y)));
    expect(worst).toBeLessThan(1e-9);
  });

  it("keeps both sides of a warped pairing on their own outlines", () => {
    const square = buildOutline(roundedSquare.body);
    const target = buildOutline(arch.body);
    const pairs = correspond(square.samples, target.samples);
    // Within a chord of one sample spacing: resampling interpolates between
    // neighbouring samples, which cuts a sharp corner by under a unit.
    const onOutline = (p: { x: number; y: number }, dense: { x: number; y: number }[]) =>
      distanceToOutline(p, dense) < 1;
    expect(pairs.from.every((p) => onOutline(p, square.dense))).toBe(true);
    expect(pairs.to.every((p) => onOutline(p, target.dense))).toBe(true);
  });

  it("smooths without moving a circle's centre", () => {
    const circle = resample(flattenPath(parsePath("M 20 70 A 50 50 0 0 1 120 70 A 50 50 0 0 1 20 70 Z")), 120);
    const box = boundingBox(smoothClosed(circle, 24));
    expect(box.x + box.width / 2).toBeCloseTo(70, 1);
    expect(box.y + box.height / 2).toBeCloseTo(70, 1);
  });

  it("writes a polygon as absolute M/L/Z", () => {
    expect(polygonToPath([{ x: 0, y: 0 }, { x: 1.234, y: 2 }])).toBe("M0 0L1.23 2Z");
  });
});

describe("easing and frames", () => {
  it("evaluates a cubic-bezier like CSS", () => {
    const ease = cubicBezier(0.22, 1, 0.36, 1);
    expect(ease(0)).toBe(0);
    expect(ease(1)).toBe(1);
    let last = 0;
    for (let x = 0.05; x < 1; x += 0.05) {
      const y = ease(x);
      expect(y).toBeGreaterThanOrEqual(last);
      last = y;
    }
    expect(cubicBezier(0.25, 0.25, 0.75, 0.75)(0.3)).toBeCloseTo(0.3, 5);
  });

  it("starts from the source and ends on the authored target", () => {
    const plan = planTransition(restSnapshot(roundedSquare), arch, "morph");
    expect(frameAt(plan, 0).d).toBe(roundedSquare.body);
    const end = frameAt(plan, 1);
    expect(end.d).toBe(arch.body);
    expect(end.settled).toBe(true);
    expect(plan.durationMs).toBe(TRANSITION_MS);
  });

  it("holds the cut's entry pose after the swap, then settles", () => {
    const plan = planTransition(restSnapshot(arch), roundedSquare, "cut");
    const CUT_AT_MS = PACE_TIMING.expressive.cutAtMs;
    const before = frameAt(plan, (CUT_AT_MS - 10) / TRANSITION_MS);
    expect(before.d).toBe(arch.body);
    const after = frameAt(plan, (CUT_AT_MS + 10) / TRANSITION_MS);
    expect(after.d).toBe(roundedSquare.body);
    expect(after.transform).toContain("scale(1.1 1)");
    expect(after.eyes).toEqual(arch.eyes);
    expect(frameAt(plan, 0.99).transform).toBeNull();
    expect(entryTransform(undefined, { x: 0, y: 0, width: 1, height: 1 }, 1)).toBeNull();
  });

  it("can start a new transition from a frame caught mid-morph", () => {
    const plan = planTransition(restSnapshot(roundedSquare), arch, "morph");
    const snapshot = snapshotOf(plan, 0.3);
    expect(snapshot.points).toHaveLength(SAMPLE_COUNT);
    const next = planTransition(snapshot, roundedSquare, "morph");
    expect(frameAt(next, 0).d).toBe(polygonToPath(snapshot.points ?? []));
  });

  it("shares one plan between every glyph making the same change from rest", () => {
    const a = planTransition(restSnapshot(roundedSquare), arch, "morph", "quick");
    expect(planTransition(restSnapshot(roundedSquare), arch, "morph", "quick")).toBe(a);
    expect(planTransition(restSnapshot(roundedSquare), arch, "morph", "expressive")).not.toBe(a);
    expect(planTransition(snapshotOf(a, 0.5), arch, "morph", "quick")).not.toBe(a);
  });

  it("lands long-travel points early, so the target is crisp well before the end", () => {
    for (const pace of GLYPH_PACES) {
      const plan = planTransition(restSnapshot(arch), roundedSquare, "morph", pace);
      const target = buildOutline(roundedSquare.body).dense;
      const mid = flattenPath(parsePath(frameAt(plan, 0.5).d));
      const worst = Math.max(...mid.map((p) => distanceToOutline(p, target)));
      // Half-way through the clock the outline is within half a unit of the
      // drawing (a tenth of a pixel at 40px).
      expect(worst, pace).toBeLessThan(0.5);
    }
  });
});

describe("pace", () => {
  it("keeps quick under the product-UI ceiling and expressive on the large-move token", () => {
    expect(PACE_TIMING.quick.durationMs).toBeLessThanOrEqual(300);
    expect(PACE_TIMING.expressive.durationMs).toBe(TRANSITION_MS);
    for (const pace of GLYPH_PACES) {
      const t = PACE_TIMING[pace];
      expect(t.cutAtMs + t.cutHoldMs + t.cutSettleMs, pace).toBeLessThan(t.durationMs);
      expect(t.blinkEveryMs[0], pace).toBeLessThan(t.blinkEveryMs[1]);
    }
  });

  it("defaults by size: avatars are quick, hero glyphs expressive", () => {
    expect(defaultPace(24)).toBe("quick");
    expect(defaultPace(40)).toBe("quick");
    expect(defaultPace(96)).toBe("expressive");
  });
});

describe("blinks", () => {
  it("flattens each eye about its own centre", () => {
    const [left] = blinkEyes(arch.eyes);
    expect(left.height).toBeCloseTo(arch.eyes[0].height * BLINK_SCALE, 9);
    expect(left.y + left.height / 2).toBeCloseTo(arch.eyes[0].y + arch.eyes[0].height / 2, 9);
    expect(left.radius).toBeLessThanOrEqual(left.height / 2);
  });
});

describe("the contract checks", () => {
  it.each(FIXTURES.map((shape) => [shape.id, shape] as const))("pass on the fixture %s", (_, shape) => {
    expect(glyphIssues(shape)).toEqual([]);
  });

  it("catch a broken body", () => {
    const broken = (body: string): GlyphShape => ({ ...arch, body });
    expect(glyphIssues(broken("M 0 0 C 1 1 2 2 3 3 Z")).join()).toContain("only absolute");
    expect(glyphIssues(broken("M 0 0 V 140 H 140 V 0 Z")).join()).toContain("counter-clockwise");
    expect(glyphIssues(broken("M 0 0 H 150 V 140 H 0 Z")).join()).toContain("leaves the 140 box");
    expect(glyphIssues(broken("M 140 0 V 140 H 0 V 0 Z")).join()).toContain("left end of the topmost edge");
    expect(glyphIssues({ ...arch, eyes: [eye(20, 20), eye(120, 20)] }).join()).toContain("not inside the body");
  });
});

describe("the registry", () => {
  it("lists both sets with unique ids", () => {
    expect(ALL_GLYPHS).toHaveLength(GLYPH_SETS.study.length + GLYPH_SETS.original.length);
    expect(new Set(ALL_GLYPHS.map((shape) => shape.id)).size).toBe(ALL_GLYPHS.length);
    for (const shape of ALL_GLYPHS) expect(getGlyph(shape.id)).toBe(shape);
    expect(findGlyph("no-such-glyph")).toBeUndefined();
    expect(() => getGlyph("no-such-glyph")).toThrow();
  });

  it("files every shape under its own set", () => {
    for (const set of ["study", "original"] as const) {
      for (const shape of GLYPH_SETS[set]) expect(shape.set).toBe(set);
    }
  });
});

// One block per registered shape, so a failure names the drawing.
for (const shape of ALL_GLYPHS) {
  describe(`glyph ${shape.id}`, () => {
    it("keeps the contract: whitelist, one subpath, clockwise, in the box, eyes inside", () => {
      expect(glyphIssues(shape)).toEqual([]);
    });
  });
}

describe("every ordered pair", () => {
  const shapes = [...FIXTURES, ...ALL_GLYPHS];
  const pairs = shapes.length * (shapes.length - 1);

  it(`tweens to ${SAMPLE_COUNT} finite points (${pairs} pairs)`, () => {
    for (const from of shapes) {
      for (const to of shapes) {
        if (from === to) continue;
        const plan = planTransition(restSnapshot(from), to, "morph");
        for (const t of [0.1, 0.5, 0.9]) {
          const frame = frameAt(plan, t);
          // Count vertices by command: rounding can make two neighbours equal.
          const vertices = commandLetters(frame.d).filter((letter) => letter !== "Z");
          const numbers = frame.d.split(/[MLZ ]/).filter(Boolean).map(Number);
          expect(frame.morphing).toBe(true);
          expect(vertices, `${from.id} → ${to.id} at ${t}`).toHaveLength(SAMPLE_COUNT);
          expect(numbers.every(Number.isFinite), `${from.id} → ${to.id} at ${t}`).toBe(true);
        }
      }
    }
  });

  // The eyes trail the body, but never off it. Checked at the eye centres
  // every 20ms, on both paces and both choreographies (a cut's body at its
  // authored pose); the engine keeps the whole eye in.
  it(`keeps both eyes on the body through every transition (${pairs} pairs)`, () => {
    for (const pace of GLYPH_PACES) {
      for (const choreography of ["morph", "cut"] as const) {
        for (const from of ALL_GLYPHS) {
          for (const to of ALL_GLYPHS) {
            if (from === to) continue;
            const plan = planTransition(restSnapshot(from), to, choreography, pace);
            for (let ms = 10; ms < plan.durationMs; ms += 20) {
              const frame = frameAt(plan, ms / plan.durationMs);
              const body = flattenPath(parsePath(frame.d));
              for (const eye of frame.eyes) {
                const centre = { x: eye.x + eye.width / 2, y: eye.y + eye.height / 2 };
                const where = `${pace} ${choreography} ${from.id} → ${to.id} at ${ms}ms`;
                expect(pointInPolygon(centre, body), where).toBe(true);
              }
            }
          }
        }
      }
    }
  });
});
