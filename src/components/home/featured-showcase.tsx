import { cn } from "@/lib/utils";
import { featuredThreads } from "@/lib/mock/featured";
import { FeaturedCard } from "@/components/home/featured-card";

// "See what Hyperagent is capable of building": a CSS multi-column masonry
// of featured threads (docs/reference/pages/threads-new.html). Column starts
// are pinned per card with `break-before-*` (see FeaturedThread.breakClass).
// Phase 2: the heading takes the brand's section-heading step in the serif
// face (docs/brand/design.md §4).

export function FeaturedShowcase() {
  return (
    <section className="w-full space-y-6">
      <h2 className="text-center font-heading text-xl text-foreground">See what Hyperagent is capable of building</h2>
      <div className="columns-1 gap-4 md:columns-2 lg:columns-3">
        {featuredThreads.map((thread, i) => (
          <div key={thread.slug} className={cn("mb-4 break-inside-avoid", thread.breakClass)}>
            <FeaturedCard thread={thread} priority={i === 0} />
          </div>
        ))}
      </div>
    </section>
  );
}
