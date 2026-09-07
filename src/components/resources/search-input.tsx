import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

// The search field used by Agents, Memories and Library. Phase 2 makes it the
// brand pill field: the shared input group (tint outline, brand focus ring,
// placeholder on the third text tier) at the site's 36px height. `children`
// render inside the relative wrapper, after the input, for trailing controls
// such as the narrow-layout filter button.
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
    <InputGroup className={cn("h-9", className)}>
      <InputGroupAddon>
        <Search className="text-muted-foreground" aria-hidden="true" />
      </InputGroupAddon>
      <InputGroupInput translate="no" className={cn("notranslate h-full", inputClassName)} {...props} />
      {children}
    </InputGroup>
  );
}
