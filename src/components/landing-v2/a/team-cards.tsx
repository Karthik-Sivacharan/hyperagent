import { Fragment } from "react";
import Image from "next/image";

import { AgentGlyph } from "@/components/brand/agent-glyph";
import type { GlyphTone } from "@/components/brand/agent-glyph";
import { cn } from "@/lib/utils";

import { Reveal } from "../reveal";
import { TEAM_CARDS } from "./content";

// The band between the formats and the roster: a two-tone heading in the
// page's display cut with two other people's cursors standing on the words of
// it, then three cards that each say one thing and show a piece of the
// surface it happens on.
//
// The cards sit on the raised neutral (`bg-surface-raised`, a whisper above
// the page's `surface-secondary`) at the page's most generous radius. Each
// picture is shown whole from top to bottom and runs off the card's right
// edge, so the card reads as a window onto something wider.

// The arrow of a live cursor: tip at the top left, the tail notched out of
// the bottom edge. Drawn once and coloured by `currentColor`.
const CURSOR_ARROW = "M1 1 L1 17 L5.2 13 L8 19 L11 17.8 L8.2 11.9 L14 11.9 Z";

// The two agents standing on the heading. Two shapes and two glyph tones, so
// they read as two teammates rather than one repeated: the accent pairs with
// the ink body it always pairs with, the info blue takes the paper body.
// Blue is the brand's one other saturated hue (`--color-info`, the `blue`
// ramp), which keeps the second cursor inside the token system.
//
// `at` places the cursor against the word it is anchored to (see below): both
// stand at that word's right edge, the first pulled back into the space in
// front of the next word, the second a hair past the final period.
const CURSORS = [
  {
    shape: "fork",
    tone: "sand" as GlyphTone,
    arrow: "text-brand-accent",
    box: "bg-brand-accent",
    // Mid-line: the tip in the gap between two words, the box under the line.
    at: "top-1/2 left-full -translate-x-1.5",
  },
  {
    shape: "trefoil",
    tone: "ink" as GlyphTone,
    arrow: "text-info",
    box: "bg-info",
    // At the end of the line, tip touching the last word's box, a step up so
    // the two never read as one repeated mark.
    at: "top-1/2 left-full translate-x-0.5 -translate-y-2",
  },
] as const;

// One agent's cursor: the coloured arrow with its box, and the agent's glyph
// in the box instead of a name. Decorative: it carries nothing a reader of
// the heading needs, so the whole thing is out of the accessibility tree.
// Below `md` both cursors leave: two of them over a phone-width heading is
// noise, and the line has no room to be stood on at that width.
//
// Each one is absolute inside a `relative` span around a single word of the
// title, so it tracks that word wherever the line breaks put it instead of
// hanging off a measured offset that a re-wrap would strand. Being absolute,
// neither can shift the heading, and the section clips its own overflow on
// the x axis, so a cursor sitting past the last word can never open a
// horizontal scroll on the page.
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
        "pointer-events-none absolute hidden select-none motion-safe:animate-fade-in md:block",
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

// The intrinsic size of each shot, keyed by its file, since the three differ
// by a few pixels. next/image reserves the exact box from these, so the card
// is its final height from the first frame.
const SHOT_SIZES: Record<string, { width: number; height: number }> = {
  roster: { width: 800, height: 598 },
  run: { width: 800, height: 608 },
  thread: { width: 800, height: 598 },
};

// The picture on each card: a screen of the product under the copy, whole
// from top to bottom and running off the card's right edge, so it reads as a
// view onto something wider rather than a framed thumbnail. The image is in
// flow and sized `h-auto`, so the card is exactly as tall as the picture it
// holds and nothing is cut off the bottom; the card's own `overflow-hidden`
// takes the right-hand bleed.
//
// Its left edge and its bottom edge are the card's own padding (24px, 40 from
// `md`), so the picture starts on the same line as the heading above it and
// leaves the same margin under it as the copy has over it. The 40px above the
// picture is the page's copy-to-media step, the one the brief cards take
// between their two halves.
//
// The panel is the card's flexible row and packs to the bottom, so on the
// three cards of one grid row — equal width, so equal picture height, and
// equal height whatever the body copy runs to — the pictures line up with
// each other and any slack from a shorter paragraph opens above them.
//
// `role="img"` with the label carries what a sighted reader gets; the file
// itself stays out of the tree, so nothing is announced twice.
function ShotPanel({ shot }: { shot: { id: string; label: string } }) {
  const size = SHOT_SIZES[shot.id] ?? { width: 800, height: 598 };
  return (
    <div
      role="img"
      aria-label={shot.label}
      className="mt-10 flex flex-1 flex-col justify-end pb-6 md:pb-10"
    >
      <Image
        src={`/img/team/${shot.id}.webp`}
        alt=""
        width={size.width}
        height={size.height}
        aria-hidden="true"
        className="ms-6 h-auto w-[calc(100%+1rem)] max-w-none rounded-2xl shadow-card-soft md:ms-10"
      />
    </div>
  );
}

export function TeamCards() {
  const { id, heading, items } = TEAM_CARDS;
  const headingId = `${id}-heading`;
  // The title, cut into its words so a cursor can stand on one of them. Both
  // anchors are derived from the copy's own length — one around the middle of
  // the line, one on the last word — so a copy edit moves the cursors with
  // the words instead of stranding them, and content.ts stays words alone.
  const words = heading.title.split(" ");
  const anchors = new Map<number, (typeof CURSORS)[number]>([
    [Math.max(Math.ceil(words.length / 2) - 1, 0), CURSORS[0]],
    [words.length - 1, CURSORS[1]],
  ]);
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="scroll-mt-16 overflow-x-clip px-4 py-24 sm:px-6 md:py-40"
    >
      <div className="mx-auto max-w-6xl">
        {/* SectionHeading's own markup and classes, hand-rolled here for the
            one thing the component cannot give: a title broken into words, so
            a cursor can stand on one of them. `cut="display"`'s classes are
            copied verbatim (`text-heading-display` on both lines, hierarchy
            by colour), so this band and the format showcase share one
            treatment; SectionHeading's default `cut` is untouched. The
            cursors are absolute, so the heading's own text flow and balance
            are as the component would set them. */}
        <Reveal className="flex max-w-4xl flex-col gap-1">
          <h2
            id={headingId}
            className="text-heading-display text-balance text-foreground"
          >
            {words.map((word, index) => {
              const cursor = anchors.get(index);
              // The space that follows a word travels with it, inside the
              // same text node: a whitespace-only node of its own is dropped
              // from the accessibility tree, and the heading — which names
              // the whole section — would be announced as one long word.
              const text = index < words.length - 1 ? `${word} ` : word;
              return cursor ? (
                <span key={`${index}-${word}`} className="relative">
                  {text}
                  <CollaboratorCursor {...cursor} />
                </span>
              ) : (
                <Fragment key={`${index}-${word}`}>{text}</Fragment>
              );
            })}
          </h2>
          <p className="text-heading-display text-pretty text-muted-foreground">
            {heading.sub}
          </p>
        </Reveal>

        {/* The one place on the page a stagger reads as a single movement:
            three cards side by side from `md`, so they cross the fold
            together and can arrive left to right, 80ms apart. Each card IS
            its own Reveal — the div the card already was — so the grid still
            sizes them as one row and the pictures stay on one line. */}
        <div className="mt-16 grid gap-4 md:mt-20 md:grid-cols-3 md:gap-6">
          {items.map((item, index) => {
            const shot = TEAM_CARDS.shots[index];
            return (
              <Reveal
                key={item.id}
                step={index + 1}
                className="flex flex-col overflow-hidden rounded-4xl bg-surface-raised md:rounded-5xl"
              >
                <div className="flex flex-col gap-3 px-6 pt-6 md:px-10 md:pt-10">
                  <h3 className="text-xl text-balance text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-base text-pretty text-muted-foreground">
                    {item.body}
                  </p>
                </div>
                <ShotPanel shot={shot} />
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
