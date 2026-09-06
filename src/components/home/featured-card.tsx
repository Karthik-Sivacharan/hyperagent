import Image from "next/image";
import Link from "next/link";
import { BadgeDollarSign, Clock } from "lucide-react";
import type { FeaturedThread } from "@/lib/mock/featured";

// One card of the "See what Hyperagent is capable of building" showcase
// (docs/reference/pages/threads-new.html). next/image with `fill` emits the
// same <img data-nimg="fill"> the site renders; `unoptimized` serves the
// local WebP as-is. The first card is eager/high-priority like the site's
// (`priority` is deprecated in Next 16, so the attributes are passed directly).

const PILL =
  "inline-flex items-center gap-1 rounded-[6px] bg-muted px-1.5 py-0.5 font-medium text-[11px] text-muted-foreground";

export function FeaturedCard({ thread, priority }: { thread: FeaturedThread; priority?: boolean }) {
  return (
    <Link
      className="group relative flex w-full flex-col overflow-hidden rounded-[12px] border border-border bg-background text-left shadow-xs cursor-pointer transition-all duration-200 hover:shadow-sm before:absolute before:inset-0 before:z-[1] before:rounded-[12px] before:bg-muted/50 before:opacity-0 before:transition-opacity hover:before:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      href={`/featured/${thread.slug}`}
    >
      <div className="relative z-[2] flex flex-col">
        <div className="relative h-48 w-full bg-muted/50">
          <Image
            alt=""
            fill
            unoptimized
            fetchPriority={priority ? "high" : undefined}
            loading={priority ? "eager" : "lazy"}
            className="object-cover transition-opacity duration-300 opacity-100"
            src={thread.image}
          />
        </div>
        <div className="flex flex-col gap-1 px-4 pt-3 pb-4">
          <h3 className="font-medium text-foreground text-sm leading-tight">{thread.title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{thread.description}</p>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className={PILL}>
              <Clock className="size-3" aria-hidden="true" />
              {thread.duration}
            </span>
            <span className={PILL}>
              <BadgeDollarSign className="size-3" aria-hidden="true" />
              {thread.cost}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
