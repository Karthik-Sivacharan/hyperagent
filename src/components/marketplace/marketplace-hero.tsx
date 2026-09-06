import { marketplaceHero } from "@/lib/mock/marketplace";

// The banner under the Marketplace title (docs/reference/pages/
// marketplace.html): a dark plum panel, the collage of screenshots as a
// contained background image on the right, headline and subline on the left.

export function MarketplaceHero() {
  return (
    <section
      className="relative hidden overflow-hidden rounded-[24px] sm:block"
      style={{ backgroundColor: marketplaceHero.background }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-8 right-8 hidden w-[34%] bg-contain bg-right bg-no-repeat lg:block"
        style={{ backgroundImage: `url(${marketplaceHero.image})` }}
      />
      <div className="relative flex w-full flex-col items-start gap-5 px-8 py-28 md:px-12 lg:pr-[40%]">
        <h1 className="whitespace-pre-line font-display font-semibold tracking-[-0.01em] text-5xl text-white leading-none md:text-6xl">
          {marketplaceHero.headline}
        </h1>
        <p className="font-display tracking-[-0.01em] font-medium text-white text-xl leading-[1.35]">
          {marketplaceHero.subline}
        </p>
      </div>
    </section>
  );
}
