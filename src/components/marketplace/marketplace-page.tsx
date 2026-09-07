import { featuredAgents, featuredSkills, marketplaceCategories } from "@/lib/mock/marketplace";
import { PageHeading } from "@/components/patterns/page-heading";
import { SearchInput } from "@/components/patterns/search-input";
import { AgentListingCard } from "@/components/marketplace/agent-listing-card";
import { CategoryCard } from "@/components/marketplace/category-card";
import { MarketplaceHero } from "@/components/marketplace/marketplace-hero";
import { SkillListingCard } from "@/components/marketplace/skill-listing-card";

// Everything inside <main> on hyperagent.com/marketplace, transcribed from
// docs/reference/pages/marketplace.html: title + search, the hero banner,
// "Featured agents", "Featured skills" and "Browse by category". Phase 2:
// the titles sit in the heading face on the brand type scale (the scale
// carries their weight and tracking; the page title one step up, `text-3xl`)
// and the search is the shared pill field with its icon on the third tier
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
            <PageHeading
              className="flex-row flex-wrap items-center justify-between"
              titleClassName="text-3xl"
              title="Marketplace"
              actions={
                <div className="relative w-full sm:w-80 lg:w-[420px]">
                  <SearchInput
                    type="text"
                    iconClassName="text-foreground-low"
                    placeholder="Search the marketplace"
                    aria-label="Search the marketplace"
                    defaultValue=""
                  />
                </div>
              }
            />

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
