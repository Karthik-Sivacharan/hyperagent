// "Suggested for you": the prompts the tray under the home composer offers
// (src/components/home/suggestion-tray.tsx). Static, like the rest of
// src/lib/mock/. The reference is the suggestion tray under a rival
// general-agent app's composer (measured live 2026-09-11): a header, a refresh, a dismiss and
// three cards, each a tool row over one line of task.
//
// The person they are for is the one the signup flow builds
// (signup-identity.ts): a design engineer at Trainwell, a fitness-coaching
// app. Every suggestion says which of three things it came from — the ROLE,
// the COMPANY, or the TOOLS that person works in — and which TOPIC it is, so
// the tray's Tune panel filters on real fields rather than decorating a
// fixed list. Order matters: the list is read three at a time, and each run
// of three mixes topics, so refresh never lands on three of a kind.
//
// `title` is the card, one or two lines at 13px; `prompt` is what lands in
// the composer, written the way a person would brief an agent. `tools` are
// ids in tool-logos.ts (or the integration catalogue); a suggestion that
// needs no tool draws a `glyph` instead, as the reference does.

export type SuggestionTopic = "design" | "code" | "research" | "writing" | "data" | "automations";
export type SuggestionSource = "role" | "company" | "tools";
export type SuggestionGlyph = "search" | "bell" | "message";

export type HomeSuggestion = {
  id: string;
  title: string;
  prompt: string;
  topic: SuggestionTopic;
  source: SuggestionSource;
  tools?: string[];
  glyph?: SuggestionGlyph;
};

export const SUGGESTION_TOPICS: { id: SuggestionTopic; label: string }[] = [
  { id: "design", label: "Design" },
  { id: "code", label: "Code" },
  { id: "research", label: "Research" },
  { id: "writing", label: "Writing" },
  { id: "data", label: "Data" },
  { id: "automations", label: "Automations" },
];

export const SUGGESTION_SOURCES: { id: SuggestionSource; label: string; detail: string }[] = [
  { id: "role", label: "Your role", detail: "Design engineer" },
  { id: "company", label: "Your company", detail: "Trainwell" },
  { id: "tools", label: "Your tools", detail: "Figma, GitHub, Linear, Slack and Notion" },
];

export const HOME_SUGGESTIONS: HomeSuggestion[] = [
  {
    id: "figma-drift",
    title: "Find where the Figma library has drifted from the code",
    prompt:
      "Compare our Figma component library against the React components in our GitHub repo. List every component whose props, variants or tokens have drifted, with a link to each side and a suggested fix.",
    topic: "design",
    source: "role",
    tools: ["figma", "github"],
  },
  {
    id: "pr-digest",
    title: "Post a weekly digest of merged pull requests to Slack",
    prompt:
      "Every Friday at 4pm, collect the pull requests merged into main that week, group them by area, and post a short digest to #design-eng in Slack.",
    topic: "automations",
    source: "tools",
    tools: ["github", "slack"],
  },
  {
    id: "fitness-onboarding",
    title: "Compare how five fitness apps onboard a new member",
    prompt:
      "Research how five leading fitness and personal-training apps onboard a new member, from download to first workout. Capture each flow as steps, and note what Trainwell could borrow.",
    topic: "research",
    source: "company",
    glyph: "search",
  },
  {
    id: "linear-changelog",
    title: "Turn this week's Linear updates into a changelog draft",
    prompt:
      "Read the Linear issues completed this week, write a customer-facing changelog in plain language, and save it as a draft page in Notion for review.",
    topic: "writing",
    source: "tools",
    tools: ["linear", "notion"],
  },
  {
    id: "review-themes",
    title: "Chart App Store review themes month by month",
    prompt:
      "Pull Trainwell's App Store reviews from the last six months, tag each one by theme (onboarding, workouts, billing, bugs), and chart the themes month by month in a Google Sheet.",
    topic: "data",
    source: "company",
    tools: ["app-store", "google-sheets"],
  },
  {
    id: "figma-comments",
    title: "Ping me in Slack when my Figma files get comments",
    prompt:
      "Watch the Figma files I own and send me a Slack DM whenever someone leaves a new comment, with the comment text and a link to the frame.",
    topic: "automations",
    source: "tools",
    tools: ["figma", "slack"],
  },
  {
    id: "hardcoded-tokens",
    title: "Find hard-coded colours that should be design tokens",
    prompt:
      "Scan our frontend repo on GitHub for hard-coded colours, spacing and radii that should use design tokens. Group the findings by file and propose the token for each.",
    topic: "code",
    source: "role",
    tools: ["github"],
  },
  {
    id: "contrast-audit",
    title: "Check every screen in a Figma file against WCAG contrast",
    prompt:
      "Go through every frame in a Figma file I share, check text and icon contrast against WCAG AA, and list each failure with its frame, layer and colours.",
    topic: "design",
    source: "role",
    tools: ["figma"],
  },
  {
    id: "tooling-brief",
    title: "Brief me on what changed in design-to-code tools this month",
    prompt:
      "Research what shipped in design-to-code and design-system tooling this month and write me a one-page brief: what changed, who it matters to, and whether any of it is worth trying.",
    topic: "research",
    source: "role",
    glyph: "search",
  },
  {
    id: "decisions-log",
    title: "Summarize long Slack threads into a decisions log",
    prompt:
      "Read the threads in #design-eng from the last two weeks, pull out every decision that was made, and add each to a Decisions log page in Notion with a link back to its thread.",
    topic: "writing",
    source: "tools",
    tools: ["slack", "notion"],
  },
  {
    id: "bug-sheet",
    title: "Build a sheet of open bugs by severity and owner",
    prompt:
      "Export every open bug in Linear into a Google Sheet with its severity, owner and age, sorted so the oldest high-severity bugs come first.",
    topic: "data",
    source: "tools",
    tools: ["linear", "google-sheets"],
  },
  {
    id: "competitor-watch",
    title: "Watch competitors' App Store listings and flag new features",
    prompt:
      "Check the App Store listings of Trainwell's five closest competitors every week and tell me when one ships a new feature, changes its screenshots or moves its price.",
    topic: "automations",
    source: "company",
    glyph: "bell",
  },
  {
    id: "signup-critique",
    title: "Write a design critique of our signup flow",
    prompt:
      "Walk through Trainwell's signup flow and write a design critique: where people might stall, what is unclear, and three changes ranked by effort against impact.",
    topic: "design",
    source: "company",
    glyph: "message",
  },
  {
    id: "pr-issue-links",
    title: "Link every open pull request to its Linear issue",
    prompt:
      "Go through the open pull requests in our GitHub repo, find the Linear issue each one belongs to and link the two; list any pull request that has no issue.",
    topic: "code",
    source: "tools",
    tools: ["github", "linear"],
  },
  {
    id: "library-proposal",
    title: "Draft a one-pager proposing a shared component library",
    prompt:
      "Draft a one-page proposal for a component library shared by design and engineering: the problem, the plan, what it costs and how we would measure it. Save it as a Google Doc.",
    topic: "writing",
    source: "role",
    tools: ["google-docs"],
  },
];
