import { cn } from "@/lib/utils";
import type { SkillListing } from "@/lib/mock/marketplace";
import { LISTING_CARD } from "@/components/marketplace/agent-listing-card";
import {
  FillImage,
  ListingAuthorRow,
  ListingFooter,
  TextTooltip,
} from "@/components/marketplace/listing-meta";

// Skill card as rendered in the marketplace's "Featured skills" grid (with
// its 16:9 showcase image) and in the Skills page's "Discover and install
// new skills" row (without). docs/reference/pages/marketplace.html,
// skills.html.

export function SkillListingCard({
  skill,
  showCover = false,
}: {
  skill: SkillListing;
  showCover?: boolean;
}) {
  const cover = showCover ? skill.cover : undefined;
  return (
    <a aria-label={skill.name} className={LISTING_CARD} href={skill.href}>
      {cover && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          <FillImage src={cover} />
        </div>
      )}
      <div className={cn("flex flex-1 flex-col gap-6 p-5", cover && "border-border border-t")}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col">
            <TextTooltip text={skill.name}>
              <h3 className="line-clamp-1 font-semibold text-base text-foreground">{skill.name}</h3>
            </TextTooltip>
            <ListingAuthorRow author={skill.author} />
          </div>
          <TextTooltip text={skill.description}>
            <p className="line-clamp-2 text-foreground text-sm">{skill.description}</p>
          </TextTooltip>
        </div>
        <ListingFooter tags={skill.tags} stars={skill.stars} installs={skill.installs} />
      </div>
    </a>
  );
}
