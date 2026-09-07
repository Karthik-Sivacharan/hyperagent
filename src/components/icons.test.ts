import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Decided 2026-09-07: icons come from @tabler/icons-react and nothing else
// (docs/brand/icons.md). These tests read the source tree, package.json and
// the installed package as text and lock the rule: no lucide import anywhere
// under src/ (the shadcn CLI still emits them), lucide out of the
// dependencies, and every name imported from Tabler one the package really
// exports, which otherwise only the build would catch.

const repo = fileURLToPath(new URL("../../", import.meta.url));
const TABLER = "@tabler/icons-react";
const LUCIDE = "lucide-react";
const SKIP = new Set(["node_modules", ".next"]);

/** Every .ts / .tsx file under `dir`, recursively, skipping dependency and build output. */
function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...sourceFiles(path));
    else if (/\.tsx?$/.test(entry.name)) out.push(path);
  }
  return out.sort();
}

const files = sourceFiles(join(repo, "src")).map((path) => ({
  path: path.slice(repo.length),
  text: readFileSync(path, "utf8"),
}));

function escape(literal: string): string {
  return literal.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
}

/** Bodies of the `import { … } from "<module>"` clauses (either quote style, `import type` too, across lines). */
function importClauses(text: string, module: string): string[] {
  const re = new RegExp(`\\bimport\\s+(?:type\\s+)?\\{([^}]*)\\}\\s*from\\s*["']${escape(module)}["']`, "g");
  return [...text.matchAll(re)].map((m) => m[1]);
}

/** Names in a clause body: `IconX`, `type TablerIcon`, `IconY as Z`; comments stripped. */
function importedNames(clause: string): string[] {
  return clause
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "")
    .split(",")
    .map((part) => part.trim().replace(/^type\s+/, "").replace(/\s+as\s+\w+$/, ""))
    .filter((name) => name.length > 0);
}

describe("no lucide-react in the source tree", () => {
  it("finds the source files", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it("has no import, dynamic import or require of lucide-react under src/", () => {
    // Any module specifier that is lucide-react or a path inside it.
    const re = new RegExp(`(?:\\bfrom\\s*|\\bimport\\s*\\(?\\s*|\\brequire\\(\\s*)["']${escape(LUCIDE)}(?:["']|/)`);
    const offenders = files.filter(({ text }) => re.test(text)).map(({ path }) => path);
    expect(offenders).toEqual([]);
  });
});

describe("package.json", () => {
  const pkg = JSON.parse(readFileSync(join(repo, "package.json"), "utf8")) as Record<
    string,
    Record<string, string> | undefined
  >;
  const blocks = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"];

  it("lists @tabler/icons-react in dependencies", () => {
    expect(pkg.dependencies?.[TABLER]).toMatch(/^\^?\d/);
  });

  it("lists lucide-react in no dependency block", () => {
    const found = blocks.filter((block) => pkg[block]?.[LUCIDE] !== undefined);
    expect(found).toEqual([]);
  });
});

describe("every name imported from @tabler/icons-react exists", () => {
  // The ESM barrel re-exports every icon as `default as IconX`; the package
  // entry adds a few aliases the same way; the d.ts names the type exports.
  const dist = join(repo, "node_modules", TABLER, "dist");
  const exported = new Set<string>();
  for (const file of ["esm/icons/index.mjs", "esm/tabler-icons-react.mjs"]) {
    for (const m of readFileSync(join(dist, file), "utf8").matchAll(/\bas\s+(\w+)/g)) exported.add(m[1]);
  }
  const types = readFileSync(join(dist, "tabler-icons-react.d.ts"), "utf8").match(/^export type \{([^}]*)\}/m);
  for (const name of importedNames(types?.[1] ?? "")) exported.add(name);

  it("reads the package's export list", () => {
    expect(exported.size).toBeGreaterThan(1000);
    for (const name of ["TablerIcon", "Icon", "IconProps", "IconCheck", "IconStarFilled"]) {
      expect(exported.has(name), name).toBe(true);
    }
  });

  it("imports at least one Tabler icon somewhere", () => {
    expect(files.some(({ text }) => importClauses(text, TABLER).length > 0)).toBe(true);
  });

  it("names only exports the installed package has", () => {
    const missing: string[] = [];
    for (const { path, text } of files) {
      for (const clause of importClauses(text, TABLER)) {
        for (const name of importedNames(clause)) {
          if (!exported.has(name)) missing.push(`${path}: ${name}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });
});
