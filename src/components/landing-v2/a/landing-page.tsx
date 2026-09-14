import { ClosingSection } from "@/components/landing/closing-section";

import { A11Y } from "./content";
import { Control } from "./control";
import { Formats } from "./formats";
import { Hero } from "./hero";
import { Pricing } from "./pricing";
import { Receipts } from "./receipts";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { UseCases } from "./use-cases";

// Landing v2, variant A: product first. A skip link, the header, the hero
// with the run inside a browser window, the use-case panel, what it
// delivers, the receipts table, the control tiles, pricing, then v1's dark
// closing band and this variant's footer, all on one paper ground.
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
        <UseCases />
        <Formats />
        <Receipts />
        <Control />
        <Pricing />
        <ClosingSection />
      </main>
      <SiteFooter />
    </div>
  );
}
