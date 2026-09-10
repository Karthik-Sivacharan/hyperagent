// The four agents the flow offers once it knows who arrived. Static, like
// everything else in this directory: there is no model behind this screen, so
// the "hyperpersonalized" suggestions are written out in full, against the one
// identity `signup-identity.ts` resolves to — Karthik, Design Engineer at
// Trainwell (remote personal training, consumer fitness app).
//
// Written against that record on 2026-09-09, which is the point of the file.
// A generic four ("Summarize my email", "Draft a doc", "Research a topic")
// would prove nothing: the screen's whole claim is that it read the role and
// the company, so each of these has to be a job only a design engineer at a
// consumer fitness company actually has — design-system drift in a codebase
// with a Figma library behind it, release notes a coaching team rather than an
// engineering team will read, member support email clustered into product
// themes, a rival fitness app's paywall taken apart each release. Swap the
// role and all four should stop making sense; that is the test.
//
// `toolIds` are resolved by `src/components/signup/tool-icon-row.tsx` against
// two logo sources — the inline marks in `src/components/settings/
// integration-logos.tsx` first, then the artwork manifest in
// `./tool-logos.ts` for the gaps (Figma and Linear, which the settings
// catalogue does not carry). Ids are the settings catalogue's own slugs, so an
// agent's tool list and the integrations page name the same things.
//
// Counts run 3, 4, 5, 4 on purpose: the row shows three and folds the rest
// into a `+N`, so three of the four exercise the overflow and one shows the
// exact-fit case. Descriptions are cut to land inside two lines at the card's
// ~330px measure — about 80 characters, measured on screen, not guessed — so
// every card is the same height and none of them ends in an ellipsis. The
// card clamps at two anyway, so a longer one degrades instead of making a
// grid of cards ragged.

export type SuggestedAgent = {
  id: string;
  name: string;
  description: string;
  /** Settings-catalogue slugs. Two to five; the card shows three plus `+N`. */
  toolIds: string[];
};

export const SUGGESTED_AGENTS: SuggestedAgent[] = [
  {
    id: "design-system-drift",
    name: "Design system drift",
    description:
      "Checks merged front-end PRs against the Figma library and files what drifted.",
    toolIds: ["figma", "github", "linear"],
  },
  {
    id: "release-notes",
    name: "Release notes from PRs",
    description:
      "Turns the week's merged PRs into release notes the coaching team can read.",
    toolIds: ["github", "linear", "google-docs", "slack"],
  },
  {
    id: "support-themes",
    name: "Support tickets into themes",
    description:
      "Clusters last week's member support email into product themes, worst first.",
    toolIds: ["gmail", "google-sheets", "linear", "google-docs", "slack"],
  },
  {
    id: "competitor-teardown",
    name: "Competitor UI teardown",
    description:
      "Takes apart a rival fitness app's onboarding and paywall after each release.",
    toolIds: ["figma", "google-docs", "linear", "slack"],
  },
];
