"use client";

import Image from "next/image";
import { useEffect, useRef, type RefObject } from "react";

import { cn } from "@/lib/utils";

import { BRIEF_CARDS } from "./content";
import { SectionHeading } from "./section";

// The band that walks one assignment through its three stages: describe,
// build, deliver. Three full-width cards stacked down the page, the sides
// alternating, so the eye zigzags instead of reading three identical rows.
//
// The text side opens on a two-tone heading broken by hand into a muted line
// and an ink one, with a sentence under it at a 580px measure. The media side
// is an app window floating on the card's gradient: a hairline, a quiet title
// bar, and the clip below it. No drop shadow anywhere; the window is held by
// its hairline and the colour behind it.

// Everything about a card that is not copy. Keyed by the card's id so the
// copy in content.ts stays words alone.
const MEDIA: Record<
  string,
  { video: string; poster: string; gradient: string }
> = {
  describe: {
    video: "/video/brief/describe.mp4",
    poster: "/img/brief/poster-describe.webp",
    gradient: "/img/brief/gradient-1.webp",
  },
  build: {
    video: "/video/brief/build.mp4",
    poster: "/img/brief/poster-build.webp",
    gradient: "/img/brief/gradient-2.webp",
  },
  deliver: {
    video: "/video/brief/deliver.mp4",
    poster: "/img/brief/poster-deliver.webp",
    gradient: "/img/brief/gradient-3.webp",
  },
};

/**
 * Plays the clip only while its card is on screen, and never at all when the
 * reader has asked for less motion.
 *
 * Three clips decoding at once is the thing to avoid, so the observer pauses
 * every video the reader has scrolled past and starts the one in front of
 * them. `prefers-reduced-motion: reduce` is read here in JS rather than left
 * to CSS, because CSS cannot stop `play()`: the element keeps its poster and
 * never starts. The quarter threshold waits until enough of the card is in
 * view to be worth watching; `play()` is a promise that rejects when a pause
 * interrupts it, which is ordinary and not an error worth reporting.
 */
function useClipInView(ref: RefObject<HTMLVideoElement | null>) {
  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    // React sets `muted` as a property and does not always write the
    // attribute into the server's HTML, and a browser only lets a script
    // start a video that is muted. Setting it here makes the rule hold
    // however the element was rendered. The clips carry no audio anyway.
    video.muted = true;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let onScreen = false;

    const sync = () => {
      if (reduced.matches || !onScreen) {
        video.pause();
        return;
      }
      void video.play().catch(() => {});
    };

    const observer = new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((entry) => entry.isIntersecting);
        sync();
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    reduced.addEventListener("change", sync);

    return () => {
      observer.disconnect();
      reduced.removeEventListener("change", sync);
      video.pause();
    };
  }, [ref]);
}

// The window the clip plays inside. `role="img"` with the card's label is
// the whole thing a screen reader gets: the bar, the dots and the video are
// decoration on top of a heading and a sentence that already say it. The
// dots are one muted grey rather than three colours, because they are a
// shape that reads as "a window", not a control anyone can press.
function AppWindow({
  title,
  label,
  video,
  poster,
}: {
  title: string;
  label: string;
  video: string;
  poster: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useClipInView(ref);

  return (
    <div
      role="img"
      aria-label={label}
      className="relative overflow-hidden rounded-md border border-border-subtle bg-background"
    >
      {/* 36px of chrome: the dots and the title share one grid cell, so the
          title is centred on the window rather than on the room left of the
          dots. The hairline is drawn inside the bar, so the bar stays 36px. */}
      <div className="grid h-9 items-center bg-tint-5 shadow-[inset_0_-1px_0_0_var(--border-subtle)]">
        <span
          aria-hidden="true"
          className="col-start-1 row-start-1 flex items-center gap-2 pl-3.5"
        >
          <span className="size-3 rounded-full bg-tint-20" />
          <span className="size-3 rounded-full bg-tint-20" />
          <span className="size-3 rounded-full bg-tint-20" />
        </span>
        <span className="col-start-1 row-start-1 truncate px-16 text-center text-md text-muted-foreground">
          {title}
        </span>
      </div>
      <video
        ref={ref}
        aria-hidden="true"
        tabIndex={-1}
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        src={video}
        className="block aspect-video w-full object-cover"
      />
    </div>
  );
}

function BriefCard({
  card,
  flipped,
}: {
  card: (typeof BRIEF_CARDS.items)[number];
  flipped: boolean;
}) {
  const media = MEDIA[card.id];
  return (
    <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
      <div className={cn("flex flex-col", flipped && "md:order-last")}>
        <h3 className="text-xl font-medium text-balance md:text-2xl">
          <span className="block text-muted-foreground">{card.lead}</span>
          <span className="block text-foreground">{card.claim}</span>
        </h3>
        <p className="mt-4 max-w-[580px] text-base text-pretty text-muted-foreground">
          {card.body}
        </p>
      </div>

      {/* The gradient is absolute and the window is in flow, so the panel is
          exactly as tall as the window plus its padding and the picture can
          never move anything as it arrives. */}
      <div className="relative overflow-hidden rounded-4xl">
        <Image
          src={media.gradient}
          alt=""
          fill
          unoptimized
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="relative p-5 sm:p-8 md:p-7 lg:p-10">
          <AppWindow
            title={card.window}
            label={card.label}
            video={media.video}
            poster={media.poster}
          />
        </div>
      </div>
    </div>
  );
}

export function BriefCards() {
  const { id, heading, items } = BRIEF_CARDS;
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="scroll-mt-16 px-4 py-20 sm:px-6 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        {/* One heading treatment across the page: the display cut, flush on
            the container's left edge, with the sub under it at the same size
            in the muted tier. `cut` is passed here rather than changed in
            SectionHeading, whose default stays `section` for variant A. */}
        <SectionHeading
          id={headingId}
          heading={heading}
          cut="display"
          className="max-w-4xl"
        />

        <div className="mt-12 flex flex-col gap-16 md:mt-16 md:gap-24">
          {items.map((card, index) => (
            <BriefCard key={card.id} card={card} flipped={index % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
