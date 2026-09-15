// Variant D reads its copy from variant A (../a/content.ts) and adds only
// what its centred hero needs that A does not carry: the address of its own
// route for the wordmark, and the words of the pill above the headline.

import { LINKS as A_LINKS, STORIES, type LandingLink } from "../a/content";

export const LINKS = {
  ...A_LINKS,
  home: { label: A_LINKS.home.label, href: "/landing/d" },
} satisfies Record<string, LandingLink>;

// The pill over the headline. The page has no announcement to make yet, so
// it points at the published customer stories further down: the lead is the
// stories heading without its full stop, the link is the section's anchor.
// Swap both for a real announcement when there is one.
export const BADGE = {
  lead: "What teams got done",
  link: { label: "Read the stories", href: `#${STORIES.id}` },
} satisfies { lead: string; link: LandingLink };

// A names the hero picture "Browser window"; D draws it as an app window.
export const A11Y = {
  window: "App window",
};
