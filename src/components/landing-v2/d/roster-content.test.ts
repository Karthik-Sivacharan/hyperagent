import { describe, expect, it } from "vitest";

import { integrations } from "../../../lib/mock/integrations";

import { ROSTER } from "./roster-content";

// The roster band's copy, held to the same rules `../a/content.test.ts` holds
// variant A's to. That file walks A's exports and cannot see this one, so the
// rules are restated here rather than imported: a new marketing page copies
// the test (docs/brand/voice-and-copy.md §9).

// Addresses and codes, not copy. `toolIds` are catalogue slugs, and the names
// a reader actually hears come from the catalogue itself.
const NOT_COPY = new Set(["id", "href", "toolIds"]);

function copyStrings(value: unknown, key = ""): string[] {
  if (typeof value === "string") return NOT_COPY.has(key) ? [] : [value];
  if (Array.isArray(value)) return value.flatMap((item) => copyStrings(item));
  if (value && typeof value === "object")
    return Object.entries(value).flatMap(([k, v]) => copyStrings(v, k));
  return [];
}

const ALL = copyStrings(ROSTER);
const AGENTS = ROSTER.categories.flatMap((category) => category.agents);

// voice-and-copy §5.3.
const BANNED =
  /\b(leverage|seamless|seamlessly|ai-powered|powerful|ship|shipping|supercharge|unlock|revolutioni[sz]e|effortless|effortlessly|fleet|bots?|chatbots?|sandbox|receipts?|tokens?|llm|models?|prompts?|workflows?|orchestrat\w*|autonomous|mcp|rubrics?|judge|threads?|triggers?|invocations?|sessions?)\b/i;

// The same list `../a/content.test.ts` carries. The product's own integrations
// are the exception to the no-other-companies rule, and they reach the page as
// slugs, not as copy, so nothing here should name one either way.
const OTHER_COMPANIES =
  /\b(manus|openclaw|cursor|grok|x\.ai|wix|symphony|salesforce|zendesk|quickbooks|shopify|datadog|lindy|devin|perplexity|elevenlabs|browserbase|composio|bending spoons)\b/i;

const CATALOGUE = new Map(integrations.map((one) => [one.slug, one.name]));

function sentences(s: string): string[] {
  return s
    .split(/(?<=[.?!])\s+/)
    .map((x) => x.trim())
    .filter(Boolean);
}
function words(s: string): number {
  return s.split(/\s+/).filter(Boolean).length;
}

describe("landing v2 variant D roster copy", () => {
  it("keeps banned words off the page", () => {
    expect(ALL.filter((s) => BANNED.test(s))).toEqual([]);
  });

  it("names no other company or product", () => {
    expect(ALL.filter((s) => OTHER_COMPANIES.test(s))).toEqual([]);
  });

  it("writes no em dashes, middle dots or exclamation marks", () => {
    expect(ALL.filter((s) => /[—·!]/.test(s))).toEqual([]);
  });

  it("keeps sentences under 25 words, the title under 10 and the sub under 19", () => {
    const long = ALL.flatMap(sentences).filter((s) => words(s) > 24);
    expect(long).toEqual([]);
    expect(words(ROSTER.heading.title)).toBeLessThan(10);
    expect(words(ROSTER.heading.sub)).toBeLessThan(19);
  });

  it("gives five functions eight agents each", () => {
    // Eight is what makes a tab two rows of four from `xl` rather than one
    // thin strip, so the grid's own shape depends on this number.
    expect(ROSTER.categories).toHaveLength(5);
    expect(ROSTER.categories.map((c) => c.agents.length)).toEqual([
      8, 8, 8, 8, 8,
    ]);
  });

  it("never leans a whole function on one tool", () => {
    // Eight cards showing the same three marks would read as one app with
    // eight buttons. Each function's roster should look like its week.
    const thin = ROSTER.categories
      .filter((c) => new Set(c.agents.flatMap((a) => a.toolIds)).size < 6)
      .map((c) => c.name);
    expect(thin).toEqual([]);
  });

  it("names every agent by its job, in two words and sentence case", () => {
    // §5.1: two words, sentence case, never a human name or a mascot. The
    // regex is the sentence-case half: one capital, at the front.
    const wrong = AGENTS.map((a) => a.name).filter(
      (name) => words(name) !== 2 || !/^[A-Z][^A-Z]*$/.test(name),
    );
    expect(wrong).toEqual([]);
  });

  it("keeps every agent name its own", () => {
    const names = AGENTS.map((a) => a.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("writes one line of job description that fits the card", () => {
    // Two lines at the narrowest column the grid draws (a 241px content box,
    // about 34 characters a line), so a row of cards is never ragged and none
    // of them ends in an ellipsis. Measured on screen, not guessed.
    const tooLong = AGENTS.filter((a) => a.description.length > 60).map(
      (a) => a.name,
    );
    expect(tooLong).toEqual([]);
    expect(AGENTS.every((a) => a.description.endsWith("."))).toBe(true);
  });

  it("touches only tools the integrations catalogue carries", () => {
    // Naming a tool on a marketing page claims the product connects to it, so
    // every slug has to be one the cloned integrations page actually lists.
    const unknown = AGENTS.flatMap((a) => a.toolIds).filter(
      (id) => !CATALOGUE.has(id),
    );
    expect(unknown).toEqual([]);
  });

  it("gives every agent three to five tools, each named once", () => {
    const wrong = AGENTS.filter(
      (a) =>
        a.toolIds.length < 3 ||
        a.toolIds.length > 5 ||
        new Set(a.toolIds).size !== a.toolIds.length,
    ).map((a) => a.name);
    expect(wrong).toEqual([]);
  });

  it("labels the roster as an example in the accessibility tree", () => {
    // §6 asks for "example" in a caption AND in the accessible name. The
    // caption came off the page on 2026-09-15, so this is the half that is
    // left; a visible caption going back is a content change, not a code one.
    const unlabelled = ROSTER.categories
      .map((c) => c.listLabel)
      .filter((label) => !/example/i.test(label));
    expect(unlabelled).toEqual([]);
  });

  it("pairs the two outward claims with the check, in different tabs", () => {
    // Rule 11: a claim that an agent acts alone carries the check on it. The
    // two that would put something in front of somebody outside the company
    // say so themselves, and they never land in one view.
    const refrain = /nothing goes out until you say so|held for your OK/i;
    const tabsWithRefrain = ROSTER.categories.filter((c) =>
      c.agents.some((a) => refrain.test(a.description)),
    );
    expect(tabsWithRefrain).toHaveLength(2);
    for (const tab of tabsWithRefrain) {
      expect(tab.agents.filter((a) => refrain.test(a.description))).toHaveLength(
        1,
      );
    }
  });

  it("names a verb and an object in the action, and never a count of agents", () => {
    expect(ROSTER.action.label).toBe("See more agents");
    // §6 forbids a number of agents. The label is the one place a count would
    // creep back in.
    expect(ROSTER.action.label).not.toMatch(/\d/);
    expect(ROSTER.action.href).toBe("/signup");
  });
});
