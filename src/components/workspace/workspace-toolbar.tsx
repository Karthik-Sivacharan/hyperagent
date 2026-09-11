import {
  IconArrowsDownUp,
  IconCarouselHorizontal,
  IconChevronDown,
  IconFilter2,
  IconLayoutGrid,
  IconStack2,
  type TablerIcon,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GLASS, ON_GLASS_LOW, ON_GLASS_QUIET } from "@/components/workspace/glass";

// The row over the desktop: the artifact filter on the left, the layout switch
// centred, and a spacer on the right as wide as the Browser pill plus its
// inset (109 + 8), so the switch stays centred until the filter grows into it.
// Site: the `z-10 flex … gap-3 pt-2 pb-1` row of the capture.
//
// Static: Carousel is the only layout built, so the switch is held on it and
// the filter and sort open nothing.

const LAYOUTS: { value: string; label: string; icon: TablerIcon }[] = [
  { value: "carousel", label: "Carousel", icon: IconCarouselHorizontal },
  { value: "tile", label: "Tile", icon: IconLayoutGrid },
  { value: "windows", label: "Windows", icon: IconStack2 },
];

// 28px square keys. Off they sit at the site's 70% on the glass. The pressed
// key is lifted by the brand's highlight (white at .5 in light, .15 in dark)
// under the glass chip shadow: on glass a key has to be lighter than the pane
// to read as raised, and the canvas fill the app's other layout switches use
// is a near-black hole here in dark.
const KEY = cn(
  "size-7 min-w-7 px-0 hover:bg-tint-10 hover:text-foreground",
  ON_GLASS_QUIET,
  "aria-checked:bg-(--highlight) aria-checked:text-foreground aria-checked:shadow-xs data-[state=on]:bg-(--highlight) data-[state=on]:text-foreground data-[state=on]:shadow-xs",
);

export function WorkspaceToolbar({ count }: { count: number }) {
  return (
    <div className="z-10 flex shrink-0 items-center gap-3 pt-2 pb-1">
      {/* Two boxes, as on the site: padding on the flex item itself would count toward its basis and
          push the switch 8px off centre. */}
      <div className="min-w-0 flex-1">
        <div className="min-w-0 px-2">
          <div className={cn("w-fit max-w-full rounded-full p-1", GLASS)}>
            <Button
              variant="ghost"
              size="none"
              aria-label={`Filter artifacts: All ${count}`}
              className="max-w-full gap-1.5 px-2 py-1.5 text-xs"
            >
              <IconFilter2 className={cn("size-3.5", ON_GLASS_QUIET)} aria-hidden="true" />
              <span className="min-w-0 truncate">
                All <span className={cn("tabular-nums", ON_GLASS_LOW)}>{count}</span>
              </span>
              <IconChevronDown className={cn("size-3", ON_GLASS_LOW)} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      <div className={cn("flex shrink-0 items-center gap-1 rounded-full p-1", GLASS)}>
        <ToggleGroup type="single" value="carousel" spacing={1} size="sm" aria-label="Layout">
          {LAYOUTS.map(({ value, label, icon: Icon }) => (
            <Tooltip key={value}>
              <TooltipTrigger asChild>
                <ToggleGroupItem value={value} aria-label={label} className={KEY}>
                  <Icon className="size-4" aria-hidden="true" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          ))}
        </ToggleGroup>
        <Separator orientation="vertical" className="mx-0.5 h-4 bg-foreground/15 data-vertical:self-center" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="none" aria-label="Sort artifacts" className={cn("size-7", ON_GLASS_QUIET, "hover:text-foreground")}>
              <IconArrowsDownUp className="size-4" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Sort artifacts</TooltipContent>
        </Tooltip>
      </div>

      <div className="min-w-[117px] flex-1" />
    </div>
  );
}
