import { describe, expect, it } from "vitest";

import { DEMO_AGENTS } from "./demo-agents";

// The app window's six agents: the order the sidebar lists them in, and the
// page's rule that the demo names no tool, model or company.
const ORDER = [
  "engineering",
  "marketing",
  "copywriting",
  "support",
  "sales",
  "data",
];
const LABELS = [
  "Engineering",
  "Marketing",
  "Copywriting",
  "Customer Support",
  "Sales",
  "Data & Analytics",
];

const BRANDS = [
  "github",
  "gitlab",
  "bitbucket",
  "jira",
  "linear",
  "figma",
  "slack",
  "telegram",
  "gmail",
  "google",
  "outlook",
  "notion",
  "airtable",
  "hubspot",
  "salesforce",
  "zendesk",
  "intercom",
  "stripe",
  "shopify",
  "openai",
  "chatgpt",
  "gpt",
  "anthropic",
  "claude",
  "opus",
  "sonnet",
  "haiku",
  "gemini",
  "llama",
  "mistral",
];

/** Every string value in the record, keys left out. */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object")
    return Object.values(value).flatMap(strings);
  return [];
}

describe("landing v2 variant D demo agents", () => {
  it("lists six agents in sidebar order, engineering first", () => {
    expect(DEMO_AGENTS.map((a) => a.id)).toEqual(ORDER);
    expect(DEMO_AGENTS.map((a) => a.label)).toEqual(LABELS);
  });

  it("gives every sidebar row a short preview and a time, the open one now", () => {
    for (const a of DEMO_AGENTS) {
      expect(a.preview.trim().length).toBeGreaterThan(0);
      expect(a.preview.split(/\s+/).length).toBeLessThanOrEqual(8);
      expect(a.time.trim().length).toBeGreaterThan(0);
    }
    expect(DEMO_AGENTS[0].time).toBe("now");
  });

  it("keeps each thread bar in step with its title", () => {
    for (const a of DEMO_AGENTS) expect(a.thread.title).toBe(a.threadTitle);
  });

  it("names no tool, model or company, and no handles", () => {
    const text = DEMO_AGENTS.flatMap(strings);
    const brand = new RegExp(`\\b(${BRANDS.join("|")})\\b`, "i");
    expect(text.filter((s) => brand.test(s))).toEqual([]);
    expect(text.filter((s) => /(^|\s)@\w/.test(s))).toEqual([]);
  });

  it("draws receipts as counts, never as logo stacks", () => {
    const logos = DEMO_AGENTS.flatMap((a) => a.script.rows).filter(
      (r) => r.receipt?.kind === "tools",
    );
    expect(logos).toEqual([]);
  });

  it("writes the way the page writes", () => {
    const text = DEMO_AGENTS.flatMap(strings);
    expect(text.filter((s) => /[—·!]/.test(s))).toEqual([]);
    expect(text.filter((s) => /\b(receipts?|judges?)\b/i.test(s))).toEqual([]);
  });

  it("opens every computer on a document it holds", () => {
    for (const { workspace } of DEMO_AGENTS) {
      const ids = workspace.artifacts.map((artifact) => artifact.id);
      expect(ids[0]).toBe(workspace.activeId);
    }
  });
});
