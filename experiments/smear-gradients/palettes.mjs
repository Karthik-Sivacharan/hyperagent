#!/usr/bin/env node
/**
 * palettes.mjs - the ramp system for the smear gradients.
 * ------------------------------------------------------------------
 * Every variant is the same OKLCH recipe with a different hue path, so the set
 * reads as one family rather than thirteen unrelated pictures:
 *
 *   L(t)  climbs a shared range, dark at t=0
 *   C(t)  rides one bump envelope - low at both ends, peaking somewhere in
 *         the middle, which is the shape both reference frames measure
 *   H(t)  travels along the short arc, 40-100 deg of drift
 *
 * The hue travel is not decoration: both references move hue along the ramp
 * (blue 258->343, orange 23->65), and a ramp that holds one hue while only
 * lightening reads as a plain tint rather than as this family.
 *
 * `dusk` and `ember` are the two measured originals and carry literal stops
 * sampled off the source frames; everything else is generated.
 *
 *   node experiments/smear-gradients/palettes.mjs          list every ramp
 *   node experiments/smear-gradients/palettes.mjs --emit   literals for studio.html
 */
import { clampChroma, converter, formatHex, inGamut } from 'culori';

const toOklch = converter('oklch');
const smoothstep = (t) => {
  const u = Math.min(1, Math.max(0, t));
  return u * u * (3 - 2 * u);
};

/**
 * Chroma envelope: 0 at both ends of the bump, 1 at `peak`. Sliding `peak`
 * is what separates a sky (chroma peaks early, so the bright end goes pale)
 * from a fire (chroma peaks late, so the bright end stays hot).
 */
function bump(t, peak) {
  const u = t < peak ? t / Math.max(peak, 1e-6) : (1 - t) / Math.max(1 - peak, 1e-6);
  return smoothstep(u);
}

/** Shortest signed arc from a to b, so 350 -> 10 travels +20 and not -340. */
function hueArc(a, b) {
  let d = (b - a) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

/**
 * Resolve a recipe to `n` sRGB stops. Chroma is clamped into gamut per stop,
 * so a hue path that runs outside sRGB loses saturation instead of clipping to
 * a flat wall of primary.
 */
export function buildStops(recipe, n = 11) {
  const { l: [l0, l1], c: { dark, max, light, peak }, h: [h0, h1], lEase = 1 } = recipe;
  const arc = hueArc(h0, h1);
  const stops = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const te = Math.pow(t, lEase);
    const L = l0 + (l1 - l0) * te;
    const ends = dark + (light - dark) * t;
    const C = ends + (max - ends) * bump(t, peak);
    const H = (h0 + arc * t + 360) % 360;
    let col = { mode: 'oklch', l: L, c: C, h: H };
    if (!inGamut('rgb')(col)) col = clampChroma(col, 'oklch');
    stops.push([Number(t.toFixed(2)), formatHex(col)]);
  }
  return stops;
}

/* ------------------------------------------------------------------ *
 * Field parameters shared by the whole family. Variants nudge these a
 * little so the set does not look stamped, but they all stay in the band
 * measured off the references: angle 16-26 deg, blur 15-25% of the long
 * edge, stretch 6-9x.
 * ------------------------------------------------------------------ */
const FIELD = {
  octaves: 5,
  gain: 0.54,
  softclip: 0.66,
  // Linear-light sigma of the grain, i.e. ~0.6 of one 8-bit step. Every
  // variant carries it: without grain the output measures as flat vector art.
  grain: 0.0024,
  grainLen: 22,
  drift: 0.10,
  driftL: 0.010,
  contrast: 1.0,
};

/**
 * Ten generated variants plus the two measured originals. `note` is the
 * colour story; `h` is the hue path from the dark end to the light end.
 */
const RECIPES = {
  moss: {
    note: 'pine → fern → chartreuse', angle: 19, stretch: 7.5, cellPx: 170, seed: 21,
    l: [0.27, 0.90], c: { dark: 0.035, max: 0.155, light: 0.070, peak: 0.62 }, h: [168, 108],
  },
  lagoon: {
    note: 'deep sea → teal → aqua', angle: 22, stretch: 8.0, cellPx: 150, seed: 5,
    l: [0.26, 0.88], c: { dark: 0.040, max: 0.150, light: 0.060, peak: 0.45 }, h: [218, 172],
  },
  iris: {
    note: 'violet ink → indigo → periwinkle', angle: 17, stretch: 7.0, cellPx: 200, seed: 33,
    l: [0.26, 0.92], c: { dark: 0.050, max: 0.170, light: 0.055, peak: 0.42 }, h: [298, 250],
  },
  orchid: {
    note: 'aubergine → orchid → blush', angle: 20, stretch: 7.5, cellPx: 180, seed: 9,
    l: [0.27, 0.93], c: { dark: 0.045, max: 0.165, light: 0.050, peak: 0.48 }, h: [312, 358],
  },
  rosewood: {
    note: 'oxblood → rose → apricot', angle: 24, stretch: 8.5, cellPx: 145, seed: 14,
    l: [0.26, 0.90], c: { dark: 0.035, max: 0.175, light: 0.085, peak: 0.70 }, h: [350, 30],
  },
  bronze: {
    note: 'bitumen → bronze → straw', angle: 23, stretch: 8.0, cellPx: 160, seed: 41,
    l: [0.27, 0.89], c: { dark: 0.030, max: 0.150, light: 0.090, peak: 0.74 }, h: [38, 88],
  },
  cypress: {
    note: 'forest → olive → lime', angle: 18, stretch: 7.0, cellPx: 190, seed: 27,
    l: [0.27, 0.90], c: { dark: 0.038, max: 0.165, light: 0.095, peak: 0.70 }, h: [148, 95],
  },
  glacier: {
    note: 'midnight → steel → ice', angle: 16, stretch: 9.0, cellPx: 210, seed: 2,
    l: [0.26, 0.90], c: { dark: 0.055, max: 0.145, light: 0.035, peak: 0.35 }, h: [248, 198],
  },
  nocturne: {
    note: 'blue-black → violet → mauve', angle: 21, stretch: 7.5, cellPx: 175, seed: 18,
    l: [0.26, 0.91], c: { dark: 0.055, max: 0.160, light: 0.050, peak: 0.45 }, h: [265, 325],
  },
  solstice: {
    note: 'plum-black → red → amber', angle: 26, stretch: 8.5, cellPx: 135, seed: 6,
    l: [0.26, 0.89], c: { dark: 0.040, max: 0.180, light: 0.095, peak: 0.68 }, h: [332, 72],
  },
};

/* The two measured originals: literal stops sampled off the reference frames,
 * not generated, so they stay honest to what was in the source images. */
const MEASURED = {
  dusk: {
    note: 'navy → azure → lilac → blush (measured)',
    angle: 16.5, stretch: 7.0, cellPx: 460, seed: 3,
    octaves: 4, gain: 0.52, blurFrac: 0.22, linearWeight: 0.34, softclip: 0.88,
    stops: [
      [0.00, '#022758'], [0.10, '#084382'], [0.20, '#0f61ab'], [0.30, '#1981cc'],
      [0.40, '#2d99de'], [0.50, '#4fa4e5'], [0.60, '#73aaea'], [0.69, '#97b0ee'],
      [0.80, '#babbf2'], [0.89, '#e1c3ee'], [1.00, '#fddcef'],
    ],
  },
  ember: {
    note: 'umber → vermilion → amber (measured)',
    angle: 25, stretch: 8.0, cellPx: 140, seed: 3,
    octaves: 5, gain: 0.55, blurFrac: 0.20, linearWeight: 0.03, softclip: 0.62,
    contrast: 1.15, drift: 0.12,
    stops: [
      [0.00, '#33201f'], [0.11, '#492924'], [0.20, '#5f312b'], [0.30, '#773228'],
      [0.40, '#8d3b30'], [0.50, '#a43e30'], [0.60, '#bc422e'], [0.69, '#d3472c'],
      [0.79, '#e7542b'], [0.89, '#f7702c'], [1.00, '#fea746'],
    ],
  },
};

/** name -> full preset, ready for render(). */
export const PRESETS = (() => {
  const out = {};
  for (const [name, m] of Object.entries(MEASURED)) {
    out[name] = { ...FIELD, ...m };
  }
  for (const [name, r] of Object.entries(RECIPES)) {
    const { l, c, h, note, lEase, ...field } = r;
    out[name] = {
      ...FIELD,
      ...field,
      note,
      // Held constant across the generated set: the blur and the linear bias
      // are most of what makes two frames look like the same treatment.
      blurFrac: 0.21,
      linearWeight: 0.12,
      stops: buildStops({ l, c, h, lEase }),
    };
  }
  return out;
})();

/* ---------------------------- reporting ---------------------------- */

function describe(name) {
  const p = PRESETS[name];
  const lch = p.stops.map(([, hex]) => toOklch(hex));
  const L = lch.map((c) => c.l);
  const C = lch.map((c) => c.c ?? 0);
  const H = lch.map((c) => c.h ?? 0);
  const peakAt = C.indexOf(Math.max(...C)) / (C.length - 1);
  const span = Math.abs(hueArc(H[0], H[H.length - 1]));
  return {
    name,
    note: p.note,
    angle: p.angle,
    L: `${L[0].toFixed(2)}→${L.at(-1).toFixed(2)}`,
    Cmax: Math.max(...C).toFixed(3),
    peak: `t=${peakAt.toFixed(2)}`,
    hue: `${Math.round(H[0])}→${Math.round(H.at(-1))} (${Math.round(span)}°)`,
    ends: `${p.stops[0][1]} → ${p.stops.at(-1)[1]}`,
  };
}

function main() {
  if (process.argv.includes('--emit')) {
    // Literals for the self-contained studio.html, which cannot import.
    //
    // Two unit conversions. `scale` is cellPx against the 1024 px reference
    // edge, because the shader works in normalised coordinates. `grain` is the
    // shader's own /255 knob: there the value is the mean of GTAPS=13 uniform
    // hashes scaled by (g/255)*2, giving a linear-light sigma of
    // g * 2/255 / sqrt(12 * 13) = g * 6.28e-4, so g = grain / 6.28e-4 lands the
    // shader on the same amplitude this file specifies.
    const GRAIN_TO_SHADER = 1 / 6.283e-4;
    const lines = Object.entries(PRESETS).map(([name, p]) => {
      const head = [
        `angle: ${p.angle}`, `stretch: ${p.stretch}`, `octaves: ${p.octaves}`,
        `gain: ${p.gain}`, `softclip: ${(p.softclip * (p.contrast ?? 1)).toFixed(2)}`,
        `grain: ${(p.grain * GRAIN_TO_SHADER).toFixed(1)}`, `grainLen: ${p.grainLen}`,
        `seed: ${p.seed}`,
      ].join(', ');
      const stops = p.stops.map(([t, hex]) => `[${t.toFixed(2)}, '${hex}']`).join(', ');
      return `    ${cap(name)}: {\n      ${head},\n` +
        `      scale: ${(p.cellPx / 1024).toFixed(3)}, blur: ${p.blurFrac}, linear: ${p.linearWeight},\n` +
        `      note: '${p.note}',\n      stops: [${stops}],\n    },`;
    });
    console.log('  const PRESETS = {\n' + lines.join('\n') + '\n  };');
    return;
  }

  const rows = Object.keys(PRESETS).map(describe);
  const cols = ['name', 'note', 'angle', 'L', 'Cmax', 'peak', 'hue', 'ends'];
  const w = Object.fromEntries(cols.map((c) => [c, Math.max(c.length, ...rows.map((r) => String(r[c]).length))]));
  console.log(cols.map((c) => c.padEnd(w[c])).join('  '));
  console.log(cols.map((c) => '-'.repeat(w[c])).join('  '));
  for (const r of rows) console.log(cols.map((c) => String(r[c]).padEnd(w[c])).join('  '));
  console.log(`\n  ${rows.length} ramps. Every one carries grain at ${FIELD.grain} linear-light sigma.`);
}

const cap = (s) => s[0].toUpperCase() + s.slice(1);

if (import.meta.url === `file://${process.argv[1]}`) main();
