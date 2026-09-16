import { Closing } from "./closing";
import { A11Y } from "./content";
import { Control } from "./control";
import { Formats } from "./formats";
import { Hero } from "./hero";
import { Pricing } from "./pricing";
import { Receipts } from "./receipts";
import { Roster } from "./roster";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { Stories } from "./stories";
import { UseCases } from "./use-cases";
import { Week } from "./week";

// Landing v2, variant A: the team first. A skip link, the header, the hero
// with one job running inside a browser window, the team as a message list,
// a week of reports, the use-case panel, what comes back, the cost table,
// the control tiles, the published stories, pricing, the dark closing band
// and the footer, all on one paper ground.
export function LandingPageA() {
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
        <Roster />
        <Week />
        <UseCases />
        <Formats />
        <Receipts />
        <Control />
        <Stories />
        <Pricing />
        <Closing />
      </main>
      <SiteFooter />
    </div>
  );
}
