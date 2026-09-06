"use client";

import { useState } from "react";
import Link from "next/link";
import { Blocks, LayoutGrid, Plug, Plus, RefreshCw, Search, Send, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SettingsPageHeader, SettingsShell } from "@/components/settings/settings-shell";
import { IntegrationCard } from "@/components/settings/integration-card";
import { featuredIntegrations, otherIntegrations, type Integration } from "@/lib/mock/integrations";

// /settings/integrations, transcribed from
// docs/reference/pages/settings-integrations.html. Search filters the two
// lists locally; Refresh and the Add menu are cosmetic (static mock data).

// The site's shadcn Input (older than src/components/ui/input.tsx: h-9,
// rounded-md, bg-muted), copied verbatim.
const SEARCH_INPUT =
  "notranslate h-9 w-full min-w-0 border border-input px-3 py-1 font-body text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm rounded-md bg-muted dark:bg-input/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 pl-9";

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
            <RefreshCw className={cn("mr-2 size-4", refreshing && "animate-spin")} aria-hidden="true" />
            Refresh
          </Button>
        }
      />

      <div className="relative mb-6">
        <Search
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          data-slot="input"
          translate="no"
          className={SEARCH_INPUT}
          placeholder="Search integrations..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <p className="mb-6 text-muted-foreground text-xs">
        Looking for a site the agent signs into in its browser? Those logins live in{" "}
        <Link className="underline underline-offset-2 hover:text-foreground" href="/settings/security#browser-logins">
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
                <h2 className="flex items-center gap-2 font-semibold text-lg">
                  <Star className="size-5 text-amber-500" aria-hidden="true" />
                  Featured
                </h2>
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
          <div className="mb-4 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="flex items-center gap-2 font-semibold text-lg">
                <LayoutGrid className="size-5 text-muted-foreground" aria-hidden="true" />
                All other integrations
              </h2>
            </div>
            <div className="shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" aria-label="Add integration">
                    <Plus className="size-4" aria-hidden="true" />
                    Add
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[8rem] w-auto rounded-md border">
                  <DropdownMenuItem>
                    <Plug aria-hidden="true" />
                    Add custom MCP server
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Send aria-hidden="true" />
                    Request an integration
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Blocks aria-hidden="true" />
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
            <button
              type="button"
              className="flex h-full min-h-[140px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 border-muted-foreground/30 text-muted-foreground transition-colors duration-200 hover:border-muted-foreground/60 hover:text-foreground"
            >
              <Plug className="size-6" aria-hidden="true" />
              <span className="flex max-w-full flex-col items-center gap-1">
                <span className="max-w-full truncate font-medium text-sm">Add custom MCP server</span>
                <span className="text-center text-muted-foreground text-xs">
                  Connect any tool that offers an MCP server
                </span>
              </span>
            </button>
          </IntegrationGrid>
        </div>
      </div>
    </SettingsShell>
  );
}
