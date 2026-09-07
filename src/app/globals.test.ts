import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Plan step 5: globals.css wires the theme but owns no palette. Every colour
// value lives in src/design/brand/brand.css (light on `:root`, dark on
// `.dark`); this file may only point at those tokens. Both files are read as
// text.

const globals = readFileSync(new URL("./globals.css", import.meta.url), "utf8");
const brand = readFileSync(new URL("../design/brand/brand.css", import.meta.url), "utf8");

/** Body of the first `selector { … }` rule that starts a line. */
function block(source: string, selector: string): string {
  const match = source.match(new RegExp(`^${selector}\\s*\\{([\\s\\S]*?)\\n\\}`, "m"));
  return match ? match[1] : "";
}

/** `--name: value;` declarations in a block body, comments stripped first. */
function decls(body: string): Map<string, string> {
  const out = new Map<string, string>();
  const clean = body.replace(/\/\*[\s\S]*?\*\//g, "");
  const re = /--([\w-]+)\s*:\s*([^;]+);/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(clean))) out.set(m[1], m[2].trim());
  return out;
}

const brandRoot = decls(block(brand, ":root"));

describe("globals.css owns no palette", () => {
  it("has no hex colour literal", () => {
    // Same shape as the hex rule in scripts/brand/lint-tokens.mjs.
    const hexes = globals.match(/#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g) ?? [];
    expect(hexes).toEqual([]);
  });

  it("has no `.dark` selector: the dark mapping lives only in brand.css", () => {
    expect(globals).not.toMatch(/\.dark\s*\{|\.dark\s+body/);
  });

  it("has no scope class and no phase-1 palette hook", () => {
    expect(globals).not.toContain("theme-brand");
    expect(globals).not.toContain("palette-neutral");
  });

  it("has no `-active` font indirection", () => {
    expect(globals).not.toMatch(/font-[a-z]+-active/);
  });
});

describe("the bridge (`@theme inline reference`)", () => {
  const entries = decls(block(globals, "@theme inline reference"));

  it("exists and names brand-only tokens", () => {
    expect(entries.size).toBeGreaterThan(0);
  });

  it("points every entry at a token brand.css declares on `:root`", () => {
    const dangling = [...entries]
      .map(([name, value]) => {
        const target = value.match(/^var\(\s*--([\w-]+)\s*\)$/);
        if (!target) return `--${name}: ${value} (not a var() reference)`;
        return brandRoot.has(target[1]) ? null : `--${name}: var(--${target[1]}) (target not declared in brand.css :root)`;
      })
      .filter((problem): problem is string => problem !== null);
    expect(dangling).toEqual([]);
  });
});
