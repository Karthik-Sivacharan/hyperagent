import type { LucideIcon } from "lucide-react";

// Centered empty state shared by the resource pages. Two looks appear on
// the site: "bubble" (Projects, Agents) puts the icon in a round
// glass-bubble-primary tile with an xl heading; "plain" (Library, Memories)
// shows a large faded icon with an lg heading.
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "bubble",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  variant?: "bubble" | "plain";
}) {
  const bubble = variant === "bubble";
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {bubble ? (
        <div className="rounded-full glass-bubble-primary p-4 text-primary-foreground">
          <Icon className="h-8 w-8" aria-hidden="true" />
        </div>
      ) : (
        <Icon className="h-12 w-12 text-muted-foreground/50" aria-hidden="true" />
      )}
      <h2 className={bubble ? "mt-4 text-xl font-semibold" : "mt-4 text-lg font-medium"}>{title}</h2>
      <p className={bubble ? "mt-2 max-w-md text-muted-foreground" : "mt-2 text-sm text-muted-foreground"}>
        {description}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
