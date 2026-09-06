// The conversation behind each thread, as the live account showed it on
// 2026-09-06 (docs/reference/pages/thread-detail.html). Static for the clone.
//
// Assistant text is markdown on the site. The mock keeps the raw strings and
// marks bold runs with **double asterisks**; `src/components/thread/rich-text.tsx`
// turns those into <strong> without a markdown library.

export type MessageBlock =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string };

export type OptionCardIcon = "bot" | "network" | "message-circle-question-mark" | "openclaw";

export type OptionCard = {
  id: string;
  icon: OptionCardIcon;
  title: string;
  description: string;
  /** The option the user picked (highlighted border, full opacity). */
  selected?: boolean;
};

export type ConversationItem =
  | { role: "assistant"; id: string; blocks: MessageBlock[] }
  /** A tool-rendered block: the "four paths" option cards. */
  | { role: "options"; id: string; cards: OptionCard[] }
  | {
      role: "user";
      id: string;
      text: string;
      /** Count shown in the meta line ("1 knowledge hint"). */
      knowledgeHints: number;
      /** Timestamp label exactly as the site renders it. */
      sentAtLabel: string;
    };

export type Conversation = {
  threadId: string;
  status: "live";
  model: string;
  /** Thread accent: the user bubble, the mode pill and the send button are tinted with it. */
  accent: {
    bubble: string;
    send: string;
    sendForeground: string;
  };
  items: ConversationItem[];
};

const welcomeConversation: Conversation = {
  threadId: "cmtlsm8nk0sn207ad13p8bpou",
  status: "live",
  model: "Opus 5",
  accent: {
    bubble: "rgb(3, 21, 48)",
    send: "rgb(42, 67, 102)",
    sendForeground: "rgb(255, 255, 255)",
  },
  items: [
    {
      role: "assistant",
      id: "cmtlsm8pz0j8p07adihhpyogn",
      blocks: [
        { kind: "heading", text: "Let's get to work." },
        { kind: "paragraph", text: "I'm **Hyperagent**, I can research, build, or analyze whatever you need." },
        {
          kind: "paragraph",
          text: "Here are a few ways we could go. Pick the one that feels most useful, or just tell me what you need.",
        },
      ],
    },
    {
      role: "options",
      id: "synth_msg_four_paths_cmtlsm8nk0sn207ad13p8bpou",
      cards: [
        {
          id: "personal-agent",
          icon: "bot",
          title: "Build your personal agent",
          description: "Set it up once to handle recurring tasks so you don't have to.",
        },
        {
          id: "team",
          icon: "network",
          title: "Hire a team of agents",
          description: "Assign specialized agents to different workflows that will run in parallel.",
        },
        {
          id: "interview",
          icon: "message-circle-question-mark",
          title: "Let me interview you",
          description: "Share a few details. I'll dig in and figure out where I'll be most useful.",
          selected: true,
        },
        {
          id: "openclaw",
          icon: "openclaw",
          title: "Import from OpenClaw",
          description: "Bring your workspace over and get your agent back in one click.",
        },
      ],
    },
    {
      role: "user",
      id: "cmtnrb28g00ah07ad9wmefj7m",
      text: "Let me interview you",
      knowledgeHints: 1,
      sentAtLabel: "9/4/26 · 7:21 PM",
    },
    {
      role: "assistant",
      id: "cmtnrb5wu006507adpef1utxl",
      blocks: [
        {
          kind: "paragraph",
          text: "I'm **Hyperagent**. The more you teach me about your world, the more I can handle for you — and everything compounds across every future conversation. What's your name, and what company are you at?",
        },
      ],
    },
  ],
};

export const conversations: Record<string, Conversation> = {
  [welcomeConversation.threadId]: welcomeConversation,
};

export function getConversation(threadId: string): Conversation | undefined {
  return conversations[threadId];
}
