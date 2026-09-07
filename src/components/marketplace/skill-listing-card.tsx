import { cn } from "@/lib/utils";
import type { SkillListing } from "@/lib/mock/marketplace";
import { Card } from "@/components/ui/card";
import { LISTING_LINK } from "@/components/marketplace/agent-listing-card";
import {
  FillImage,
  ListingAuthorRow,
  ListingFooter,
  TextTooltip,
} from "@/components/marketplace/listing-meta";

// Skill card as rendered in the marketplace's "Featured skills" grid (with
// its 16:9 showcase image) and in the Skills page's "Discover and install
// new skills" row (without). docs/reference/pages/marketplace.html,
// skills.html. Phase 2: the same interactive `shadow-card` tile as the agent
// card, the name in the heading face on the first text tier, the
// description on the second, a hairline under the cover
// (docs/brand/design.md §4.1, §5).

export function SkillListingCard({
  skill,
  showCover = false,
}: {
  skill: SkillListing;
  showCover?: boolean;
}) {
  const cover = showCover ? skill.cover : undefined;
  return (
    <Card asChild size="none" variant="interactive" className={LISTING_LINK}>
      <a aria-label={skill.name} href={skill.href}>
        {cover && (
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-tint-10">
            <FillImage src={cover} />
          </div>
        )}
        <div className={cn("flex flex-1 flex-col gap-6 p-5", cover && "border-border-subtle border-t")}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col">
              <TextTooltip text={skill.name}>
                <h3 className="line-clamp-1 font-heading font-medium text-base leading-snug text-foreground">
                  {skill.name}
                </h3>
              </TextTooltip>
              <ListingAuthorRow author={skill.author} />
            </div>
            <TextTooltip text={skill.description}>
              <p className="line-clamp-2 text-muted-foreground text-sm">{skill.description}</p>
            </TextTooltip>
          </div>
          <ListingFooter tags={skill.tags} stars={skill.stars} installs={skill.installs} />
        </div>
      </a>
    </Card>
  );
}
