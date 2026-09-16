#!/usr/bin/env node
/**
 * smear-gradient.mjs - generate "smear gradients": the motion-blurred,
 * gradient-mapped noise fields in experiments/smear-gradients/README.md.
 * ---------------------------------------------------------------------
 * The whole family is one formula:
 *
 *     rgb(x, y) = ramp( softclip( blur_theta( fbm_theta(x, y) ) + linear(x, y) ) )
 *
 * A single scalar field drives a single 1-D colour ramp, so every pixel in
 * the image is one point on one curve through OKLab. The direction lives in
 * two places that must agree: the fBm domain is stretched along `angle`, and
 * the blur runs along `angle` too. Stretch alone gives soft blobs; blur alone
 * gives a flat smear; together they give the streaks.
 *
 * The twelve ramps live in palettes.mjs: two sampled off the reference frames
 * and ten generated from one shared OKLCH recipe. The derivation is in
 * README.md.
 *
 *   node experiments/smear-gradients/smear-gradient.mjs              every preset
 *   node experiments/smear-gradients/smear-gradient.mjs iris         just one
 *   node experiments/smear-gradients/smear-gradient.mjs iris 2560 1440 7
 *   node experiments/smear-gradients/smear-gradient.mjs --sheet      contact sheet
 */
import { converter } from 'culori';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRESETS } from './palettes.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const toOklab = converter('oklab');
const toRgb = converter('rgb');

/* ---------------------------- plumbing ---------------------------- */

// mulberry32: small, fast, and seeded, so a given seed always redraws the
// same image. Math.random() would make the presets unreproducible.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Box-Muller, so the field is gaussian rather than uniform. Uniform noise
// clumps at the ends of the ramp and the midtones go thin.
function gaussians(n, rand) {
  const out = new Float64Array(n);
  for (let i = 0; i < n; i += 2) {
    const u = Math.max(rand(), 1e-12);
    const r = Math.sqrt(-2 * Math.log(u));
    const th = 2 * Math.PI * rand();
    out[i] = r * Math.cos(th);
    if (i + 1 < n) out[i + 1] = r * Math.sin(th);
  }
  return out;
}

const smootherstep = (t) => t * t * t * (t * (t * 6 - 15) + 10);

/**
 * One octave of value noise, sampled on a grid that is rotated to `angle`
 * and `stretch` times coarser along the streak axis than across it.
 */
function valueNoise(w, h, theta, stretch, cellPx, rand) {
  const ct = Math.cos(theta);
  const st = Math.sin(theta);
  const cellU = cellPx * stretch; // along streaks
  const cellV = cellPx; // across streaks

  // Bound the rotated domain so the lattice covers every pixel.
  const corners = [[0, 0], [w, 0], [0, h], [w, h]];
  let uMin = Infinity, uMax = -Infinity, vMin = Infinity, vMax = -Infinity;
  for (const [x, y] of corners) {
    const u = x * ct + y * st;
    const v = -x * st + y * ct;
    uMin = Math.min(uMin, u); uMax = Math.max(uMax, u);
    vMin = Math.min(vMin, v); vMax = Math.max(vMax, v);
  }
  const gu = Math.ceil((uMax - uMin) / cellU) + 3;
  const gv = Math.ceil((vMax - vMin) / cellV) + 3;
  const lat = gaussians(gu * gv, rand);

  const out = new Float64Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const fu = (x * ct + y * st - uMin) / cellU + 1;
      const fv = (-x * st + y * ct - vMin) / cellV + 1;
      const iu = Math.floor(fu), iv = Math.floor(fv);
      const tu = smootherstep(fu - iu), tv = smootherstep(fv - iv);
      const i0 = iv * gu + iu;
      const a = lat[i0], b = lat[i0 + 1];
      const c = lat[i0 + gu], d = lat[i0 + gu + 1];
      out[y * w + x] = (a + (b - a) * tu) * (1 - tv) + (c + (d - c) * tu) * tv;
    }
  }
  return out;
}

/** Stacked octaves: each one half the cell size and `gain` the amplitude. */
function fbm(w, h, theta, stretch, cellPx, octaves, gain, rand) {
  const out = new Float64Array(w * h);
  let amp = 1, norm = 0, cell = cellPx;
  for (let o = 0; o < octaves; o++) {
    const layer = valueNoise(w, h, theta, stretch, cell, rand);
    for (let i = 0; i < out.length; i++) out[i] += amp * layer[i];
    norm += amp;
    amp *= gain;
    cell /= 2;
  }
  for (let i = 0; i < out.length; i++) out[i] /= norm;
  return out;
}

/**
 * Directional box blur by shear -> horizontal blur -> unshear, so a running
 * sum can do the work in one pass per row instead of resampling a rotation.
 *
 * The shear has to move COLUMNS vertically, not rows horizontally. A row shear
 * maps the direction (cos t, sin t) to (cos t + s sin t, sin t), whose y stays
 * put — it can never lay a diagonal flat, and its forward and inverse passes
 * cancel inside a row, leaving a plain horizontal blur. Shifting column x by
 * slope * x instead makes the round trip average buf[y + slope * k][x + k],
 * which is the line integral we want.
 *
 * Above 45 deg the shear would stretch without bound, so that case runs
 * transposed. Out-of-range reads reflect rather than clamp: clamping repeats a
 * single edge value down a whole column, and the shear carries columns past
 * the frame by |tan(theta)| * W / 2 — far more than the padding — so those
 * repeats show up as hard steps.
 */
function directionalBlur(src, w, h, theta, lengthPx) {
  const steep = Math.abs(Math.tan(theta)) > 1;
  let buf = src, W = w, H = h, th = theta;
  if (steep) {
    buf = transpose(src, w, h); W = h; H = w; th = Math.PI / 2 - theta;
  }
  const slope = Math.tan(th);
  const run = Math.max(1, Math.round(lengthPx * Math.abs(Math.cos(th))));

  // Shift column x by `dir * slope * (x - W/2)` rows, sampled bilinearly.
  // Centring on the middle column halves the furthest excursion.
  const shear = (input, dir) => {
    const out = new Float64Array(W * H);
    for (let x = 0; x < W; x++) {
      const shift = dir * slope * (x - W / 2);
      for (let y = 0; y < H; y++) {
        const sy = y + shift;
        const j = Math.floor(sy);
        const f = sy - j;
        const a = input[reflect(j, H) * W + x];
        const b = input[reflect(j + 1, H) * W + x];
        out[y * W + x] = a + (b - a) * f;
      }
    }
    return out;
  };

  const sheared = shear(buf, 1);

  // running-sum box blur along x
  const blurred = new Float64Array(W * H);
  const half = run >> 1;
  const n = 2 * half + 1;
  for (let y = 0; y < H; y++) {
    const row = y * W;
    let sum = 0;
    for (let k = -half; k <= half; k++) sum += sheared[row + reflect(k, W)];
    for (let x = 0; x < W; x++) {
      blurred[row + x] = sum / n;
      sum += sheared[row + reflect(x + half + 1, W)];
      sum -= sheared[row + reflect(x - half, W)];
    }
  }

  const out = shear(blurred, -1);
  return steep ? transpose(out, W, H) : out;
}

function transpose(src, w, h) {
  const out = new Float64Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) out[x * h + y] = src[y * w + x];
  return out;
}

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

/** Mirror an index back into [0, n) — the triangle wave of period 2n. */
function reflect(i, n) {
  if (n === 1) return 0;
  const p = 2 * n - 2;
  let k = ((i % p) + p) % p;
  return k < n ? k : p - k;
}

/** The ramp, resolved to a lookup table in OKLab and converted back to sRGB. */
function buildRamp(stops, n = 2048) {
  const labs = stops.map(([t, hex]) => {
    const { l, a, b } = toOklab(hex);
    return { t, l, a, b };
  });
  const table = new Float64Array(n * 3);
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    let k = 0;
    while (k < labs.length - 2 && labs[k + 1].t < t) k++;
    const p = labs[k], q = labs[k + 1];
    const f = q.t === p.t ? 0 : (t - p.t) / (q.t - p.t);
    const c = toRgb({
      mode: 'oklab',
      l: p.l + (q.l - p.l) * f,
      a: p.a + (q.a - p.a) * f,
      b: p.b + (q.b - p.b) * f,
    });
    table[i * 3] = clamp(c.r, 0, 1);
    table[i * 3 + 1] = clamp(c.g, 0, 1);
    table[i * 3 + 2] = clamp(c.b, 0, 1);
  }
  return table;
}

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toSrgb = (c) => {
  const v = clamp(c, 0, 1);
  return v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055;
};

function normalise(field) {
  let mean = 0;
  for (const v of field) mean += v;
  mean /= field.length;
  let sd = 0;
  for (const v of field) sd += (v - mean) ** 2;
  sd = Math.sqrt(sd / field.length) || 1;
  for (let i = 0; i < field.length; i++) field[i] = (field[i] - mean) / sd;
  return field;
}

/* ---------------------------- the image ---------------------------- */

export function render(w, h, preset, seed = 1) {
  const p = { contrast: 1, ...preset };
  const rand = rng(seed);
  const theta = (p.angle * Math.PI) / 180;

  // The blur reaches outside the frame, so build on a padded canvas and crop.
  const pad = Math.ceil(Math.max(w, h) * p.blurFrac);
  const W = w + 2 * pad;
  const H = h + 2 * pad;

  let field = fbm(W, H, theta, p.stretch, p.cellPx, p.octaves, p.gain, rand);
  field = directionalBlur(field, W, H, theta, Math.max(w, h) * p.blurFrac);
  normalise(field);

  // A linear ramp across the streak axis, mixed in. `dusk` leans on it
  // (0.34) for its top-left-to-bottom-right fall; `ember` barely uses it.
  const st = Math.sin(theta), ct = Math.cos(theta);
  const t = new Float64Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = (-x * st + y * ct) / Math.max(w, h);
      t[y * w + x] = field[(y + pad) * W + (x + pad)];
      t[y * w + x] = t[y * w + x] * (1 - p.linearWeight) + v * p.linearWeight * 5.4;
    }
  }
  normalise(t);

  // tanh instead of a clamp: the ends compress smoothly, so the darkest and
  // lightest stops stay reachable without a flat clipped plateau.
  for (let i = 0; i < t.length; i++) {
    t[i] = 0.5 + 0.5 * Math.tanh(t[i] * p.softclip * p.contrast);
  }

  const ramp = buildRamp(p.stops);
  const nRamp = ramp.length / 3;
  const rgb = new Float64Array(w * h * 3);
  for (let i = 0; i < t.length; i++) {
    const f = clamp(t[i], 0, 1) * (nRamp - 1);
    const i0 = Math.floor(f);
    const i1 = Math.min(i0 + 1, nRamp - 1);
    const fr = f - i0;
    for (let c = 0; c < 3; c++) {
      rgb[i * 3 + c] = ramp[i0 * 3 + c] * (1 - fr) + ramp[i1 * 3 + c] * fr;
    }
  }

  // A slow, independent wander so the image is not *exactly* a 1-D ramp.
  // Straight off the ramp it measures PC1 ~98%; the reference frames sit near
  // 89%, and the gap reads as colour that drifts a little off the curve.
  // This scales chroma rather than offsetting OKLab a/b: an offset sends the
  // near-black end of a warm ramp purple on its negative half, whereas a
  // scale can only ever make a colour more or less saturated than the stop.
  if (p.drift > 0) {
    const d = normalise(fbm(w, h, theta, p.stretch * 0.6, p.cellPx * 1.4, 2, 0.5, rand));
    for (let i = 0; i < d.length; i++) {
      const k = 1 + d[i] * p.drift;
      const lab = toOklab({ mode: 'rgb', r: rgb[i * 3], g: rgb[i * 3 + 1], b: rgb[i * 3 + 2] });
      const c = toRgb({ mode: 'oklab', l: lab.l + d[i] * p.driftL, a: lab.a * k, b: lab.b * k });
      rgb[i * 3] = clamp(c.r, 0, 1);
      rgb[i * 3 + 1] = clamp(c.g, 0, 1);
      rgb[i * 3 + 2] = clamp(c.b, 0, 1);
    }
  }

  // Grain, smeared along the same axis and added in linear light. This is the
  // detail that separates the look from a vector gradient: the reference
  // frames carry ~1/255 of noise that is 8-14x longer along the streaks
  // than across them.
  const gPad = p.grainLen;
  const gW = w + 2 * gPad, gH = h + 2 * gPad;
  const noise = gaussians(gW * gH, rand);
  const grain = normalise(directionalBlur(noise, gW, gH, theta, p.grainLen));

  const out = Buffer.alloc(w * h * 3);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const g = grain[(y + gPad) * gW + (x + gPad)] * p.grain;
      for (let c = 0; c < 3; c++) {
        const lit = toLinear(rgb[i * 3 + c]) + g;
        // triangular dither, or 8-bit quantisation bands the shallow ramps
        const dither = (rand() - rand()) * (0.45 / 255);
        out[i * 3 + c] = Math.round(clamp(toSrgb(lit) + dither, 0, 1) * 255);
      }
    }
  }
  return out;
}

/** A 4-wide grid of every preset, for judging the set as a set. */
async function contactSheet(dir, tileW = 420, tileH = 315, gap = 10) {
  const names = Object.keys(PRESETS);
  const cols = 4;
  const rows = Math.ceil(names.length / cols);
  const W = cols * tileW + (cols + 1) * gap;
  const H = rows * tileH + (rows + 1) * gap;

  const tiles = await Promise.all(names.map(async (key, i) => {
    const p = PRESETS[key];
    const raw = render(tileW, tileH, p, p.seed ?? 3);
    return {
      input: await sharp(raw, { raw: { width: tileW, height: tileH, channels: 3 } }).png().toBuffer(),
      left: gap + (i % cols) * (tileW + gap),
      top: gap + Math.floor(i / cols) * (tileH + gap),
    };
  }));

  const file = join(dir, 'contact-sheet.png');
  await sharp({ create: { width: W, height: H, channels: 3, background: '#0d0c0b' } })
    .composite(tiles)
    .png({ compressionLevel: 9 })
    .toFile(file);
  console.log(`\n  contact sheet: ${file}  (${names.length} presets, ${W}x${H})`);
}

/**
 * Committed previews, so the set is visible from a plain checkout without
 * anyone having to run node first. output/ is git-ignored because the PNGs run
 * to 16MB; these are WebP q92, which holds ~95% of the grain amplitude at 35KB
 * an image. Anything lossier eats the grain, which is most of the point.
 */
async function previews() {
  const dir = join(HERE, 'preview');
  await mkdir(dir, { recursive: true });
  let total = 0;

  for (const [key, p] of Object.entries(PRESETS)) {
    const raw = render(1024, 768, p, p.seed ?? 3);
    const buf = await sharp(raw, { raw: { width: 1024, height: 768, channels: 3 } })
      .webp({ quality: 92 })
      .toBuffer();
    await sharp(buf).toFile(join(dir, `${key}.webp`));
    total += buf.length;
  }

  const png = join(HERE, 'output', 'contact-sheet.png');
  await sharp(png).webp({ quality: 92 }).toFile(join(dir, 'contact-sheet.webp'));
  const { size } = await sharp(join(dir, 'contact-sheet.webp')).metadata()
    .then(() => import('node:fs/promises').then((fs) => fs.stat(join(dir, 'contact-sheet.webp'))));

  console.log(`\n  previews: ${dir}`);
  console.log(`  ${Object.keys(PRESETS).length} frames ${(total / 1048576).toFixed(2)}MB` +
    ` + contact sheet ${(size / 1024).toFixed(0)}KB`);
}

async function main() {
  const args = process.argv.slice(2);
  const sheet = args.includes('--sheet');
  const preview = args.includes('--preview');
  const [name, wArg, hArg, seedArg] = args.filter((a) => !a.startsWith('--'));
  const dir = join(HERE, 'output');
  await mkdir(dir, { recursive: true });

  if (preview && !name) {
    await contactSheet(dir);
    await previews();
    return;
  }

  if (sheet && !name) {
    await contactSheet(dir);
    return;
  }

  const targets = name ? [name] : Object.keys(PRESETS);
  const w = Number(wArg) || 1024;
  const h = Number(hArg) || 768;

  for (const key of targets) {
    const preset = PRESETS[key];
    if (!preset) {
      console.error(`unknown preset "${key}" - have: ${Object.keys(PRESETS).join(', ')}`);
      process.exitCode = 1;
      return;
    }
    // Each preset carries the seed its composition was chosen on; an explicit
    // fourth argument overrides it.
    const seed = Number(seedArg) || preset.seed || 3;
    const started = Date.now();
    const raw = render(w, h, preset, seed);
    const file = join(dir, `${key}-${w}x${h}-s${seed}.png`);
    await sharp(raw, { raw: { width: w, height: h, channels: 3 } })
      .png({ compressionLevel: 9 })
      .toFile(file);
    const ends = `${preset.stops[0][1]} -> ${preset.stops.at(-1)[1]}`;
    console.log(
      `  ${key.padEnd(9)} ${String(preset.angle).padStart(4)}deg  ${ends}  ` +
      `seed ${String(seed).padEnd(4)} ${Date.now() - started}ms  ${preset.note ?? ''}`
    );
  }
  if (sheet) await contactSheet(dir);
}

if (import.meta.url === `file://${process.argv[1]}`) await main();

export { PRESETS };
