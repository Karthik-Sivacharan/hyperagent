// The views band's copy, in the shape every band on this page uses: an id,
// a two-tone heading, and the words for the control that changes what the
// panel shows. Words, plus the one list of codes the band cannot draw
// without: the ids of the runs the pictures show, the way `./roster-content`
// carries `toolIds`. The glyphs are React components and stay beside the
// markup in `./team-views.tsx`.

import { FLEET_RUNS } from "@/lib/mock/teams";

import type { Heading } from "../a/content";

// The band's own id, which the nav in `./content.ts` names and the section
// answers to as an anchor. It is here rather than there because `./content.ts`
// is the module both this file and the nav can see; putting it the other way
// round would close the import into a circle, the same reason `ROSTER_ID`
// sits where it does.
export const TEAM_VIEWS_ID = "views";

/** The four views, in the order the control puts them. */
export type TeamViewId = "board" | "list" | "org" | "office";

// `name` is the pill's label and `alt` is what a screen reader hears in place
// of the picture: the panel is a picture of the product rather than the
// product (see `./team-views.tsx`), so nothing inside it is in the
// accessibility tree and this line is the whole of what the view says.
//
// The annotation, rather than inference, is what makes a fifth view a type
// error until `./team-views.tsx` gives it a glyph.
const VIEWS: { id: TeamViewId; name: string; alt: string }[] = [
  {
    id: "board",
    name: "Board",
    alt: "The week as a board, one column per state, a card for each job in it.",
  },
  {
    id: "list",
    name: "List",
    alt: "The week as a list, grouped by state, one row for each job.",
  },
  {
    id: "org",
    name: "Org chart",
    alt: "The team as a chart, every agent under the one it reports to.",
  },
  {
    id: "office",
    name: "Office",
    alt: "The team as an office, every agent at a desk in its department.",
  },
];

// The claim is the one thing the four pictures cannot say for themselves:
// that they are the SAME week, and that choosing between them costs nothing.
// The line under it names all four in the order the control puts them, so a
// reader who never touches a tab still learns what the band holds.
export const TEAM_VIEWS = {
  id: TEAM_VIEWS_ID,
  heading: {
    title: "Manage the team the way you want.",
    sub: "The same week as a board, a list, an org chart, or the office floor.",
  } satisfies Heading,
  tabsLabel: "Views",
  views: VIEWS,
};

// The week the four pictures show, as ids into `src/lib/mock/teams.ts`. The
// /teams page runs twenty-four of these, which is a board five and six cards
// deep. The panel here is 576px tall and a card is about 120, so a column past
// five is mostly the fade under it. Sixteen is what leaves the busiest column
// one card into that fade and every other one clear of it: 3 needs you, 5
// working, 3 queued, 3 in review, 2 done.
//
// The TEAM is not cut with the work. All twelve agents stay, because the org
// chart draws a reporting line for each and the office seats each one at a
// desk, and an agent missing from either is a hole in the picture rather than
// a shorter list.
//
// Chosen so nothing in the band goes quiet, and the mock's own rule decides
// most of it: every working agent is on a working run or named in one's
// `helpers` (teams.ts). Keeping all three runs that are delegating right now
// (Atlas to three leads, Rook to Finch, Iris to Scout) covers seven of the
// eight and is also what the org chart draws as travelling edges and the
// office as a huddle; Echo is the eighth, so its own run stays too. Three runs
// wait on a person, which is the bubble over a head in the office and the
// first column of the board.
export const SHOWCASE_RUNS = [
  "RUN-221",
  "RUN-220",
  "RUN-219",
  "RUN-224",
  "RUN-223",
  "RUN-222",
  "RUN-227",
  "RUN-226",
  "RUN-217",
  "RUN-215",
  "RUN-214",
  "RUN-213",
  "RUN-212",
  "RUN-211",
  "RUN-209",
  "RUN-206",
];

/**
 * The runs themselves, derived once here rather than in the band, so the test
 * beside this file guards what the band actually hands the store.
 */
export const SHOWCASE_WEEK = FLEET_RUNS.filter((run) =>
  SHOWCASE_RUNS.includes(run.id),
);
