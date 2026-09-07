"use client";

import { useState } from "react";
import Link from "next/link";
import { IconBlocks, IconLayoutGrid, IconPlug, IconPlus, IconRefresh, IconSend, IconStar } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Overline } from "@/components/ui/overline";
import { SearchInput } from "@/components/patterns/search-input";
import { SettingsPageHeader, SettingsShell } from "@/components/settings/settings-shell";
import { IntegrationCard } from "@/components/settings/integration-card";
import { featuredIntegrations, otherIntegrations, type Integration } from "@/lib/mock/integrations";

// /settings/integrations, transcribed from
// docs/reference/pages/settings-integrations.html. Search filters the two
// lists locally; Refresh and the Add menu are cosmetic (static mock data).
// Phase 2: the search is the shared pill field (kept at the site's 36px),
// Refresh and Add are outline pills, the two section labels over the card
// grids are the brand overline (a group label is never tier 2,
// docs/brand/design.md §4.1), the "Looking for a site…" hint is tier-3 meta
// with the brand underline, and the custom-MCP tile is a ghost button drawn
// as a dashed hairline at the card radius.

function matches(integration: Integration, query: string) {
  return (
    integration.name.toLowerCase().includes(query) || integration.description.toLowerCase().includes(query)
  );
}

function IntegrationGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="@container">
      <div className="grid gap-4 @3xl:grid-cols-3 @md:grid-cols-2 grid-cols-1">{children}</div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Overline asChild>
      <h2 className="flex items-center gap-2">{children}</h2>
    </Overline>
  );
}

export function IntegrationsPage() {
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const q = query.trim().toLowerCase();
  const featured = q ? featuredIntegrations.filter((i) => matches(i, q)) : featuredIntegrations;
  const others = q ? otherIntegrations.filter((i) => matches(i, q)) : otherIntegrations;

  const refresh = () => {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <SettingsShell>
      <SettingsPageHeader
        title="Integrations"
        description="Connect apps and tools for your agents"
        backHref="/settings"
        actions={
          <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing}>
            <IconRefresh className={cn("size-4", refreshing && "animate-spin")} aria-hidden="true" />
            Refresh
          </Button>
        }
      />

      <SearchInput
        className="mb-6"
        placeholder="Search integrations..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <p className="mb-6 text-xs text-foreground-low">
        Looking for a site the agent signs into in its browser? Those logins live in{" "}
        <Link
          className="underline underline-offset-4 decoration-border-loud transition-[color,text-decoration-color] duration-(--duration-fast) ease-out-quart hover:text-foreground hover:decoration-foreground"
          href="/settings/security#browser-logins"
        >
          Browser logins
        </Link>
        .
      </p>
      <div className="mb-8 hidden" />

      <div className="">
        {featured.length > 0 ? (
          <div className="mb-8">
            <div className="mb-4 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <SectionLabel>
                  <IconStar className="size-4" aria-hidden="true" />
                  Featured
                </SectionLabel>
              </div>
            </div>
            <IntegrationGrid>
              {featured.map((integration) => (
                <IntegrationCard key={integration.slug} integration={integration} />
              ))}
            </IntegrationGrid>
          </div>
        ) : null}

        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <SectionLabel>
                <IconLayoutGrid className="size-4" aria-hidden="true" />
                All other integrations
              </SectionLabel>
            </div>
            <div className="shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" aria-label="Add integration">
                    <IconPlus className="size-4" aria-hidden="true" />
                    Add
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[8rem] w-auto">
                  <DropdownMenuItem>
                    <IconPlug aria-hidden="true" />
                    Add custom MCP server
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <IconSend aria-hidden="true" />
                    Request an integration
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <IconBlocks aria-hidden="true" />
                    Create a skill
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <IntegrationGrid>
            {others.map((integration) => (
              <IntegrationCard key={integration.slug} integration={integration} />
            ))}
            <Button
              variant="ghost"
              size="none"
              className="h-full min-h-[140px] w-full flex-col gap-3 rounded-3xl border-2 border-dashed border-border-subtle p-6 whitespace-normal font-normal text-muted-foreground transition-[color,border-color] hover:border-border-loud hover:bg-transparent hover:text-foreground"
            >
              <IconPlug className="size-6" aria-hidden="true" />
              <span className="flex max-w-full flex-col items-center gap-1">
                <span className="max-w-full truncate text-sm font-medium">Add custom MCP server</span>
                <span className="text-center text-xs text-foreground-low">
                  Connect any tool that offers an MCP server
                </span>
              </span>
            </Button>
          </IntegrationGrid>
        </div>
      </div>
    </SettingsShell>
  );
}
