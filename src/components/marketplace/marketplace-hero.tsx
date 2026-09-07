import { marketplaceHero } from "@/lib/mock/marketplace";

// The banner under the Marketplace title (docs/reference/pages/
// marketplace.html): the collage of screenshots as a contained background
// image on the right, headline and subline on the left. Phase 2 swaps the
// site's plum panel for the brand's hero backdrop: a 26px panel on the
// secondary surface (sunken in dark, as the brand's is) under the glass hero
// shadow, the headline in the heading face on the first text tier and the
// lede on the second; the collage is imagery and keeps its colours
// (docs/brand/design.md §3.2, §4.1, §5, §6).

export function MarketplaceHero() {
  return (
    <section className="relative hidden overflow-hidden rounded-4xl bg-surface-secondary shadow-hero sm:block">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-8 right-8 hidden w-[34%] bg-contain bg-right bg-no-repeat lg:block"
        style={{ backgroundImage: `url(${marketplaceHero.image})` }}
      />
      <div className="relative flex w-full flex-col items-start gap-5 px-8 py-28 md:px-12 lg:pr-[40%]">
        <h1 className="whitespace-pre-line font-heading text-3xl text-foreground md:text-4xl">
          {marketplaceHero.headline}
        </h1>
        <p className="text-lg text-muted-foreground">{marketplaceHero.subline}</p>
      </div>
    </section>
  );
}
