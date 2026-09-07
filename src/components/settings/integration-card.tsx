import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { integrationLogos } from "@/components/settings/integration-logos";
import type { Integration, IntegrationLogo } from "@/lib/mock/integrations";

// One integration card, transcribed from
// docs/reference/pages/settings-integrations.html. The site renders MCP and
// native integrations with slightly different header markup (truncating
// title + wrapped badge vs. nowrap title + bare badge); both are kept.
// Phase 2: the brand card (22px, `shadow-card` lifting on hover), the logo
// artwork untouched, the name on tier 1, the blurb on tier 2, the kind as a
// tint chip in the caps label (it was already set in caps), "Connect" as the
// ink pill and the Telegram link as the outline pill (docs/brand/design.md
// §4.1, §5, §6).

function Logo({ logo }: { logo: IntegrationLogo }) {
  if (logo.type === "svg") {
    const Mark = integrationLogos[logo.id];
    return <Mark />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img alt={logo.alt} width={24} height={24} className="shrink-0" src={logo.src} />;
}

export function IntegrationCard({ integration }: { integration: Integration }) {
  const native = integration.kind === "native";
  const badge = (
    <Badge variant="secondary" className="shrink-0 text-label-12-caps">
      {native ? "Native" : "MCP"}
    </Badge>
  );
  const action =
    integration.action === "telegram" ? (
      <Button asChild variant="outline" size="sm" className="w-full">
        <Link href="/agents">Set up on an agent</Link>
      </Button>
    ) : (
      <Button variant="default" size="sm" className="w-full">
        Connect
      </Button>
    );

  return (
    <div
      data-slot="card"
      className="relative flex h-full flex-col gap-6 overflow-hidden rounded-3xl bg-card py-4 text-card-foreground shadow-card transition-[box-shadow] duration-(--duration-slow) ease-out hover:shadow-card-hover"
    >
      <div
        data-slot="card-header"
        className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 px-4 pb-2"
      >
        {native ? (
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Logo logo={integration.logo} />
              <div data-slot="card-title" className="min-w-0 font-heading text-[15px] font-semibold text-foreground">
                <span className="whitespace-nowrap">{integration.name}</span>
              </div>
            </div>
            {badge}
          </div>
        ) : (
          <div className="flex min-w-0 items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Logo logo={integration.logo} />
              <div data-slot="card-title" className="min-w-0 truncate font-heading text-[15px] font-semibold text-foreground">
                {integration.name}
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">{badge}</div>
          </div>
        )}
        <div
          data-slot="card-description"
          className={cn("text-sm text-muted-foreground", !integration.unclamped && "line-clamp-1")}
        >
          {integration.description}
        </div>
      </div>
      <div data-slot="card-content" className="mt-auto px-4">
        {integration.stackedActions ? (
          <div className="w-full">
            <div className="w-full space-y-2">{action}</div>
          </div>
        ) : (
          action
        )}
      </div>
    </div>
  );
}
