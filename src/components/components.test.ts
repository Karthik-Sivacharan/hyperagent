import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Decided 2026-09-07 (docs/components.md): every piece of UI is built from
// the primitives in src/components/ui and the composites in
// src/components/patterns. These tests read the source tree and the
// reference dumps as text and lock the rules: radix-ui and cmdk are imported
// only by primitives; no shell, page or route file renders a raw control
// (the rendered element of an `asChild` primitive is the one allowed shape);
// the prototype copies stay retired; every data-slot the live site emits has
// a local definition; every primitive names its slot.

const repo = fileURLToPath(new URL("../../", import.meta.url));
const SKIP = new Set(["node_modules", ".next"]);

/** Every file under `dir` whose name passes `keep`, recursively, skipping dependency and build output. */
function walk(dir: string, keep: (name: string) => boolean): string[] {
  const out: string[] = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(path, keep));
    else if (keep(entry.name)) out.push(path);
  }
  return out.sort();
}

type Source = { path: string; text: string };

function read(paths: string[]): Source[] {
  return paths.map((path) => ({ path: path.slice(repo.length), text: readFileSync(path, "utf8") }));
}

const isSource = (name: string) => /\.tsx?$/.test(name);
const isHtml = (name: string) => /\.html$/.test(name);

const sources = read(walk(join(repo, "src"), isSource));
const primitives = read(walk(join(repo, "src/components/ui"), isSource));
const patterns = read(walk(join(repo, "src/components/patterns"), isSource));
const dumps = read([
  ...walk(join(repo, "docs/reference/pages"), isHtml),
  ...walk(join(repo, "docs/reference/overlays"), isHtml),
]);

const inUi = (path: string) => path.startsWith("src/components/ui/");

/** A module specifier in `import … from`, `import()` or `require()` that is `module` or a path inside it. */
function specifier(module: string): RegExp {
  return new RegExp(`(?:\\bfrom\\s*|\\bimport\\s*\\(?\\s*|\\brequire\\(\\s*)["']${module}(?:["']|/)`);
}

/** Blank out block comments and full-line `//` comments, keeping every line number. */
function stripComments(text: string): string {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/^[ \t]*\/\/[^\n]*/gm, (m) => " ".repeat(m.length));
}

function lineOf(text: string, index: number): number {
  return text.slice(0, index).split("\n").length;
}

/**
 * True when the tag at `index` is the rendered element of an `asChild`
 * primitive: the nearest preceding opening tag is a component (capitalised)
 * whose props carry `asChild`, and only whitespace sits between its `>` and
 * this tag (so the raw element is that primitive's direct child).
 */
function isAsChildElement(text: string, index: number): boolean {
  const before = text.slice(0, index);
  let start = -1;
  for (const m of before.matchAll(/<[A-Za-z][\w.]*/g)) start = m.index;
  if (start === -1) return false;
  const opener = before.slice(start);
  const close = opener.lastIndexOf(">");
  if (close === -1 || opener.includes("</")) return false;
  const tag = opener.slice(0, close);
  if (!/^<[A-Z]/.test(tag) || tag.trimEnd().endsWith("/")) return false;
  return /\basChild\b/.test(tag) && opener.slice(close + 1).trim() === "";
}

describe("the component tree", () => {
  it("finds the sources, the primitives, the patterns and the dumps", () => {
    expect(sources.length).toBeGreaterThan(0);
    expect(primitives.length).toBeGreaterThan(20);
    expect(patterns.length).toBeGreaterThan(0);
    expect(dumps.length).toBeGreaterThan(20);
  });

  it("imports radix-ui and cmdk only under src/components/ui/", () => {
    const radix = specifier("radix-ui");
    const cmdk = specifier("cmdk");
    const offenders = sources
      .filter(({ path, text }) => !inUi(path) && (radix.test(text) || cmdk.test(text)))
      .map(({ path }) => path);
    expect(offenders).toEqual([]);
  });

  // React Flow reaches the app through src/components/ui/flow.tsx alone (its
  // parts, its CSS layer and the types and hooks it re-exports).
  it("imports @xyflow/react only under src/components/ui/", () => {
    const xyflow = specifier("@xyflow/react");
    const offenders = sources.filter(({ path, text }) => !inUi(path) && xyflow.test(text)).map(({ path }) => path);
    expect(offenders).toEqual([]);
  });

  // The beam reaches the app through src/components/ui/border-beam.tsx alone,
  // which is where it learns the app theme and waits for the client.
  it("imports border-beam only under src/components/ui/", () => {
    const beam = specifier("border-beam");
    const offenders = sources.filter(({ path, text }) => !inUi(path) && beam.test(text)).map(({ path }) => path);
    expect(offenders).toEqual([]);
  });

  it("renders no raw button, input, textarea, select or label outside src/components/ui/", () => {
    // The swatch page keeps three raw buttons on purpose: they are the
    // press / hover / focus motion specimens of the brand's motion section
    // and demonstrate the tokens on a bare element, not a control the app
    // ships (src/app/design/brand/page.tsx, "Motion").
    const ALLOW = new Set(["src/app/design/brand/page.tsx"]);
    const scope = sources.filter(
      ({ path }) =>
        (path.startsWith("src/components/") || path.startsWith("src/app/")) && !inUi(path) && !ALLOW.has(path),
    );
    const offenders: string[] = [];
    for (const { path, text } of scope) {
      const clean = stripComments(text);
      for (const m of clean.matchAll(/<(button|input|textarea|select|label)\b/g)) {
        if (isAsChildElement(clean, m.index)) continue;
        offenders.push(`${path}:${lineOf(clean, m.index)} <${m[1]}>`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("keeps the prototype copies retired: no src/design/brand/ui/, no import of it or its utils", () => {
    expect(existsSync(join(repo, "src/design/brand/ui"))).toBe(false);
    expect(existsSync(join(repo, "src/design/brand/utils.ts"))).toBe(false);
    const re = /(?:\bfrom\s*|\bimport\s*\(?\s*|\brequire\(\s*)["'][^"']*design\/brand\/(?:ui|utils)\b/;
    const offenders = sources.filter(({ text }) => re.test(text)).map(({ path }) => path);
    expect(offenders).toEqual([]);
  });
});

describe("the data-slot contract", () => {
  const seen = new Set<string>();
  for (const { text } of dumps) {
    for (const m of text.matchAll(/data-slot="([^"]+)"/g)) seen.add(m[1]);
  }
  const defined = new Set<string>();
  for (const { text } of [...primitives, ...patterns]) {
    for (const m of text.matchAll(/data-slot="([^"]+)"/g)) defined.add(m[1]);
  }

  it("reads the slots the live site emits", () => {
    expect(seen.size).toBeGreaterThan(50);
  });

  it("defines every data-slot found in the reference dumps under ui/ or patterns/", () => {
    const missing = [...seen].filter((slot) => !defined.has(slot)).sort();
    expect(missing, `data-slot values with no definition under src/components/ui or src/components/patterns: ${missing.join(", ")}`).toEqual([]);
  });

  it("gives every primitive under src/components/ui/ a data-slot", () => {
    const silent = primitives.filter(({ text }) => !text.includes("data-slot=")).map(({ path }) => path);
    expect(silent).toEqual([]);
  });
});

// Found by audit 2026-09-10, after a user reported the agent panel "ghosting"
// through the conversation on the signup handoff.
//
// TAILWIND V4 DOES NOT COMPILE `translate-*` / `scale-*` / `rotate-*` TO THE
// `transform` PROPERTY. It compiles them to the separate CSS properties of the
// same name:
//
//   .translate-x-full { --tw-translate-x: 100%;
//                       translate: var(--tw-translate-x) var(--tw-translate-y); }
//   .scale-\(--scale-press\) { scale: var(--scale-press) var(--scale-press); }
//
// So `transition-[transform,box-shadow]` sitting next to `translate-x-full`
// transitions NOTHING: the element teleports, silently, with no warning
// anywhere and a class list that reads as if it were animating. Five such
// sites had been shipped, one of them the panel that appeared to paint through
// the conversation for a third of a second on every arrival.
//
// The NAMED utility is safe — `transition-transform` expands to
// `transition-property: transform, translate, scale, rotate` — which is why
// the sidebar's wrapper, three lines from the panel's, never had the bug.
//
// The rule below is deliberately not a ban on the word `transform`: a list may
// name it, and one day something may legitimately want it (`skew-*` and
// `transform-gpu` still compile to `transform`). What it may not do is name
// `transform` INSTEAD of the property the same file actually moves on.
//
// Its one known blind spot: a class string that overrides a primitive's own
// transition list from another file (`ACTION` in the two thread-card files did
// exactly that to Button's press feedback) is invisible to a per-file rule,
// because the utility and the list live in different files.
describe("transition property lists", () => {
  /** A Tailwind v4 movement utility, and the CSS property it really sets. */
  const MOVEMENT: [property: string, utility: RegExp][] = [
    // `translate-x-4`, `-translate-y-full`, `translate-(--foo)`, `translate-[3px]`
    ["translate", /(?<![\w-])-?translate(?:-[xyz])?-(?=[\d([]|(?:full|px|none)\b)/],
    // `scale-95`, `-scale-x-100`, `scale-(--scale-press)`, `scale-[1.02]`
    ["scale", /(?<![\w-])-?scale(?:-[xyz])?-(?=[\d([]|(?:none|3d)\b)/],
    // `rotate-45`, `-rotate-12`, `rotate-(--foo)`, `rotate-[3deg]`
    ["rotate", /(?<![\w-])-?rotate(?:-[xyz])?-(?=[\d([]|none\b)/],
  ];

  it("never names `transform` in place of the v4 property the same file moves on", () => {
    const offenders: string[] = [];
    for (const { path, text } of sources) {
      // Class strings only. The prose in these files quotes both spellings on
      // purpose, and a comment has never animated anything.
      const clean = stripComments(text);
      const moves = MOVEMENT.filter(([, utility]) => utility.test(clean)).map(([property]) => property);
      if (moves.length === 0) continue;
      for (const m of clean.matchAll(/transition-\[([^\]]+)\]/g)) {
        const listed = m[1].split(",").map((p) => p.trim());
        if (!listed.includes("transform")) continue;
        const missing = moves.filter((property) => !listed.includes(property));
        if (missing.length === 0) continue;
        offenders.push(
          `${path}:${lineOf(clean, m.index)} transition-[${m[1]}] names \`transform\`, but this file moves on \`${missing.join("`, `")}\` — Tailwind v4 compiles translate-*/scale-*/rotate-* to those properties, not to transform, so this transitions nothing. List \`${missing.join(", ")}\` explicitly, or use the named \`transition-transform\`.`,
        );
      }
    }
    expect(offenders, offenders.join("\n")).toEqual([]);
  });
});
