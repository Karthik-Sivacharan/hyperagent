import { Closing } from "./closing";
import { A11Y } from "./content";
import { Control } from "./control";
import { Hero } from "./hero";
import { Pricing } from "./pricing";
import { Receipts } from "./receipts";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { UseCases } from "./use-cases";
import { WeekStack } from "./week-stack";

// Variant C, "Ink": the whole page on the dark ground. `/landing/*` is
// forced light by the app, so `dark` on this wrapper re-maps every token
// for the subtree (brand.css); nothing below carries a `dark:` variant.
// A skip link, the header, the sections, the closing surface, the footer.
export function LandingPageC() {
  return (
    <div className="dark flex min-h-svh flex-col bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-(--z-toast) focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-md"
      >
        {A11Y.skip}
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        <Hero />
        <UseCases />
        <WeekStack />
        <Receipts />
        <Control />
        <Pricing />
        <Closing />
      </main>
      <SiteFooter />
    </div>
  );
}
