import { Closing } from "../a/closing";
import { A11Y } from "../a/content";
import { Control } from "../a/control";
import { Formats } from "../a/formats";
import { Pricing } from "../a/pricing";
import { Receipts } from "../a/receipts";
import { Roster } from "../a/roster";
import { Stories } from "../a/stories";
import { UseCases } from "../a/use-cases";
import { Week } from "../a/week";
import { Hero } from "./hero";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

// Landing v2, variant D: variant A's page with a centred hero. D owns the
// hero and the shell (header and footer, for its own home link); every
// section below the hero is A's component reading A's copy, on A's paper
// ground.
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
