import Image from "next/image";
import Link from "next/link";
import { IconClock, IconCoin } from "@tabler/icons-react";
import type { FeaturedThread } from "@/lib/mock/featured";

// One card of the "See what Hyperagent is capable of building" showcase
// (docs/reference/pages/threads-new.html). next/image with `fill` emits the
// same <img data-nimg="fill"> the site renders; `unoptimized` serves the
// local WebP as-is. The first card is eager/high-priority like the site's
// (`priority` is deprecated in Next 16, so the attributes are passed directly).
// Phase 2: the brand tile, 22px corners on the card surface with the resting
// card shadow and the 300ms hover lift in place of the site's border and
// wash; the title moves to the serif face and the run-time / spend meta to
// the mono figure label on tier 3. The cover image keeps its colours
// (docs/brand/design.md §4.1, §5, §6, §8).

const META = "inline-flex items-center gap-1 text-label-12-mono text-foreground-low";

export function FeaturedCard({ thread, priority }: { thread: FeaturedThread; priority?: boolean }) {
  return (
    <Link
      className="group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-3xl bg-card text-left text-card-foreground shadow-card transition-[box-shadow] duration-(--duration-slow) ease-out hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      href={`/featured/${thread.slug}`}
    >
      <div className="relative flex flex-col">
        <div className="relative h-48 w-full bg-tint-10">
          <Image
            alt=""
            fill
            unoptimized
            fetchPriority={priority ? "high" : undefined}
            loading={priority ? "eager" : "lazy"}
            className="object-cover opacity-100 transition-opacity duration-(--duration-slow) ease-out"
            src={thread.image}
          />
        </div>
        <div className="flex flex-col gap-1 px-4 pt-3 pb-4">
          <h3 className="font-heading text-base leading-tight text-foreground">{thread.title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{thread.description}</p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span className={META}>
              <IconClock className="size-3" aria-hidden="true" />
              {thread.duration}
            </span>
            <span className={META}>
              <IconCoin className="size-3" aria-hidden="true" />
              {thread.cost}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
