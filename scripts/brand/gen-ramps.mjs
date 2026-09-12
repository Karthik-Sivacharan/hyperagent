#!/usr/bin/env node
/**
 * gen-ramps.mjs - generate/verify the Brand OKLCH primitive ramps.
 * ------------------------------------------------------------------
 * Every hue rides ONE shared lightness ramp (50→950) anchored to values
 * measured on the brand site (see docs/brand/brand-style-audit.md). Chroma follows a
 * per-family envelope and is clamped into the sRGB gamut, so the printed
 * OKLCH literals are safe to paste into the `:root { }` block of
 * src/design/brand/brand.css. Prints hex round-trips
 * so anchors can be checked against the audit.
 *
 *   node scripts/brand/gen-ramps.mjs   (or: npm run brand:gen-ramps)
 */
import { clampChroma, converter, formatHex, inGamut, wcagContrast } from 'culori';

const toOklch = converter('oklch');
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

// Shared L ramp. Anchors (measured): 50 = sand-2 #f9f9f8 (surface-secondary),
// 100 ≈ dark fg-high #eeeeec / sand-3, 300 = sand-6 #dad9d6 (border),
// 400 = dark sand-11 #b5b3ad (dark fg-mid), 500 = brand tangerine-9 L 0.67,
// 700 = sand-11 #63635e (fg-mid), 800 = dark sand-6 #3b3a37 (dark border),
// 900 = dark sand-4 #2a2a28 (dark elevated), 950 = dark canvas #1e1e1d.
const L = [0.9818, 0.9520, 0.9097, 0.8852, 0.7666, 0.6700, 0.5530, 0.4981, 0.3484, 0.2843, 0.2346];

const FAMILIES = {
  // Sand-tinted near-achromatic gray (Radix sand: hue ~95–107, C 0.001–0.011)
  neutral:   { hue: 100, chroma: [0.0013, 0.0025, 0.0042, 0.0042, 0.0087, 0.0100, 0.0089, 0.0078, 0.0053, 0.0036, 0.0019] },
  // Brand orange, hue 42 (Brand --tangerine-*-oklch). Peak chroma = sRGB gamut max at L 0.67.
  tangerine: { hue: 42,  chroma: [0.012, 0.022, 0.045, 0.075, 0.160, 0.220, 0.200, 0.170, 0.115, 0.085, 0.060] },
  // Status hues share one envelope (peak 0.16 @ 500) - below brand, above the 0.10 a quieter reference system caps at.
  red:   { hue: 25,  chroma: [0.012, 0.024, 0.050, 0.085, 0.125, 0.160, 0.155, 0.135, 0.100, 0.075, 0.050] },
  green: { hue: 158, chroma: [0.012, 0.024, 0.050, 0.085, 0.125, 0.160, 0.155, 0.135, 0.100, 0.075, 0.050] },
  amber: { hue: 70,  chroma: [0.012, 0.024, 0.050, 0.085, 0.125, 0.160, 0.155, 0.135, 0.100, 0.075, 0.050] },
  blue:  { hue: 252, chroma: [0.012, 0.024, 0.050, 0.085, 0.125, 0.160, 0.155, 0.135, 0.100, 0.075, 0.050] },
};

const out = {};
for (const [name, { hue, chroma }] of Object.entries(FAMILIES)) {
  console.log(`\n  /* ${name} */`);
  out[name] = {};
  STEPS.forEach((step, i) => {
    let col = { mode: 'oklch', l: L[i], c: chroma[i], h: hue };
    const wasIn = inGamut('rgb')(col);
    if (!wasIn) col = clampChroma(col, 'oklch');
    const o = toOklch(col);
    const lit = `oklch(${o.l.toFixed(4)} ${o.c.toFixed(4)} ${o.h.toFixed(2)})`;
    out[name][step] = lit;
    console.log(`  --color-${name}-${step}: ${lit};  /* ${formatHex(col)}${wasIn ? '' : ' (chroma clamped from ' + chroma[i] + ')'} */`);
  });
}

// Anchor round-trips
console.log('\nAnchor checks (token → hex vs measured):');
const checks = [
  ['neutral-50', '#f9f9f8'], ['neutral-100', '#eeeeec'], ['neutral-300', '#dad9d6'], ['neutral-400', '#b5b3ad'],
  ['neutral-600', '#82827c (fg-low, lifted for AA)'], ['neutral-700', '#63635e'], ['neutral-800', '#3b3a37'],
  ['neutral-900', '#2a2a28'], ['neutral-950', '#1e1e1d'], ['tangerine-500', '#f55d00 (oklch .67 .22 42 sRGB-clamped)'],
  ['tangerine-400', '#ff824f (dark brand-accent)'], ['tangerine-600', '#d44f00 (tangerine-10)'], ['tangerine-700', '#a63c00 (tangerine-11)'],
];
for (const [tok, want] of checks) {
  const [fam, step] = tok.split('-');
  console.log(`  ${tok.padEnd(14)} ${formatHex(out[fam][step])}   measured ${want}`);
}

// Contrast probes for the semantic mapping decisions
const W = 'oklch(1 0 0)';
const r = (a, b) => wcagContrast(a, b).toFixed(2);
console.log('\nContrast probes:');
for (const fam of ['tangerine', 'red', 'green', 'amber', 'blue']) {
  console.log(`  white on ${fam}: 500 ${r(W, out[fam][500])} · 600 ${r(W, out[fam][600])} · 700 ${r(W, out[fam][700])}   | ${fam} on white: 500 ${r(out[fam][500], W)} · 600 ${r(out[fam][600], W)}  | on dark bg: 400 ${r(out[fam][400], out.neutral[950])} · 500 ${r(out[fam][500], out.neutral[950])} · 600 ${r(out[fam][600], out.neutral[950])}`);
}
console.log(`  neutral-600 on white ${r(out.neutral[600], W)} · neutral-700 on white ${r(out.neutral[700], W)} · neutral-700 on neutral-100 ${r(out.neutral[700], out.neutral[100])}`);
console.log(`  neutral-500 on 950 ${r(out.neutral[500], out.neutral[950])} · neutral-400 on 950 ${r(out.neutral[400], out.neutral[950])} · neutral-400 on 900 ${r(out.neutral[400], out.neutral[900])} · neutral-100 on 950 ${r(out.neutral[100], out.neutral[950])} · neutral-700 on 950 ${r(out.neutral[700], out.neutral[950])}`);
console.log(`  tangerine-700 on tangerine-50 ${r(out.tangerine[700], out.tangerine[50])} · tangerine-300 on tangerine-950 ${r(out.tangerine[300], out.tangerine[950])} · tangerine-400 on 950 ${r(out.tangerine[400], out.neutral[950])}`);
