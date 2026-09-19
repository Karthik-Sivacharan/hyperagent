import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { findGlyph } from "@/components/brand/agent-glyph";
import { WIKI_ATOM_TYPE_ORDER, WIKI_DRAWN_GROUPS, WIKI_SOURCE_KIND_ORDER, wikiAgentGlyph } from "@/components/wiki/topic-type";
import { wikiReadableNote, wikiTopics } from "@/lib/mock/wiki";

// The wiki's store is a 1.7 MB JSON file that only the server should hold. A
// client component that imports a value from the store module pulls the whole
// file into a browser chunk, so the wiki components import only types from
// it: labels arrive as props from the server, and the icons and colours live
// in topic-type.ts. Only the server shells, which slice the store per route,
// read its values. These tests keep that true, and keep topic-type.ts drawing
// every kind the store holds.

const repo = fileURLToPath(new URL("../../../", import.meta.url));

function walk(dir: string): string[] {
  const out: string[] = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(path));
    else if (/\.tsx?$/.test(entry.name) && !entry.name.endsWith(".test.ts")) out.push(path);
  }
  return out.sort();
}

const store = JSON.parse(readFileSync(join(repo, "src/lib/mock/wiki-data.json"), "utf8")) as {
  groupOrder: string[];
  atoms: Record<string, { type: string; sources: { kind: string }[] }>;
  agents: { id: string; name: string }[];
};

const components = walk(join(repo, "src/components/wiki")).map((path) => ({
  path: path.slice(repo.length),
  text: readFileSync(path, "utf8"),
}));

const STORE_IMPORT = /import\s+(type\s+)?[^;]*?from\s*["']@\/lib\/mock\/wiki["']/g;

describe("the wiki store stays on the server", () => {
  it("finds the wiki components", () => {
    expect(components.length).toBeGreaterThan(10);
  });

  it("imports only types from the store module, outside the server shells", () => {
    const offenders = components
      .filter(({ path }) => !path.endsWith("page-shell.tsx"))
      .filter(({ text }) => [...text.matchAll(STORE_IMPORT)].some((match) => !match[1]))
      .map(({ path }) => path);
    expect(offenders, `value imports from @/lib/mock/wiki: ${offenders.join(", ")}`).toEqual([]);
  });

  it("stays out of every client component, the shell's included", () => {
    // The sidebar's workspace switcher shows the store's workspace; AppShell
    // reads it on the server and hands the sidebar plain rows.
    const offenders = walk(join(repo, "src"))
      .map((path) => ({ path: path.slice(repo.length), text: readFileSync(path, "utf8") }))
      .filter(({ text }) => /^\s*["']use client["']/.test(text))
      .filter(({ text }) => [...text.matchAll(STORE_IMPORT)].some((match) => !match[1]) || text.includes("wiki-data.json"))
      .map(({ path }) => path);
    expect(offenders).toEqual([]);
  });

  it("never imports the JSON store from a component", () => {
    const offenders = components.filter(({ text }) => text.includes("wiki-data.json")).map(({ path }) => path);
    expect(offenders).toEqual([]);
  });
});

describe("topic-type.ts matches the store", () => {
  it("draws every Topic group the store lists", () => {
    expect(store.groupOrder.filter((id) => !WIKI_DRAWN_GROUPS.includes(id))).toEqual([]);
  });

  it("has an icon for every atom type and source kind in the store", () => {
    const types = new Set(Object.values(store.atoms).map((atom) => atom.type));
    const kinds = new Set(Object.values(store.atoms).flatMap((atom) => atom.sources.map((source) => source.kind)));
    expect([...types].filter((type) => !WIKI_ATOM_TYPE_ORDER.includes(type))).toEqual([]);
    expect([...kinds].filter((kind) => !WIKI_SOURCE_KIND_ORDER.includes(kind))).toEqual([]);
  });

  it("gives every assistant on the roster a face the glyph registry knows", () => {
    const faceless = store.agents.filter(({ id }) => {
      const glyph = wikiAgentGlyph(id);
      return !glyph || !findGlyph(glyph);
    });
    expect(faceless.map(({ id }) => id)).toEqual([]);
  });
});

describe("v1 names what the store writes as ids", () => {
  it("leaves no roster id or Topic id in a Topic's history notes", () => {
    const notes = Object.values(wikiTopics).flatMap((topic) =>
      topic.versions.map((version) => wikiReadableNote(version.changeNote)),
    );
    const ids = /\bag-[a-z]|(?:Folded into|Merged into|near miss:) [a-z0-9]/;
    expect(notes.filter((note) => ids.test(note))).toEqual([]);
  });
});
