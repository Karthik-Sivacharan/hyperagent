import "./landing-b.css";

import { Closing } from "./closing";
import { A11Y } from "./content";
import { Control } from "./control";
import { Gallery } from "./gallery";
import { Hero } from "./hero";
import { Pricing } from "./pricing";
import { Receipts } from "./receipts";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { UseCases } from "./use-cases";

// Landing v2, variant B: editorial, soft surfaces. One paper ground the
// whole way down; every panel is a soft tint with a hairline ring, never a
// border; the only colour is the person's bubble in the threads. A skip
// link, the header, the sections, the close and the footer.
export function LandingPageB() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
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
        <Gallery />
        <Receipts />
        <Control />
        <Pricing />
        <Closing />
      </main>
      <SiteFooter />
    </div>
  );
}
