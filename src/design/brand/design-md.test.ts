import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// docs/brand/hyperagent-DESIGN.md is the portable form of brand.css. Its token
// regions are generated (scripts/brand/build-design-md.mjs), so a token change
// that skips `npm run brand:design-md` would ship a DESIGN.md that disagrees
// with the app. The check mode rebuilds them in memory and compares, and also
// checks public/design.md (the copy the site serves at /design.md) is the
// same file.

const script = fileURLToPath(new URL("../../../scripts/brand/build-design-md.mjs", import.meta.url));
const md = readFileSync(new URL("../../../docs/brand/hyperagent-DESIGN.md", import.meta.url), "utf8");

describe("hyperagent-DESIGN.md", () => {
  it("matches brand.css, and public/design.md matches it (run `npm run brand:design-md` after a token change)", () => {
    expect(() => execFileSync(process.execPath, [script, "--check"], { stdio: "pipe" })).not.toThrow();
  });

  it("keeps the section order the DESIGN.md format lints for", () => {
    const sections = [...md.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
    const canonical = ["Overview", "Colors", "Typography", "Layout", "Elevation & Depth", "Shapes", "Components", "Do's and Don'ts"];
    expect(sections.filter((s) => canonical.includes(s))).toEqual(canonical);
    expect(new Set(sections).size).toBe(sections.length);
  });
});
