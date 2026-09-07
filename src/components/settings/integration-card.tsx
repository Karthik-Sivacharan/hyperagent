import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { integrationLogos } from "@/components/settings/integration-logos";
import type { Integration, IntegrationLogo } from "@/lib/mock/integrations";

// One integration card, transcribed from
// docs/reference/pages/settings-integrations.html. The site renders MCP and
// native integrations with slightly different header markup (truncating
// title + wrapped badge vs. nowrap title + bare badge); both are kept.
// Phase 2: the brand's interactive card (22px, `shadow-card` lifting on
// hover, the page's 16px padding), the logo artwork untouched, the name on
// tier 1 as a 15px semibold on the body's 24px line (the card title's own
// size, weight and line are reset for it), the blurb on tier 2, the kind as
// a tint chip in the caps label (it was already set in caps), "Connect" as
// the ink pill and the Telegram link as the outline pill
// (docs/brand/design.md §4.1, §5, §6).

const TITLE = "min-w-0 text-[15px] font-semibold leading-6 text-foreground";

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
    <Card variant="interactive" size="none" className="relative h-full gap-6 py-4">
      <CardHeader className="grid-rows-[auto_auto] gap-2 px-4 pb-2 [.border-b]:pb-6">
        {native ? (
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Logo logo={integration.logo} />
              <CardTitle className={TITLE}>
                <span className="whitespace-nowrap">{integration.name}</span>
              </CardTitle>
            </div>
            {badge}
          </div>
        ) : (
          <div className="flex min-w-0 items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Logo logo={integration.logo} />
              <CardTitle className={cn(TITLE, "truncate")}>{integration.name}</CardTitle>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">{badge}</div>
          </div>
        )}
        <CardDescription className={cn(!integration.unclamped && "line-clamp-1")}>
          {integration.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto px-4">
        {integration.stackedActions ? (
          <div className="w-full">
            <div className="w-full space-y-2">{action}</div>
          </div>
        ) : (
          action
        )}
      </CardContent>
    </Card>
  );
}
