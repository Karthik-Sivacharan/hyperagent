import { IconPencil } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// The shell both "here is what we found" cards wear, so the two are the same
// object twice rather than two cards that happen to sit together: same media
// slot, same title/subtitle pair, same corner action, same optional footer.
//
// Borrowed from the Gumloop agent tile (measured 2026-09-09): a flat surface
// whose separation is a hairline rather than a shadow, a title at ~500 weight
// over a two-line clamped description, a footer row of small bordered pieces,
// and a corner action that is fully visible at rest — that last one is worth
// stating, because the reflex is to hide it until hover. On a card whose whole
// job is "check this, fix what is wrong", a hidden edit affordance is the one
// control the screen cannot afford to hide, and hover-to-reveal does not exist
// on touch at all.
//
// Two deliberate departures from that reference. It paints its cards in the
// page's own colour and lets the border do everything; these are tinted
// (`bg-surface-raised`) because the found record has to read as a distinct
// object the page is handing you, not as more page. And its icon straddles the
// card's top edge, escaping it by 32px — a lovely move on a wide grid of
// tiles, and the wrong one here: two cards stacked in a 384px column would
// have to buy that overhang twice in vertical space the column does not have.
// The media stays inside, at the head of the row.
//
// The fill is `bg-tint-7` rather than one of the named surfaces, because the
// named ones are not symmetric here and this card has to weigh the same in
// both themes. `bg-card` is the canvas colour in light (a white card on a
// white page is nothing), `bg-surface-secondary` sinks BELOW the canvas in
// dark, and `bg-surface-raised` lands on #efefed in light against #222221 in
// dark — a heavy grey slab beside a whisper. A tint is a percentage of the
// theme's own neutral over whatever is behind it, so both themes get the same
// step and neither needs a `dark:` variant (docs/brand/reskin-conventions.md,
// "fills are tints").

export function FoundCard({
  media,
  title,
  subtitle,
  editLabel,
  footer,
  className,
  children,
}: {
  /** Avatar or logo tile. Sized by the caller; the row reserves 48px. */
  media: React.ReactNode;
  title: string;
  subtitle: string;
  /** Names the action for screen readers — "Edit" alone would not say what. */
  editLabel: string;
  /** The tag row, on the card that has one. */
  footer?: React.ReactNode;
  className?: string;
  /** The body line: an address on one card, a description on the other. */
  children?: React.ReactNode;
}) {
  return (
    <Card
      size="none"
      className={cn(
        // `size="none"` zeroes the primitive's own padding so the 40px media
        // and the 32px action can set the rhythm instead of a 16px default.
        "w-full gap-3 bg-tint-7 p-4",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {media}
        {/* min-w-0 is what lets the truncate below actually truncate: without
            it the flex item takes its content's intrinsic width and a long
            name pushes the action button off the card instead of ellipsing. */}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate font-heading text-base leading-snug font-medium text-foreground">{title}</p>
          <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {/* Muted at rest and first-tier on hover, so it is legible without
            competing with the name beside it. -mt-1 -mr-1 pulls the 32px
            target back so its ICON optically aligns with the card's 16px
            padding; a ghost button's box is bigger than the glyph it holds. */}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={editLabel}
          className="-mt-1 -mr-1 shrink-0 text-foreground-low hover:text-foreground"
        >
          <IconPencil aria-hidden="true" />
        </Button>
      </div>

      {children}
      {footer}
    </Card>
  );
}
