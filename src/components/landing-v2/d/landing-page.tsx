import { BriefCards } from "../a/brief-cards";
import { A11Y } from "../a/content";
import { FormatShowcase } from "../a/format-showcase";
import { TeamCards } from "../a/team-cards";
import { ClosingD } from "./closing";
import { Hero } from "./hero";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

// Landing v2, variant D: the short page. A centred hero, then three bands
// that each show the work rather than describe it (the formats, one job from
// brief to delivery, the team at work), then the dark closing. The sections A
// carries below those (the roster, a week, the use cases, the cost table, the
// control tiles, the stories and pricing) are not on D; /landing/a is where
// they still live.
//
// D owns the hero, the shell (header and footer, for its own home link and
// its own nav) and the closing band; the three bands between are A's
// components reading A's copy, on A's paper ground. Every one of them carries
// the same heading treatment: the display cut, flush on the container's left
// edge.
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
        <FormatShowcase />
        <BriefCards />
        <TeamCards />
        <ClosingD />
      </main>
      <SiteFooter />
    </div>
  );
}
