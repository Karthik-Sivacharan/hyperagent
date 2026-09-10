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

// `prompt` is what the composer is filled with when a card is picked, and it
// is written to the same test as the description: first person, the way you
// would actually brief someone on a Monday, and dead if you swap the role out
// from under it. The description is the shop window ("what is this"); the
// prompt is the brief ("go and do it"), so it names the artefacts — the Figma
// library, the coaches, the member app, the paywall — rather than restating
// the title in a longer form.
//
// All four are written to land on TWO lines at the composer's 720px measure
// (752 minus its 16px padding either side, 14px Geist), which is roughly 100
// characters a line. They run 183-196 characters, which is the middle of the
// two-line band rather than its edge: same line count for all four, so
// switching cards never changes the composer's height and nothing under it
// moves. Only the FIRST pick grows the box from one row to two, and the
// centred column settles by half that, once. A prompt short enough for one
// line or long enough for three breaks that.

export type SuggestedAgent = {
  id: string;
  name: string;
  description: string;
  /** What the composer is filled with when this card is picked. Two lines. */
  prompt: string;
  /** Settings-catalogue slugs. Two to five; the card shows three plus `+N`. */
  toolIds: string[];
};

export const SUGGESTED_AGENTS: SuggestedAgent[] = [
  {
    id: "design-system-drift",
    name: "Design system drift",
    description:
      "Checks merged front-end PRs against the Figma library and files what drifted.",
    prompt:
      "Go through the front-end PRs we merged this week, compare every component change against our Figma library, and open a Linear issue for each place the code and the design have drifted apart.",
    toolIds: ["figma", "github", "linear"],
  },
  {
    id: "release-notes",
    name: "Release notes from PRs",
    description:
      "Turns the week's merged PRs into release notes the coaching team can read.",
    prompt:
      "Turn this week's merged PRs into release notes our coaches can actually read: what changed in the member app, what it means for the clients they train, no ticket numbers and no engineering words.",
    toolIds: ["github", "linear", "google-docs", "slack"],
  },
  {
    id: "support-themes",
    name: "Support tickets into themes",
    description:
      "Clusters last week's member support email into product themes, worst first.",
    prompt:
      "Cluster last week's member support email into product themes, rank them by how many members hit each one, and tell me which two are design problems I could fix in the app this sprint.",
    toolIds: ["gmail", "google-sheets", "linear", "google-docs", "slack"],
  },
  {
    id: "competitor-teardown",
    name: "Competitor UI teardown",
    description:
      "Takes apart a rival fitness app's onboarding and paywall after each release.",
    prompt:
      "Walk a rival fitness app's onboarding and paywall on its latest release, capture every screen, and tell me where it asks a new member for less than we do before they see anything worth paying for.",
    toolIds: ["figma", "google-docs", "linear", "slack"],
  },
];
