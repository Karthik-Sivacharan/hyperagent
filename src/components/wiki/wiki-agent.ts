/**
 * The wiki's own agent: the one a reader talks to from the wiki, which reads
 * every page, finds what disagrees and brings it to them. It is not one of the
 * workspace's assistants (topic-type.ts gives those their faces), so it wears
 * a face none of them does: `folio`, a page with its corner turned. Keep it
 * wherever the agent appears, as docs/brand/agent-glyphs.md asks.
 */
export const WIKI_AGENT = {
  id: "wiki-agent",
  name: "Wiki Agent",
  glyph: "folio",
} as const;
