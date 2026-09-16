"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

import { BRIEF_CARDS } from "./content";
import { SectionHeading } from "./section";

// The band that walks one assignment through its three stages: describe,
// build, deliver.
//
// The shape is an index beside a stack. On a wide screen the three stage
// names stand in a column that stays with the reader while the panels beside
// them scroll past, and the name of whichever panel is crossing the middle of
// the screen goes from the muted tier to ink. Nothing is hijacked and nothing
// moves on its own: the rail is `position: sticky` and the only thing the
// page listens for is which panel is in the middle, which is the reader's own
// scroll position read back to them. Clicking a name scrolls to its panel and
// puts the keyboard there, and with no JavaScript the same markup is three
// in-page links that jump.
//
// Below `lg` the rail would be a second column on a phone, so it goes, and
// each panel carries its own stage name again in the muted tier above its
// claim — the two-tone heading this band has always had. The name is only
// hidden from the eye at `lg` (`sr-only`), never from the tree, so the
// heading a screen reader announces is the same sentence at every width.
//
// Each panel is a neutral card with a colour field filling it from the copy
// column's edge to its own three: the picture of the work floats on the
// field and runs off the card's right edge, so the panel reads as a window
// onto something wider. The field is one of the band's three gradients, which
// are too contrasty to set type on, so no word of the panel ever sits on one.

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

// The panels' element ids, derived once: the rail links to them, the observer
// watches them, and a click focuses one.
const PANEL_IDS = BRIEF_CARDS.items.map(
  (card) => `${BRIEF_CARDS.id}-${card.id}`,
);

/**
 * The id of the panel crossing the middle of the screen.
 *
 * A tenth of the viewport, centred, is the whole observed root: a panel is
 * "the one being read" while it covers the middle, and the panels are taller
 * than the gaps between them, so something is always in that band. When
 * nothing is — the moment a gap passes through it — the last answer stands
 * rather than the rail blanking, which is why the state is only ever written
 * with a panel that is actually there.
 *
 * Nothing runs on scroll: the observer fires on the crossings alone.
 */
function useStageInTheMiddle(ids: readonly string[]): string {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    if (typeof IntersectionObserver !== "function") return;
    const panels = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);
    if (panels.length === 0) return;

    const inTheMiddle = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inTheMiddle.add(entry.target.id);
          else inTheMiddle.delete(entry.target.id);
        }
        const first = ids.find((id) => inTheMiddle.has(id));
        if (first) setActive(first);
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const panel of panels) observer.observe(panel);
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

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

// One name in the index. A real in-page link, so it works before the page is
// interactive and lands in the reader's history the way a link should; the
// handler only takes over to make the jump a scroll and to hand the keyboard
// to the panel it arrives at.
//
// `aria-current="step"` is the state: these are stages of one job, which is
// the word ARIA has for it, and it is what colours the name and draws the
// tick. The tick grows from a third of its width rather than appearing, so
// nothing on the row ever changes size and the name beside it cannot move;
// the property named in the transition is `scale`, never `transform`, since
// that is what Tailwind compiles `scale-x-*` to.
//
// 44px of row on a phone — the rail is not shown there, but the size is what
// keeps the link a thumb's target wherever a narrow window puts it.
function StageLink({
  id,
  label,
  active,
}: {
  id: string;
  label: string;
  active: boolean;
}) {
  const onClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      const panel = document.getElementById(id);
      // No panel, or a reader who has asked for less motion: the browser's
      // own jump is both the correct answer and the one they asked for.
      if (
        !panel ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        return;
      event.preventDefault();
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
      // The panel is a -1 tab stop, so this moves the keyboard to what the
      // reader just asked for without stealing the scroll back or painting a
      // focus ring on a block nobody tabbed to.
      panel.focus({ preventScroll: true });
      history.replaceState(null, "", `#${id}`);
    },
    [id],
  );

  return (
    <a
      href={`#${id}`}
      onClick={onClick}
      aria-current={active ? "step" : undefined}
      className="group flex min-h-11 items-center gap-4 text-lg text-muted-foreground transition-colors duration-(--duration-fast) ease-out-quart hover:text-foreground aria-[current=step]:text-foreground xl:text-xl"
    >
      <span
        aria-hidden="true"
        className="h-px w-6 shrink-0 origin-left scale-x-50 bg-border-loud transition-[scale,background-color] duration-(--duration-normal) ease-out-quart group-aria-[current=step]:scale-x-100 group-aria-[current=step]:bg-foreground"
      />
      <span className="text-balance">{label}</span>
    </a>
  );
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

function BriefPanel({ card }: { card: (typeof BRIEF_CARDS.items)[number] }) {
  const media = MEDIA[card.id];
  // The picture takes two thirds of the panel at `lg` and three quarters once
  // there is room for it, which is where the copy column stops gaining
  // anything from the width and the work starts to.
  return (
    <div className="grid gap-12 p-6 md:gap-14 md:p-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10 lg:p-10 xl:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
      <div className="flex flex-col">
        <h3 className="text-xl font-medium text-balance md:text-2xl">
          {/* The stage name. The rail says it at `lg`, so there it is read
              out and not drawn; at every width below, it is the muted first
              line of the heading it has always been.

              The space that follows it travels inside its own text node: a
              whitespace-only node is dropped from the accessibility tree, and
              the two lines of the heading would be announced as one word with
              no gap ("what you need.They take it"). It collapses to nothing
              on a line of its own, and the line is hidden at `lg` anyway. */}
          <span className="block text-muted-foreground lg:sr-only">
            {`${card.lead} `}
          </span>
          <span className="block text-foreground">{card.claim}</span>
        </h3>
        {/* The sentence sits under the claim on a phone and drops to the foot
            of the column beside the picture, which is the air the panel is
            built around: a claim at the top, a line at the bottom, and the
            work itself filling everything to the right of them. */}
        <p className="mt-4 max-w-[46ch] text-base text-pretty text-muted-foreground lg:mt-auto lg:pt-10">
          {card.body}
        </p>
      </div>

      {/* The colour field and the picture on it. The field is inset by exactly
          the panel's own padding, so it meets the card's top, bottom and right
          edges and, at `lg`, the copy column's edge across the grid's gap; one
          trio of negative insets covers all three widths because the padding
          and the gap are the same step at each. It is absolute and the window
          is in flow, so the panel is exactly as tall as the window plus its
          room and the picture can never move anything as it arrives. */}
      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute -inset-6 overflow-hidden md:-inset-8 lg:-inset-10"
        >
          <Image
            src={media.gradient}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover"
          />
          {/* The seam. The field's own edge against the card is a hard line
              across the panel on a phone and down it beside the copy at `lg`,
              so the card's colour is laid back over the first 64 or 96px of
              it and the two grounds meet in a dissolve instead of a cut. */}
          <div className="absolute inset-x-0 top-0 h-16 bg-linear-to-b from-surface-raised to-transparent lg:inset-y-0 lg:right-auto lg:h-auto lg:w-24 lg:bg-linear-to-r" />
        </div>
        {/* The bleed is to the right alone. Every one of the three clips keeps
            its point in the lower half of the frame, so nothing is ever cut
            off the bottom; the right tenth of each is the room beside the
            product, which is what the card's edge takes. */}
        <div className="relative lg:-me-24">
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
  const { id, heading, items, stagesLabel } = BRIEF_CARDS;
  const headingId = `${id}-heading`;
  const active = useStageInTheMiddle(PANEL_IDS);

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="scroll-mt-16 px-4 py-24 sm:px-6 md:py-40"
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

        <div className="mt-16 grid gap-6 md:mt-20 lg:grid-cols-[minmax(0,3fr)_minmax(0,9fr)] lg:gap-16">
          {/* The index. The column is a grid item, so it is as tall as the
              stack beside it and the rail can stay with the reader the whole
              way down; `top-28` parks it clear of the sticky header, the step
              the page's other sticky column already takes. */}
          <div className="hidden lg:block">
            <nav aria-label={stagesLabel} className="sticky top-28">
              <ol role="list" className="flex flex-col gap-5">
                {items.map((card, index) => (
                  <li key={card.id}>
                    <StageLink
                      id={PANEL_IDS[index]}
                      label={card.lead}
                      active={active === PANEL_IDS[index]}
                    />
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          {/* The stack. The three arrive together, not on a 0/1/2 ladder:
              the panels are most of a screen apart, so the scroll already
              sequences them and a growing delay would only read as lag on the
              last one. `scroll-mt` lands a panel under the header on the same
              line the rail's first name sits on. */}
          <ol role="list" className="flex flex-col gap-4 md:gap-6">
            {items.map((card, index) => (
              <li
                key={card.id}
                id={PANEL_IDS[index]}
                tabIndex={-1}
                className="scroll-mt-28 focus:outline-none"
              >
                <div className="overflow-hidden rounded-4xl bg-surface-raised md:rounded-5xl lg:min-h-96">
                  <BriefPanel card={card} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
