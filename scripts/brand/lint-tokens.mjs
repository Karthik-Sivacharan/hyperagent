#!/usr/bin/env node
/**
 * lint-tokens.mjs - keep components on the brand tokens
 * ------------------------------------------------------------------
 * Scans src/components and src/app (.tsx) for class strings and styles
 * that bypass the token system (docs/brand/design.md §12, the token-lint
 * idea from src/design/brand/README.md):
 *
 *   • raw colours: hex literals, rgb()/rgba()/hsl()/oklch() literals
 *   • stock Tailwind palette families the brand does not ship
 *     (slate, gray, zinc, stone, orange, yellow, lime, emerald, teal, cyan,
 *     sky, indigo, violet, purple, fuchsia, pink, rose); the brand's own
 *     ramps (neutral, tangerine, red, green, amber, blue) and white/black
 *     alpha are allowed
 *   • arbitrary pixel radii (rounded-[8px]) instead of the radius scale
 *   • transition-all (list the properties instead)
 *
 * Comments are stripped before matching. Files that carry third-party or
 * brand-mark artwork are allow-listed below: logos keep their colours.
 *
 *   node scripts/brand/lint-tokens.mjs            # exit 1 on any finding
 *   node scripts/brand/lint-tokens.mjs --summary  # counts per file only
 *   npm run brand:lint-tokens
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const SUMMARY = process.argv.includes('--summary');
const ROOTS = ['src/components', 'src/app'].map((p) => resolve(root, p));

// Artwork and reference material: colours are part of the asset, not the skin.
const ALLOW = [
  'src/components/app/brand-icons.tsx',
  'src/components/app/agent-orb.tsx',
  'src/components/app/token-usage-chart.tsx',
  'src/components/settings/integration-logos.tsx',
  'src/components/settings/settings-icons.tsx',
  'src/components/thread/openclaw-icon.tsx',
  'src/components/marketplace/agent-icon.tsx',
  'src/app/design/brand/', // the swatch page prints hex labels on purpose
];

const RULES = [
  { name: 'hex colour', re: /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g },
  // Relative colour syntax that derives from a token (`oklch(from var(--x) …)`) is fine.
  { name: 'colour function literal', re: /\b(?:rgba?|hsla?)\(|\b(?:oklch|oklab|lab)\((?!\s*from\s+var\()/g },
  {
    name: 'stock palette colour',
    re: /\b(?:bg|text|border|ring|fill|stroke|from|to|via|shadow|outline|decoration|accent|caret|divide|placeholder|inset-ring)-(?:slate|gray|zinc|stone|orange|yellow|lime|emerald|teal|cyan|sky|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g,
  },
  { name: 'arbitrary px radius', re: /\brounded(?:-[a-z]{1,2})?-\[\d+(?:\.\d+)?px\]/g },
  { name: 'transition-all', re: /\btransition-all\b/g },
];

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) yield* walk(full);
    else if (/\.tsx?$/.test(entry)) yield full;
  }
}

function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:"'`])\/\/[^\n]*/g, (m, lead) => lead + ' '.repeat(m.length - lead.length));
}

let findings = 0;
const perFile = new Map();
for (const dir of ROOTS) {
  for (const file of walk(dir)) {
    const rel = relative(root, file);
    if (ALLOW.some((a) => rel.startsWith(a))) continue;
    const text = stripComments(readFileSync(file, 'utf8'));
    const lines = text.split('\n');
    lines.forEach((line, i) => {
      for (const rule of RULES) {
        rule.re.lastIndex = 0;
        let m;
        while ((m = rule.re.exec(line))) {
          findings++;
          perFile.set(rel, (perFile.get(rel) ?? 0) + 1);
          if (!SUMMARY) console.log(`${rel}:${i + 1}: ${rule.name}: ${m[0]}`);
        }
      }
    });
  }
}

if (SUMMARY) {
  for (const [file, n] of [...perFile.entries()].sort((a, b) => b[1] - a[1])) console.log(`${String(n).padStart(4)}  ${file}`);
}
if (findings) {
  console.error(`\n✗ ${findings} token-lint finding${findings === 1 ? '' : 's'} in ${perFile.size} file${perFile.size === 1 ? '' : 's'}`);
  process.exit(1);
}
console.log('✓ token lint: no raw colours, stock palette classes, px radii or transition-all in components');
