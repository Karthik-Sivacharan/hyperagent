#!/usr/bin/env node
/**
 * build-design-md.mjs - keeps docs/brand/hyperagent-DESIGN.md in step with brand.css
 * ------------------------------------------------------------------
 * hyperagent-DESIGN.md is the portable form of the brand: one file another
 * Tailwind v4 + shadcn/ui codebase drops in, so its coding agents can restyle
 * that codebase's components. Its token values are never typed by hand. Two
 * regions of it are generated from src/design/brand/brand.css and rewritten
 * in place:
 *
 *   the front-matter tokens   between `# generated:tokens` and `# /generated:tokens`
 *   the token CSS             between `<!-- generated:css -->` and `<!-- /generated:css -->`
 *
 * Everything else in the file is prose and component recipes, edited by hand.
 *
 * The same bytes are written to public/design.md, so the deployed site serves
 * the file at /design.md: the link a recipient's agent fetches.
 *
 * The CSS is re-shaped for a stock Tailwind v4 app rather than copied. This
 * app keeps every token on an unlayered `:root` and reaches them through the
 * `@theme inline reference` bridge in src/app/globals.css; a recipient has no
 * bridge, so here the scales go in `@theme static` (each one a utility, and
 * every variable emitted even when no class uses it yet), the theme-switched
 * semantics stay on `:root` / `.dark`, and `@theme inline` maps them to
 * utilities, the way shadcn/ui lays out its own globals.css. The values are
 * byte-for-byte the ones in brand.css. App-only tokens (the knowledge-tier
 * badge, the agent-glyph avatar, the profile hero) are left out.
 *
 * Front-matter colours are the sRGB hex of the light values, which is what
 * the DESIGN.md format recommends and what its linter checks contrast on;
 * translucent ones are flattened over the light canvas (see flattenOver).
 *
 *   node scripts/brand/build-design-md.mjs          # rewrite the regions
 *   node scripts/brand/build-design-md.mjs --check  # exit 1 if they are stale
 *   npm run brand:design-md
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { converter, parse, formatHex, formatHex8 } from 'culori';

const here = dirname(fileURLToPath(import.meta.url));
const CSS_PATH = resolve(here, '../../src/design/brand/brand.css');
const MD_PATH = resolve(here, '../../docs/brand/hyperagent-DESIGN.md');
const PUBLIC_PATH = resolve(here, '../../public/design.md');
const CHECK = process.argv.includes('--check');

// ── parsing ──────────────────────────────────────────────────────
// Same anchoring as check-contrast.mjs: the selector must start a line, so a
// mention inside the header comment cannot match.
function block(css, selector) {
  const match = css.match(new RegExp(`^${selector}\\s*\\{([\\s\\S]*?)\\n\\}`, 'm'));
  if (!match) throw new Error(`brand.css has no \`${selector} { }\` block`);
  return match[1];
}

/** Declarations in source order, comments stripped first. */
function decls(body) {
  const out = [];
  const clean = body.replace(/\/\*[\s\S]*?\*\//g, '');
  const re = /(--[\w-]+|color-scheme)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(clean))) out.push({ name: m[1], value: m[2].trim().replace(/\s+/g, ' ') });
  return out;
}

// ── what travels, and where it goes ──────────────────────────────
// App-only tokens stay behind.
const DROP = [/^--(color-)?mind-/, /^--(color-)?glyph-avatar/, /^--shadow-(avatar|hero)$/, /^--radius-(hero|squircle)$/];
const kept = (d) => !DROP.some((re) => re.test(d.name));

// `--color-x: var(--x)` points a utility at a theme-switched semantic.
const isMapping = (d) => /^--color-/.test(d.name) && /^var\(--(?!color-)[\w-]+\)$/.test(d.value);

// Names Tailwind turns into utilities. `--font-weight-heading` is left out on
// purpose: as a theme key it would mint a `font-heading` WEIGHT utility that
// fights the `font-heading` family utility.
const THEME_GROUPS = [
  ['Colour ramps. One lightness ramp (50 → 950) shared by every hue, so any two families swap step for step. The hex is the sRGB value, for reference.', /^--color-/],
  ['Type: Geist and Geist Mono. Headings carry their own tracking and the heading weight through the --text-* companions.', /^--(font|text)-/],
  ['Radius: every step is a ratio of --radius (on :root), so one knob softens or sharpens the whole UI.', /^--radius-/],
  ['Elevation: glass shadows (low-alpha umbras plus inset highlights) and hairlines drawn as box-shadows.', /^--(shadow|blur)-/],
  ['Layout: content widths and the group → stack → section rhythm (gap-group, gap-stack, gap-section).', /^--(container|spacing)-/],
  ['Motion: easing curves and animations. Durations and press scales are plain variables on :root.', /^--(ease|animate)-/],
];
const THEME_KEY = /^--(color-|font-(sans|mono|heading)$|font-weight-(normal|medium|strong|semibold)$|text-|radius-|shadow-|blur-|container-|spacing-|ease-|animate-)/;

const KNOB_GROUPS = [
  ['The knobs', /^(color-scheme|--radius|--font-weight-heading)$/],
  ['Motion values. Not utilities: write duration-(--duration-fast) and motion-safe:active:scale-(--scale-press).', /^--(duration-|scale-|translate-|ease$)/],
  ['Layers: z-(--z-dropdown), z-(--z-modal) …', /^--z-/],
];
const SEMANTIC_GROUPS = [
  ['Canvas, text and the shadcn/ui contract', /^--(background|foreground|card|popover|primary|secondary|muted|accent|destructive|border|input|ring)(-foreground)?$/],
  ['Status: small fills, dots and text, never large areas', /^--(success|warning|info)(-foreground)?$/],
  ['Tints: translucent sand, the workhorse fill. The base is theme-switched, so one class reads right in both themes.', /^--tint-/],
  ['Surfaces, text tiers and edges', /^--(surface-|foreground-|border-|overlay$|scrim$)/],
  ['Brand: tangerine, the one accent', /^--(brand|selection)/],
  ['Chips and chat', /^--(chip|chat-)/],
  ['Glass: the shadow highlights, and the 1px edge that appears in dark', /^--(highlight|edge$)/],
  ['Sidebar', /^--sidebar/],
  ['Charts', /^--chart-/],
];

function groupIndex(name, groups) {
  const i = groups.findIndex(([, re]) => re.test(name));
  if (i === -1) throw new Error(`${name} fits no group: add it to a group or to DROP in build-design-md.mjs`);
  return i;
}

/**
 * Stable sort by group, then emit a comment header each time the group
 * changes. `keyOf` picks the name a row is grouped by (a mapping groups by
 * the semantic it points at, so its order matches the :root block).
 */
function emitGrouped(list, groups, line, keyOf = (d) => d.name) {
  const rows = list.map((d, i) => ({ d, i, g: groupIndex(keyOf(d), groups) })).sort((a, b) => a.g - b.g || a.i - b.i);
  const out = [];
  let last = -1;
  for (const { d, g } of rows) {
    if (g !== last) {
      if (last !== -1) out.push('');
      out.push(`  /* ${groups[g][0]} */`);
      last = g;
    }
    out.push(`  ${line(d)}`);
  }
  return out;
}

// ── colour helpers ───────────────────────────────────────────────
function hexOf(value) {
  const colour = parse(value);
  if (!colour) throw new Error(`culori cannot parse ${value}`);
  return colour.alpha !== undefined && colour.alpha < 1 ? formatHex8(colour) : formatHex(colour);
}

/**
 * A translucent colour composited over an opaque one, the way the browser
 * blends it (per channel in sRGB). The DESIGN.md linter ignores alpha, so a
 * 10% tint would otherwise be contrast-checked as a solid mid-sand.
 */
function flattenOver(value, ground) {
  const toRgb = converter('rgb');
  const fg = toRgb(parse(value));
  const bg = toRgb(parse(ground));
  const a = fg.alpha ?? 1;
  return formatHex({ mode: 'rgb', r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a) });
}

/** Resolve var() chains against a name → value map. */
function resolveVars(value, map, seen = []) {
  return value.replace(/var\((--[\w-]+)\)/g, (_, name) => {
    if (seen.includes(name)) throw new Error(`var() cycle: ${[...seen, name].join(' → ')}`);
    if (!map.has(name)) throw new Error(`unresolved ${name}`);
    return resolveVars(map.get(name), map, [...seen, name]);
  });
}

// ── build ────────────────────────────────────────────────────────
const css = readFileSync(CSS_PATH, 'utf8');
const rootAll = decls(block(css, ':root'));
const darkAll = decls(block(css, '\\.dark'));
const root = rootAll.filter(kept);
const dark = darkAll.filter(kept);

const mappings = root.filter(isMapping);
const theme = root.filter((d) => !isMapping(d) && THEME_KEY.test(d.name));
const knobs = root.filter((d) => !isMapping(d) && !THEME_KEY.test(d.name) && KNOB_GROUPS.some(([, re]) => re.test(d.name)));
const lightSemantics = root.filter((d) => !isMapping(d) && !THEME_KEY.test(d.name) && !knobs.includes(d));
const darkKnobs = dark.filter((d) => d.name === 'color-scheme');
const darkSemantics = dark.filter((d) => d.name !== 'color-scheme');

// The dark block may only re-map names the light block defines.
for (const d of darkSemantics) {
  if (!lightSemantics.some((l) => l.name === d.name)) throw new Error(`.dark sets ${d.name}, which :root does not`);
}

const rampLine = (d) => (/^--color-/.test(d.name) && /^oklch\(/.test(d.value) ? `${d.name}: ${d.value}; /* ${hexOf(d.value)} */` : `${d.name}: ${d.value};`);
const plainLine = (d) => `${d.name}: ${d.value};`;
const semanticOf = (d) => d.value.match(/^var\((--[\w-]+)\)$/)[1];

const cssLines = [
  '@custom-variant dark (&:is(.dark *));',
  '',
  '/* 1. Scales. The same in both themes; each becomes a Tailwind utility',
  '   (bg-tangerine-500, text-2xl, rounded-3xl, shadow-card, ease-out-quart …).',
  '   `static` emits every variable, so var(--color-blue-400) works in inline',
  '   styles even before a class uses it. */',
  '@theme static {',
  ...emitGrouped(theme, THEME_GROUPS, rampLine),
  '}',
  '',
  '/* 2. Knobs and the light theme. */',
  ':root {',
  ...emitGrouped(knobs, KNOB_GROUPS, plainLine),
  '',
  ...emitGrouped(lightSemantics, SEMANTIC_GROUPS, plainLine),
  '}',
  '',
  '/* 3. The dark theme re-maps the semantics only; the scales never change. */',
  '.dark {',
  ...darkKnobs.map((d) => `  ${plainLine(d)}`),
  '',
  ...emitGrouped(darkSemantics, SEMANTIC_GROUPS, plainLine),
  '}',
  '',
  '/* 4. Semantic colours → utilities (bg-background, text-foreground-low,',
  '   bg-tint-10, bg-brand …). `inline` makes each utility read the variable,',
  '   so it follows :root / .dark. */',
  '@theme inline {',
  ...emitGrouped(mappings, SEMANTIC_GROUPS, plainLine, semanticOf),
  '}',
];

const cssText = cssLines.join('\n');

// Every var() the block reads must be defined by the block, or be one of the
// few names the host supplies (next/font's variables, Tailwind's own).
{
  const defined = new Set([...theme, ...knobs, ...lightSemantics, ...mappings].map((d) => d.name));
  const external = /^--(font-geist-(sans|mono)|tw-|spacing$|ring-(from|to)$)/;
  for (const [, name] of cssText.matchAll(/var\((--[\w-]+)/g)) {
    if (!defined.has(name) && !external.test(name)) throw new Error(`generated CSS reads ${name}, which it never defines`);
  }
}

// ── front matter ────────────────────────────────────────────────
const lightMap = new Map(rootAll.map((d) => [d.name, d.value]));
const resolved = (name) => resolveVars(`var(${name})`, lightMap);

const FM_COLORS = [
  'primary', 'primary-foreground', 'secondary', 'secondary-foreground',
  'background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground',
  'muted', 'muted-foreground', 'accent', 'accent-foreground', 'destructive', 'destructive-foreground',
  'border', 'input', 'ring',
  'brand', 'brand-foreground', 'brand-accent', 'brand-subtle', 'brand-subtle-foreground',
  'surface-secondary', 'surface-elevated', 'foreground-low', 'border-subtle', 'tint-10', 'tint-15',
  'chip', 'chip-foreground',
  'success', 'success-foreground', 'warning', 'warning-foreground', 'info', 'info-foreground',
];

const px = (v) => {
  const n = parseFloat(v);
  if (v.endsWith('rem')) return `${n * 16}px`;
  if (v.endsWith('px')) return `${n}px`;
  throw new Error(`not a length: ${v}`);
};
const radiusBase = parseFloat(lightMap.get('--radius'));
const radiusPx = (v) => {
  if (v === 'var(--radius)') return `${radiusBase}px`;
  const m = v.match(/^calc\(var\(--radius\) \* ([\d.]+)\)$/);
  if (m) return `${+(radiusBase * parseFloat(m[1])).toFixed(2)}px`;
  return px(v);
};

// name, --text-* step, family; weight and tracking come from the tokens.
const TYPE_ROLES = [
  ['heading-48', '5xl', 'Geist'], ['heading-40', '4xl', 'Geist'], ['heading-32', '3xl', 'Geist'],
  ['heading-24', '2xl', 'Geist'], ['heading-20', 'xl', 'Geist'],
  ['lede', 'lg', 'Geist'], ['body', 'base', 'Geist'], ['body-sm', 'sm', 'Geist'],
  ['label', 'sm', 'Geist', 500], ['metadata', 'md', 'Geist'], ['caption', 'xs', 'Geist'], ['label-xs', 'xs', 'Geist', 500],
  ['code', 'sm', 'Geist Mono'], ['code-xs', 'xs', 'Geist Mono'],
];

// Translucent tokens (the tints, the hairline, the field outline) are listed
// flattened over the light canvas: what a viewer sees, and what the linter can
// check. The token CSS keeps them translucent.
const canvas = resolved('--background');
const fm = ['colors:'];
for (const key of FM_COLORS) {
  const value = resolved(`--${key}`);
  const alpha = parse(value)?.alpha;
  fm.push(`  ${key}: "${alpha !== undefined && alpha < 1 ? flattenOver(value, canvas) : hexOf(value)}"`);
}

fm.push('typography:');
for (const [name, step, family, weightOverride] of TYPE_ROLES) {
  const weightToken = lightMap.has(`--text-${step}--font-weight`) ? resolved(`--text-${step}--font-weight`) : null;
  const weight = weightOverride ?? (weightToken ? Number(weightToken) : 400);
  const tracking = lightMap.get(`--text-${step}--letter-spacing`);
  fm.push(`  ${name}:`, `    fontFamily: ${family}`, `    fontSize: ${px(lightMap.get(`--text-${step}`))}`, `    fontWeight: ${weight}`, `    lineHeight: ${px(lightMap.get(`--text-${step}--line-height`))}`);
  if (tracking && tracking !== '0') fm.push(`    letterSpacing: ${tracking}`);
  if (name === 'body') fm.push(`    fontFeature: '"rlig" 1, "calt" 0, "ss11" 1'`);
}

fm.push('rounded:');
for (const d of theme.filter((t) => /^--radius-/.test(t.name))) fm.push(`  ${d.name.slice('--radius-'.length)}: ${radiusPx(d.value)}`);

fm.push('spacing:', '  unit: 4px');
for (const d of theme.filter((t) => /^--spacing-/.test(t.name))) fm.push(`  ${d.name.slice('--spacing-'.length)}: ${px(d.value)}`);
for (const d of theme.filter((t) => /^--container-/.test(t.name))) fm.push(`  container-${d.name.slice('--container-'.length)}: ${px(d.value)}`);

// ── write ────────────────────────────────────────────────────────
function replaceRegion(md, start, end, body) {
  const i = md.indexOf(start);
  const j = md.indexOf(end);
  if (i === -1 || j === -1 || j < i) throw new Error(`hyperagent-DESIGN.md is missing the ${start} … ${end} markers`);
  return `${md.slice(0, i + start.length)}\n${body}\n${md.slice(j)}`;
}

const before = readFileSync(MD_PATH, 'utf8');
let after = replaceRegion(before, '# generated:tokens', '# /generated:tokens', fm.join('\n'));
after = replaceRegion(after, '<!-- generated:css -->', '<!-- /generated:css -->', `\`\`\`css\n${cssText}\n\`\`\``);

if (CHECK) {
  if (after !== before) {
    console.error('docs/brand/hyperagent-DESIGN.md is out of date with brand.css. Run `npm run brand:design-md`.');
    process.exit(1);
  }
  if (!existsSync(PUBLIC_PATH) || readFileSync(PUBLIC_PATH, 'utf8') !== after) {
    console.error('public/design.md differs from docs/brand/hyperagent-DESIGN.md. Run `npm run brand:design-md`.');
    process.exit(1);
  }
  console.log('hyperagent-DESIGN.md matches brand.css, and public/design.md matches it.');
} else {
  writeFileSync(MD_PATH, after);
  writeFileSync(PUBLIC_PATH, after);
  console.log(`hyperagent-DESIGN.md: ${theme.length} scale tokens, ${lightSemantics.length} semantic tokens (light + dark), ${mappings.length} colour utilities.`);
}
