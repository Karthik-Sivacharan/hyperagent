import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Overline } from "@/components/ui/overline";

import { AssetSlot } from "./asset-slot";
import { HERO, LINKS } from "./content";
import { TwoToneText } from "./section";

// The job, the check, the proof: a two-tone headline with the check in the
// second tier, the lede, two actions and the price, beside the product demo
// (a placeholder in v1). Under it, customer stories and one public number.
//
// The copy column sits vertically centred beside the picture, the way the
// calmer split heroes do it, and the headline balances its two lines so the
// second tier never strands one word. The picture keeps its 4:3 box from the
// first paint, so the skeleton and the asset that replaces it share a height
// and nothing below moves. The actions are 44px tall on a phone (a thumb)
// and drop to the brand's 40px large button beside a pointer.
export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="px-4 py-16 sm:px-6 md:py-24"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="flex flex-col items-start gap-6">
          <h1
            id="hero-heading"
            className="text-heading-display text-balance text-foreground"
          >
            <TwoToneText heading={HERO.heading} />
          </h1>
          <p className="max-w-xl text-lg text-pretty text-muted-foreground">
            {HERO.lede}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-11 md:h-10">
              <Link href={LINKS.start.href}>{LINKS.start.label}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-11 md:h-10"
            >
              <a href={LINKS.tour.href}>{LINKS.tour.label}</a>
            </Button>
          </div>
          <p className="text-md text-pretty text-foreground-low">{HERO.fine}</p>
        </div>
        <AssetSlot asset={HERO.asset} className="aspect-4/3 w-full" />
      </div>

      <div className="mx-auto mt-16 flex max-w-6xl flex-col gap-6 md:mt-20 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-8">
          <Overline asChild>
            <p>{HERO.proof.label}</p>
          </Overline>
          <AssetSlot asset={HERO.proof.logos} variant="logos" />
        </div>
        <p className="text-sm text-muted-foreground">
          <strong className="font-strong text-foreground tabular-nums">
            {HERO.proof.figure}
          </strong>{" "}
          {HERO.proof.caption}
        </p>
      </div>
    </section>
  );
}
