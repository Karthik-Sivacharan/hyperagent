import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { integrationLogos } from "@/components/settings/integration-logos";
import type { Integration, IntegrationLogo } from "@/lib/mock/integrations";

// One integration card, transcribed from
// docs/reference/pages/settings-integrations.html. The site renders MCP and
// native integrations with slightly different header markup (truncating
// title + wrapped badge vs. nowrap title + bare badge); both are kept.
// Card/badge class strings are inlined because the site's shadcn Card and
// Badge are older than the ones in src/components/ui/.

const BADGE =
  "inline-flex w-fit items-center justify-center gap-1 overflow-hidden whitespace-nowrap border py-0.5 font-ui transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3 [a&]:hover:bg-accent [a&]:hover:text-accent-foreground h-4 shrink-0 rounded-[4px] px-1.5 font-normal text-[9px] text-muted-foreground uppercase tracking-wide";

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
    <span data-slot="badge" className={BADGE}>
      {native ? "Native" : "MCP"}
    </span>
  );
  const action =
    integration.action === "telegram" ? (
      <Button asChild variant="default" size="sm" className="w-full cursor-pointer">
        <Link href="/agents">Set up on an agent</Link>
      </Button>
    ) : (
      <Button variant="default" size="sm" className="w-full cursor-pointer">
        Connect
      </Button>
    );

  return (
    <div
      data-slot="card"
      className="flex flex-col gap-6 rounded-xl border bg-card text-card-foreground shadow-sm relative h-full overflow-hidden py-4 transition-all duration-200 hover:shadow-md"
    >
      <div
        data-slot="card-header"
        className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 px-4 pb-2"
      >
        {native ? (
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Logo logo={integration.logo} />
              <div data-slot="card-title" className="font-heading font-semibold min-w-0 text-[15px]">
                <span className="whitespace-nowrap">{integration.name}</span>
              </div>
            </div>
            {badge}
          </div>
        ) : (
          <div className="flex min-w-0 items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Logo logo={integration.logo} />
              <div data-slot="card-title" className="font-heading font-semibold min-w-0 truncate text-[15px]">
                {integration.name}
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">{badge}</div>
          </div>
        )}
        <div
          data-slot="card-description"
          className={cn("font-body text-sm", !integration.unclamped && "line-clamp-1", "text-foreground")}
        >
          {integration.description}
        </div>
      </div>
      <div data-slot="card-content" className="px-4 mt-auto">
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
