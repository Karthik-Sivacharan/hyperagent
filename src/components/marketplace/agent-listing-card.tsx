import type { AgentListing } from "@/lib/mock/marketplace";
import { AgentIcon } from "@/components/marketplace/agent-icon";
import {
  FillImage,
  ListingAuthorRow,
  ListingFooter,
  TextTooltip,
} from "@/components/marketplace/listing-meta";

// "Featured agents" card (docs/reference/pages/marketplace.html): a 100px
// header (cover image or the violet-to-blue placeholder wash) under a black
// fade, icon tile + name at the bottom-left, then author, description and
// footer. Phase 2 dresses it as the brand's 22px `shadow-card` tile that
// lifts on hover; the header art keeps its colours (docs/brand/design.md §5,
// §6; reskin-conventions, "imagery keeps its colours").

export const LISTING_CARD =
  "group h-full flex flex-col overflow-hidden rounded-3xl bg-card shadow-card cursor-pointer transition-[box-shadow] duration-(--duration-slow) ease-out hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

// The site's violet-to-blue placeholder, derived from the info hue rather
// than written as a raw colour: the `@theme inline` bridge emits a primitive
// variable only when a semantic token uses it, and `--info` always exists.
const PLACEHOLDER_WASH = {
  backgroundImage:
    "linear-gradient(to bottom right, oklch(from var(--info) l c calc(h + 40) / 0.6), oklch(from var(--info) l c h / 0.6))",
};

export function AgentListingCard({ agent }: { agent: AgentListing }) {
  return (
    <a aria-label={agent.name} className={LISTING_CARD} href={agent.href}>
      <div className="relative h-[100px] w-full shrink-0 overflow-hidden">
        {agent.cover ? <FillImage src={agent.cover} /> : <div className="size-full" style={PLACEHOLDER_WASH} />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
        <div className="absolute right-5 bottom-5 left-5 flex items-center gap-3">
          <AgentIcon icon={agent.icon} />
          <div className="min-w-0">
            <TextTooltip text={agent.name}>
              <h3 className="line-clamp-1 font-heading text-2xl font-medium text-white drop-shadow-sm">
                {agent.name}
              </h3>
            </TextTooltip>
            {agent.tagline && (
              <div className="line-clamp-1 text-white/80 text-xs drop-shadow-sm">{agent.tagline}</div>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-5 p-5">
        <div className="flex flex-col gap-2">
          <ListingAuthorRow author={agent.author} className="flex items-center gap-1" />
          <TextTooltip text={agent.description}>
            <p className="line-clamp-2 text-muted-foreground text-sm">{agent.description}</p>
          </TextTooltip>
        </div>
        <ListingFooter tags={agent.tags} stars={agent.stars} installs={agent.installs} />
      </div>
    </a>
  );
}
