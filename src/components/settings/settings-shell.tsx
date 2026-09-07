import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/patterns/page-heading";

// Scroll container + centred column shared by every /settings page, and the
// page header (optional "Back to Settings" link, then the shared title row:
// title, subtitle, actions). Markup is transcribed from
// hyperagent.com/settings and /settings/integrations
// (docs/reference/pages/settings*.html). Phase 2: the back link is a ghost
// pill (pulled left so its arrow still sits on the column edge), the title
// is the brand display face on tier 1 and the description is running copy
// on tier 2 (docs/brand/design.md §4, §4.1).

export function SettingsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="h-full overflow-y-auto">
        <div className="container mx-auto max-w-4xl p-6">{children}</div>
      </div>
    </div>
  );
}

export function SettingsPageHeader({
  title,
  description,
  backHref,
  backLabel = "Back to Settings",
  actions,
  titleRowClassName,
  children,
}: {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  titleRowClassName?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      {backHref ? (
        <Button asChild variant="ghost" size="sm" className="-ml-3 mb-4 text-muted-foreground hover:text-foreground">
          <Link href={backHref}>
            <IconArrowLeft className="size-4" aria-hidden="true" />
            {backLabel}
          </Link>
        </Button>
      ) : null}
      <PageHeading title={title} subtitle={description} actions={actions} className={titleRowClassName} />
      {children}
    </div>
  );
}
