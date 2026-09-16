import { describe, expect, it } from "vitest";

import { FLEET_AGENTS, FLEET_RUNS, RUN_STATUS_ORDER, TEAM } from "../../../lib/mock/teams";

import { DEMO_USER } from "./content";
import {
  SHOWCASE_RUNS,
  SHOWCASE_TEAM,
  SHOWCASE_WEEK,
  TEAM_VIEWS,
  TEAM_VIEWS_ID,
} from "./team-views-content";

// The views band's copy, held to the same rules `../a/content.test.ts` holds
// variant A's to. That file walks A's exports and cannot see this one, so the
// rules are restated here rather than imported: a new marketing page copies
// the test (docs/brand/voice-and-copy.md §9).
//
// The band draws the live /teams views over a slice of their mock, so the
// second half guards the slice. A run whose agent is missing throws inside
// the fleet store rather than merely looking wrong, and an empty lane is a
// picture of a board with a hole in it.

// Addresses and codes, not copy.
const NOT_COPY = new Set(["id"]);

function copyStrings(value: unknown, key = ""): string[] {
  if (typeof value === "string") return NOT_COPY.has(key) ? [] : [value];
  if (Array.isArray(value)) return value.flatMap((item) => copyStrings(item, key));
  if (value && typeof value === "object")
    return Object.entries(value).flatMap(([k, v]) => copyStrings(v, k));
  return [];
}

const ALL = copyStrings(TEAM_VIEWS);

// voice-and-copy §5.3.
const BANNED =
  /\b(leverage|seamless|seamlessly|ai-powered|powerful|ship|shipping|supercharge|unlock|revolutioni[sz]e|effortless|effortlessly|fleet|bots?|chatbots?|sandbox|receipts?|tokens?|llm|models?|prompts?|workflows?|orchestrat\w*|autonomous|mcp|rubrics?|judge|threads?|triggers?|invocations?|sessions?)\b/i;

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

describe("landing v2 variant D views copy", () => {
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
    expect(ALL.flatMap(sentences).filter((s) => words(s) > 24)).toEqual([]);
    expect(words(TEAM_VIEWS.heading.title)).toBeLessThan(10);
    expect(words(TEAM_VIEWS.heading.sub)).toBeLessThan(19);
  });

  it("never names a price, which is the line D holds everywhere", () => {
    expect(
      ALL.filter((s) =>
        /\$|\b(price|prices|plan|plans|cost|costs|credit|month|free)\b/i.test(s),
      ),
    ).toEqual([]);
  });

  it("names a band the page can anchor to", () => {
    expect(TEAM_VIEWS.id).toBe(TEAM_VIEWS_ID);
    expect(TEAM_VIEWS_ID).toMatch(/^[a-z-]+$/);
  });

  // Each name sits on a pill, and the four have to stay on one row from `sm`
  // without the track scrolling. One word, or two short ones, is what fits.
  it("names four views in short labels, each with a picture of its own", () => {
    expect(TEAM_VIEWS.views).toHaveLength(4);
    expect(TEAM_VIEWS.views.map((view) => view.id)).toEqual([
      "board",
      "list",
      "org",
      "office",
    ]);
    for (const view of TEAM_VIEWS.views) {
      expect(words(view.name)).toBeLessThan(3);
      expect(view.alt.endsWith(".")).toBe(true);
    }
  });

  // A reader who never touches the control still learns what the band holds,
  // so the line under the claim names all four, in the control's order.
  it("promises all four views in the line under the claim", () => {
    const sub = TEAM_VIEWS.heading.sub.toLowerCase();
    let at = -1;
    for (const view of TEAM_VIEWS.views) {
      const next = sub.indexOf(view.name.toLowerCase());
      expect(next).toBeGreaterThan(at);
      at = next;
    }
  });
});

describe("landing v2 variant D views data", () => {
  const ids = new Set(SHOWCASE_RUNS);
  // What the band hands the store, not a second copy of the same filter.
  const shown = SHOWCASE_WEEK;

  it("names runs that all exist, with no duplicates", () => {
    expect(ids.size).toBe(SHOWCASE_RUNS.length);
    expect(shown).toHaveLength(SHOWCASE_RUNS.length);
    expect(shown.length).toBeLessThanOrEqual(16);
  });

  // Every agent in a shown run has to be one the band also hands the store,
  // or `agentById` throws where the card renders. The band keeps the whole
  // team, so this is a check that the mock's own ids stay consistent.
  it("draws no run whose agent has left the team", () => {
    const team = new Set(FLEET_AGENTS.map((agent) => agent.id));
    expect(shown.filter((run) => !team.has(run.agentId))).toEqual([]);
  });

  // Lanes deep enough to read and none deeper than the fade can absorb: the
  // board is 576px tall at `lg` and a card is about 120, so five runs one
  // card into the fade at the foot of the panel, and six is a column the
  // reader mostly sees the fade of.
  it("fills every lane of the board without overflowing it", () => {
    for (const status of RUN_STATUS_ORDER) {
      const lane = shown.filter((run) => run.status === status);
      expect(lane.length).toBeGreaterThan(0);
      expect(lane.length).toBeLessThanOrEqual(5);
    }
  });

  // `src/lib/mock/teams.ts` states it of the whole mock, and a slice can
  // quietly break it: an agent drawn as working, on the org chart and at a
  // desk in the office, with nothing in any of the four pictures that it
  // could be working on.
  it("leaves no working agent without work in the picture", () => {
    const busy = new Set(shown.flatMap((run) => [run.agentId, ...(run.helpers ?? [])]));
    const idleLooking = FLEET_AGENTS.filter(
      (agent) => agent.state === "working" && !busy.has(agent.id),
    );
    expect(idleLooking.map((agent) => agent.name)).toEqual([]);
  });

  // The org chart draws a travelling edge for every sub-agent a working run
  // has handed work to, and the office draws the same handoff as a huddle.
  // Keeping all three is what keeps both pictures alive.
  it("keeps every run that is delegating right now", () => {
    const delegating = FLEET_RUNS.filter((run) => run.helpers?.length);
    expect(delegating.length).toBeGreaterThan(0);
    expect(delegating.filter((run) => !ids.has(run.id))).toEqual([]);
  });
});

describe("landing v2 variant D views cast", () => {
  // The mock signs its owner in as the person who built the repo, which is
  // right on /teams and wrong on a page anyone can open: the office draws that
  // name on a tag over a character's head, with a "You" badge beside it, on a
  // stranger's screen. The swap is easy to lose in a refactor and nothing else
  // would notice, so it is held here by name.
  it("signs in the page's fictional person, not the repo's owner", () => {
    const owner = TEAM.members.find((member) => member.id === "m-karthik");
    expect(owner).toBeDefined();
    const shown = SHOWCASE_TEAM.members.find((member) => member.id === "m-karthik");
    expect(shown?.name).toBe(DEMO_USER.name);
    expect(shown?.initials).toBe(DEMO_USER.initials);
    expect(SHOWCASE_TEAM.members.map((member) => member.name)).not.toContain(owner!.name);
  });

  // Every part of the office is keyed by id: the seed that places this person,
  // the sprite sheet that gives them hair rather than an antenna, the art
  // pixels the tag clears their head by. Rename an id and they have nowhere to
  // stand.
  it("changes the words and not one id", () => {
    expect(SHOWCASE_TEAM.members.map((member) => member.id)).toEqual(
      TEAM.members.map((member) => member.id),
    );
    expect(SHOWCASE_TEAM.id).toBe(TEAM.id);
    expect(SHOWCASE_TEAM.members).toHaveLength(TEAM.members.length);
  });

  // The rest of the mock's people were invented to begin with; this is a check
  // that a future edit to the mock does not quietly put a real one back.
  it("leaves the invented members alone", () => {
    for (const member of TEAM.members) {
      if (member.id === "m-karthik") continue;
      const shown = SHOWCASE_TEAM.members.find((one) => one.id === member.id);
      expect(shown).toEqual(member);
    }
  });
});
