import type { JSX } from "react";
import Image from "next/image";

import { integrationLogos } from "@/components/settings/integration-logos";
import { integrations } from "@/lib/mock/integrations";
import { TOOL_LOGOS } from "@/lib/mock/tool-logos";
import { cn } from "@/lib/utils";

// The "what this agent touches" strip on an agent card: a short run of tool
// marks with the rest folded into a `+N`.
//
// The structure is the Gumloop agent tile's, measured 2026-09-09: flat square
// tiles butted edge to edge, separated by a 1px divider, the whole run inside
// ONE bordered, rounded group — and the `+N` is another tile in that same
// group rather than a pill sitting next to it. That last detail is the reason
// to copy the structure at all. A detached "+2" chip reads as a second thing,
// a count of something; the same tile in the same frame reads as "and these,
// folded", which is what it means. It also keeps the run to one object with
// one edge, so a card carries one more shape instead of four.
//
// Their pixels are not reproduced where a token says otherwise. They use a
// 26px tile at a 6px radius on a `bg-muted` slab; this uses a 24px tile
// (`IconTile`'s `sm`, so the row sits on the same grid as the composer's
// integration strip) at `rounded-md`, and the fill is `bg-tint-10` — one step
// more tinted than the `bg-tint-7` card under it. A tint rather than a named
// surface for the reason found-card.tsx spells out at length: the named
// surfaces are not symmetric between themes, and this group has to be the
// same one step above its card in both. `shadow-edge` and
// `divide-border-subtle` are the same hairline, so the frame and its internal
// dividers are one line weight (docs/brand/reskin-conventions.md, rules 4-6).
//
// The logos themselves keep their own colours (brand rule 10) and come from
// two places, in this order: the inline marks transcribed from the
// integrations page, then the artwork manifest for the ones that page does not
// carry. Nothing here inlines an SVG, so this file needs no entry on the
// lint-tokens ALLOW list.

/** How many marks show before the rest become `+N`. */
const SHOWN = 3;

/** Names come from the integrations catalogue, so a mark and the settings
 *  page that offers it are called the same thing to a screen reader. */
const INTEGRATION_NAMES = new Map(integrations.map((integration) => [integration.slug, integration.name]));

const inlineLogos: Record<string, (() => JSX.Element) | undefined> = integrationLogos;

function toolName(id: string): string {
  return INTEGRATION_NAMES.get(id) ?? TOOL_LOGOS[id]?.name ?? id;
}

function isKnown(id: string): boolean {
  return Boolean(inlineLogos[id] ?? TOOL_LOGOS[id]);
}

/** "Figma, GitHub and Linear" / "Gmail, Google Sheets, Linear and 2 more" —
 *  the tiles that are actually on screen, then the count the `+N` stands for,
 *  so what is heard and what is seen are the same list. */
function describeRow(shown: string[], hidden: number): string {
  const names = shown.map(toolName);
  if (hidden > 0) return `${names.join(", ")} and ${hidden} more`;
  if (names.length < 2) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/** One mark, drawn at 16px whichever source it came from. */
function ToolMark({ id }: { id: string }) {
  const Inline = inlineLogos[id];
  // The inline marks are fixed 24px SVGs with no size prop, so the tile sizes
  // them from outside; a class beats the element's width/height attributes.
  if (Inline) return <Inline />;

  const file = TOOL_LOGOS[id];
  if (!file) return null;
  // 32 for the 2x of a 16px mark. `.svg` sources skip the optimizer on their
  // own in this version of next/image.
  return <Image src={file.src} alt="" width={32} height={32} className="size-4 object-contain" />;
}

export function ToolIconRow({
  toolIds,
  className,
}: {
  toolIds: string[];
  className?: string;
}) {
  // Filtering first keeps the `+N` honest: an id with no artwork behind it
  // would otherwise buy an empty tile or be counted as one.
  const known = toolIds.filter(isKnown);
  const shown = known.slice(0, SHOWN);
  const hidden = known.length - shown.length;

  if (shown.length === 0) return null;

  return (
    // One label on the group, and `role="img"` to make it stick: an aria-label
    // on a bare div is dropped by most screen readers, and the marks inside
    // are decoration beside a title that already names the agent. The role
    // also collapses the run to a single stop, which is what it looks like.
    <div
      role="img"
      aria-label={describeRow(shown, hidden)}
      className={cn(
        "flex w-fit items-center divide-x divide-border-subtle overflow-hidden rounded-md bg-tint-10 shadow-edge",
        className,
      )}
    >
      {shown.map((id) => (
        <span key={id} aria-hidden="true" className="flex size-6 items-center justify-center [&>svg]:size-4">
          <ToolMark id={id} />
        </span>
      ))}
      {hidden > 0 && (
        // The `+N` idiom the marketplace tag row already uses, in this row's
        // shape instead of a badge's: same fill and same muted tier as
        // `<Badge variant="secondary">`, tabular figures so +1 and +9 measure
        // the same, and `min-w-6` rather than `size-6` so a two-digit count
        // grows the tile instead of spilling out of it.
        <span
          aria-hidden="true"
          className="flex h-6 min-w-6 items-center justify-center px-1 text-xs font-medium text-muted-foreground tabular-nums"
        >
          +{hidden}
        </span>
      )}
    </div>
  );
}
