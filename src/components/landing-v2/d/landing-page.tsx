import { BriefCards } from "../a/brief-cards";
import { A11Y } from "../a/content";
import { FormatShowcase } from "../a/format-showcase";
import { TeamCards } from "../a/team-cards";
import { AgentRoster } from "./agent-roster";
import { ClosingD } from "./closing";
import { Hero } from "./hero";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

// Landing v2, variant D: the short page. A centred hero, then four bands —
// the roster, which says who is on the team, and then three that show the
// work rather than describe it (the formats, one job from brief to delivery,
// the team at work) — and then the footer, which carries the page's two
// actions out of the dark ground. The sections A carries below those (its own
// roster, a week, the use cases, the cost table, the control tiles, the
// stories and pricing) are not on D; /landing/a is where they still live.
//
// D owns the hero, the roster and the shell (header and footer, for its own
// home link and its own nav); the three bands after the roster are A's
// components reading A's copy, on A's paper ground. Every one of them carries
// the same heading treatment: the display cut, flush on the container's left
// edge.
//
// The roster goes second because of what the hero leaves open. The hero names
// a team and shows the app; the reader's next question is who is on it, and
// the bands below each answer a different one. `NAV_D` names all four, so the
// header is an index of the page rather than of the page as it once was.
//
// The page ends on the closing band (`./closing`), which is where its one
// action is asked for below the hero. It was a full-bleed dark band and is
// now a panel on a masked smear gradient, so the page finishes on the same
// paper it opened on and the footer under it needs no change of ground.
//
// NOTHING ON THIS PAGE ANIMATES ON SCROLL. The bands used to fade and rise as
// the reader reached them, through a `Reveal` wrapper that held each one on
// the first frame of an animation until an observer said it had arrived. That
// is out, on the marketing rule that a page should not move because the reader
// scrolled: the motion is not something they asked for, it arrives while they
// are trying to read, and it costs the page a class of bug it should never
// have carried — a block held back by an observer is a block that can be left
// invisible, which is exactly what an in-page anchor used to do to every band
// it jumped over.
//
// What is left is motion a reader can account for: the hero window drawing
// itself once on arrival, and the two cursors on the team band, which move
// because the sentence they sit on is about work happening.
export function LandingPageD() {
  return (
    <div className="flex min-h-svh flex-col bg-surface-secondary text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-(--z-toast) focus:rounded-full focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-md"
      >
        {A11Y.skip}
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        <Hero />
        <AgentRoster />
        <FormatShowcase />
        <BriefCards />
        <TeamCards />
        <ClosingD />
      </main>
      <SiteFooter />
    </div>
  );
}
