import { IconSearch } from "@tabler/icons-react";
import { featuredAgents, featuredSkills, marketplaceCategories } from "@/lib/mock/marketplace";
import { AgentListingCard } from "@/components/marketplace/agent-listing-card";
import { CategoryCard } from "@/components/marketplace/category-card";
import { MarketplaceHero } from "@/components/marketplace/marketplace-hero";
import { SiteInput } from "@/components/marketplace/site-input";
import { SkillListingCard } from "@/components/marketplace/skill-listing-card";

// Everything inside <main> on hyperagent.com/marketplace, transcribed from
// docs/reference/pages/marketplace.html: title + search, the hero banner,
// "Featured agents", "Featured skills" and "Browse by category". Phase 2:
// the titles sit in the heading face on the brand type scale (the scale
// carries their weight and tracking) and the search is the pill input group
// (docs/brand/design.md §4, §5).

function MarketplaceSection({
  title,
  id,
  children,
}: {
  title: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div id={id} className="mb-4 flex items-end justify-between gap-3">
        <h2 className="font-heading text-xl text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function MarketplacePage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl space-y-10 p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="font-heading text-3xl text-foreground">Marketplace</h1>
              <div className="relative w-full sm:w-80 lg:w-[420px]">
                <SiteInput
                  type="text"
                  icon={<IconSearch aria-hidden="true" />}
                  placeholder="Search the marketplace"
                  aria-label="Search the marketplace"
                  defaultValue=""
                />
              </div>
            </div>

            <MarketplaceHero />

            <MarketplaceSection title="Featured agents">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {featuredAgents.map((agent) => (
                  <AgentListingCard key={agent.id} agent={agent} />
                ))}
              </div>
            </MarketplaceSection>

            <MarketplaceSection title="Featured skills">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {featuredSkills.map((skill) => (
                  <SkillListingCard key={skill.id} skill={skill} showCover />
                ))}
              </div>
            </MarketplaceSection>

            <MarketplaceSection title="Browse by category" id="categories">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {marketplaceCategories.map((category) => (
                  <CategoryCard key={category.slug} category={category} />
                ))}
              </div>
            </MarketplaceSection>
          </div>
        </div>
      </div>
    </div>
  );
}
