import { DESKTOP_WALLPAPER, type Wallpaper } from "@/lib/mock/workspace";

import type { DemoAgentId } from "../demo-agents";

// One wallpaper per agent, painted by the workspace's own wallpaper
// (workspace-artwork.tsx): a base, three soft fields and a highlight, under
// the same vignette and grain. Only the palette changes. The app's desktop is
// a blue field over a sand one and a rose one on a mauve base; in OKLCH that
// is one hue (257) with the sand turned 180deg, the rose 104deg and the base
// 78deg, at the lightness and chroma below. Each agent keeps those steps and
// turns them to its own hue, so the six read as one set. Colours are CSS
// relative colour from the brand's neutral ramp, which stays light in both
// themes, as the app's wallpaper does.

const HUES: Record<DemoAgentId, number> = {
  engineering: 252,
  marketing: 42,
  copywriting: 305,
  support: 158,
  sales: 70,
  data: 195,
};

// Every other agent gets the fields mirrored left to right, so neighbours in
// the list do not share a layout as well as a technique.
const MIRRORED: ReadonlySet<DemoAgentId> = new Set([
  "marketing",
  "support",
  "data",
]);

const turn = (hue: number, by: number) => (hue + by) % 360;

function wallpaperFor(id: DemoAgentId): Wallpaper {
  const hue = HUES[id];
  const colors = [
    `oklch(from var(--color-neutral-500) l 0.068 ${hue})`,
    `oklch(from var(--color-neutral-300) calc(l - 0.035) 0.042 ${turn(hue, 180)})`,
    `oklch(from var(--color-neutral-400) calc(l - 0.01) 0.053 ${turn(hue, 104)})`,
  ];
  const mirrored = MIRRORED.has(id);
  return {
    base: `oklch(from var(--color-neutral-400) calc(l - 0.01) 0.017 ${turn(hue, 78)})`,
    fields: DESKTOP_WALLPAPER.fields.map((field, i) => ({
      ...field,
      left: mirrored ? 100 - field.left - field.size : field.left,
      color: colors[i],
    })),
    highlight: mirrored
      ? {
          x: 100 - DESKTOP_WALLPAPER.highlight.x,
          y: DESKTOP_WALLPAPER.highlight.y,
        }
      : DESKTOP_WALLPAPER.highlight,
  };
}

export const WALLPAPERS: Record<DemoAgentId, Wallpaper> = {
  engineering: wallpaperFor("engineering"),
  marketing: wallpaperFor("marketing"),
  copywriting: wallpaperFor("copywriting"),
  support: wallpaperFor("support"),
  sales: wallpaperFor("sales"),
  data: wallpaperFor("data"),
};
