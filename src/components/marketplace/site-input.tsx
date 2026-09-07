import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

// hyperagent.com's search <Input> (docs/reference/pages/skills.html,
// marketplace.html), re-skinned as the brand's pill input group: the `input`
// tint outline, the brand ring on focus, the leading icon as an addon and the
// placeholder on the third text tier (docs/brand/design.md §3.2, §4.1, §5).
// The site's 36px height is kept so the toolbars do not move.
export function SiteInput({
  className,
  icon,
  ...props
}: React.ComponentProps<"input"> & { icon?: React.ReactNode }) {
  return (
    <InputGroup className={cn("h-9", className)}>
      {icon && <InputGroupAddon className="text-foreground-low">{icon}</InputGroupAddon>}
      <InputGroupInput translate="no" className="notranslate" {...props} />
    </InputGroup>
  );
}
