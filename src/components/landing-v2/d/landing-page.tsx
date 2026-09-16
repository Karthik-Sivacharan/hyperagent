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
// the bands below each answer a different one. `NAV_D` is untouched: it names
// the three bands that were on the page when it was written, and adding a
// fourth link is a separate call about the header's density.
//
// The page ends on the closing band (`./closing`), which is where its one
// action is asked for below the hero. It was a full-bleed dark band and is
// now a panel on a masked smear gradient, so the page finishes on the same
// paper it opened on and the footer under it needs no change of ground.
export function LandingPageD() {
  return (
    <div className="flex min-h-svh flex-col bg-surface-secondary text-foreground">
      {/* The scroll entrances (../reveal) hold each band on the first frame of
          its animation until an observer reports it. With no JavaScript
          nothing ever reports one, so this hands every band its animation
          already running: the entrances play once, on load, and the page is
          whole rather than a column of held-back blocks. Under reduced motion
          there is no animation to hand out — the module's rules live in a
          `no-preference` query — so the rule is inert there. */}
      <noscript>
        <style>{"[data-reveal]{--reveal-play:running}"}</style>
      </noscript>
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
