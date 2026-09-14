import { ClosingSection } from "./closing-section";
import { A11Y } from "./content";
import { ControlSection } from "./control-section";
import { Hero } from "./hero";
import { HowItWorks } from "./how-it-works";
import { LearningSection } from "./learning-section";
import { PricingSection } from "./pricing-section";
import { ReceiptsSection } from "./receipts-section";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { TeamSection } from "./team-section";

// The landing page: a skip link, the header, the sections on one paper
// ground, and the dark closing band and footer.
export function LandingPage() {
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
        <HowItWorks />
        <TeamSection />
        <ReceiptsSection />
        <ControlSection />
        <LearningSection />
        <PricingSection />
        <ClosingSection />
      </main>
      <SiteFooter />
    </div>
  );
}
