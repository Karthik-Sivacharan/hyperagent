import { describe, expect, it } from "vitest";

import * as content from "./content";
import { creditLine, formatUsd } from "./content";

// Every string a visitor reads or hears. Link targets, ids, tab values,
// initials and states are addresses or codes, not copy.
const NOT_COPY = new Set(["href", "id", "value", "initials", "state", "from"]);

function copyStrings(value: unknown, key = ""): string[] {
  if (typeof value === "string") return NOT_COPY.has(key) ? [] : [value];
  if (Array.isArray(value)) return value.flatMap((item) => copyStrings(item));
  if (value && typeof value === "object")
    return Object.entries(value).flatMap(([k, v]) => copyStrings(v, k));
  return [];
}

function hrefs(value: unknown, key = ""): string[] {
  if (typeof value === "string") return key === "href" ? [value] : [];
  if (Array.isArray(value)) return value.flatMap((item) => hrefs(item));
  if (value && typeof value === "object")
    return Object.entries(value).flatMap(([k, v]) => hrefs(v, k));
  return [];
}

// Everything except the stories, whose company names are allowed only there,
// and except the two spots where "webhook" may appear.
const WITHOUT_STORIES = Object.fromEntries(
  Object.entries(content).filter(([key]) => key !== "STORIES"),
);
const ALL = copyStrings(content);
const OUTSIDE_STORIES = copyStrings(WITHOUT_STORIES);
const WEBHOOK_ALLOWED = new Set([
  ...content.HERO.startsFrom.items,
  ...content.PRICING.faq.items.map((q) => q.answer),
]);

const SECTION_IDS = [
  content.TEAM.id,
  content.WEEK.id,
  content.USE_CASES.id,
  content.FORMATS.id,
  content.RECEIPTS.id,
  content.CONTROL.id,
  content.STORIES.id,
  content.PRICING.id,
  content.PRICING.faq.id,
];
const ROUTES = ["/landing/a", "/signup", "/threads/new"];
const STORY_ORIGIN = "https://www.hyperagent.com/blog/";

const BANNED =
  /\b(leverage|seamless|seamlessly|ai-powered|powerful|ship|shipping|supercharge|unlock|revolutioni[sz]e|effortless|effortlessly|fleet|bots?|chatbots?|sandbox|receipts?|tokens?|llm|models?|prompts?|workflows?|orchestrat\w*|autonomous|mcp|rubrics?|judge|threads?|triggers?|invocations?|sessions?)\b/i;

// Other companies and products the research names. None may appear on the page.
const OTHER_COMPANIES =
  /\b(manus|openclaw|cursor|grok|x\.ai|wix|symphony|salesforce|zendesk|quickbooks|shopify|datadog|lindy|devin|perplexity|elevenlabs|browserbase|composio|bending spoons)\b/i;

function sentences(s: string): string[] {
  return s
    .split(/(?<=[.?!])\s+/)
    .map((x) => x.trim())
    .filter(Boolean);
}
function words(s: string): number {
  return s.split(/\s+/).filter(Boolean).length;
}

describe("landing v2 variant A copy", () => {
  it("keeps banned words off the page", () => {
    expect(ALL.filter((s) => BANNED.test(s))).toEqual([]);
  });

  it("names no other company or product", () => {
    expect(ALL.filter((s) => OTHER_COMPANIES.test(s))).toEqual([]);
  });

  it("names the story customers only inside the stories", () => {
    const names = content.STORIES.items.map((story) => story.who.split(",")[0]);
    const leaks = OUTSIDE_STORIES.filter((s) =>
      names.some((name) => s.includes(name)),
    );
    expect(leaks).toEqual([]);
  });

  it("says webhook only in the starts-from list and the questions", () => {
    const leaks = ALL.filter(
      (s) => /\bwebhooks?\b/i.test(s) && !WEBHOOK_ALLOWED.has(s),
    );
    expect(leaks).toEqual([]);
  });

  it("writes no em dashes, middle dots or exclamation marks", () => {
    expect(ALL.filter((s) => /[—·!]/.test(s))).toEqual([]);
  });

  it("keeps sentences under 25 words, titles under 10 and subheads under 19", () => {
    const long = ALL.flatMap(sentences).filter((s) => words(s) > 24);
    expect(long).toEqual([]);
    const sections = [
      content.TEAM,
      content.WEEK,
      content.USE_CASES,
      content.FORMATS,
      content.RECEIPTS,
      content.CONTROL,
      content.STORIES,
      content.PRICING,
    ];
    const titles = [
      content.HERO.title,
      ...sections.map((s) => s.heading.title),
      content.CLOSING.heading,
    ];
    const subs = [content.HERO.sub, ...sections.map((s) => s.heading.sub)];
    expect(titles.filter((h) => words(h) > 9)).toEqual([]);
    expect(subs.filter((h) => words(h) > 18)).toEqual([]);
  });

  it("gives every section its own id and links only to the page or a route", () => {
    expect(new Set(SECTION_IDS).size).toBe(SECTION_IDS.length);
    const broken = hrefs(content).filter((href) => {
      if (href.startsWith("#")) return !SECTION_IDS.includes(href.slice(1));
      if (href.startsWith(STORY_ORIGIN)) return false;
      return !ROUTES.includes(href);
    });
    expect(broken).toEqual([]);
  });

  it("gives every department exactly four agents with a three-step job", () => {
    for (const department of content.USE_CASES.departments) {
      expect(department.agents).toHaveLength(4);
      expect(department.bubbles).toHaveLength(2);
      for (const agent of department.agents) {
        expect(agent.run.steps).toHaveLength(3);
        expect(agent.initials).toHaveLength(2);
      }
    }
  });

  it("keeps the same agent names across the hero, the team, the week and the table", () => {
    const known = new Set(
      content.USE_CASES.departments.flatMap((d) => d.agents.map((a) => a.name)),
    );
    const used = [
      content.HERO.window.thread.agent,
      ...content.HERO.window.roster.items.map((r) => r.name),
      ...content.TEAM.items.map((r) => r.name),
      ...content.WEEK.days.flatMap((d) => d.items.map((r) => r.agent)),
      ...content.RECEIPTS.rows.map((r) => r.agent),
    ];
    expect(used.filter((name) => !known.has(name))).toEqual([]);
  });

  it("carries the refrain in the agents' own words", () => {
    const refrain = /nothing goes out until you say so/i;
    expect(ALL.filter((s) => refrain.test(s)).length).toBeGreaterThanOrEqual(3);
  });

  it("labels the calls to action", () => {
    expect(content.LINKS.start.label).toBe("Start your team");
    expect(content.LINKS.logIn.label).toBe("Log in");
    expect(content.USE_CASES.action.label).toBe("Start this agent");
    expect(content.STORIES.linkLabel).toBe("Read the story");
  });

  it("matches the plan ladder", () => {
    expect(content.PRICING.plans.map((p) => [p.price, p.bonus])).toEqual([
      [20, 0],
      [100, 15],
      [500, 25],
      [2000, 35],
    ]);
    expect(formatUsd(2000)).toBe("$2,000");
    expect(creditLine({ price: 100, bonus: 15, fit: "" })).toBe(
      "$115 in credit, 15% bonus",
    );
  });

  it("totals the example table", () => {
    const seconds = content.RECEIPTS.rows
      .map((r) => r.duration.match(/(\d+)m (\d+)s/)!)
      .reduce((sum, m) => sum + Number(m[1]) * 60 + Number(m[2]), 0);
    expect(seconds).toBe(54 * 60 + 53);
    const cost = content.RECEIPTS.rows.reduce(
      (sum, r) => sum + Number(r.cost.replace("$", "")),
      0,
    );
    expect(cost.toFixed(2)).toBe("8.97");
  });

  it("labels the example figures as examples", () => {
    expect(content.TEAM.caption).toMatch(/example/i);
    expect(content.WEEK.caption).toMatch(/example/i);
    expect(content.A11Y.runs).toMatch(/example/i);
  });
});
