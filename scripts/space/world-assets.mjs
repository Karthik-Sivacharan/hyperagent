#!/usr/bin/env node
/**
 * world-assets.mjs - build the /teams office art in public/space/ (floors,
 * walls, rugs and furniture; NOT characters/, which make-agent-sprites.mjs
 * owns) from two licence-clean packs. The PNGs it writes are committed; this
 * file documents exactly how they were made.
 *
 *   node scripts/space/world-assets.mjs <pixel-agents-assets> <antea-dir>
 *
 *   <pixel-agents-assets>  webview-ui/public/assets of Pixel Agents v1.4.1
 *                          (MIT, github.com/pixel-agents-hq/pixel-agents,
 *                          commit 3537e140c2094761beae748592aeb92ece8edfdd)
 *   <antea-dir>            the unzipped Office-Furniture-Pixel-Art folder of
 *                          Antea's "Free Office Furniture Set" (CC BY 4.0,
 *                          stcrbcn.itch.io/furniture-office-set)
 *
 * What it does:
 *   - floors/*.png   Grey floor patterns (Pixel Agents' tiles, and boards and
 *                    carpet drawn below), tinted per room type with a port of
 *                    its Photoshop-style colorize.
 *   - walls/*.png    Pixel Agents' 16-piece wall sheet, its three greys mapped
 *                    to warm neutrals plus a skirting board; and shade.png, the
 *                    soft shadow under a wall face.
 *   - rugs/*.png     Pixel Agents' marching-squares carpets, two-tone filled.
 *   - furniture/*    Pieces copied as they are, a few recoloured (Antea's
 *                    burgundy chairs and navy sofas to the desks' slate), and
 *                    two desks re-stitched from Antea's so the screen sits
 *                    over the chair's tile (desk-b, lead-desk).
 *
 * Tints are HSL numbers, never hex: h 0-360, s 0-100, and Pixel Agents'
 * brightness (b) and contrast (c), both -100..100.
 *
 * colorize() and its HSL helpers are ports of Pixel Agents' office/colorize.ts
 * (the licence text is also in public/space/LICENSE-pixel-agents.txt):
 *
 *   MIT License. Copyright (c) 2026 Pablo De Lucca.
 *
 *   Permission is hereby granted, free of charge, to any person obtaining a copy
 *   of this software and associated documentation files (the "Software"), to deal
 *   in the Software without restriction, including without limitation the rights
 *   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *   copies of the Software, and to permit persons to whom the Software is
 *   furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included in all
 *   copies or substantial portions of the Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *   SOFTWARE.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const [paDir, anteaDir] = process.argv.slice(2);
if (!paDir || !anteaDir) {
  console.error("usage: node scripts/space/world-assets.mjs <pixel-agents-assets> <antea-dir>");
  process.exit(1);
}
const OUT = path.resolve("public/space");

// ---------------------------------------------------------------------------
// Pixel buffers

async function read(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { w: info.width, h: info.height, data: Buffer.from(data) };
}

async function write(rel, img) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await sharp(img.data, { raw: { width: img.w, height: img.h, channels: 4 } })
    .png({ compressionLevel: 9, palette: false })
    .toFile(file);
  console.log("wrote", path.relative(process.cwd(), file), `${img.w}x${img.h}`);
}

function blank(w, h) {
  return { w, h, data: Buffer.alloc(w * h * 4) };
}

function map(img, fn) {
  const out = { w: img.w, h: img.h, data: Buffer.from(img.data) };
  for (let i = 0; i < out.data.length; i += 4) {
    if (out.data[i + 3] === 0) continue;
    const [r, g, b] = fn(out.data[i], out.data[i + 1], out.data[i + 2], out.data[i + 3]);
    out.data[i] = r;
    out.data[i + 1] = g;
    out.data[i + 2] = b;
  }
  return out;
}

/** Copy columns [sx, sx + w) of `src` into `dst` at column dx (same rows). */
function blitCols(dst, src, sx, w, dx) {
  for (let y = 0; y < Math.min(dst.h, src.h); y++) {
    for (let x = 0; x < w; x++) {
      const si = (y * src.w + sx + x) * 4;
      const di = (y * dst.w + dx + x) * 4;
      src.data.copy(dst.data, di, si, si + 4);
    }
  }
}

// ---------------------------------------------------------------------------
// Colour (port of Pixel Agents' colorize.ts)

function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const [r1, g1, b1] =
    hp < 1 ? [c, x, 0] : hp < 2 ? [x, c, 0] : hp < 3 ? [0, c, x] : hp < 4 ? [0, x, c] : hp < 5 ? [x, 0, c] : [c, 0, x];
  const m = l - c / 2;
  const to = (v) => Math.max(0, Math.min(255, Math.round((v + m) * 255)));
  return [to(r1), to(g1), to(b1)];
}

function rgbToHsl(r, g, b) {
  const rf = r / 255;
  const gf = g / 255;
  const bf = b / 255;
  const max = Math.max(rf, gf, bf);
  const min = Math.min(rf, gf, bf);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === rf) h = ((gf - bf) / d + (gf < bf ? 6 : 0)) * 60;
  else if (max === gf) h = ((bf - rf) / d + 2) * 60;
  else h = ((rf - gf) / d + 4) * 60;
  return [h, s, l];
}

function shapeLightness(l, { b = 0, c = 0 }) {
  let out = l;
  if (c !== 0) out = 0.5 + (out - 0.5) * ((100 + c) / 100);
  if (b !== 0) out += b / 200;
  return Math.max(0, Math.min(1, out));
}

/** Photoshop-style colorize: perceived luminance becomes the lightness of one hue. */
function colorize(img, tint) {
  return map(img, (r, g, b) => {
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return hslToRgb(tint.h, tint.s / 100, shapeLightness(lum, tint));
  });
}

/** Two-tone fill for Pixel Agents' carpets: the darkest grey becomes `main`, everything lighter `accent`. */
function rug(img, main, accent) {
  let darkest = 255;
  for (let i = 0; i < img.data.length; i += 4) if (img.data[i + 3]) darkest = Math.min(darkest, img.data[i]);
  const m = hslToRgb(main.h, main.s / 100, main.l / 100);
  const a = hslToRgb(accent.h, accent.s / 100, accent.l / 100);
  return map(img, (r) => (r === darkest ? m : a));
}

// ---------------------------------------------------------------------------
// Grey patterns drawn here (Pixel Agents' planks read as brick at 2x, and a
// flat carpet reads as a hole): long boards and a loop-pile carpet tile.
// Luminance only; colorize() gives them their hue.

function grey(w, h, lumAt) {
  const img = blank(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = Math.round(Math.max(0, Math.min(1, lumAt(x, y))) * 255);
      const i = (y * w + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
  }
  return img;
}

/**
 * 64 x 32 (4 x 2 tiles): boards 4 px wide running east-west, a soft seam under
 * each, one butt joint per board, staggered, and each board its own tone.
 */
function boards() {
  const JOINT = [9, 41, 25, 57, 17, 49, 1, 33];
  const TONE = [0.63, 0.67, 0.61, 0.65, 0.68, 0.62, 0.66, 0.64, 0.6, 0.65, 0.67, 0.62, 0.64, 0.61, 0.66, 0.63];
  return grey(64, 32, (x, y) => {
    const row = Math.floor(y / 4);
    if (y % 4 === 3) return 0.55; // the seam between boards
    if (x === JOINT[row]) return 0.56; // butt joint
    const tone = TONE[row * 2 + (x > JOINT[row] ? 1 : 0)];
    const grain = (x * 7 + row * 13) % 17 === 0 ? -0.02 : 0; // a sparse grain fleck
    return tone + (y % 4 === 0 ? 0.012 : 0) + grain;
  });
}

/** 16 x 16: a sparse grid of lighter loops over a flat pile. */
function carpet() {
  return grey(16, 16, (x, y) => ((x % 4 === 0 && y % 4 === 0) || (x % 4 === 2 && y % 4 === 2) ? 0.585 : 0.56));
}

// ---------------------------------------------------------------------------
// Tints. Offices are pale oak boards, Atlas's office a deeper walnut, the hall
// warm stone, the meeting room a greige carpet, the lounge pale tile. All low
// in chroma, so no room reads as a department's colour.

const FLOORS = {
  wood: { gen: boards, h: 34, s: 26, b: 12, c: 0 },
  walnut: { gen: boards, h: 26, s: 24, b: -18, c: 10 },
  // Pixel Agents floor_1: large tiles with light grout.
  hall: { src: "floor_1", h: 40, s: 12, b: 22, c: -40 },
  carpet: { gen: carpet, h: 30, s: 8, b: 4, c: 0 },
  // Pixel Agents floor_4: small tiles with light grout.
  tile: { src: "floor_4", h: 45, s: 10, b: 30, c: -45 },
};

// The wall sheet has three greys: outline, cap and face. Each becomes one warm
// neutral, and the bottom of every face gets a skirting board.
const WALL = {
  outline: { h: 28, s: 10, l: 34 },
  cap: { h: 34, s: 9, l: 77 },
  face: { h: 40, s: 18, l: 89 },
  skirting: { h: 34, s: 10, l: 76 },
};

const RUGS = {
  // Under the meeting table and in the lounge: a soft oat field, a paler border.
  oat: { src: "carpet_1", main: { h: 36, s: 18, l: 70 }, accent: { h: 38, s: 22, l: 82 } },
  // Atlas's office: pale stone on the walnut, a lighter border.
  stone: { src: "carpet_1", main: { h: 36, s: 10, l: 66 }, accent: { h: 38, s: 14, l: 79 } },
  // The entrance mat: coir.
  mat: { src: "carpet_0", main: { h: 32, s: 20, l: 46 }, accent: { h: 34, s: 22, l: 56 } },
};

// ---------------------------------------------------------------------------

const pa = (...p) => path.join(paDir, ...p);
const an = (f) => path.join(anteaDir, f);

async function floors() {
  for (const [name, t] of Object.entries(FLOORS)) {
    const base = t.gen ? t.gen() : await read(pa("floors", `${t.src}.png`));
    await write(`floors/${name}.png`, colorize(base, t));
  }
}

async function walls() {
  const sheet = await read(pa("walls", "wall_0.png"));
  // Sort the sheet's three greys by lightness: outline, cap, face.
  const greys = [...new Set(Array.from({ length: sheet.data.length / 4 }, (_, i) => sheet.data[i * 4]))].sort((a, b) => a - b);
  const [outline, cap, face] = greys;
  const rgb = (c) => hslToRgb(c.h, c.s / 100, c.l / 100);
  const out = map(sheet, (r) => rgb(r === outline ? WALL.outline : r === cap ? WALL.cap : WALL.face));
  // Skirting: the two face rows just above a face's bottom outline.
  for (let y = 0; y < out.h; y++) {
    for (let x = 0; x < out.w; x++) {
      const i = (y * out.w + x) * 4;
      if (sheet.data[i] !== face || !sheet.data[i + 3]) continue;
      const below = (k) => (y + k < out.h ? sheet.data[((y + k) * out.w + x) * 4] : -1);
      if (below(1) === outline || below(2) === outline) {
        const [r, g, b] = rgb(WALL.skirting);
        out.data[i] = r;
        out.data[i + 1] = g;
        out.data[i + 2] = b;
      }
    }
  }
  await write("walls/wall.png", out);

  // The soft shadow a wall face casts on the floor in front of it.
  const shade = blank(16, 16);
  [56, 30, 12].forEach((alpha, y) => {
    for (let x = 0; x < 16; x++) shade.data[(y * 16 + x) * 4 + 3] = alpha;
  });
  await write("walls/shade.png", shade);
}

async function rugs() {
  for (const [name, r] of Object.entries(RUGS)) {
    await write(`rugs/${name}.png`, rug(await read(pa("carpets", `${r.src}.png`)), r.main, r.accent));
  }
}

// Pieces copied as they are. [output name, source]
const COPY_PA = [
  ["large-plant", "LARGE_PLANT/LARGE_PLANT.png"],
  ["plant", "PLANT/PLANT.png"],
  ["plant-2", "PLANT_2/PLANT_2.png"],
  ["whiteboard", "WHITEBOARD/WHITEBOARD.png"],
  ["clock", "CLOCK/CLOCK.png"],
  ["painting-large", "LARGE_PAINTING/LARGE_PAINTING.png"],
  ["painting", "SMALL_PAINTING/SMALL_PAINTING.png"],
  ["painting-2", "SMALL_PAINTING_2/SMALL_PAINTING_2.png"],
  ["coffee-table", "COFFEE_TABLE/COFFEE_TABLE.png"],
  ["side-table", "SMALL_TABLE/SMALL_TABLE_FRONT.png"],
  ["meeting-table", "TABLE_FRONT/TABLE_FRONT.png"],
  ["mug", "COFFEE/COFFEE.png"],
  ["bench", "WOODEN_BENCH/WOODEN_BENCH.png"],
];

const COPY_ANTEA = [
  ["desk-a", "Desk.png"],
  ["big-plant", "Big-Plant.png"],
  ["small-plant", "Small-Plant.png"],
  ["water-dispenser", "Water-Dispenser.png"],
  ["coffee-machine", "Coffee-Machine.png"],
  ["vending-machine", "Vending-Machine.png"],
  ["printer", "Printer-Furniture.png"],
  ["copier", "Big-Office-Printer.png"],
  ["cabinet-tall", "Filing-Cabinet-Tall.png"],
  ["cabinet-small", "Filing-Cabinet-Small.png"],
  ["bookcase", "Tall-Bookshelf.png"],
  ["wall-clock", "Wall-Clock.png"],
  ["wall-graph", "Wall-Graph.png"],
  ["wall-note", "Wall-Note.png"],
  ["wall-note-2", "Wall-Note-2.png"],
  ["board", "Board.png"],
  ["bin", "Bin.png"],
  ["small-table", "Small-Table.png"],
  ["papers", "Papers.png"],
  ["folders", "Folders.png"],
];

// Burgundy and navy (the saturated pixels) move to the desks' slate.
function slate(img, lift = 1.05) {
  return map(img, (r, g, b) => {
    const [, s, l] = rgbToHsl(r, g, b);
    if (s <= 0.25) return [r, g, b];
    return hslToRgb(228, Math.min(0.2, s * 0.35), Math.min(0.62, l * lift));
  });
}

async function furniture() {
  for (const [name, src] of COPY_PA) await write(`furniture/${name}.png`, await read(pa("furniture", src)));
  for (const [name, src] of COPY_ANTEA) await write(`furniture/${name}.png`, await read(an(src)));

  // Chairs: Antea's office chair, front view (also the back view: it is
  // symmetric) and side view (faces left), in slate.
  await write("furniture/chair.png", slate(await read(an("Chair.png"))));
  await write("furniture/chair-side.png", slate(await read(an("Chair-2.png"))));

  // Sofas in the same slate, a step lighter so the cushions read.
  await write("furniture/sofa.png", slate(await read(an("Big-Sofa.png")), 1.35));
  await write("furniture/armchair.png", slate(await read(an("Small-Sofa.png")), 1.35));
  await write("furniture/sofa-side.png", slate(await read(an("Big-Sofa-2.png")), 1.35));

  // desk-b: Antea's Desk-2 with four plain columns let in left of the screen,
  // so the screen (x 13-26 in the source) lands over the right-hand tile.
  const d2 = await read(an("Desk-2.png"));
  const b = blank(32, 32);
  blitCols(b, d2, 0, 13, 0);
  for (let i = 0; i < 4; i++) blitCols(b, d2, 28, 1, 13 + i);
  blitCols(b, d2, 13, 14, 17);
  blitCols(b, d2, 31, 1, 31);
  await write("furniture/desk-b.png", b);

  // lead-desk: 48 wide. Desk-2's frame and plant, plain desk, Desk's screen
  // and keyboard centred on the middle tile, then Desk's mug, papers and end.
  const d1 = await read(an("Desk.png"));
  const lead = blank(48, 32);
  blitCols(lead, d2, 0, 13, 0); // frame, plant (x 0-12)
  for (let i = 0; i < 4; i++) blitCols(lead, d2, 28, 1, 13 + i); // plain (x 13-16)
  blitCols(lead, d1, 3, 14, 17); // screen and keyboard (x 17-30, centre 23.5)
  for (let i = 0; i < 2; i++) blitCols(lead, d2, 28, 1, 31 + i); // plain (x 31-32)
  blitCols(lead, d1, 17, 15, 33); // mug, papers, right end (x 33-47)
  await write("furniture/lead-desk.png", lead);
}

await floors();
await walls();
await rugs();
await furniture();
