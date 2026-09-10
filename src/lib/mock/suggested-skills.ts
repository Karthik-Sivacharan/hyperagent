// The skills the flow offers once it has read the record and proposed the four
// agents. Static, like everything else in this directory.
//
// REAL SKILLS, real numbers. Every entry below is a published skill on
// skills.sh, read from its own page on 2026-09-10: the `name` and `repo` are
// the ones that address it (`skills.sh/<repo>/<name>`), the install count is
// the one the search list showed that day, and `summary` is the skill's own
// meta description cut to a row. Nothing here is invented, which is the point —
// a suggestion screen that lists plausible-sounding skills nobody can install
// is the one lie this flow has not told yet.
//
// The SELECTION is the invented part, and it is written to the same test
// suggested-agents.ts sets for itself: these six are the ones a design engineer
// at a consumer fitness app would actually want, and swapping the role should
// make the list stop making sense. Two are about taste and polish
// (`emil-design-eng`, `frontend-design`), two are about the surfaces this
// person ships (`apple-design` and `design-mobile-apps` — Trainwell is an iOS
// app delivered to members, not a web dashboard), one pairs with the "Design
// system drift" agent card already on screen (`extract-design-system`), and one
// is the review pass (`web-design-guidelines`). A GTM lead or a support manager
// would want none of them.
//
// Ordered by relevance to the record rather than by install count: the counts
// run 259.3K, 130.0K, 128.8K, 621.7K, 119.2K, 871.8K, which is deliberately not
// a ranking. A list sorted by popularity is a chart, and a chart is the thing
// this screen is trying not to be — the claim is "these fit you", and the
// biggest number in the set sits fifth from the top to keep that claim honest.
//
// `installs` is a string, not a number: it is a label read off the source, and
// rounding 871,800 to "871.8K" in the component would be inventing a precision
// the capture never had.

export type SuggestedSkill = {
  id: string;
  /** The skill's own name, as `skills.sh/<repo>/<name>` addresses it. */
  name: string;
  /** `owner/repo` on skills.sh. Shown as provenance, never as a link here. */
  repo: string;
  /** The skill's own description, cut to fit one row at the card's measure. */
  summary: string;
  /** Install count exactly as skills.sh printed it on the capture date. */
  installs: string;
  /** Why THIS record gets this skill. One clause, no period, lower case. */
  reason: string;
};

export const SUGGESTED_SKILLS: SuggestedSkill[] = [
  {
    id: "emil-design-eng",
    name: "emil-design-eng",
    repo: "emilkowalski/skills",
    summary: "UI polish, component design, animation, and the invisible details that make software feel good.",
    installs: "259.3K",
    reason: "the details your members feel but never name",
  },
  {
    id: "apple-design",
    name: "apple-design",
    repo: "emilkowalski/skills",
    summary: "Apple's approach to interface design and fluid, physical motion, translated for the web.",
    installs: "130.0K",
    reason: "your app lives on iOS first",
  },
  {
    id: "extract-design-system",
    name: "extract-design-system",
    repo: "arvindrk/extract-design-system",
    summary: "Extract design primitives from a public site and generate starter token files for a project.",
    installs: "128.8K",
    reason: "pairs with the design-system drift agent",
  },
  {
    id: "web-design-guidelines",
    name: "web-design-guidelines",
    repo: "vercel-labs/agent-skills",
    summary: "Review UI code against the Web Interface Guidelines — accessibility, UX and design audits.",
    installs: "621.7K",
    reason: "the review pass before a release",
  },
  {
    id: "design-mobile-apps",
    name: "design-mobile-apps",
    repo: "designed-by-ai/skills",
    summary: "Design mobile app screens and turn those designs into code.",
    installs: "119.2K",
    reason: "the member app is the product",
  },
  {
    id: "frontend-design",
    name: "frontend-design",
    repo: "anthropics/skills",
    summary: "Distinctive, intentional visual design when building new UI or reshaping an existing one.",
    installs: "871.8K",
    reason: "aesthetic direction that is not a template",
  },
];

// The three the flow pre-selects. A suggestion screen that arrives with nothing
// ticked asks the reader to do the work the screen claimed to have done; one
// that arrives with all six ticked is not a suggestion, it is a default nobody
// chose. Three is the set the copy can defend out loud, and the other three
// stay one click away.
export const PRESELECTED_SKILL_IDS = ["emil-design-eng", "apple-design", "extract-design-system"];
