import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Overline } from "@/components/ui/overline";

import { A11Y, HERO, LINKS } from "./content";
import { HeroThread } from "./hero-thread";
import { TwoToneText } from "./section";

// The reference hero, on our grid: the headline across seven columns, the
// lede across five and level with it, the two pills under the headline.
// Under that, one soft panel holding one large thread with no window
// chrome, then the row of places an agent starts from and reports to, as
// quiet pills. Nothing here moves except the thread itself.
export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="px-4 pt-14 pb-16 sm:px-6 md:pt-24 md:pb-24"
    >
      <div className="mx-auto grid max-w-6xl gap-x-12 gap-y-6 lg:grid-cols-12 lg:items-end">
        <h1
          id="hero-heading"
          className="text-heading-display text-balance text-foreground lg:col-span-7"
        >
          <TwoToneText heading={HERO.heading} />
        </h1>
        <p className="max-w-xl text-lg text-pretty text-muted-foreground lg:col-span-5 lg:pb-1">
          {HERO.lede}
        </p>
        <div className="flex flex-wrap items-center gap-3 lg:col-span-12 lg:mt-2">
          <Button asChild size="lg" className="h-11 md:h-10">
            <Link href={LINKS.start.href}>{LINKS.start.label}</Link>
          </Button>
          <Button asChild size="lg" variant="ghost" className="h-11 md:h-10">
            <a href={LINKS.seeRun.href}>{LINKS.seeRun.label}</a>
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-6xl md:mt-16">
        <div className="rounded-5xl bg-surface-secondary p-3 shadow-edge sm:p-6 md:p-10">
          <HeroThread />
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-6xl flex-col gap-3 md:mt-10 md:flex-row md:items-center md:gap-6">
        <Overline asChild>
          <p className="shrink-0">{HERO.integrations.label}</p>
        </Overline>
        <ul
          role="list"
          aria-label={A11Y.integrations}
          className="flex flex-wrap gap-2"
        >
          {HERO.integrations.items.map((item) => (
            <li
              key={item}
              className="rounded-full bg-background px-3 py-1.5 text-sm text-muted-foreground shadow-xs"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
