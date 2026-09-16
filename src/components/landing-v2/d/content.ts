// Variant D reads its copy from variant A (../a/content.ts) and adds only
// what its centred hero needs that A does not carry: the address of its own
// route for the wordmark, and its own headline, lede and first action.

import {
  BRIEF_CARDS,
  FORMATS,
  LINKS as A_LINKS,
  TEAM_CARDS,
  type LandingLink,
} from "../a/content";

export const LINKS = {
  ...A_LINKS,
  home: { label: A_LINKS.home.label, href: "/landing/d" },
} satisfies Record<string, LandingLink>;

// The roster band's own id, defined here rather than in `./roster-content`
// because the nav below has to name it and that module already reads this one.
// Putting it the other way round would close the import into a circle.
export const ROSTER_ID = "agents";

// D is a shorter page than A: the hero, the roster, the formats, the three
// stages of one job, the team cards and the closing band. A's NAV and FOOTER
// point at the sections D does not carry, so D keeps its own, in the order the
// page reads.
//
// Every band the page has is named here, which is the point of the list: a
// reader who opens the nav should see the shape of the whole page, and a link
// missing from it is a section they have no way to reach. The roster was the
// one gap — it was added to the page after this list was written.
//
// The closing band is deliberately NOT on it. It is the page's last call to
// action rather than a section of argument, and the two buttons in the header
// already go where it goes; a nav link to it would be a third copy of the same
// destination dressed as navigation.
//
// Four is also the ceiling the header can carry. The row is the wordmark, the
// links and two actions on one 64px line, and it only draws the links from
// `lg`; a fifth would start crowding the actions at 1024.
export const NAV_D: LandingLink[] = [
  { label: "Agents", href: `#${ROSTER_ID}` },
  { label: "Formats", href: `#${FORMATS.id}` },
  { label: "How it works", href: `#${BRIEF_CARDS.id}` },
  { label: "Your team", href: `#${TEAM_CARDS.id}` },
];

export const FOOTER_D = {
  groups: [
    { title: "Product", links: NAV_D },
    { title: "Account", links: [LINKS.logIn, LINKS.start] },
  ] satisfies { title: string; links: LandingLink[] }[],
};

// D's closing band. A's fine print sells the plan ladder; D never names a
// price, on the hero or here, so the line says what the next two minutes
// look like instead and still ends on the refrain the agents say themselves.
export const CLOSING_D = {
  heading: "Hire your first agent today.",
  fine: "Name the job and set the schedule. Nothing goes out until you say so.",
};

// D's headline, lede and first action, in place of A's hero copy. The
// title is the owner's; the glyph sits after `glyphAfter`. The lede says
// what the team does in two short sentences and names no price or plan.
export const HERO_D = {
  title: "Team of agents that ship real work",
  glyphAfter: "agents",
  description:
    "Set up agents that work together in the tools you already use. They follow your team's style and get the job done.",
  primary: "Launch agents",
};

// A names the hero picture "Browser window"; D draws it as an app window
// whose only live part is the list of agents.
export const A11Y = {
  window: "Product demo",
  agents: "Demo agents",
};

// The person signed in to the demo app. Fictional; the address is on the
// domain reserved for examples.
export const DEMO_USER = {
  name: "Jordan Lee",
  email: "jordan@example.com",
  initials: "JL",
  avatarUrl: "https://github.com/maxleiter.png",
};

// The words the demo app's own chrome shows around the agent list.
export const DEMO_CHROME = {
  brand: "Hyperagent",
  actions: ["New thread", "Search", "Inbox"],
  agents: "Agents",
  recent: "Recent threads",
  resources: "Resources",
  followUp: "Add a follow-up…",
  model: "Auto",
};
