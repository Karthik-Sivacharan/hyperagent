import { SUGGESTED_AGENTS, type SuggestedAgent } from "@/lib/mock/suggested-agents";
import { SUGGESTED_SKILLS } from "@/lib/mock/suggested-skills";

// What the agent says after you press send on the signup chat step: one turn
// per suggested agent, plus one for a brief typed from scratch. Static, like
// every other file in this directory; `use-agent-stream.ts` plays it back at
// the product's tempo and `agent-turn.tsx` draws it.
//
// THE SHAPE IS THE PRODUCT'S, read off hyperagent.com on 2026-09-10
// (docs/reference/overlays/thread-streaming-live.html): reasoning with no
// visible text, then tool rows one after another, each a present participle
// plus a truncated parameter, then prose. The turn ends on a question, which
// is the product's "Waiting for your input" state, and the question is the
// skills card this flow unwired in a6b87b6 for not fitting the pre-send cell.
//
// HONEST ROWS ONLY, the rule research-signals.tsx set one screen earlier. At
// signup this account has connected nothing, so no row may claim to read a
// mailbox, a repo or a Figma file. What an agent can truthfully do in its first
// ten seconds is write its own instructions, look up public skills, and check
// which of its tools the account has connected — which is reading the
// account's own state, not anybody's data. The prose keeps the same line: it
// says what the agent WILL do and where its connectors live, never that it has
// already read something.
//
// THE PANEL IS STATIC, and the prose may only point at it where it is true.
// The agent panel always describes Design system drift (agent-config.ts), so
// that is the one turn allowed to say "under Connectors in the panel"; the
// other three name their tools and stop there, and a typed brief does not
// promise instructions the panel is not showing.
//
// Every string is written against the one record the flow resolves to
// (Karthik, Design Engineer at Trainwell) and against its agent's own brief,
// to the same test suggested-agents.ts sets: swap the role and the turn should
// stop making sense. No em dashes anywhere a reader sees.

/** The glyph a row carries. Names, not components: this file is data. */
export type StreamRowIcon = "reading" | "pencil" | "puzzle" | "plug" | "download";

export type StreamRow = {
  id: string;
  /** Present participle plus object, sentence case, no period. */
  label: string;
  /** The one parameter after the middot, as the product prints it. */
  detail: string;
  icon: StreamRowIcon;
  /** What lands after the detail once the row settles. */
  receipt?: { kind: "count"; text: string } | { kind: "tools"; toolIds: string[] };
};

/** Structurally the same as thread/streaming-message.tsx's StreamSegment. */
export type StreamSegment = { text: string; strong?: boolean };
export type StreamParagraph = StreamSegment[];

export type AgentScript = {
  /** Null for a hand-typed brief: there is no agent name to say yet. */
  agentName: string | null;
  rows: StreamRow[];
  prose: StreamParagraph[];
  /** The skills question, in the agent's own voice. */
  question: string;
};

// The skills row reads the same six skills the question card offers, so its
// count is that list's length and not a number typed twice.
const SKILLS_FOUND = `${SUGGESTED_SKILLS.length} found`;

function connectorsRow(agent: SuggestedAgent): StreamRow {
  return {
    id: "connectors",
    label: "Checking connectors",
    detail: agent.toolIds.map(toolLabel).join(", "),
    icon: "plug",
    receipt: { kind: "tools", toolIds: agent.toolIds },
  };
}

// The connector names as a reader would say them, for the row's parameter.
// The logo stack in the receipt carries the marks; this carries the words.
const TOOL_LABELS: Record<string, string> = {
  figma: "Figma",
  github: "GitHub",
  linear: "Linear",
  slack: "Slack",
  gmail: "Gmail",
  "google-docs": "Google Docs",
  "google-sheets": "Google Sheets",
};

function toolLabel(id: string): string {
  return TOOL_LABELS[id] ?? id;
}

function instructionsRow(name: string): StreamRow {
  return { id: "instructions", label: "Writing instructions", detail: name, icon: "pencil" };
}

function skillsRow(detail: string): StreamRow {
  return { id: "skills", label: "Searching skills", detail, icon: "puzzle", receipt: { kind: "count", text: SKILLS_FOUND } };
}

const QUESTION = "Which skills should it start with?";

const BY_AGENT: Record<string, (agent: SuggestedAgent) => AgentScript> = {
  // The default path, and the one the agent panel already describes: its
  // Instructions field is the thing the first row writes, and its Skills
  // section lists the three the question arrives with ticked.
  "design-system-drift": (agent) => ({
    agentName: agent.name,
    rows: [instructionsRow(agent.name), skillsRow("design systems, Figma, iOS"), connectorsRow(agent)],
    prose: [
      [
        { text: agent.name, strong: true },
        {
          text: " is set up. After every merge to main it compares the front-end changes against your Figma library and opens a Linear issue for each component that drifted, with the Figma node and the PR line side by side.",
        },
      ],
      [
        {
          text: "It works from Figma and GitHub and files to Linear; all three are under Connectors in the panel. One thing before its first run:",
        },
      ],
    ],
    question: QUESTION,
  }),
  "release-notes": (agent) => ({
    agentName: agent.name,
    rows: [instructionsRow(agent.name), skillsRow("design engineering, iOS"), connectorsRow(agent)],
    prose: [
      [
        { text: agent.name, strong: true },
        {
          text: " is set up. Each Friday it turns the week's merged PRs into notes on what changed in the member app, written for the coaches rather than for engineering: no ticket numbers, no jargon.",
        },
      ],
      [
        {
          text: "It reads GitHub and Linear, drafts in Google Docs and posts to Slack. One thing before its first run:",
        },
      ],
    ],
    question: QUESTION,
  }),
  "support-themes": (agent) => ({
    agentName: agent.name,
    rows: [instructionsRow(agent.name), skillsRow("design engineering, iOS"), connectorsRow(agent)],
    prose: [
      [
        { text: agent.name, strong: true },
        {
          text: " is set up. Every Monday it groups the past week's member support email into product themes, ranks them by how many members hit each one, and flags the ones a design change in the app could fix.",
        },
      ],
      [
        {
          text: "It reads from Gmail, keeps its tally in Google Sheets and files to Linear. One thing before its first run:",
        },
      ],
    ],
    question: QUESTION,
  }),
  "competitor-teardown": (agent) => ({
    agentName: agent.name,
    rows: [instructionsRow(agent.name), skillsRow("design engineering, iOS"), connectorsRow(agent)],
    prose: [
      [
        { text: agent.name, strong: true },
        {
          text: " is set up. When a rival fitness app ships a release, it walks the new onboarding and paywall, captures every screen, and marks where they ask a new member for less than Trainwell does.",
        },
      ],
      [
        {
          text: "It frames the screens in Figma, writes up in Google Docs and files to Linear. One thing before its first run:",
        },
      ],
    ],
    question: QUESTION,
  }),
};

/**
 * The turn for a brief typed from scratch. There is no agent to name and no
 * tool list to check, so the rows are the things that are true of any brief:
 * it was read, instructions were written from it, and the public skills were
 * searched for the question the turn ends on.
 */
function fallbackScript(brief: string): AgentScript {
  return {
    agentName: null,
    rows: [
      { id: "brief", label: "Reading your brief", detail: brief.trim().replace(/\s+/g, " "), icon: "reading" },
      instructionsRow("Your first agent"),
      skillsRow("design engineering, iOS"),
    ],
    prose: [
      [
        {
          text: "Got it. I've drafted an agent from that brief and written its first instructions. One thing before its first run:",
        },
      ],
    ],
    question: QUESTION,
  };
}

/** The turn for what was sent: the picked card's agent, or the typed brief. */
export function agentScriptFor(agentId: string | null, brief: string): AgentScript {
  const agent = agentId ? SUGGESTED_AGENTS.find((a) => a.id === agentId) : undefined;
  const build = agent ? BY_AGENT[agent.id] : undefined;
  return agent && build ? build(agent) : fallbackScript(brief);
}

// ===== THE ANSWER ==========================================================
//
// Answering the question is a message like any other, so it lands as a user
// bubble in the words a person would have typed, and the agent answers in one
// row and one sentence. Skill names stay in their own spelling: they are
// addresses on skills.sh, not phrases.

const SKILL_NAMES = new Map(SUGGESTED_SKILLS.map((skill) => [skill.id, skill.name]));

/** "a", "a and b", "a, b and c". */
function listOf(items: string[]): string {
  if (items.length < 2) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export type SkillsAnswer = { kind: "install"; ids: string[] } | { kind: "skip" };

/** What the reader "said" by pressing the card's button. */
export function answerText(answer: SkillsAnswer): string {
  if (answer.kind === "skip") return "Skip skills for now.";
  return `Install ${listOf(answer.ids.map((id) => SKILL_NAMES.get(id) ?? id))}.`;
}

export type AgentAck = { row: StreamRow | null; prose: StreamParagraph[] };

/** The agent's reply to that answer. */
export function ackFor(answer: SkillsAnswer, agentName: string | null): AgentAck {
  const subject: StreamSegment = agentName ? { text: agentName, strong: true } : { text: "Your agent" };
  if (answer.kind === "skip") {
    return {
      row: null,
      prose: [[{ text: "No skills for now. You can add them to " }, subject, { text: " at any time." }]],
    };
  }
  const count = answer.ids.length;
  const noun = count === 1 ? "skill" : "skills";
  return {
    row: { id: "install", label: "Installing skills", detail: `${count} ${noun}`, icon: "download" },
    prose: [[{ text: "Done. " }, subject, { text: ` has ${count} ${noun} and will use them from its first run.` }]],
  };
}
