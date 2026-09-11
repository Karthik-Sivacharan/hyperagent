// One populated team for /teams: Growth Ops, its three people, its twelve
// named agents and the runs they are on this week. Static, like every other
// mock in this directory: no clock, no randomness, every relative time is a
// pre-baked string, so the server render and the client render agree.
//
// WHERE THIS SHAPE COMES FROM. Three products, read on 2026-09-10
// (docs/research/09-agent-orchestration-ux.md in the main checkout):
//
//   - Devin Desktop's Sessions board sorts work by what the human owes next
//     (Running / Waiting for review / Done), not by agent or model. `RunStatus`
//     is that idea with the two states Devin folds away made explicit: a run
//     that is blocked on a person ("needs-you", Claude Code's "Needs input",
//     Antigravity's "User Review Required") and one that has not started
//     ("queued"). RUN_STATUS_ORDER puts the human's debt first.
//
//   - Linear for Agents keeps the person as the assignee when work is
//     delegated to an agent; the agent sits nested under them. So every run
//     carries both `agentId` (who does it) and `ownerId` (who answers for
//     it), and every agent has an accountable `ownerId` of its own.
//
//   - Paperclip draws its agents as an org chart with titles, reporting lines
//     and monthly budgets, and gives each one a dashboard with run activity
//     and a success rate. `parentId`, `role`, `spend` / `budget` and `score`
//     are those fields. `helpers` on a working run names the sub-agents it has
//     handed work to right now, which is what the org view draws as a live
//     edge (Relevance AI's workforce canvas animates the same handoff).
//
// THE FLEET. Atlas, the chief of staff, reports to the team and routes work
// to four leads (research, outbound, content, finance ops), each with one or
// two specialists. Hue is the department: research runs blue, outbound
// rose, content green, finance gold, Atlas violet, so a branch of the org
// chart reads as one family at a glance. No agent sits in 10-55, the band
// the tangerine accent and the destructive red own. Each agent wears a glyph
// for its job (`glyph`, drawn by agent-avatar.tsx), unique across the fleet
// and never the same silhouette twice inside one department.
//
// The states are chosen so every view has something to show: eight agents
// working, two idle (Mosaic, Ledger), Gauge paused at its monthly cap, and
// Tally in error because its Stripe connection expired, which is also why
// one of the four "needs you" runs exists. Every working agent is either on
// a working run of its own or listed in a working run's `helpers`.
//
// THE RUNS. 24 of them, 3-6 per status: 4 needs you, 6 working, 4 queued,
// 4 in review, 6 done. Business deliverables, not code. `needs` is set on
// every needs-you run (the one line that says what the person has to do),
// `outcome` on every review and done run (the receipt), `progress` on queued
// and working runs (steps), and `helpers` on three working runs. Queued runs
// carry the few cents and the minute their planning pass cost. Ids leave gaps
// (202, 205, 207) the way a shared counter does when other teams use it.

export type RunStatus = "queued" | "working" | "needs-you" | "review" | "done";
export type AgentState = "working" | "idle" | "paused" | "error";
export type RunTrigger = "thread" | "slack" | "schedule" | "email" | "webhook" | "agent";

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  online: boolean;
}

/**
 * The pictogram an agent wears in its avatar, a key into agent-avatar.tsx's
 * Tabler map. The first twelve are the fleet's jobs; the rest are abstract
 * marks the avatar falls back on (by a hash of the id) when none was picked.
 */
export type AgentGlyph =
  | "compass"
  | "eye"
  | "binoculars"
  | "chart-line"
  | "speakerphone"
  | "list-search"
  | "mail"
  | "feather"
  | "headphones"
  | "presentation"
  | "report-money"
  | "credit-card-refund"
  | "hexagon"
  | "atom"
  | "planet"
  | "anchor"
  | "cube"
  | "diamond"
  | "leaf"
  | "prism";

export interface FleetAgent {
  id: string;
  name: string;
  role: string;
  /** OKLCH hue 0-360 for the avatar orb. */
  hue: number;
  /** The avatar's pictogram; when absent the avatar picks a stable abstract mark from the id. */
  glyph?: AgentGlyph;
  model: string;
  /** The agent it reports to; null = reports to the team. */
  parentId: string | null;
  /** Accountable human (TeamMember.id). */
  ownerId: string;
  state: AgentState;
  /** The live line while working; the reason while paused or in error. */
  activity?: string;
  /** USD this month. */
  spend: number;
  /** USD monthly cap. */
  budget: number;
  /** Average rubric score, 0-100. */
  score: number;
  runsThisWeek: number;
  skills: string[];
}

export interface FleetRun {
  id: string;
  title: string;
  /** The agent doing the work. */
  agentId: string;
  /** The human accountable for it. */
  ownerId: string;
  status: RunStatus;
  trigger: RunTrigger;
  project: string;
  /** Steps, for queued and working runs. */
  progress?: { done: number; total: number };
  /** Only on needs-you runs: what the person has to do. */
  needs?: string;
  /** On review and done runs: what the run produced. */
  outcome?: string;
  /** Pre-baked relative time. */
  updated: string;
  /** USD so far. */
  cost: number;
  /** Run time so far, in minutes. */
  minutes: number;
  /** Sub-agent ids it has delegated to right now (drives the live org edges). */
  helpers?: string[];
}

export interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
}

export const TEAM: Team = {
  id: "t-growth-ops",
  name: "Growth Ops",
  description: "The agents that fill the pipeline, ship the launch content and close the books.",
  members: [
    { id: "m-karthik", name: "Karthik Sivacharan", initials: "KS", role: "Founder", online: true },
    { id: "m-diego", name: "Diego Alvarez", initials: "DA", role: "Head of growth", online: true },
    { id: "m-sam", name: "Sam Whitfield", initials: "SW", role: "Finance and ops", online: false },
  ],
};

export const FLEET_AGENTS: FleetAgent[] = [
  // The orchestrator.
  {
    id: "a-atlas",
    name: "Atlas",
    role: "Chief of staff",
    hue: 285,
    glyph: "compass",
    model: "Opus 5",
    parentId: null,
    ownerId: "m-karthik",
    state: "working",
    activity: "Collecting inputs from three leads for the growth review",
    spend: 212.4,
    budget: 300,
    score: 91,
    runsThisWeek: 38,
    skills: ["Delegation", "Weekly planning", "Status reports", "Slack"],
  },

  // Research.
  {
    id: "a-iris",
    name: "Iris",
    role: "Research lead",
    hue: 220,
    glyph: "eye",
    model: "Opus 5",
    parentId: "a-atlas",
    ownerId: "m-karthik",
    state: "working",
    activity: "Merging Scout's findings into the week 37 digest",
    spend: 118.75,
    budget: 200,
    score: 89,
    runsThisWeek: 16,
    skills: ["Market research", "Synthesis", "Interview notes"],
  },
  {
    id: "a-scout",
    name: "Scout",
    role: "Competitor watcher",
    hue: 195,
    glyph: "binoculars",
    model: "Gemini 3.8 Flash",
    parentId: "a-iris",
    ownerId: "m-karthik",
    state: "working",
    activity: "Reading 14 competitor changelogs",
    spend: 36.2,
    budget: 80,
    score: 84,
    runsThisWeek: 22,
    skills: ["Web browsing", "Changelog tracking", "Pricing pages"],
  },
  {
    id: "a-gauge",
    name: "Gauge",
    role: "Market analyst",
    hue: 245,
    glyph: "chart-line",
    model: "Fable 5.1",
    parentId: "a-iris",
    ownerId: "m-karthik",
    state: "paused",
    activity: "Paused at its $80 monthly budget",
    spend: 80,
    budget: 80,
    score: 87,
    runsThisWeek: 6,
    skills: ["Market sizing", "Spreadsheets", "Survey analysis"],
  },

  // Outbound.
  {
    id: "a-rook",
    name: "Rook",
    role: "Outbound lead",
    hue: 330,
    glyph: "speakerphone",
    model: "Sonnet 5",
    parentId: "a-atlas",
    ownerId: "m-diego",
    state: "working",
    activity: "Scoring 50 fintech prospects against the ICP",
    spend: 142.1,
    budget: 200,
    score: 86,
    runsThisWeek: 19,
    skills: ["Prospecting", "Sequencing", "HubSpot"],
  },
  {
    id: "a-finch",
    name: "Finch",
    role: "Prospect researcher",
    hue: 305,
    glyph: "list-search",
    model: "GPT 5.6 Terra",
    parentId: "a-rook",
    ownerId: "m-diego",
    state: "working",
    activity: "Enriching prospect 31 of 50",
    spend: 58.35,
    budget: 100,
    score: 82,
    runsThisWeek: 27,
    skills: ["Enrichment", "LinkedIn research", "ICP scoring"],
  },
  {
    id: "a-echo",
    name: "Echo",
    role: "Email copywriter",
    hue: 350,
    glyph: "mail",
    model: "Sonnet 5",
    parentId: "a-rook",
    ownerId: "m-diego",
    state: "working",
    activity: "Writing nurture email 2 of 4",
    spend: 44.9,
    budget: 80,
    score: 79,
    runsThisWeek: 24,
    skills: ["Cold email", "Nurture sequences", "Subject line tests"],
  },

  // Content.
  {
    id: "a-quill",
    name: "Quill",
    role: "Content lead",
    hue: 150,
    glyph: "feather",
    model: "Opus 5",
    parentId: "a-atlas",
    ownerId: "m-diego",
    state: "working",
    activity: "Drafting the pricing FAQ, section 3 of 5",
    spend: 96.6,
    budget: 150,
    score: 90,
    runsThisWeek: 14,
    skills: ["Launch copy", "Brand voice", "Editing"],
  },
  {
    id: "a-cadence",
    name: "Cadence",
    role: "Podcast producer",
    hue: 125,
    glyph: "headphones",
    model: "Sonnet 5",
    parentId: "a-quill",
    ownerId: "m-diego",
    state: "working",
    activity: "Cutting clip 4 of 6 from episode 11",
    spend: 71.25,
    budget: 120,
    score: 85,
    runsThisWeek: 9,
    skills: ["Podcast editing", "Show notes", "Clip cutting"],
  },
  {
    id: "a-mosaic",
    name: "Mosaic",
    role: "Deck designer",
    hue: 170,
    glyph: "presentation",
    model: "GPT-6 Astra",
    parentId: "a-quill",
    ownerId: "m-karthik",
    state: "idle",
    spend: 52.8,
    budget: 100,
    score: 88,
    runsThisWeek: 7,
    skills: ["Slide design", "Charts", "Brand kit"],
  },

  // Finance ops.
  {
    id: "a-ledger",
    name: "Ledger",
    role: "Finance ops lead",
    hue: 80,
    glyph: "report-money",
    model: "Opus 5",
    parentId: "a-atlas",
    ownerId: "m-sam",
    state: "idle",
    spend: 64.15,
    budget: 150,
    score: 93,
    runsThisWeek: 11,
    skills: ["Month-end close", "Board metrics", "Data rooms"],
  },
  {
    id: "a-tally",
    name: "Tally",
    role: "Refunds and disputes",
    hue: 100,
    glyph: "credit-card-refund",
    model: "Sonnet 5",
    parentId: "a-ledger",
    ownerId: "m-sam",
    state: "error",
    activity: "Stripe connection expired",
    spend: 22.4,
    budget: 60,
    score: 81,
    runsThisWeek: 31,
    skills: ["Stripe", "Refund triage", "Dispute evidence"],
  },
];

export const RUN_STATUS_ORDER: RunStatus[] = ["needs-you", "working", "queued", "review", "done"];

// Grouped in RUN_STATUS_ORDER, newest first inside each group.
export const FLEET_RUNS: FleetRun[] = [
  // Needs you.
  {
    id: "RUN-221",
    title: "Cold sequence: fintech founders, wave 1",
    agentId: "a-echo",
    ownerId: "m-diego",
    status: "needs-you",
    trigger: "agent",
    project: "Pipeline",
    needs: "Approve sending 42 emails",
    updated: "4m ago",
    cost: 3.88,
    minutes: 15,
  },
  {
    id: "RUN-220",
    title: "Podcast launch kit, episode 12",
    agentId: "a-cadence",
    ownerId: "m-diego",
    status: "needs-you",
    trigger: "slack",
    project: "Content engine",
    needs: "Pick one of three cover art directions",
    updated: "7m ago",
    cost: 4.75,
    minutes: 22,
  },
  {
    id: "RUN-219",
    title: "Refund triage: 17 disputed charges",
    agentId: "a-tally",
    ownerId: "m-sam",
    status: "needs-you",
    trigger: "webhook",
    project: "Month-end close",
    needs: "Reconnect Stripe so Tally can resume",
    updated: "12m ago",
    cost: 1.12,
    minutes: 9,
  },
  {
    id: "RUN-218",
    title: "Investor update, August",
    agentId: "a-atlas",
    ownerId: "m-karthik",
    status: "needs-you",
    trigger: "schedule",
    project: "Series A prep",
    needs: "Confirm August burn: $182k or $191k",
    updated: "25m ago",
    cost: 6.4,
    minutes: 38,
  },

  // Working.
  {
    id: "RUN-224",
    title: "Weekly growth review, week 37",
    agentId: "a-atlas",
    ownerId: "m-karthik",
    status: "working",
    trigger: "schedule",
    project: "Operating rhythm",
    progress: { done: 2, total: 6 },
    updated: "just now",
    cost: 5.2,
    minutes: 19,
    helpers: ["a-iris", "a-rook", "a-quill"],
  },
  {
    id: "RUN-223",
    title: "50 Series A fintech prospects",
    agentId: "a-rook",
    ownerId: "m-diego",
    status: "working",
    trigger: "thread",
    project: "Pipeline",
    progress: { done: 3, total: 5 },
    updated: "just now",
    cost: 7.85,
    minutes: 46,
    helpers: ["a-finch"],
  },
  {
    id: "RUN-222",
    title: "Weekly competitor digest, week 37",
    agentId: "a-iris",
    ownerId: "m-karthik",
    status: "working",
    trigger: "schedule",
    project: "Market intel",
    progress: { done: 6, total: 9 },
    updated: "1m ago",
    cost: 3.1,
    minutes: 21,
    helpers: ["a-scout"],
  },
  {
    id: "RUN-227",
    title: "Launch week clips from episode 11",
    agentId: "a-cadence",
    ownerId: "m-diego",
    status: "working",
    trigger: "agent",
    project: "Content engine",
    progress: { done: 4, total: 6 },
    updated: "2m ago",
    cost: 2.9,
    minutes: 26,
  },
  {
    id: "RUN-225",
    title: "Q3 launch narrative and FAQ",
    agentId: "a-quill",
    ownerId: "m-karthik",
    status: "working",
    trigger: "thread",
    project: "Q3 launch",
    progress: { done: 5, total: 8 },
    updated: "3m ago",
    cost: 4.6,
    minutes: 33,
  },
  {
    id: "RUN-226",
    title: "Nurture emails for webinar signups",
    agentId: "a-echo",
    ownerId: "m-diego",
    status: "working",
    trigger: "webhook",
    project: "Pipeline",
    progress: { done: 2, total: 4 },
    updated: "5m ago",
    cost: 1.35,
    minutes: 8,
  },

  // Queued.
  {
    id: "RUN-217",
    title: "Pricing page teardown: 6 competitors",
    agentId: "a-scout",
    ownerId: "m-karthik",
    status: "queued",
    trigger: "thread",
    project: "Market intel",
    progress: { done: 0, total: 6 },
    updated: "2m ago",
    cost: 0.48,
    minutes: 1,
  },
  {
    id: "RUN-216",
    title: "Merge 212 duplicate HubSpot contacts",
    agentId: "a-finch",
    ownerId: "m-diego",
    status: "queued",
    trigger: "schedule",
    project: "Pipeline",
    progress: { done: 0, total: 4 },
    updated: "18m ago",
    cost: 0.4,
    minutes: 1,
  },
  {
    id: "RUN-215",
    title: "Market sizing: SMB payroll in LATAM",
    agentId: "a-gauge",
    ownerId: "m-karthik",
    status: "queued",
    trigger: "thread",
    project: "Series A prep",
    progress: { done: 0, total: 7 },
    updated: "1h ago",
    cost: 0.42,
    minutes: 1,
  },
  {
    id: "RUN-214",
    title: "September close checklist",
    agentId: "a-ledger",
    ownerId: "m-sam",
    status: "queued",
    trigger: "schedule",
    project: "Month-end close",
    progress: { done: 0, total: 12 },
    updated: "3h ago",
    cost: 0.55,
    minutes: 2,
  },

  // In review.
  {
    id: "RUN-213",
    title: "LinkedIn posts for launch week",
    agentId: "a-quill",
    ownerId: "m-diego",
    status: "review",
    trigger: "slack",
    project: "Q3 launch",
    outcome: "5 posts, 2 variants each",
    updated: "40m ago",
    cost: 2.35,
    minutes: 17,
  },
  {
    id: "RUN-212",
    title: "Series A data room index",
    agentId: "a-ledger",
    ownerId: "m-sam",
    status: "review",
    trigger: "thread",
    project: "Series A prep",
    outcome: "Index, 64 documents in 9 folders",
    updated: "1h ago",
    cost: 8.9,
    minutes: 52,
  },
  {
    id: "RUN-211",
    title: "Q3 launch deck",
    agentId: "a-mosaic",
    ownerId: "m-karthik",
    status: "review",
    trigger: "agent",
    project: "Q3 launch",
    outcome: "Deck, 14 slides",
    updated: "2h ago",
    cost: 11.3,
    minutes: 64,
  },
  {
    id: "RUN-210",
    title: "Churn interview synthesis",
    agentId: "a-iris",
    ownerId: "m-karthik",
    status: "review",
    trigger: "email",
    project: "Market intel",
    outcome: "Memo, 6 themes and 23 quotes",
    updated: "3h ago",
    cost: 5.6,
    minutes: 41,
  },

  // Done.
  {
    id: "RUN-209",
    title: "Enrich inbound webinar leads",
    agentId: "a-finch",
    ownerId: "m-diego",
    status: "done",
    trigger: "webhook",
    project: "Pipeline",
    outcome: "38 leads added to HubSpot",
    updated: "yesterday",
    cost: 1.9,
    minutes: 12,
  },
  {
    id: "RUN-208",
    title: "Webinar follow-up sequence",
    agentId: "a-echo",
    ownerId: "m-diego",
    status: "done",
    trigger: "thread",
    project: "Pipeline",
    outcome: "3 emails, 61% opened",
    updated: "yesterday",
    cost: 1.45,
    minutes: 11,
  },
  {
    id: "RUN-206",
    title: "Stripe payout reconciliation, August",
    agentId: "a-tally",
    ownerId: "m-sam",
    status: "done",
    trigger: "schedule",
    project: "Month-end close",
    outcome: "412 payouts matched, 3 flagged",
    updated: "2d ago",
    cost: 4.2,
    minutes: 27,
  },
  {
    id: "RUN-204",
    title: "Weekly competitor digest, week 36",
    agentId: "a-scout",
    ownerId: "m-karthik",
    status: "done",
    trigger: "schedule",
    project: "Market intel",
    outcome: "Digest, 11 changes flagged",
    updated: "3d ago",
    cost: 2.05,
    minutes: 16,
  },
  {
    id: "RUN-203",
    title: "Podcast episode 11 edit",
    agentId: "a-cadence",
    ownerId: "m-diego",
    status: "done",
    trigger: "agent",
    project: "Content engine",
    outcome: "Episode, 42 minutes",
    updated: "3d ago",
    cost: 24.1,
    minutes: 128,
  },
  {
    id: "RUN-201",
    title: "Board meeting pre-read",
    agentId: "a-atlas",
    ownerId: "m-karthik",
    status: "done",
    trigger: "thread",
    project: "Series A prep",
    outcome: "Pre-read, 6 pages",
    updated: "4d ago",
    cost: 18.6,
    minutes: 95,
  },
];
