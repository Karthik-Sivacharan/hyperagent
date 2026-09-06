import type { AgentListing } from "@/lib/mock/marketplace";
import { AgentIcon } from "@/components/marketplace/agent-icon";
import {
  FillImage,
  ListingAuthorRow,
  ListingFooter,
  TextTooltip,
} from "@/components/marketplace/listing-meta";

// "Featured agents" card (docs/reference/pages/marketplace.html): a 100px
// header (cover image or the violet-to-blue gradient) under a black fade,
// icon tile + name at the bottom-left, then author, description and footer.

export const LISTING_CARD =
  "group h-full flex flex-col overflow-hidden rounded-[16px] border border-border bg-card cursor-pointer transition-colors hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function AgentListingCard({ agent }: { agent: AgentListing }) {
  return (
    <a aria-label={agent.name} className={LISTING_CARD} href={agent.href}>
      <div className="relative h-[100px] w-full shrink-0 overflow-hidden">
        {agent.cover ? (
          <FillImage src={agent.cover} />
        ) : (
          <div className="size-full bg-gradient-to-br from-violet-500/60 to-blue-500/60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
        <div className="absolute right-5 bottom-5 left-5 flex items-center gap-3">
          <AgentIcon icon={agent.icon} />
          <div className="min-w-0">
            <TextTooltip text={agent.name}>
              <h3 className="line-clamp-1 font-display font-semibold text-2xl text-white drop-shadow-sm">
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
            <p className="line-clamp-2 text-foreground text-sm">{agent.description}</p>
          </TextTooltip>
        </div>
        <ListingFooter tags={agent.tags} stars={agent.stars} installs={agent.installs} />
      </div>
    </a>
  );
}
