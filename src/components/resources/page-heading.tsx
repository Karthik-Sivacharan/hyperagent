import { cn } from "@/lib/utils";

// The title row every resource page shares (docs/reference/pages/*.html):
// an h1 in the display face, an optional one-line subtitle, and actions
// pushed to the right from `md` up. The wrapper around it (border, padding)
// differs per page and stays in the page component.
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
        <h1 className="font-display font-semibold tracking-[-0.01em] text-2xl text-foreground">
          {title}
        </h1>
        {subtitle ? <p className="text-muted-foreground text-sm">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </div>
  );
}
