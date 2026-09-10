import { IconFileText } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { Wallpaper } from "@/lib/mock/workspace";

// The pictures in the workspace, as hyperagent.com paints them
// (docs/reference/overlays/thread-workspace-carousel.html). Artwork rather
// than skin (docs/brand/reskin-conventions.md rule 10), which is why this file
// sits on the token lint's allow-list: the colours here are part of the
// picture. The wallpaper's palette is data (`DESKTOP_WALLPAPER`); only the
// layers every wallpaper shares are written down here.

// 200px of desaturated fractal noise, tiled, laid over everything at half
// strength in overlay: the grain that makes the soft fields read as a surface.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/**
 * The desktop: a flat base, the colour fields (blurred by a clamp on the
 * container's short side, so a small desktop stays soft without smearing), a
 * vignette that darkens the corners 15%, one 12% highlight and the grain.
 * Fills whatever positioned box it is put in.
 */
export function WorkspaceWallpaper({ wallpaper, className }: { wallpaper: Wallpaper; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden select-none [container-type:size]", className)}
      style={{ backgroundColor: wallpaper.base }}
    >
      {wallpaper.fields.map((field, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-95"
          style={{
            top: `${field.top}%`,
            left: `${field.left}%`,
            width: `${field.size}%`,
            height: `${field.size}%`,
            background: `radial-gradient(circle, ${field.color} 0%, transparent 70%)`,
            filter: "blur(clamp(3px, 18cqmin, 28px))",
          }}
        />
      ))}
      <div className="absolute inset-0" style={{ background: "radial-gradient(transparent 45%, rgb(0 0 0 / 0.15) 100%)" }} />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(at ${wallpaper.highlight.x}% ${wallpaper.highlight.y}%, rgb(255 255 255 / 0.12) 0%, transparent 55%)`,
        }}
      />
      <div className="absolute inset-0 opacity-50 mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
    </div>
  );
}

/**
 * A document's tile in the dock: the file glyph on the site's document blue.
 * A file-type face, like an app icon, so it keeps the site's colour; the image
 * tile's face is the image itself.
 */
export function DocumentTileFace() {
  return (
    <span
      className="pointer-events-none flex size-full items-center justify-center"
      style={{ background: "linear-gradient(145deg, rgb(37 99 235), rgb(29 78 216))" }}
    >
      <IconFileText className="size-5 text-white/80" aria-hidden="true" />
    </span>
  );
}
