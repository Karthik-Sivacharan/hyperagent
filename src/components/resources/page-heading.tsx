import { cn } from "@/lib/utils";

// The title row every resource page shares (docs/reference/pages/*.html):
// an h1, an optional one-line subtitle, and actions pushed to the right from
// `md` up. Phase 2 sets the title in the brand display face on the first
// text tier and the subtitle on the second (docs/brand/design.md §4, §4.1);
// `text-2xl` carries the brand tracking and heading weight on its own. The
// wrapper around it (border, padding) differs per page and stays in the page
// component.
export function PageHeading({
  title,
  subtitle,
  actions,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="font-heading text-2xl font-semibold text-foreground">{title}</h1>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </div>
  );
}
