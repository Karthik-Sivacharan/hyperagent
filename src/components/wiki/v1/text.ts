import type { WikiLinkTarget } from "@/lib/mock/wiki";

// Pure readings of the composer's text, for the places v1 shows it outside
// the body renderer: a line in a button, an alias list, a comparison.

const WIKILINK = /\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g;
const CITE = /\s*\[cite:memoryAtom:[^\]]+\]/g;

/** The words of a composed string: wikilinks as their labels, citations and emphasis marks dropped. */
export function plainText(text: string, links: Record<string, WikiLinkTarget> = {}) {
  return text
    .replace(WIKILINK, (_, key: string, label?: string) => label || links[key.trim().toLowerCase().replace(/\s+/g, "-")]?.title || key)
    .replace(CITE, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

const ALIASES = /^Also known as:\s*(.+)\n*/;

/**
 * A body that opens with the composer's "Also known as: A, B" line, split
 * into those names and the rest of the body, so the header can carry them.
 */
export function splitAliases(content: string): { aliases: string[]; body: string } {
  const match = content.match(ALIASES);
  if (!match) return { aliases: [], body: content };
  return {
    aliases: match[1]
      .split(",")
      .map((name) => plainText(name))
      .filter(Boolean),
    body: content.slice(match[0].length),
  };
}

const normalise = (text: string) => plainText(text).toLowerCase();

/** Whether the body already says what the summary says, so the page need not lead with it. */
export function bodyRepeatsSummary(summary: string, content: string) {
  const opening = normalise(summary).slice(0, 60);
  return opening.length > 0 && normalise(content).includes(opening);
}

/** Words in a composed body, as a reader would count them. */
export function wordCount(content: string) {
  return plainText(content.replace(/^[#>|\-*\s]+/gm, " ").replace(/\|/g, " "))
    .split(" ")
    .filter((word) => /\w/.test(word)).length;
}
