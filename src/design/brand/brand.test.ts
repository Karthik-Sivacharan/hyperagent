import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Plan step 5: brand.css is the app's only palette. These tests read the sheet
// as text and lock in its shape (the light mapping on `:root`, the dark re-map
// on `.dark`), the tokens the contrast gate and the GenUI blocks depend on,
// and the colour rules docs/brand/design.md fixes (§3, §12).

const css = readFileSync(new URL("./brand.css", import.meta.url), "utf8");
const contrastScript = readFileSync(
  new URL("../../../scripts/brand/check-contrast.mjs", import.meta.url),
  "utf8",
);

/** Body of the first `selector { … }` rule that starts a line; the same anchoring check-contrast.mjs uses. */
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

const root = decls(block(css, ":root"));
const dark = decls(block(css, "\\.dark"));

type Theme = "root" | "dark";

/** Follow a pure `var(--x)` chain to its terminal token; dark falls back to `:root` like the cascade does. */
function chain(name: string, theme: Theme): { terminal: string; error?: string } {
  const seen: string[] = [];
  let current = name;
  for (let hops = 0; hops < 32; hops++) {
    seen.push(current);
    const value = (theme === "dark" ? dark.get(current) : undefined) ?? root.get(current);
    if (value === undefined) {
      return { terminal: current, error: `--${current} is not declared (${theme}); chain ${seen.map((n) => `--${n}`).join(" -> ")}` };
    }
    const next = value.match(/^var\(\s*--([\w-]+)\s*\)$/);
    if (!next) return { terminal: current };
    current = next[1];
  }
  return { terminal: current, error: `var() chain from --${name} did not terminate (${theme})` };
}

/** Token names in the `PAIRS` array of check-contrast.mjs, read as text (importing the script would run the audit). */
function pairTokens(script: string): string[] {
  const array = script.match(/^const PAIRS = \[([\s\S]*?)^\];/m);
  if (!array) throw new Error("PAIRS array not found in scripts/brand/check-contrast.mjs");
  const clean = array[1].replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  const names = new Set<string>();
  for (const row of clean.matchAll(/\[([^\]]*)\]/g)) {
    const items = [...row[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
    // Only the first two items are tokens (fg, bg); the rest are the type and severity.
    for (const layered of items.slice(0, 2)) {
      for (const name of layered.split(" over ")) names.add(name.trim());
    }
  }
  return [...names];
}

const GENUI_TOKENS = [
  "spacing-group",
  "spacing-stack",
  "spacing-section",
  "blur-glass",
  "shadow-edge",
  "shadow-card",
  "shadow-card-hover",
  "chart-6",
  "chart-track",
  "chart-grid",
  "chart-target",
  "chart-band",
  "chart-seq-1",
  "chart-seq-2",
  "chart-seq-3",
  "chart-seq-4",
  "chart-seq-5",
];

const GENUI_CLASSES = [
  "focus-ring",
  "skeleton",
  "squircle",
  "genui-prose",
  "text-heading-display",
  "text-heading-lg",
  "text-label-14-mono",
  "text-label-12-mono",
  "text-label-12-caps",
];

describe("brand.css structure", () => {
  it("declares the light mapping on `:root` and the dark re-map on `.dark`, in that order", () => {
    const rootAt = css.search(/^:root\s*\{/m);
    const darkAt = css.search(/^\.dark\s*\{/m);
    expect(rootAt, "a `:root {` rule at line start").toBeGreaterThanOrEqual(0);
    expect(darkAt, "a `.dark {` rule at line start").toBeGreaterThanOrEqual(0);
    expect(darkAt, "`.dark {` comes after `:root {`").toBeGreaterThan(rootAt);
  });

  it("carries no scope class: `theme-brand` appears nowhere", () => {
    expect(css).not.toContain("theme-brand");
  });

  it("only re-maps in `.dark`: every dark token is also declared in `:root`", () => {
    expect(dark.size, "the `.dark {` block declares tokens").toBeGreaterThan(0);
    const introduced = [...dark.keys()].filter((name) => !root.has(name));
    expect(introduced, `tokens declared only in .dark: ${introduced.join(", ")}`).toEqual([]);
  });
});

describe("tokens the contrast gate reads (PAIRS in scripts/brand/check-contrast.mjs)", () => {
  const tokens = pairTokens(contrastScript);

  it("parses a non-empty PAIRS array", () => {
    expect(tokens.length).toBeGreaterThan(0);
  });

  it("resolves every PAIRS token in `:root`", () => {
    const unresolved = tokens.map((t) => chain(t, "root").error).filter((e): e is string => e !== undefined);
    expect(unresolved).toEqual([]);
  });

  it("resolves every PAIRS token in `.dark` (falling back to `:root`)", () => {
    const unresolved = tokens.map((t) => chain(t, "dark").error).filter((e): e is string => e !== undefined);
    expect(unresolved).toEqual([]);
  });
});

describe("GenUI additions", () => {
  it("declares the GenUI tokens in `:root`", () => {
    const missing = GENUI_TOKENS.filter((name) => !root.has(name));
    expect(missing, `GenUI tokens missing from :root: ${missing.join(", ")}`).toEqual([]);
  });

  it("declares the GenUI classes unprefixed (a line starts with the bare selector)", () => {
    const missing = GENUI_CLASSES.filter((cls) => !new RegExp(`^\\s*\\.${cls}(?![\\w-])`, "m").test(css));
    expect(missing, `classes not declared at line start: ${missing.map((c) => `.${c}`).join(", ")}`).toEqual([]);
  });
});

describe("colour rules (docs/brand/design.md §3, §12)", () => {
  it("--primary is ink in both themes; the primary button is never the accent", () => {
    expect(root.get("primary")).toBe("var(--color-neutral-950)");
    expect(dark.get("primary")).toBe("var(--color-neutral-100)");
  });

  it("--brand is tangerine-600 in both themes", () => {
    expect(root.get("brand")).toBe("var(--color-tangerine-600)");
    expect(dark.get("brand")).toBe("var(--color-tangerine-600)");
  });

  it("--brand-accent is tangerine-500 in light and lifts to tangerine-400 in dark", () => {
    expect(root.get("brand-accent")).toBe("var(--color-tangerine-500)");
    expect(dark.get("brand-accent")).toBe("var(--color-tangerine-400)");
  });

  it("--ring follows --brand-accent in both themes", () => {
    for (const theme of ["root", "dark"] as const) {
      const ring = chain("ring", theme);
      const accent = chain("brand-accent", theme);
      expect(ring.error, theme).toBeUndefined();
      expect(accent.error, theme).toBeUndefined();
      expect(ring.terminal, `--ring resolves to --${ring.terminal} in ${theme}, --brand-accent to --${accent.terminal}`).toBe(accent.terminal);
    }
  });
});
