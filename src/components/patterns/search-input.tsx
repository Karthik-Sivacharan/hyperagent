import { IconSearch } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

// The search field every list page shares. Phase 2 makes it the brand pill
// field: the shared input group (tint outline, brand focus ring, placeholder
// on the third text tier) at the site's 36px height. `children` render
// inside the relative wrapper, after the input, for trailing controls such
// as the narrow-layout filter button. The leading icon sits on the second
// text tier; `iconClassName` drops it to the third where the site did
// (marketplace, skills).
export function SearchInput({
  className,
  inputClassName,
  iconClassName,
  children,
  ...props
}: Omit<React.ComponentProps<"input">, "className"> & {
  className?: string;
  inputClassName?: string;
  iconClassName?: string;
}) {
  return (
    <InputGroup className={cn("h-9", className)}>
      <InputGroupAddon>
        <IconSearch className={cn("text-muted-foreground", iconClassName)} aria-hidden="true" />
      </InputGroupAddon>
      <InputGroupInput translate="no" className={cn("notranslate h-full", inputClassName)} {...props} />
      {children}
    </InputGroup>
  );
}
