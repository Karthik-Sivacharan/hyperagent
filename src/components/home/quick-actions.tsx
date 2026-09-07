import {
  IconAppWindow,
  IconFileText,
  IconMapPin,
  IconPhoto,
  IconPresentation,
  IconSearch,
  IconSparkles,
  IconUsers,
  IconVideo,
  IconVolume,
  type TablerIcon,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// The quick-action chip row under the home composer
// (docs/reference/pages/threads-new.html). The four prompt chips prefill the
// composer on the live site; "Set up your agent" and "More..." open the small
// menus captured under docs/reference/overlays/home-*-popover.html (same
// widths, padding and items; the items are no-ops here). Phase 2 dresses the
// row in the brand: outline pills on the hairline edge, and the tinted brand
// chip for the set-up nudge (not the site's amber, not a solid accent), so
// the composer's send arrow stays the view's one solid tangerine
// (docs/brand/design.md §1, §3.2, §5, §8). The chips are `size="pill"` (the
// composer's 32px metric with a 12px inset on both sides of an icon) and the
// menus are the brand dropdown, whose item carries the site's row metrics.

const ACTIONS: { icon: TablerIcon; label: string }[] = [
  { icon: IconAppWindow, label: "Design a website" },
  { icon: IconUsers, label: "Source candidates" },
  { icon: IconSearch, label: "Research a topic" },
  { icon: IconPhoto, label: "Generate images" },
];

const MORE: { icon: TablerIcon; label: string }[] = [
  { icon: IconVideo, label: "Video" },
  { icon: IconVolume, label: "Audio" },
  { icon: IconPresentation, label: "Slides" },
  { icon: IconMapPin, label: "Map" },
  { icon: IconFileText, label: "Doc" },
];

export function QuickActions() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap justify-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="pill"
              className="bg-brand-subtle text-brand-subtle-foreground hover:bg-brand-accent/15 aria-expanded:bg-brand-accent/15"
            >
              <IconSparkles className="size-4 text-brand-accent" aria-hidden="true" />
              Set up your agent
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52 p-1.5">
            <div className="space-y-0.5">
              <DropdownMenuItem>Pick up where you left off</DropdownMenuItem>
              <DropdownMenuItem>Start fresh</DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        {ACTIONS.map(({ icon: Icon, label }) => (
          <Button key={label} variant="outline" size="pill">
            <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
            {label}
          </Button>
        ))}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="pill">
              More...
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60 p-1.5">
            <div className="space-y-0.5">
              {MORE.map(({ icon: Icon, label }) => (
                <DropdownMenuItem key={label}>
                  <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                  {label}
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
