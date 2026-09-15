import type { ReactNode } from "react";

/** A preview section: a hairline, a title with one line of purpose, controls on the right. */
export function Section({
  title,
  description,
  controls,
  children,
}: {
  title: string;
  description: string;
  controls?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4 border-t border-border-subtle pt-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl">{title}</h2>
          <p className="max-w-content text-sm text-muted-foreground">{description}</p>
        </div>
        {controls ? <div className="flex flex-wrap items-center gap-3">{controls}</div> : null}
      </header>
      {children}
    </section>
  );
}
