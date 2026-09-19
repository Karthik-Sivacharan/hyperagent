import type { MessageBlock } from "@/lib/mock/conversation";

// Wiki Agent's side of the wiki chat: what it has found that needs a person,
// and the answers it gives. Static, like every mock here. The counts are the
// wiki store's own (wiki-data.json: 27 conflict pairs, 70 of 97 topics with
// no composed page, 5 retracted atoms); the answers are written, not derived.

export type WikiChatSuggestionKind = "conflict" | "missing" | "retracted";

export type WikiChatSuggestion = {
  id: string;
  kind: WikiChatSuggestionKind;
  /** The line on the suggestion itself. */
  label: string;
  /** What sending it says, as the reader's own message. */
  prompt: string;
};

export const WIKI_CHAT_SUGGESTIONS: readonly WikiChatSuggestion[] = [
  {
    id: "conflicts",
    kind: "conflict",
    label: "Settle 27 pairs of facts that disagree",
    prompt: "Show me the facts that disagree",
  },
  {
    id: "missing",
    kind: "missing",
    label: "Draft pages for 70 topics that have none",
    prompt: "Which topics have no page yet?",
  },
  {
    id: "retracted",
    kind: "retracted",
    label: "Check the pages that cite 5 retracted facts",
    prompt: "Which pages still cite a retracted fact?",
  },
];

export type WikiChatReply = {
  /** The pages it reads first, shown as "Reading" rows while it works. */
  reads: readonly string[];
  blocks: readonly MessageBlock[];
};

const REPLIES: Record<string, WikiChatReply> = {
  conflicts: {
    reads: ["Vantek Adhesives", "Brightwell", "Maya Chen"],
    blocks: [
      {
        kind: "paragraph",
        text: "There are **27** pairs of facts that disagree. The first is on **Vantek Adhesives**: an older fact keeps the old contact list, and a newer one names **Dana Nwosu** as the rep.",
      },
      {
        kind: "paragraph",
        text: "I'd keep the newer fact and retire the older one. Say the word and I'll do it, or open the page and check first.",
      },
    ],
  },
  missing: {
    reads: ["Topics", "Ops Assistant"],
    blocks: [
      {
        kind: "paragraph",
        text: "**70** of the wiki's 97 topics have no page yet, **Ops Assistant** among them. I can draft a page for any of them from the facts I already hold.",
      },
      { kind: "paragraph", text: "Which one first?" },
    ],
  },
  retracted: {
    reads: ["Retracted facts", "Brightwell", "CL rollout"],
    blocks: [
      {
        kind: "paragraph",
        text: "**5** facts have been retracted. I'll go through every page that still cites one and suggest what it should cite instead, one page at a time.",
      },
    ],
  },
};

const DEFAULT_REPLY: WikiChatReply = {
  reads: ["Wiki index", "Vantek Adhesives"],
  blocks: [
    {
      kind: "paragraph",
      text: "I read the pages that mention it and found nothing that disagrees. Ask me to open one of them, or to fix something on it.",
    },
  ],
};

/** The answer to a message: a suggestion's own, or the general one. */
export function wikiChatReply(prompt: string): WikiChatReply {
  const suggestion = WIKI_CHAT_SUGGESTIONS.find((s) => s.prompt === prompt);
  return (suggestion && REPLIES[suggestion.id]) ?? DEFAULT_REPLY;
}
