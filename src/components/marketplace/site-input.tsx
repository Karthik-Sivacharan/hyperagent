import { cn } from "@/lib/utils";

// hyperagent.com's <Input>: shadcn's input with the site's rounded-[8px] /
// dark:bg-muted look (docs/reference/pages/skills.html, marketplace.html).
// Kept apart from src/components/ui/input.tsx, the stock primitive.
export const SITE_INPUT =
  "notranslate h-9 w-full min-w-0 border px-3 py-1 font-body text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm rounded-[8px] border-border bg-white dark:bg-muted focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40";

export function SiteInput({ className, ...props }: React.ComponentProps<"input">) {
  return <input data-slot="input" translate="no" className={cn(SITE_INPUT, className)} {...props} />;
}
