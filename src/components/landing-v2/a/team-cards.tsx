import { Fragment } from "react";
import Image from "next/image";

import { AgentGlyph } from "@/components/brand/agent-glyph";
import type { GlyphTone } from "@/components/brand/agent-glyph";
import { cn } from "@/lib/utils";

import { Reveal } from "../reveal";
import { TEAM_CARDS } from "./content";
import styles from "./team-cursors.module.css";

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
    drift: styles.driftA,
  },
  {
    shape: "trefoil",
    tone: "ink" as GlyphTone,
    arrow: "text-info",
    box: "bg-info",
    // At the end of the line, tip touching the last word's box, a step up so
    // the two never read as one repeated mark.
    at: "top-1/2 left-full translate-x-0.5 -translate-y-2",
    drift: styles.driftB,
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
// horizontal scroll on the page — including the few pixels the drift below
// takes it out past the last word's right edge.
//
// TWO SPANS, not one, and they divide the work: the outer one is WHERE the
// cursor lives, which is `at` against its word, and the inner one is the
// drifting it does there (./team-cursors.module.css). Keeping the anchor and
// the movement on separate elements means neither has to know what the other
// sets, and the drift is a pointer moving near its word rather than a second
// offset applied to the first.
function CollaboratorCursor({
  shape,
  tone,
  arrow,
  box,
  at,
  drift,
}: (typeof CURSORS)[number]) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute hidden select-none motion-safe:animate-fade-in md:block",
        at,
      )}
    >
      {/* `relative` so the box below still measures from the arrow rather
          than from the anchor, which leaves the pair's geometry exactly as it
          was and lets the two of them travel together. */}
      <span className={cn("relative block", styles.drift, drift)}>
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

// The colour field behind each shot, keyed by the shot it sits under. These
// are the band's own three of the twelve smear gradients: none of them is on
// the format showcase's six, so no two bands of the page ever show the same
// file. They run cool to warm across the row (a blue-teal, a violet, a rose),
// which reads as three cards rather than one repeated, and every one of them
// is dark and saturated enough to throw the product's light screenshots
// forward off it.
const SHOT_FIELDS: Record<string, string> = {
  roster: "/img/gradients/glacier.webp",
  run: "/img/gradients/nocturne.webp",
  thread: "/img/gradients/rosewood.webp",
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
//
// The colour field is the card's ground under the picture, in the idiom the
// brief cards use above: the gradient bleeds to the card's left, right and
// bottom edges and dissolves into the card's own neutral on the way up, so
// the shot floats on colour and not one word of the copy ever sits on one.
// These gradients are far too contrasty to set type on, which is what the
// dissolve is for, not taste.
//
// The field is anchored to the PICTURE, not to the panel: the panel starts
// wherever the copy above it ends, which is a different line on each of the
// three cards, while the pictures are packed to the bottom of equal-height
// cards and so start on one line across the row. Hanging the field 40px above
// the picture puts all three colour edges on that line too, and 40px is the
// gap the panel already opens between the copy and the shot, so the field
// fills exactly that gap and nothing about the card's metrics moves.
function ShotPanel({ shot }: { shot: { id: string; label: string } }) {
  const size = SHOT_SIZES[shot.id] ?? { width: 800, height: 598 };
  const field = SHOT_FIELDS[shot.id];
  return (
    <div
      role="img"
      aria-label={shot.label}
      className="mt-10 flex flex-1 flex-col justify-end"
    >
      <div className="relative pb-6 md:pb-10">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-10 bottom-0 overflow-hidden"
        >
          <Image
            src={field}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 768px) 34vw, 100vw"
            className="object-cover"
          />
          {/* The seam. The field's top edge against the card is a hard line
              across the card, so the card's own colour is laid back over the
              first 80px of it and the two grounds meet in a dissolve rather
              than a cut. It runs past the picture's top edge on purpose: the
              picture covers the lower half of the ramp, so what shows in the
              40px gap is only its quiet first half. */}
          <div className="absolute inset-x-0 top-0 h-20 bg-linear-to-b from-surface-raised to-transparent" />
        </div>
        <Image
          src={`/img/team/${shot.id}.webp`}
          alt=""
          width={size.width}
          height={size.height}
          aria-hidden="true"
          className="relative ms-6 h-auto w-[calc(100%+1rem)] max-w-none rounded-2xl shadow-card-soft md:ms-10"
        />
      </div>
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
