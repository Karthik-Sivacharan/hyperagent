import { describe, expect, it } from "vitest";

import * as content from "./content";
import { creditLine, formatUsd, type LandingAsset } from "./content";

// Every string a visitor reads or hears. Link targets, section ids and tab
// values are addresses, not copy.
function copyStrings(value: unknown, key = ""): string[] {
  if (typeof value === "string") return ["href", "id", "value"].includes(key) ? [] : [value];
  if (Array.isArray(value)) return value.flatMap((item) => copyStrings(item));
  if (value && typeof value === "object") return Object.entries(value).flatMap(([k, v]) => copyStrings(v, k));
  return [];
}

function hrefs(value: unknown, key = ""): string[] {
  if (typeof value === "string") return key === "href" ? [value] : [];
  if (Array.isArray(value)) return value.flatMap((item) => hrefs(item));
  if (value && typeof value === "object") return Object.entries(value).flatMap(([k, v]) => hrefs(v, k));
  return [];
}

function assets(value: unknown): LandingAsset[] {
  if (Array.isArray(value)) return value.flatMap(assets);
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const self = typeof record.brief === "string" ? [record as LandingAsset] : [];
    return [...self, ...Object.values(record).flatMap(assets)];
  }
  return [];
}

const SECTION_IDS = [
  content.HOW_IT_WORKS.section.id,
  content.TEAM.section.id,
  content.RECEIPTS.section.id,
  content.CONTROL.section.id,
  content.LEARNING.section.id,
  content.PRICING.section.id,
  content.PRICING.faq.id,
];
const ROUTES = ["/landing", "/signup", "/threads/new"];

describe("landing copy", () => {
  it("keeps the retired filler words off the page", () => {
    const retired = /\b(real|powerful|ship|shipping|cooking|agi|seamless|seamlessly|supercharge|unlock|revolutionize|effortless|effortlessly|leverage)\b/i;
    expect(copyStrings(content).filter((s) => retired.test(s))).toEqual([]);
  });

  it("writes no middle dots or em dashes", () => {
    expect(copyStrings(content).filter((s) => /[·—]/.test(s))).toEqual([]);
  });

  it("gives every section its own id", () => {
    expect(new Set(SECTION_IDS).size).toBe(SECTION_IDS.length);
  });

  it("points every link at a section on the page or a route that exists", () => {
    const broken = hrefs(content).filter((href) =>
      href.startsWith("#") ? !SECTION_IDS.includes(href.slice(1)) : !ROUTES.includes(href),
    );
    expect(broken).toEqual([]);
  });

  it("lists the placeholders v1 draws", () => {
    expect(assets(content).map((a) => a.id).sort()).toEqual(
      [
        "control-autonomy",
        "control-budget",
        "control-connections",
        "control-read-only",
        "customer-logos",
        "hero-run",
        "learning-weeks",
        "receipts-ledger",
        "receipts-score-trend",
        "step-brief",
        "step-computer",
        "step-memory",
        "step-report",
        "team-quote",
        "team-roster",
      ].sort(),
    );
  });

  it("labels every placeholder and briefs the asset that replaces it", () => {
    for (const asset of assets(content)) {
      expect(asset.id).toMatch(/^[a-z0-9-]+$/);
      expect(asset.label).toMatch(/^Placeholder for /);
      expect(asset.brief.length).toBeGreaterThan(60);
    }
  });
});

describe("pricing", () => {
  it("formats whole dollars", () => {
    expect(formatUsd(20)).toBe("$20");
    expect(formatUsd(2700)).toBe("$2,700");
    expect(formatUsd(10000)).toBe("$10,000");
  });

  it("derives each plan's credit from its bonus", () => {
    expect(content.PRICING.plans.map((plan) => creditLine(plan))).toEqual([
      "$20 in credit",
      "$115 in credit, 15% bonus",
      "$625 in credit, 25% bonus",
      "$2,700 in credit, 35% bonus",
    ]);
  });
});
