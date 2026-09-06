import type { AgentIcon as AgentIconData } from "@/lib/mock/marketplace";
import { FillImage } from "@/components/marketplace/listing-meta";

// The 40px icon tile in an agent card's header (docs/reference/pages/
// marketplace.html). Uploaded icons are plain images; otherwise the site
// generates a "mesh": base colour, three blurred radial blobs, a vignette, a
// highlight, a soft-light noise layer, then the emoji on top. The inline
// styles are copied from the live markup.

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function AgentIcon({ icon, size = 40 }: { icon: AgentIconData; size?: number }) {
  return (
    <div
      className="relative flex select-none items-center justify-center overflow-hidden shrink-0 rounded-[6px]"
      aria-hidden="true"
      style={{ width: size, height: size }}
    >
      {icon.kind === "image" ? (
        <FillImage src={icon.src} />
      ) : (
        <>
          <div
            className="overflow-hidden absolute inset-0"
            style={{ backgroundColor: icon.base, containerType: "size" }}
          >
            {icon.blobs.map((blob, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  top: blob.top,
                  left: blob.left,
                  width: blob.size,
                  height: blob.size,
                  background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
                  filter: "blur(clamp(3px, 18cqmin, 28px))",
                  opacity: 0.95,
                }}
              />
            ))}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(transparent 45%, rgba(0, 0, 0, 0.15) 100%)" }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(at ${icon.highlight[0]} ${icon.highlight[1]}, rgba(255, 255, 255, 0.12) 0%, transparent 55%)`,
              }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: NOISE,
                backgroundRepeat: "repeat",
                opacity: 0.3,
                mixBlendMode: "soft-light",
              }}
            />
          </div>
          <div className="absolute inset-0 bg-black" style={{ opacity: 0.15 }} />
          <span className="relative leading-none drop-shadow-sm" style={{ fontSize: size / 2 }}>
            {icon.emoji}
          </span>
        </>
      )}
    </div>
  );
}
