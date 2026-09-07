import {
  AppWindow,
  FileText,
  Image as ImageIcon,
  MapPin,
  Presentation,
  Search,
  Sparkles,
  Users,
  Video,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// The quick-action chip row under the home composer
// (docs/reference/pages/threads-new.html). The four prompt chips prefill the
// composer on the live site; "Set up your agent" and "More..." open the small
// popovers captured under docs/reference/overlays/home-*-popover.html (same
// widths, padding and items; the items are no-ops here). Phase 2 dresses the
// row in the brand: outline pills on the hairline edge, and the tinted brand
// chip for the set-up nudge (not the site's amber, not a solid accent), so
// the composer's send arrow stays the view's one solid tangerine
// (docs/brand/design.md §1, §3.2, §5, §8).

const ACTIONS: { icon: LucideIcon; label: string }[] = [
  { icon: AppWindow, label: "Design a website" },
  { icon: Users, label: "Source candidates" },
  { icon: Search, label: "Research a topic" },
  { icon: ImageIcon, label: "Generate images" },
];

const MORE: { icon: LucideIcon; label: string }[] = [
  { icon: Video, label: "Video" },
  { icon: Volume2, label: "Audio" },
  { icon: Presentation, label: "Slides" },
  { icon: MapPin, label: "Map" },
  { icon: FileText, label: "Doc" },
];

// Chips keep the site's 32px height and 12px inset (the composer's pill metrics).
const CHIP = "px-3 has-[>svg]:px-3";

// Popover rows keep the site's metrics (8px corners, px-2 py-1.5, 14px) on
// the brand's tint hover.
const POPOVER_ITEM =
  "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground outline-none transition-[color,background-color] duration-(--duration-instant) ease-out hover:bg-tint-10 focus-visible:bg-tint-10";

export function QuickActions() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap justify-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                CHIP,
                "bg-brand-subtle text-brand-subtle-foreground hover:bg-brand-accent/15 aria-expanded:bg-brand-accent/15",
              )}
            >
              <Sparkles className="size-4 text-brand-accent" aria-hidden="true" />
              Set up your agent
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-52 p-1.5">
            <div className="space-y-0.5">
              <button type="button" className={POPOVER_ITEM}>
                Pick up where you left off
              </button>
              <button type="button" className={POPOVER_ITEM}>
                Start fresh
              </button>
            </div>
          </PopoverContent>
        </Popover>
        {ACTIONS.map(({ icon: Icon, label }) => (
          <Button key={label} variant="outline" size="sm" className={CHIP}>
            <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
            {label}
          </Button>
        ))}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={CHIP}>
              More...
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-1.5">
            <div className="space-y-0.5">
              {MORE.map(({ icon: Icon, label }) => (
                <button key={label} type="button" className={POPOVER_ITEM}>
                  <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
