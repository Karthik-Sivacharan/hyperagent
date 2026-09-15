import { describe, expect, it } from "vitest";

import * as a from "../a/content";
import { A11Y, HERO_D, LINKS } from "./content";

// Variant D adds only a handful of strings to variant A's copy. They follow
// A's rules, and every link lands on a section of the page or a route.
const SECTION_IDS = [
  a.TEAM.id,
  a.WEEK.id,
  a.USE_CASES.id,
  a.FORMATS.id,
  a.RECEIPTS.id,
  a.CONTROL.id,
  a.STORIES.id,
  a.PRICING.id,
  a.PRICING.faq.id,
];
const ROUTES = ["/landing/d", "/signup", "/threads/new"];

describe("landing v2 variant D copy", () => {
  it("keeps variant A's words and labels", () => {
    expect(LINKS.start).toEqual(a.LINKS.start);
    expect(LINKS.logIn).toEqual(a.LINKS.logIn);
    expect(LINKS.home.label).toBe(a.LINKS.home.label);
  });

  it("writes the new strings the way A writes its own", () => {
    const added = [HERO_D.primary, A11Y.window];
    expect(added.filter((s) => /[—·!]/.test(s))).toEqual([]);
    expect(added.filter((s) => s.split(/\s+/).length > 6)).toEqual([]);
  });

  it("keeps the hero to the owner's title and a lede with no price", () => {
    expect(HERO_D.title).toBe("Team of agents that ship real work");
    expect(HERO_D.title).toContain(HERO_D.glyphAfter);
    expect(HERO_D.description).not.toMatch(
      /\$|\b(price|prices|plan|plans|cost|costs|credit|month|free)\b/i,
    );
    expect(HERO_D.description).not.toMatch(/real work|[—·!]/i);
  });

  it("links only to a section on the page or a route", () => {
    const hrefs = Object.values(LINKS).map((l) => l.href);
    const broken = hrefs.filter((href) =>
      href.startsWith("#")
        ? !SECTION_IDS.includes(href.slice(1))
        : !ROUTES.includes(href),
    );
    expect(broken).toEqual([]);
  });
});
