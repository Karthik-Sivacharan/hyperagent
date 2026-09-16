import Image from "next/image";

import { AgentGlyph } from "@/components/brand/agent-glyph";
import type { GlyphTone } from "@/components/brand/agent-glyph";
import { cn } from "@/lib/utils";

import { TEAM_CARDS } from "./content";

// The band between the formats and the roster: a two-tone heading in the
// page's display cut with two other people's cursors standing at the end of
// it, then three cards that each say one thing and show a cropped piece of
// the surface it happens on.
//
// The cards sit on the raised neutral (`bg-surface-raised`, a whisper above
// the page's `surface-secondary`) at the page's most generous radius, and
// every picture is cut by the card's bottom edge rather than fitted into it,
// so the card reads as a window onto something larger.

// The arrow of a live cursor: tip at the top left, the tail notched out of
// the bottom edge. Drawn once and coloured by `currentColor`.
const CURSOR_ARROW = "M1 1 L1 17 L5.2 13 L8 19 L11 17.8 L8.2 11.9 L14 11.9 Z";

// The two agents standing on the heading. Two shapes and two glyph tones, so
// they read as two teammates rather than one repeated: the accent pairs with
// the ink body it always pairs with, the info blue takes the paper body.
// Blue is the brand's one other saturated hue (`--color-info`, the `blue`
// ramp), which keeps the second cursor inside the token system.
const CURSORS = [
  {
    shape: "fork",
    tone: "sand" as GlyphTone,
    arrow: "text-brand-accent",
    box: "bg-brand-accent",
    // Just past the last word, tip on the middle of the line.
    at: "ms-4 -translate-y-[0.75rem]",
  },
  {
    shape: "trefoil",
    tone: "ink" as GlyphTone,
    arrow: "text-info",
    box: "bg-info",
    // Further out and a step down, so the two never sit on one another.
    at: "ms-20 translate-y-[0.5rem]",
  },
] as const;

// One agent's cursor: the coloured arrow with its box, and the agent's glyph
// in the box instead of a name. Decorative: it carries nothing a reader of
// the heading needs, so the whole thing is out of the accessibility tree.
// Below `md` both cursors leave: two of them over a phone-width heading is
// noise, and there is no room beside the line at that width.
//
// Both are anchored to `left-full` on a box that hugs the title, so they
// stand in the empty room after the last word however the title is set, and
// they follow the left-aligned line instead of a centre that no longer
// exists. The title's box is capped at `max-w-4xl` inside a `max-w-6xl`
// container, so the furthest of the two (5rem out, about 2rem wide) can
// never reach the page gutter, shift the layout or open a horizontal scroll.
function CollaboratorCursor({
  shape,
  tone,
  arrow,
  box,
  at,
}: (typeof CURSORS)[number]) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute top-1/2 left-full hidden select-none motion-safe:animate-fade-in md:block",
        at,
      )}
    >
      <svg
        viewBox="0 0 16 20"
        fill="currentColor"
        className={cn("h-5 w-4 drop-shadow-sm", arrow)}
      >
        <path d={CURSOR_ARROW} />
      </svg>
      <span
        className={cn(
          "absolute top-4 left-3 flex items-center justify-center rounded-lg p-1 shadow-sm",
          box,
        )}
      >
        <AgentGlyph shape={shape} tone={tone} tile={false} size={16} />
      </span>
    </span>
  );
}

// The picture on each card: a screen of the product, pinned under the copy
// and running off the card's right and bottom edges, so it reads as a view
// onto something larger rather than a framed thumbnail. `role="img"` with the
// label carries what a sighted reader gets; the file itself stays out of the
// tree, so nothing is announced twice.
function ShotPanel({ shot }: { shot: { id: string; label: string } }) {
  return (
    <div
      role="img"
      aria-label={shot.label}
      className="relative mt-8 min-h-36 flex-1 overflow-hidden sm:min-h-40"
    >
      <Image
        src={`/img/team/${shot.id}.webp`}
        alt=""
        width={800}
        height={608}
        aria-hidden="true"
        className="absolute top-0 left-5 w-[calc(100%+1rem)] max-w-none rounded-2xl shadow-card-soft"
      />
    </div>
  );
}

export function TeamCards() {
  const { id, heading, items } = TEAM_CARDS;
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="scroll-mt-16 px-4 py-20 sm:px-6 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        {/* SectionHeading's own markup and classes, hand-rolled here for the
            one thing the component cannot give: a box that hugs the title, so
            the cursors can stand at the end of the line. `cut="display"`'s
            classes are copied verbatim (`text-heading-display` on both lines,
            hierarchy by colour), so this band and the format showcase share
            one treatment; SectionHeading's default `cut` is untouched.
            The cursors are absolute, so the heading's own text flow and
            balance are as the component would set them. */}
        <div className="flex max-w-4xl flex-col gap-1">
          <div className="relative w-fit">
            <h2
              id={headingId}
              className="text-heading-display text-balance text-foreground"
            >
              {heading.title}
            </h2>
            {CURSORS.map((cursor) => (
              <CollaboratorCursor key={cursor.shape} {...cursor} />
            ))}
          </div>
          <p className="text-heading-display text-pretty text-muted-foreground">
            {heading.sub}
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-3 md:gap-6">
          {items.map((item, index) => {
            const shot = TEAM_CARDS.shots[index];
            return (
              <div
                key={item.id}
                className="flex flex-col overflow-hidden rounded-4xl bg-surface-raised md:rounded-5xl"
              >
                <div className="flex flex-col gap-2 px-6 pt-8 md:px-7 md:pt-10">
                  <h3 className="text-xl text-balance text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-base text-pretty text-muted-foreground">
                    {item.body}
                  </p>
                </div>
                <ShotPanel shot={shot} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
