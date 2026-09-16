import { describe, expect, it } from "vitest";

import * as a from "../a/content";
import {
  A11Y,
  CLOSING_D,
  FOOTER_D,
  HERO_D,
  LINKS,
  NAV_D,
  ROSTER_ID,
} from "./content";
import { TEAM_VIEWS_ID } from "./team-views-content";

// Variant D adds only a handful of strings to variant A's copy. They follow
// A's rules, and every link lands on a section of the page or a route.
//
// D is the short page: the hero, the roster, the formats, one job from brief
// to delivery, the team cards, the four views and the closing. These are the
// only ids an in-page link on D may name, which is what keeps the nav and the
// footer off A's sections.
//
// The roster's id comes from `./content` and not from `./roster-content`, for
// the same reason the nav reads it there: that module imports this one, and
// the id has to be somewhere both the band and the link can see.
const SECTION_IDS = [
  ROSTER_ID,
  a.FORMATS.id,
  a.BRIEF_CARDS.id,
  a.TEAM_CARDS.id,
  TEAM_VIEWS_ID,
];
// `main` is the page's own landmark rather than one of its bands: the skip
// link at the top of the document names it, and so does the footer's way
// back up. It is on the page, so a link to it is not a dead anchor.
const PAGE_IDS = [...SECTION_IDS, "main"];
const ROUTES = ["/landing/d", "/signup", "/threads/new"];
const ALL_LINKS = [
  ...Object.values(LINKS),
  ...NAV_D,
  ...FOOTER_D.groups.flatMap((group) => group.links),
  FOOTER_D.top,
];

describe("landing v2 variant D copy", () => {
  it("keeps variant A's words and labels", () => {
    expect(LINKS.start).toEqual(a.LINKS.start);
    expect(LINKS.logIn).toEqual(a.LINKS.logIn);
    expect(LINKS.home.label).toBe(a.LINKS.home.label);
  });

  it("writes the new strings the way A writes its own", () => {
    const added = [
      HERO_D.primary,
      A11Y.window,
      ...NAV_D.map((link) => link.label),
      ...FOOTER_D.groups.map((group) => group.title),
      FOOTER_D.top.label,
    ];
    expect(added.filter((s) => /[—·!]/.test(s))).toEqual([]);
    expect(added.filter((s) => s.split(/\s+/).length > 6)).toEqual([]);
  });

  // The footer's sign-off is a sentence, not a label, so it answers to the
  // sentence rules instead: A's banned words, one idea under 25 words, and no
  // price, which is the line D holds everywhere else on the page.
  it("signs off in one plain sentence with no price in it", () => {
    expect(FOOTER_D.line).not.toMatch(/[—·!]/);
    expect(FOOTER_D.line).not.toMatch(
      /\$|\b(price|prices|plan|plans|cost|costs|credit|month|free)\b/i,
    );
    expect(
      FOOTER_D.line.split(/\s+/).filter(Boolean).length,
    ).toBeLessThanOrEqual(24);
    expect(FOOTER_D.line).not.toMatch(
      /\b(leverage|seamless|seamlessly|ai-powered|powerful|ship|shipping|supercharge|unlock|revolutioni[sz]e|effortless|effortlessly|fleet|bots?|chatbots?|sandbox|receipts?|tokens?|llm|models?|prompts?|workflows?|orchestrat\w*|autonomous|mcp|rubrics?|judge|threads?|triggers?|invocations?|sessions?)\b/i,
    );
  });

  it("keeps the hero to the owner's title and a lede with no price", () => {
    expect(HERO_D.title).toBe("Team of agents that ship real work");
    expect(HERO_D.title).toContain(HERO_D.glyphAfter);
    expect(HERO_D.description).not.toMatch(
      /\$|\b(price|prices|plan|plans|cost|costs|credit|month|free)\b/i,
    );
    expect(HERO_D.description).not.toMatch(/real work|[—·!]/i);
  });

  // The nav is the page's own index: a band with no link in it is a section
  // the reader has no way to reach from the top of the page. The closing band
  // is the one exclusion, and it is deliberate — see the note on NAV_D.
  it("names every band of the page in the nav", () => {
    expect(NAV_D.map((link) => link.href)).toEqual(
      SECTION_IDS.map((id) => `#${id}`),
    );
  });

  it("links only to a section on the page or a route", () => {
    const broken = ALL_LINKS.map((l) => l.href).filter((href) =>
      href.startsWith("#")
        ? !PAGE_IDS.includes(href.slice(1))
        : !ROUTES.includes(href),
    );
    expect(broken).toEqual([]);
  });

  it("closes on the refrain and never on a price", () => {
    expect(CLOSING_D.fine).toMatch(/nothing goes out until you say so/i);
    expect(CLOSING_D.fine).not.toMatch(
      /\$|\b(price|prices|plan|plans|cost|costs|credit|month|free)\b/i,
    );
    const lines = [CLOSING_D.heading, CLOSING_D.fine];
    expect(lines.filter((s) => /[—·!]/.test(s))).toEqual([]);
    expect(CLOSING_D.heading.split(/\s+/).length).toBeLessThan(10);
    const long = lines
      .flatMap((s) => s.split(/(?<=[.?])\s+/))
      .filter((s) => s.split(/\s+/).filter(Boolean).length > 24);
    expect(long).toEqual([]);
  });
});
