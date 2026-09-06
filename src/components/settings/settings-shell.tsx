import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// Scroll container + centred column shared by every /settings page, and the
// page header (optional "Back to Settings" link, title, subtitle, actions).
// Markup and classes are transcribed from hyperagent.com/settings and
// /settings/integrations (docs/reference/pages/settings*.html).

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
        <Link
          className="mb-4 inline-flex items-center text-muted-foreground text-sm transition-colors hover:text-foreground"
          href={backHref}
        >
          <ArrowLeft className="mr-2 size-4" aria-hidden="true" />
          {backLabel}
        </Link>
      ) : null}
      <div
        className={cn(
          "flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between",
          titleRowClassName,
        )}
      >
        <div className="min-w-0">
          <h1 className="font-display font-semibold tracking-[-0.01em] text-2xl text-foreground">{title}</h1>
          {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}
