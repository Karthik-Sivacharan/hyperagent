#!/usr/bin/env node
/**
 * check-contrast.mjs - Design-token accessibility checker
 * ------------------------------------------------------------------
 * Two checks, run against src/design/brand/brand.css (the scoped Brand
 * token sheet; primitives + light semantics live in `.theme-brand { }`,
 * the dark mapping in `.theme-brand.dark, .dark .theme-brand { }`):
 *
 *   CHECK 1: Scale validation (50–950 primitives)
 *     • monotonic lightness (each step strictly darker than the last)
 *     • perceptual spacing (even OKLCH L deltas between steps)
 *     • distance guarantee (step N vs N+500 ≥ 4.5:1, N vs N+400 ≥ 3:1)
 *     • carrier check (which steps safely hold white vs black text @ AA)
 *
 *   CHECK 2: Semantic pair matrix (.theme-brand AND .theme-brand.dark)
 *     • every foreground/background pairing that renders together
 *     • per-type threshold: text 4.5:1, large/UI 3:1, non-text 3:1
 *
 * Verdict GATE = WCAG 2 AA (the legal baseline). APCA Lc is REPORTED
 * alongside as a perceptual-quality signal but never fails the build.
 *
 * Exit code 0 = all WCAG gates pass, 1 = at least one WCAG failure.
 *
 *   node scripts/brand/check-contrast.mjs          # full report
 *   node scripts/brand/check-contrast.mjs --quiet  # only failures + summary
 *   npm run brand:check-contrast
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { wcagContrast, converter } from 'culori';
import { APCAcontrast, sRGBtoY } from 'apca-w3';

const QUIET = process.argv.includes('--quiet');
const here = dirname(fileURLToPath(import.meta.url));
// Optional first non-flag arg = CSS file to audit (default: brand.css).
const pathArg = process.argv.slice(2).find((a) => !a.startsWith('-'));
const CSS_PATH = pathArg
  ? resolve(process.cwd(), pathArg)
  : resolve(here, '../../src/design/brand/brand.css');
const css = readFileSync(CSS_PATH, 'utf8');

// ── tiny ANSI helpers ────────────────────────────────────────────
const c = {
  g: (s) => `\x1b[32m${s}\x1b[0m`,
  r: (s) => `\x1b[31m${s}\x1b[0m`,
  y: (s) => `\x1b[33m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};
const PASS = c.g('✓');
const FAIL = c.r('✗');
const WARN = c.y('⚠');

// ── CSS parsing ──────────────────────────────────────────────────
// Pull the body of a single `selector { ... }` block (first match). Anchored
// to a line start so mentions inside the header comment cannot match.
function block(selector) {
  const re = new RegExp(`^${selector}\\s*\\{([\\s\\S]*?)\\n\\}`, 'm');
  const m = css.match(re);
  return m ? m[1] : '';
}
// Parse `--name: value;` declarations out of a block body.
function decls(body) {
  const out = {};
  // Strip comments first: a `--name:` mention inside a comment would otherwise
  // swallow the next real declaration.
  const clean = body.replace(/\/\*[\s\S]*?\*\//g, '');
  const re = /--([\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(clean))) out[m[1]] = m[2].trim();
  return out;
}

// In the scoped sheet the primitives (Brand's `@theme inline`) and the light
// semantics (Brand's `:root`) share one `.theme-brand { }` rule, so both
// lookups read the same block; the dark mapping is its own rule.
const lightVars = decls(block('\\.theme-brand'));
const themeVars = lightVars; // primitives + aliases
const rootVars = lightVars; // light semantics
const darkVars = decls(block('\\.theme-brand\\.dark[^{]*'));

// Resolve a token name to a concrete color string, following var() chains.
// Lookup order: dark mode falls back to the light block (semantics, then primitives).
function resolve_color(name, theme, seen = new Set()) {
  if (seen.has(name)) throw new Error(`var cycle at --${name}`);
  seen.add(name);
  const scope =
    theme === 'dark'
      ? darkVars[name] ?? rootVars[name] ?? themeVars[name]
      : rootVars[name] ?? themeVars[name];
  if (scope == null) throw new Error(`--${name} not found (${theme})`);
  const varMatch = scope.match(/^var\(\s*--([\w-]+)\s*\)$/);
  if (varMatch) return resolve_color(varMatch[1], theme, seen);
  return scope; // a concrete color literal (oklch(...), etc.)
}

// ── contrast primitives ──────────────────────────────────────────
const toRgb = converter('rgb');
const toOklch = converter('oklch');

/**
 * Brand builds almost every fill from a translucent mid-sand (`tint-5`…`tint-40`)
 * rather than a solid step, so a tint has no contrast of its own — it only exists
 * once composited over the surface beneath it. Without this, a pair naming a tint
 * measures against its alpha and reports nonsense, which is why the 12px label on
 * `bg-tint-10` (4.37:1 in light) went unnoticed until it was found by hand.
 */
function flatten(color, backdrop) {
  const src = toRgb(color);
  const dst = toRgb(backdrop);
  const a = src.alpha ?? 1;
  if (a === 1) return src;
  return {
    mode: 'rgb',
    r: src.r * a + dst.r * (1 - a),
    g: src.g * a + dst.g * (1 - a),
    b: src.b * a + dst.b * (1 - a),
  };
}

/** `"tint-10 over surface-secondary"` — a translucent fill named with the surface it sits on. */
function resolveLayered(name, theme) {
  const layers = name.split(' over ').map((n) => n.trim());
  const base = resolve_color(layers[layers.length - 1], theme);
  return layers
    .slice(0, -1)
    .reverse()
    .reduce((backdrop, layer) => flatten(resolve_color(layer, theme), backdrop), base);
}

function wcag(fg, bg) {
  return wcagContrast(fg, bg); // culori: ratio 1..21
}
// APCA Lc (signed). Magnitude is what matters; sign = polarity.
// NOTE: sRGBtoY returns NaN on out-of-gamut (negative) channels, which some
// wide-gamut OKLCH values produce (e.g. amber). Clamp to [0,255] integers
// first; the browser gamut-maps these anyway, so the clamp matches render.
function apca(fg, bg) {
  const to255 = (col) => {
    const x = toRgb(col);
    const cl = (v) => Math.max(0, Math.min(255, Math.round(v * 255)));
    return [cl(x.r), cl(x.g), cl(x.b)];
  };
  const lc = APCAcontrast(sRGBtoY(to255(fg)), sRGBtoY(to255(bg)));
  return typeof lc === 'number' ? lc : Number(lc);
}

const fmtWcag = (v) => v.toFixed(2).padStart(5);
const fmtLc = (v) => `${v >= 0 ? '+' : ''}${v.toFixed(0)}`.padStart(4);

let failures = 0;

// ── CHECK 1: scales ─────────────────────────────────────────────
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const SCALES = ['neutral', 'tangerine', 'red', 'green', 'amber', 'blue'];

function checkScale(scale) {
  const lines = [];
  const colors = STEPS.map((s) => themeVars[`color-${scale}-${s}`]);
  const Ls = colors.map((col) => toOklch(col).l);

  // (a) monotonic lightness
  let mono = true;
  for (let i = 1; i < Ls.length; i++) if (Ls[i] >= Ls[i - 1]) mono = false;
  if (!mono) failures++;
  lines.push(`   ${mono ? PASS : FAIL} monotonic lightness 50→950`);

  // (b) perceptual spacing: report L deltas (tighter at the ends is normal)
  const deltas = [];
  for (let i = 1; i < Ls.length; i++) deltas.push(Ls[i - 1] - Ls[i]);
  const min = Math.min(...deltas), max = Math.max(...deltas);
  lines.push(
    `   ${c.dim('spacing ')} ` +
      c.dim(`ΔL ${min.toFixed(3)}–${max.toFixed(3)} (ends tighter, normal)`)
  );

  // (c) contrast-distance - INFORMATIONAL ONLY (not a WCAG gate).
  // Reports the minimum step-distance that reaches AA text (4.5) and AA UI (3).
  const minDist = (target) => {
    for (let gap = 1; gap < STEPS.length; gap++) {
      let ok = true;
      for (let i = 0; i + gap < STEPS.length; i++)
        if (wcag(colors[i], colors[i + gap]) < target) { ok = false; break; }
      if (ok) return gap;
    }
    return null;
  };
  const d45 = minDist(4.5), d3 = minDist(3);
  lines.push(
    `   ${c.dim('distance')} ` +
      c.dim(`AA text (4.5:1) needs ${d45 ?? '>10'} steps · AA UI (3:1) needs ${d3 ?? '>10'} steps`)
  );

  // (d) carrier check: which steps hold white / black text at AA (4.5)
  const white = 'oklch(1 0 0)', black = 'oklch(0 0 0)';
  const onWhite = STEPS.filter((s, i) => wcag(white, colors[i]) >= 4.5);
  const onBlack = STEPS.filter((s, i) => wcag(black, colors[i]) >= 4.5);
  lines.push(`   ${c.dim('carriers')} white-text-safe: ${onWhite.join(',') || 'none'}`);
  lines.push(`   ${c.dim('        ')} black-text-safe: ${onBlack.join(',') || 'none'}`);

  return lines;
}

// ── CHECK 2: semantic pairs ─────────────────────────────────────
// type → WCAG threshold
const THRESH = { text: 4.5, large: 3.0, ui: 3.0 };

// Pairs that render together. [fg, bg, type, severity?]
//   severity 'advisory' = reported but does NOT fail the build.
//   Used for decorative borders/inputs: WCAG 1.4.11 only requires 3:1
//   for *meaningful* boundaries; subtle surface borders are exempt.
const PAIRS = [
  // ── each surface with its own foreground text  (GATE @ 4.5) ──
  ['foreground', 'background', 'text'],
  ['card-foreground', 'card', 'text'],
  ['popover-foreground', 'popover', 'text'],
  ['muted-foreground', 'muted', 'text'],
  ['primary-foreground', 'primary', 'text'],
  ['secondary-foreground', 'secondary', 'text'],
  ['accent-foreground', 'accent', 'text'],
  ['destructive-foreground', 'destructive', 'text'],
  ['success-foreground', 'success', 'text'],
  ['warning-foreground', 'warning', 'text'],
  ['info-foreground', 'info', 'text'],
  ['sidebar-foreground', 'sidebar', 'text'],
  ['sidebar-primary-foreground', 'sidebar-primary', 'text'],
  ['sidebar-accent-foreground', 'sidebar-accent', 'text'],
  ['foreground-inverted', 'primary', 'text'],
  ['foreground', 'overlay', 'text'],
  ['muted-foreground', 'overlay', 'text'],
  // ── Brand surfaces / text tiers / brand / chat  (GATE @ 4.5) ──
  ['brand-foreground', 'brand', 'text'],
  ['brand-subtle-foreground', 'brand-subtle', 'text'],
  ['chip-foreground', 'chip', 'text'],
  ['chat-bubble-user-foreground', 'chat-bubble-user', 'text'],
  ['chat-bubble-assistant-foreground', 'chat-bubble-assistant', 'text'],
  ['foreground', 'surface-secondary', 'text'],
  ['foreground', 'surface-elevated', 'text'],
  ['muted-foreground', 'surface-secondary', 'text'],
  ['foreground-low', 'background', 'text'],
  ['foreground-low', 'card', 'text'],
  ['foreground-low', 'surface-secondary', 'text'],
  // ── muted-foreground also renders on base + card surfaces (common) ──
  ['muted-foreground', 'background', 'text'],
  ['muted-foreground', 'card', 'text'],
  // ── text on tint fills: the workhorse card ground (prompt-card, currently-card,
  //    question chips, the imageless case-study well). A tint is translucent, so each
  //    pair names the surface it sits on and is composited before measuring. ──
  ['foreground', 'tint-10 over background', 'text'],
  ['foreground', 'tint-10 over surface-secondary', 'text'],
  ['muted-foreground', 'tint-10 over background', 'text'],
  ['muted-foreground', 'tint-10 over surface-secondary', 'text'],
  // The pairing to avoid, kept so the number stays on the record: a tint lifts the
  // surface toward the text, so the tertiary tier lands at 4.37/4.16 in light — under
  // AA at any size. Advisory rather than a gate because no component may ship it;
  // reach for `muted-foreground` on a tinted ground (5.51/5.25).
  ['foreground-low', 'tint-10 over background', 'text', 'advisory'],
  ['foreground-low', 'tint-10 over surface-secondary', 'text', 'advisory'],
  ['foreground', 'tint-15 over surface-secondary', 'text'],
  ['muted-foreground', 'tint-15 over surface-secondary', 'text'],
  // ── focus rings - meaningful UI indicators  (GATE @ 3) ──
  ['ring', 'background', 'ui'],
  ['sidebar-ring', 'sidebar', 'ui'],
  // ── colored fills used as graphical objects on the page  (GATE @ 3) ──
  // (status dots, badges, icons, chart series, WCAG 1.4.11)
  ['primary', 'background', 'ui'],
  ['brand-accent', 'background', 'ui'],
  ['brand', 'background', 'ui'],
  ['destructive', 'background', 'ui'],
  ['success', 'background', 'ui'],
  ['warning', 'background', 'ui'],
  ['info', 'background', 'ui'],
  ['chart-1', 'background', 'ui'],
  ['chart-2', 'background', 'ui'],
  ['chart-3', 'background', 'ui'],
  ['chart-4', 'background', 'ui'],
  ['chart-5', 'background', 'ui'],
  // ── Mind score tier icons - Brand's exact hexes, kept verbatim. The icon
  //    always sits beside a text label, so these are ADVISORY: novice (3.1)
  //    and legendary (2.8) would otherwise fail the 3:1 graphic gate in light.
  ['mind-novice', 'background', 'ui', 'advisory'],
  ['mind-skilled', 'background', 'ui', 'advisory'],
  ['mind-expert', 'background', 'ui', 'advisory'],
  ['mind-master', 'background', 'ui', 'advisory'],
  ['mind-sage', 'background', 'ui', 'advisory'],
  ['mind-legendary', 'background', 'ui', 'advisory'],
  ['mind-eternal', 'background', 'ui', 'advisory'],
  // ── decorative boundaries  (ADVISORY, exempt under 1.4.11) ──
  ['border', 'background', 'ui', 'advisory'],
  ['input', 'background', 'ui', 'advisory'],
  ['sidebar-border', 'sidebar', 'ui', 'advisory'],
  ['border-subtle', 'background', 'ui', 'advisory'],
  ['border-loud', 'background', 'ui', 'advisory'],
];

function checkPairs(theme) {
  const rows = [];
  for (const [fgName, bgName, type, severity] of PAIRS) {
    let fg, bg;
    try {
      fg = resolveLayered(fgName, theme);
      bg = resolveLayered(bgName, theme);
    } catch (e) {
      rows.push({ skip: true, label: `${fgName}/${bgName}`, note: e.message });
      continue;
    }
    const ratio = wcag(fg, bg);
    const lc = apca(fg, bg);
    const gate = THRESH[type];
    const pass = ratio >= gate;
    const advisory = severity === 'advisory';
    if (!pass && !advisory) failures++;
    rows.push({ fgName, bgName, type, ratio, lc, gate, pass, advisory });
  }
  return rows;
}

// APCA quality bands (perceptual signal only, never gates).
function apcaBand(lc, type) {
  const a = Math.abs(lc);
  const need = type === 'text' ? 75 : type === 'large' ? 60 : 30;
  return a >= need ? PASS : a >= need - 15 ? WARN : FAIL;
}

// ── render ───────────────────────────────────────────────────────
function printScales() {
  console.log(c.bold('\n━━ CHECK 1 · Scale validation (50–950) ━━'));
  for (const s of SCALES) {
    console.log(`\n ${c.bold(s)}`);
    for (const l of checkScale(s)) console.log(l);
  }
}

function printPairs(theme) {
  console.log(c.bold(`\n━━ CHECK 2 · Semantic pairs · ${theme === 'dark' ? '.theme-brand.dark' : '.theme-brand'} ━━`));
  console.log(
    c.dim('   ' + 'pair'.padEnd(40) + 'type   WCAG   gate  APCA')
  );
  for (const row of checkPairs(theme)) {
    if (row.skip) {
      console.log(`   ${WARN} ${row.label.padEnd(38)} ${c.dim('skipped: ' + row.note)}`);
      continue;
    }
    const { fgName, bgName, type, ratio, lc, gate, pass, advisory } = row;
    const label = `${fgName} on ${bgName}`.padEnd(38);
    // advisory failures show as ⚠ (and never gate); real failures show ✗.
    const mark = pass ? PASS : advisory ? WARN : FAIL;
    const ratioStr = pass ? c.g(fmtWcag(ratio)) : advisory ? c.y(fmtWcag(ratio)) : c.r(fmtWcag(ratio));
    if (QUIET && pass) continue;
    console.log(
      `   ${mark} ${label} ${type.padEnd(5)} ${ratioStr}  ${c.dim('≥' + gate)}  ` +
        `${apcaBand(lc, type)} ${c.dim('Lc ' + fmtLc(lc))}` +
        (advisory ? c.dim('  (advisory)') : '')
    );
  }
}

console.log(c.bold('Brand · Token contrast audit'));
console.log(c.dim(`source: ${CSS_PATH}`));
console.log(c.dim('gate: WCAG 2 AA  ·  APCA Lc reported (not gated)'));

if (!QUIET) printScales();
printPairs('root');
printPairs('dark');

console.log(
  '\n' +
    (failures === 0
      ? c.g(c.bold(`✓ all WCAG AA gates pass`))
      : c.r(c.bold(`✗ ${failures} WCAG AA failure(s)`)))
);
process.exit(failures === 0 ? 0 : 1);
