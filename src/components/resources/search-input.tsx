import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

// The white/muted rounded search field used by Agents and Memories (the
// Library page's search is a different treatment and is inlined there).
// `children` render inside the relative wrapper, after the input, for
// trailing controls such as the narrow-layout filter button.
const SEARCH_INPUT =
  "notranslate h-9 min-w-0 border px-3 py-1 font-body text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm rounded-[8px] border-border bg-white dark:bg-muted focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 w-full pl-8 pr-3";

export function SearchInput({
  className,
  inputClassName,
  children,
  ...props
}: Omit<React.ComponentProps<"input">, "className"> & {
  className?: string;
  inputClassName?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input data-slot="input" translate="no" className={cn(SEARCH_INPUT, inputClassName)} {...props} />
      {children}
    </div>
  );
}
