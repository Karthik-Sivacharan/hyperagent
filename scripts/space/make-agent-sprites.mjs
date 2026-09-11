#!/usr/bin/env node
/**
 * make-agent-sprites.mjs - the characters of the /teams office.
 * ------------------------------------------------------------------
 * Writes public/space/characters/: one sheet per person (member-<id>.png)
 * and one robot sheet per agent (agent-<id>.png), plus a fallback of each
 * kind, all in Pixel Agents' layout: 112 x 96, 7 columns x 3 rows of 16 x 32
 * frames; rows face down, up and right (left is right mirrored); columns
 * 0-2 walk, 3-4 type, 5-6 read. src/components/teams/space/world/sprites.ts
 * names the files and picks the frames.
 *
 * WHERE THE ART COMES FROM. The six character sheets of Pixel Agents v1.4.1
 * (MIT, (c) 2026 Pablo De Lucca, github.com/pixel-agents-hq/pixel-agents at
 * 3537e14), which are based on JIK-A-4's MetroCity pack (CC0). They sit with
 * their licence in scripts/space/sprites-source/. People wear three of them,
 * copied byte for byte. Agents are robots made from them, frame for frame:
 *
 *   1. Roles. Every pixel is typed by its colour (sprites-palette.mjs): hair,
 *      skin, eye, cloth, shoe, prop and the outline variants.
 *   2. Visor. From the brow down to the last eye row, the face becomes one
 *      dark glass screen with a glint, and the pupils light up in the agent's
 *      hue (a pupil is a dark eye pixel touching an eye white, so the glasses
 *      of the reading frames stay dark). Anything above the screen joins the
 *      helmet. The back view has no screen.
 *   3. Helmet. The hair keeps its silhouette, so the bases stay tell-apart,
 *      less its top row, and is repainted as one glossy white shell: a dark
 *      outline, a sphere lit from the top left with a specular pixel, a
 *      shaded rim where it meets the face and body.
 *   4. Antenna. A 2px steel stalk and a lit tip in the agent's hue on the
 *      crown, standing in the row the shell gave up, in every frame and
 *      direction. Atlas, the orchestrator, is the one robot on the spiky base:
 *      its tuft becomes twin antennas at the outer spike tips, and its body
 *      is a step lighter.
 *   5. Metal. Skin becomes a light cool steel ramp; shoes go dark steel.
 *   6. Body. Clothes take the agent's own orb hue from src/lib/mock/teams.ts,
 *      so the robot matches its avatar. The source's light-to-dark structure
 *      is kept around one tone per agent (CAST.shade; yellows sit higher),
 *      with outlines in a deep shade of the same hue.
 *
 * CAST picks the base and tone of every agent so that no two agents in one
 * room, or round the meeting table, share a base; the hues do the rest.
 * Colour maths is OKLCH through culori, clamped into sRGB.
 *
 *   node scripts/space/make-agent-sprites.mjs                    write the sheets
 *   node scripts/space/make-agent-sprites.mjs --contact out.png  and a 6x contact sheet of all 15
 *   node scripts/space/make-agent-sprites.mjs --out dir          write somewhere else (to preview)
 *
 * Needs Node 22.18+ (it imports teams.ts as TypeScript) and sharp (in the
 * dev tree through next). Unchanged inputs give byte-identical sheets.
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";
import { clampChroma, converter } from "culori";
import { ROLES } from "./sprites-palette.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SRC = join(ROOT, "scripts/space/sprites-source");

const FW = 16;
const FH = 32;
const COLS = 7;
const ROWS = 3;
const W = FW * COLS;
const H = FH * ROWS;

/** The source sheet with two spikes on top, which only Atlas wears as a robot. */
const SPIKY_BASE = 4;

/** People: which source sheet each one wears, unchanged. `fallback` is for a member id sprites.ts does not know. */
const PEOPLE = { "m-priya": 5, "m-diego": 4, "m-sam": 0, fallback: 3 };

/**
 * Agents: `base` is the source sheet, `shade` nudges the body's tone. The
 * rooms (plan §2) and their bases: Research 0 2 5, Outbound 5 3 1, Content
 * 2 1 0, Finance 3 0; round the meeting table Atlas 4, Iris 0, Rook 5,
 * Quill 2.
 */
const CAST = {
  "a-atlas": { base: SPIKY_BASE, shade: 0.06 },
  "a-iris": { base: 0, shade: 0 },
  "a-scout": { base: 2, shade: 0.06 },
  "a-gauge": { base: 5, shade: -0.05 },
  "a-rook": { base: 5, shade: 0 },
  "a-finch": { base: 3, shade: -0.03 },
  "a-echo": { base: 1, shade: -0.05 },
  "a-quill": { base: 2, shade: 0 },
  "a-cadence": { base: 1, shade: 0 },
  "a-mosaic": { base: 0, shade: -0.05 },
  "a-ledger": { base: 3, shade: 0 },
  "a-tally": { base: 0, shade: 0.06 },
  // A neutral steel robot for an agent id sprites.ts does not know.
  fallback: { base: 0, shade: 0, hue: null },
};

/** Contact sheet order: people and Atlas, then one row per department. */
const CONTACT_ROWS = [
  ["member-m-priya", "member-m-diego", "member-m-sam", "agent-a-atlas"],
  ["agent-a-iris", "agent-a-scout", "agent-a-gauge"],
  ["agent-a-rook", "agent-a-finch", "agent-a-echo"],
  ["agent-a-quill", "agent-a-cadence", "agent-a-mosaic"],
  ["agent-a-ledger", "agent-a-tally"],
];

// ── Colour ──────────────────────────────────────────────────────────────

const toOklch = converter("oklch");
const toRgb = converter("rgb");
const STEEL_HUE = 250;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** OKLCH to [r, g, b] bytes, chroma pulled into sRGB. */
function rgb(l, c, h) {
  const { r, g, b } = toRgb(clampChroma({ mode: "oklch", l, c, h: h ?? 0 }, "oklch"));
  return [r, g, b].map((v) => Math.round(clamp(v, 0, 1) * 255));
}

const lightnessCache = new Map();
function lightness(hex) {
  if (!lightnessCache.has(hex)) lightnessCache.set(hex, toOklch(`#${hex}`).l);
  return lightnessCache.get(hex);
}

/** Steel: a cool, barely tinted grey. */
const steel = (l) => rgb(l, 0.014, STEEL_HUE);

/** Chroma for a body tone: full in the middle, easing off towards black and white. */
const bodyChroma = (l) => 0.155 * clamp(1 - ((l - 0.62) / 0.42) ** 2, 0.18, 1);

/** Golds and yellows only look like themselves when light, so their bodies sit higher (up to 0.11 at hue 88). */
function yellowLift(h) {
  const d = Math.abs(((((h - 88) % 360) + 540) % 360) - 180);
  return d < 56 ? 0.11 * Math.cos((d * 1.6 * Math.PI) / 180) ** 2 : 0;
}

function paletteFor(hue, shade) {
  const neutral = hue == null;
  return {
    tone: 0.6 + (neutral ? 0 : yellowLift(hue)) + shade,
    body: (l) => rgb(l, neutral ? 0.01 : bodyChroma(l), neutral ? STEEL_HUE : hue),
    clothline: neutral ? steel(0.34) : rgb(0.33, 0.07, hue),
    skinline: steel(0.47),
    shell: { outline: steel(0.42), rim: steel(0.66), shade: steel(0.78), base: steel(0.87), light: steel(0.94), spec: steel(1) },
    glass: rgb(0.27, 0.035, STEEL_HUE),
    glassDeep: rgb(0.21, 0.03, STEEL_HUE),
    glint: rgb(0.9, 0.02, STEEL_HUE),
    led: neutral ? steel(0.95) : rgb(0.88, 0.1, hue),
    stalk: steel(0.5),
    bulb: neutral ? steel(0.95) : rgb(0.82, 0.16, hue),
  };
}

// ── Sheets ──────────────────────────────────────────────────────────────

async function readSheet(base) {
  const file = join(SRC, `char_${base}.png`);
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (info.width !== W || info.height !== H) throw new Error(`${file}: expected ${W}x${H}, got ${info.width}x${info.height}`);
  return data;
}

const pixel = (fx, fy, x, y) => ((fy * FH + y) * W + fx * FW + x) * 4;
const hexAt = (buf, i) => ((buf[i] << 16) | (buf[i + 1] << 8) | buf[i + 2]).toString(16).padStart(6, "0");
const rowOf = (p) => Math.floor(p / FW);
const colOf = (p) => p % FW;

const N4 = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];

/**
 * The resolved role of every pixel of one frame (null where transparent). A
 * multi-role entry takes `prop` inside the paper's bounding box, `eye` above
 * the neck line (the first row of clothes, or the paper's top if higher),
 * and otherwise its last role.
 */
function frameRoles(buf, base, fx, fy) {
  const table = ROLES[base];
  const raw = new Array(FW * FH).fill(null);
  let neck = FH;
  const box = { x0: FW, y0: FH, x1: -1, y1: -1 };
  for (let y = 0; y < FH; y++) {
    for (let x = 0; x < FW; x++) {
      const i = pixel(fx, fy, x, y);
      if (buf[i + 3] === 0) continue;
      const hex = hexAt(buf, i);
      const entry = table[hex];
      if (!entry) throw new Error(`char_${base}.png: colour #${hex} at frame c${fx}r${fy} (${x}, ${y}) has no role in sprites-palette.mjs`);
      raw[y * FW + x] = entry;
      if (entry === "cloth" || entry === "clothline") neck = Math.min(neck, y);
      if (hex === "391624") Object.assign(box, { x0: Math.min(box.x0, x), y0: Math.min(box.y0, y), x1: Math.max(box.x1, x), y1: Math.max(box.y1, y) });
    }
  }
  if (box.x1 >= 0) neck = Math.min(neck, box.y0);
  return raw.map((entry, p) => {
    if (entry == null || !entry.includes("|")) return entry;
    const x = colOf(p);
    const y = rowOf(p);
    const options = entry.split("|");
    for (const option of options.slice(0, -1)) {
      if (option === "prop" && x >= box.x0 && x <= box.x1 && y >= box.y0 && y <= box.y1) return "prop";
      if (option === "eye" && y < neck) return "eye";
    }
    return options.at(-1);
  });
}

/** Mean OKLCH lightness of the source pixels holding `role`, over the whole sheet. */
function meanLightness(buf, base, role) {
  let sum = 0;
  let n = 0;
  for (let fy = 0; fy < ROWS; fy++) {
    for (let fx = 0; fx < COLS; fx++) {
      frameRoles(buf, base, fx, fy).forEach((r, p) => {
        if (r !== role) return;
        sum += lightness(hexAt(buf, pixel(fx, fy, colOf(p), rowOf(p))));
        n++;
      });
    }
  }
  return sum / n;
}

/** Paint one robot frame of `src` (sheet `base`) into `out`. */
function robotFrame(src, out, base, fx, fy, pal, means) {
  const role = frameRoles(src, base, fx, fy);
  const at = (x, y) => (x < 0 || y < 0 || x >= FW || y >= FH ? null : role[y * FW + x]);
  const srcHex = (p) => hexAt(src, pixel(fx, fy, colOf(p), rowOf(p)));
  const paint = new Map(); // pixel index -> [r, g, b]
  const clear = new Set(); // pixel indexes that become transparent

  // 2. Visor: brow to last eye row, across the face's width.
  const eyeRows = [...new Set(role.flatMap((r, p) => (r === "eye" ? [rowOf(p)] : [])))].sort((a, b) => a - b);
  const face = eyeRows.flatMap((y) => [...Array(FW).keys()].filter((x) => at(x, y) === "eye" || at(x, y) === "skin"));
  if (face.length) {
    const [sx0, sx1] = [Math.min(...face), Math.max(...face)];
    const screen = new Set();
    for (let y = eyeRows[0] - 1; y <= eyeRows.at(-1); y++) {
      for (let x = sx0; x <= sx1; x++) if (at(x, y) != null && at(x, y) !== "skinline") screen.add(y * FW + x);
    }
    const eyeL = (x, y) => (at(x, y) === "eye" ? lightness(srcHex(y * FW + x)) : null);
    const pupils = new Set();
    for (const y of eyeRows) {
      for (let x = 0; x < FW; x++) {
        const l = eyeL(x, y);
        if (l != null && l < 0.5 && N4.some(([dx, dy]) => (eyeL(x + dx, y + dy) ?? 0) > 0.8)) pupils.add(y * FW + x);
      }
    }
    const top = Math.min(...[...screen].map(rowOf));
    const bottom = Math.max(...[...screen].map(rowOf));
    role.forEach((r, p) => {
      if ((rowOf(p) < top && r === "skin") || (r === "eye" && !screen.has(p))) role[p] = "hair";
    });
    for (const p of screen) {
      role[p] = "visor";
      paint.set(p, pupils.has(p) ? pal.led : rowOf(p) === bottom ? pal.glassDeep : pal.glass);
    }
    const topRow = [...screen].filter((p) => rowOf(p) === top).sort((a, b) => a - b);
    if (topRow.length > 3 && !pupils.has(topRow[1])) paint.set(topRow[1], pal.glint);
  }

  // 4a. Crown: the shell gives up its top row (the spiky base, its tuft) to the antennas.
  const hair = role.flatMap((r, p) => (r === "hair" ? [p] : []));
  const antennas = [];
  if (hair.length) {
    const rows = new Map();
    for (const p of hair) rows.set(rowOf(p), [...(rows.get(rowOf(p)) ?? []), colOf(p)]);
    const ys = [...rows.keys()].sort((a, b) => a - b);
    const y0 = ys[0];
    const width = (y) => Math.max(...rows.get(y)) - Math.min(...rows.get(y)) + 1;
    const widest = Math.max(...ys.map(width));
    const spiky = base === SPIKY_BASE;
    const dome = spiky ? ys.find((y) => width(y) >= 0.6 * widest) : Math.min(y0 + 1, ys.at(-1));
    for (const p of hair) {
      if (rowOf(p) >= dome) continue;
      role[p] = null;
      clear.add(p);
    }
    const tips = spiky ? rows.get(y0) : rows.get(dome);
    const xs = spiky ? [...new Set([Math.min(...tips), Math.max(...tips)])] : [Math.round((Math.min(...tips) + Math.max(...tips)) / 2)];
    const bulbY = Math.max(0, spiky ? Math.min(y0, dome - 2) : y0 - 2);
    for (const x of xs) antennas.push({ x, bulbY, dome });
  }

  // 3. Helmet: the shell as a sphere lit from the top left, centred on the crown (not on long hair's full length).
  const shell = role.flatMap((r, p) => (r === "hair" ? [p] : []));
  if (shell.length) {
    const kind = new Map();
    for (const p of shell) {
      const next = N4.map(([dx, dy]) => at(colOf(p) + dx, rowOf(p) + dy));
      kind.set(p, next.some((r) => r == null) ? "outline" : next.some((r) => r !== "hair") ? "rim" : "base");
    }
    const xs = shell.map(colOf);
    const ys = shell.map(rowOf);
    const rx = (Math.max(...xs) - Math.min(...xs) + 1) / 2;
    const ry = Math.min(rx, (Math.max(...ys) - Math.min(...ys) + 1) / 2);
    const ox = Math.min(...xs) + rx - 0.5;
    const oy = Math.min(...ys) + ry - 0.5;
    let brightest = null;
    for (const p of shell) {
      if (kind.get(p) !== "base") continue;
      const u = (colOf(p) - ox) / rx;
      const v = (rowOf(p) - oy) / ry;
      const lit = -0.45 * u - 0.55 * v + 0.7 * Math.sqrt(Math.max(0, 1 - u * u - v * v));
      kind.set(p, lit > 0.78 ? "light" : lit > 0.42 ? "base" : lit > 0.1 ? "shade" : "rim");
      if (!brightest || lit > brightest.lit) brightest = { p, lit };
    }
    if (brightest) kind.set(brightest.p, "spec");
    for (const p of shell) paint.set(p, pal.shell[kind.get(p)]);
  }

  // 4b. Antennas: a steel stalk from the dome up to a lit tip.
  for (const { x, bulbY, dome } of antennas) {
    for (let y = bulbY; y < dome; y++) {
      if (at(x, y) != null) continue;
      clear.delete(y * FW + x);
      paint.set(y * FW + x, y === bulbY ? pal.bulb : pal.stalk);
    }
  }

  // 5 and 6. Metal, shoes and body; the prop keeps its colour.
  const metal = (l) => steel(clamp(0.84 + (l - means.skin) * 0.6, 0.64, 0.97));
  const shoe = (l) => steel(clamp(0.28 + l * 0.4, 0.26, 0.66));
  const cloth = (l) => pal.body(clamp(pal.tone + (l - means.cloth) * 0.8, 0.3, 0.95));
  role.forEach((r, p) => {
    if (r == null || paint.has(p)) return;
    const l = lightness(srcHex(p));
    if (r === "skin") paint.set(p, metal(l));
    else if (r === "skinline") paint.set(p, pal.skinline);
    else if (r === "shoe") paint.set(p, shoe(l));
    else if (r === "cloth") paint.set(p, cloth(l));
    else if (r === "clothline") paint.set(p, pal.clothline);
  });

  for (const [p, colour] of paint) out.set([...colour, 255], pixel(fx, fy, colOf(p), rowOf(p)));
  for (const p of clear) out.set([0, 0, 0, 0], pixel(fx, fy, colOf(p), rowOf(p)));
}

async function robotSheet(base, hue, shade) {
  const src = await readSheet(base);
  const out = Buffer.from(src);
  const pal = paletteFor(hue, shade);
  const means = { skin: meanLightness(src, base, "skin"), cloth: meanLightness(src, base, "cloth") };
  for (let fy = 0; fy < ROWS; fy++) for (let fx = 0; fx < COLS; fx++) robotFrame(src, out, base, fx, fy, pal, means);
  return out;
}

// ── Contact sheet ───────────────────────────────────────────────────────

async function contactSheet(dir, file) {
  const scale = 6;
  const gap = 36;
  const label = 40;
  const cellW = W * scale;
  const cellH = H * scale;
  const cols = Math.max(...CONTACT_ROWS.map((r) => r.length));
  const layers = [];
  for (const [ri, row] of CONTACT_ROWS.entries()) {
    for (const [ci, name] of row.entries()) {
      const left = gap + ci * (cellW + gap);
      const top = gap + ri * (cellH + label + gap);
      layers.push({ input: await sharp(join(dir, `${name}.png`)).resize(cellW, cellH, { kernel: "nearest" }).png().toBuffer(), left, top });
      const text = `<svg xmlns="http://www.w3.org/2000/svg" width="${cellW}" height="${label}"><text x="0" y="28" font-family="Helvetica, Arial, sans-serif" font-size="24" fill="rgb(58,58,56)">${name}</text></svg>`;
      layers.push({ input: Buffer.from(text), left, top: top + cellH + 4 });
    }
  }
  const width = gap + cols * (cellW + gap);
  const height = gap + CONTACT_ROWS.length * (cellH + label + gap);
  mkdirSync(dirname(file), { recursive: true });
  await sharp({ create: { width, height, channels: 4, background: { r: 236, g: 233, b: 226, alpha: 1 } } }).composite(layers).png().toFile(file);
  console.log(`contact sheet: ${file}`);
}

// ── Main ────────────────────────────────────────────────────────────────

const flag = (name) => {
  const i = process.argv.indexOf(name);
  return i > 0 ? resolve(process.argv[i + 1]) : null;
};

async function main() {
  const out = flag("--out") ?? join(ROOT, "public/space/characters");
  // Node notes that it reparses teams.ts as an ES module; expected here, so keep the output clean.
  process.removeAllListeners("warning");
  process.on("warning", (w) => w.code !== "MODULE_TYPELESS_PACKAGE_JSON" && console.warn(w));
  const { FLEET_AGENTS } = await import(pathToFileURL(join(ROOT, "src/lib/mock/teams.ts")).href);
  mkdirSync(out, { recursive: true });

  for (const [id, base] of Object.entries(PEOPLE)) copyFileSync(join(SRC, `char_${base}.png`), join(out, `member-${id}.png`));

  const missing = FLEET_AGENTS.filter((a) => !CAST[a.id]).map((a) => a.id);
  if (missing.length) throw new Error(`CAST has no entry for ${missing.join(", ")}; give each a base and a shade`);
  const hueOf = new Map(FLEET_AGENTS.map((a) => [a.id, a.hue]));
  for (const [id, { base, shade, hue }] of Object.entries(CAST)) {
    if (id !== "fallback" && !hueOf.has(id)) throw new Error(`CAST names ${id}, which is not in FLEET_AGENTS`);
    const sheet = await robotSheet(base, hue === undefined ? hueOf.get(id) : hue, shade);
    await sharp(sheet, { raw: { width: W, height: H, channels: 4 } }).png({ compressionLevel: 9 }).toFile(join(out, `agent-${id}.png`));
  }
  console.log(`wrote ${Object.keys(PEOPLE).length} people and ${Object.keys(CAST).length} robots to ${out}`);

  const contact = flag("--contact");
  if (contact) await contactSheet(out, contact);
}

await main();
