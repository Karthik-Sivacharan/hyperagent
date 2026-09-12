// The agent configuration the right-hand panel edits. Static, like every other
// mock in this directory.
//
// WHERE THIS SHAPE COMES FROM. Two live products, read on 2026-09-10:
//
//   - A competitor's agent page keeps a ~550px panel open on the right by
//     DEFAULT, tabbed "Agent / Settings", with a Save. Its sections are flat
//     and always visible — Agent Preferences (model, system
//     prompt, self-updates), Triggers, Connectors, Skills, Knowledge Sources,
//     Subagents — and every one of them carries its own "+ Add" and its own
//     "AI managed" state on the header row. Nothing is behind an accordion.
//
//   - hyperagent.com's own panel (…/thread/<id>?panel=settings) is the same
//     information COLLAPSED: tabs "Configuration / Learning / Library / Usage"
//     over an accordion of Model & compute, Subagents, Autonomy & safety,
//     Capabilities (17 active · 1 overriding agent) and Visual, closed on
//     arrival and closed again on every visit.
//
// The panel follows the competitor. The reason is not novelty: on
// hyperagent.com the same model and the same tool list are ALSO reachable from
// the composer's settings pill and its "+" menu, so the config exists twice and
// the copy that is easiest to reach is the one that is hardest to see whole.
// A panel that opens closed is a panel that loses that race every time, which
// is why the duplicate menus grew in the first place. Open by default, one
// place.
//
// `aiManaged` is the competitor's idea and worth keeping: a section can be run
// by the agent itself ("AI Discovery: ON") rather than by hand, which is the
// honest answer to "why is this list empty" at the end of a signup flow:
// nothing is configured yet because nothing needs to be yet.

export type ConnectorStatus = "connected" | "available";

export type AgentConnector = {
  id: string;
  /** Settings-catalogue slug or tool-logos key, resolved by the tool row. */
  toolId: string;
  name: string;
  status: ConnectorStatus;
};

export type AgentSubagent = {
  id: string;
  name: string;
  blurb: string;
  model: string;
};

export type AgentTrigger = {
  id: string;
  label: string;
  detail: string;
};

export type AgentKnowledgeSource = {
  id: string;
  name: string;
  detail: string;
};

/**
 * A panel section's header state. `count` is the figure beside the title,
 * `aiManaged` the "AI Discovery: ON" pill the reference puts on the header row.
 */
export type SectionMeta = {
  id: string;
  title: string;
  /** The one-line "what is this for", shown when the section is empty. */
  empty: string;
  aiManagedLabel?: string;
  aiManaged?: boolean;
  addLabel?: string;
};

// The record the signup flow arrives with. Deliberately THIN: this is the
// panel ninety seconds after a Google button, so most of it is empty and the
// empty state is the product — a panel full of pre-filled settings nobody
// chose would be the same lie the research pass was written to avoid.
export const AGENT_CONFIG = {
  name: "Design system drift",
  blurb:
    "Checks merged front-end PRs against the Figma library and files what drifted.",
  // Model & compute. The composer's own pill shows the same two values today;
  // the panel is where they stop being a menu and become a setting.
  model: "Opus 5",
  modelTag: "Latest",
  modelNote: "Defaults from your account — changes apply to this agent only",
  reasoningEffort: "Medium" as "Low" | "Medium" | "High",
  reasoningBlurb: "Balanced",
  instructions:
    "You are the design-system reviewer for Trainwell's member app. After every merge to main, compare the front-end changes against the Figma library and file what drifted — component by component, with the Figma node and the PR line side by side. Prefer one issue per component over one issue per PR.",
  selfUpdates: true,
} as const;

export const AGENT_CONNECTORS: AgentConnector[] = [
  { id: "figma", toolId: "figma", name: "Figma", status: "connected" },
  { id: "github", toolId: "github", name: "GitHub", status: "connected" },
  { id: "linear", toolId: "linear", name: "Linear", status: "available" },
  { id: "slack", toolId: "slack", name: "Slack", status: "available" },
];

export const AGENT_SUBAGENTS: AgentSubagent[] = [
  {
    id: "self",
    name: "Design system drift (Me)",
    blurb: "Clones itself to review more than one repository at a time.",
    model: "Opus 5",
  },
];

export const AGENT_TRIGGERS: AgentTrigger[] = [
  { id: "merge", label: "On merge to main", detail: "trainwell/member-app" },
];

export const AGENT_KNOWLEDGE: AgentKnowledgeSource[] = [];

// Section headers, in the order the panel stacks them. Model first because it
// is the only one that is never empty; Skills and Connectors next because they
// are what the signup flow has just been talking about; the two that are empty
// at signup (Knowledge, Triggers) sit at the bottom where an empty row costs
// nothing.
export const PANEL_SECTIONS: SectionMeta[] = [
  { id: "model", title: "Model & compute", empty: "" },
  {
    id: "skills",
    title: "Skills",
    empty: "Nothing installed yet. The chat can add these for you.",
    aiManagedLabel: "AI skill editing",
    aiManaged: true,
    addLabel: "Add",
  },
  {
    id: "connectors",
    title: "Connectors",
    empty: "No tools connected yet.",
    aiManagedLabel: "AI discovery",
    aiManaged: true,
    addLabel: "Add",
  },
  {
    id: "knowledge",
    title: "Knowledge sources",
    empty: "Point the agent at a doc, a site or a repo it should always know.",
    addLabel: "Add",
  },
  {
    id: "subagents",
    title: "Subagents",
    empty: "No subagents. This agent works alone.",
    addLabel: "Add",
  },
  {
    id: "triggers",
    title: "Triggers",
    empty: "Runs only when you ask.",
    aiManagedLabel: "AI managed",
    aiManaged: true,
    addLabel: "Add",
  },
  {
    id: "autonomy",
    title: "Autonomy & safety",
    empty: "Ask before anything that leaves the building.",
  },
];

// The Learning tab (src/components/agent-panel/learning-tab.tsx). What the
// agent may learn, and what it has learned, which at signup is nothing: the
// Insights section is its empty line, because an agent that has never run has
// no insights to show and inventing some would be the research pass's lie.
// The four kinds and their modes are the live panel's
// (docs/reference/overlays/thread-panel-learning.html): memories and skills
// can be suggested or added automatically, agents and rubrics only suggested.
export type LearningTarget = {
  id: "memories" | "skills" | "agents" | "rubrics";
  label: string;
  suggest: boolean;
  /** Absent where the kind can only be suggested, never added on its own. */
  auto?: boolean;
};

export const LEARNING_TARGETS: LearningTarget[] = [
  { id: "memories", label: "Memories", suggest: true, auto: false },
  { id: "skills", label: "Skills", suggest: true, auto: false },
  { id: "agents", label: "Agents", suggest: true },
  { id: "rubrics", label: "Rubrics", suggest: true },
];

export const LEARNING_CONFIG = {
  discoverKnowledge: true,
  model: "Opus 5",
};

export const LEARNING_SECTIONS: [SectionMeta, SectionMeta, SectionMeta] = [
  { id: "knowledge", title: "Knowledge", empty: "" },
  { id: "generation", title: "Generation", empty: "" },
  {
    id: "insights",
    title: "Insights",
    empty: "Nothing learned yet. After each run, what it picks up about your work lands here for you to approve.",
  },
];
