import {
  Bot,
  ChartColumn,
  Code,
  Megaphone,
  Microscope,
  PenTool,
  Puzzle,
  TrendingUp,
  UserSearch,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import type { CategoryIcon, MarketplaceCategory } from "@/lib/mock/marketplace";

// "Browse by category" tile (docs/reference/pages/marketplace.html): a 5:3
// coloured card with a faded 3x4 lattice of bot / puzzle glyphs in the
// top-right corner and the category icon, name and counts bottom-left.

const ICONS: Record<CategoryIcon, LucideIcon> = {
  megaphone: Megaphone,
  microscope: Microscope,
  "user-search": UserSearch,
  "trending-up": TrendingUp,
  code: Code,
  "pen-tool": PenTool,
  "chart-column": ChartColumn,
  workflow: Workflow,
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
      className="relative flex aspect-[5/3] flex-col justify-end overflow-hidden rounded-[16px] border border-border/40 p-5 transition-opacity hover:opacity-90"
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
                <Bot key={j} className="size-7" strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <Puzzle key={j} className="size-7" strokeWidth={1.5} aria-hidden="true" />
              ),
            )}
          </div>
        ))}
      </div>
      <div className="relative z-10 flex flex-col gap-4">
        <Icon className="size-6 drop-shadow-sm" strokeWidth={1.75} aria-hidden="true" />
        <div className="flex flex-col gap-0.5">
          <span className="font-display font-medium text-2xl leading-none tracking-[-0.24px] drop-shadow-sm">
            {category.name}
          </span>
          <span className="text-xs opacity-80 drop-shadow-sm">{category.summary}</span>
        </div>
      </div>
    </a>
  );
}
