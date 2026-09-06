import { AppWindow, Image as ImageIcon, Search, Sparkles, Users, type LucideIcon } from "lucide-react";

// The quick-action chip row under the home composer
// (docs/reference/pages/threads-new.html). Classes are copied verbatim; the
// amber "Set up your agent" chip and "More..." open dialogs on the live site
// (not captured in the dump), the others prefill the composer.

const CHIP =
  "flex cursor-pointer items-center gap-1.5 rounded-[8px] border border-border bg-background px-3 py-1.5 font-medium text-sm shadow-xs transition-colors hover:border-border/80 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const ACTIONS: { icon: LucideIcon; label: string }[] = [
  { icon: AppWindow, label: "Design a website" },
  { icon: Users, label: "Source candidates" },
  { icon: Search, label: "Research a topic" },
  { icon: ImageIcon, label: "Generate images" },
];

export function QuickActions() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          className="flex cursor-pointer items-center gap-1.5 rounded-[8px] border px-3 py-1.5 font-medium text-sm shadow-xs border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-100 transition-colors hover:border-amber-400 hover:bg-amber-100 disabled:opacity-50 dark:hover:border-amber-600 dark:hover:bg-amber-900/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-haspopup="dialog"
          aria-expanded={false}
        >
          <Sparkles className="size-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          Set up your agent
        </button>
        {ACTIONS.map(({ icon: Icon, label }) => (
          <button key={label} type="button" className={CHIP}>
            <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
            {label}
          </button>
        ))}
        <button
          type="button"
          className="flex cursor-pointer items-center rounded-[8px] border border-border bg-background px-3 py-1.5 font-medium text-sm shadow-xs transition-colors hover:border-border/80 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-haspopup="dialog"
          aria-expanded={false}
        >
          More...
        </button>
      </div>
    </div>
  );
}
