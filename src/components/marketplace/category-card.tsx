import {
  IconBrush,
  IconChartBar,
  IconCode,
  IconMicroscope,
  IconPuzzle,
  IconRobotFace,
  IconSchema,
  IconSpeakerphone,
  IconTrendingUp,
  IconUserSearch,
  type TablerIcon,
} from "@tabler/icons-react";
import type { CategoryIcon, MarketplaceCategory } from "@/lib/mock/marketplace";

// "Browse by category" tile (docs/reference/pages/marketplace.html): a 5:3
// coloured card with a faded 3x4 lattice of bot / puzzle glyphs in the
// top-right corner and the category icon, name and counts bottom-left.
// Phase 2: the brand's 22px `shadow-card` tile that lifts on hover, the name
// in the heading face. The tile's own colours come from the listing data and
// stay, as cover art does (docs/brand/design.md §5, §6).
//
// The icon keys are the captured dump's lucide class names, resolved here to
// Tabler glyphs. Two resolve to a different glyph than the name suggests:
// "pen-tool" (the vector pen nib) is a brush, because Tabler's bezier icons
// read as boxes joined by lines and were hard to tell from the workflow
// tile; "chart-column" is Tabler's bar chart with a baseline, the shape the
// source glyph had, because Tabler's chart-column is a stack of dashes.

const ICONS: Record<CategoryIcon, TablerIcon> = {
  megaphone: IconSpeakerphone,
  microscope: IconMicroscope,
  "user-search": IconUserSearch,
  "trending-up": IconTrendingUp,
  code: IconCode,
  "pen-tool": IconBrush,
  "chart-column": IconChartBar,
  workflow: IconSchema,
};

const LATTICE: ("bot" | "puzzle")[][] = [
  ["bot", "puzzle", "bot", "puzzle"],
  ["puzzle", "bot", "puzzle", "bot"],
  ["bot", "puzzle", "bot", "puzzle"],
];

export function CategoryCard({ category }: { category: MarketplaceCategory }) {
  const Icon = ICONS[category.icon];
  return (
    <a
      className="relative flex aspect-[5/3] flex-col justify-end overflow-hidden rounded-3xl p-5 shadow-card transition-[box-shadow] duration-(--duration-slow) ease-out hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      href={`/marketplace/c/${category.slug}`}
      style={{ backgroundColor: category.background, color: category.color }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-2 right-2 flex flex-col items-end gap-2 opacity-[0.3]"
        style={{ color: category.color, maskImage: "linear-gradient(to left bottom, black, transparent)" }}
      >
        {LATTICE.map((row, i) => (
          <div key={i} className="flex gap-2">
            {row.map((glyph, j) =>
              glyph === "bot" ? (
                <IconRobotFace key={j} className="size-7" stroke={1.5} aria-hidden="true" />
              ) : (
                <IconPuzzle key={j} className="size-7" stroke={1.5} aria-hidden="true" />
              ),
            )}
          </div>
        ))}
      </div>
      <div className="relative z-10 flex flex-col gap-4">
        <Icon className="size-6 drop-shadow-sm" stroke={1.75} aria-hidden="true" />
        <div className="flex flex-col gap-0.5">
          <span className="font-heading font-medium text-2xl leading-none drop-shadow-sm">{category.name}</span>
          <span className="text-xs opacity-80 drop-shadow-sm">{category.summary}</span>
        </div>
      </div>
    </a>
  );
}
