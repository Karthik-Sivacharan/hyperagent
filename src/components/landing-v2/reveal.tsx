"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

import styles from "./reveal.module.css";

// The share of the viewport a block has to reach before it counts as arrived.
// It is the IntersectionObserver's own `rootMargin` written as a number, so
// the observer and the geometric test below can never disagree about where
// the line is.
const ARRIVAL = 0.9;

// One passive scroll listener for the whole page, shared by every block that
// has not arrived yet, and taken down again once the last one has.
//
// It is here because an IntersectionObserver alone cannot see a JUMP. The
// observer reports threshold CROSSINGS, and a click on an in-page anchor
// moves the page in one frame: every block between where the reader was and
// where they landed goes from "below the fold" to "above the fold" without
// ever being on screen, so its ratio reads 0 before and 0 after and no
// callback is delivered. Those blocks would sit on their held-back first
// frame for good — the reader scrolls back up into a column of blank paper.
// The header's nav is five such anchors, so this is the ordinary path
// through the page rather than a corner of it.
//
// A scroll listener sees it, because a jump still fires `scroll`. The work
// per event is one `getBoundingClientRect` per block that has not played,
// batched into a frame, and the whole thing unsubscribes as the page fills
// in — by the time the reader is at the foot of the page there is no
// listener left.
const pending = new Set<() => void>();
let frame = 0;

function onScroll() {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    // A copy, since a check that arrives removes itself from the set.
    for (const check of [...pending]) check();
  });
}

function watchScroll(check: () => void) {
  if (pending.size === 0) {
    window.addEventListener("scroll", onScroll, { passive: true });
  }
  pending.add(check);
  return () => {
    pending.delete(check);
    if (pending.size === 0) {
      window.removeEventListener("scroll", onScroll);
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    }
  };
}

// One band of the page arriving: a fade and a rise, played once, when the
// reader first reaches it. The timing, the held-back first frame and the two
// ways out of it are in reveal.module.css.
//
// `Reveal` renders a plain div and takes the caller's classes, so it can BE
// the element it reveals — a card, a footer column, a heading block — instead
// of wrapping one. Nothing about the box changes, so the grid and flex parents
// above it lay out exactly as they did.
//
// `step` offsets the delay for siblings that come into view together, which is
// the only place a stagger reads as one movement: a row of three cards, the
// footer's columns. Blocks stacked down the page keep step 0 or 1 — the scroll
// already sequences them, and a delay on top of that is just lag.
export function Reveal({
  children,
  className,
  step = 0,
}: {
  children: ReactNode;
  className?: string;
  step?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || played) return;

    // Two cases that must never wait on an observer, both armed on the next
    // frame rather than in the effect body, which would cascade a render.
    //
    // Reduced motion: the stylesheet has no animation at all there, so this
    // changes nothing on the page — it matters only if the reader turns the
    // preference off mid-visit, when a band held on a first frame it never had
    // would suddenly have one. Arming every band up front means the stylesheet
    // can appear under a settled page.
    //
    // No IntersectionObserver (an old browser): there is nothing to wait for,
    // so the band is simply there.
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver !== "function"
    ) {
      const armed = requestAnimationFrame(() => setPlayed(true));
      return () => cancelAnimationFrame(armed);
    }

    // Has the block reached the line, measured rather than reported? True for
    // a block on screen and for one the page is already scrolled past, which
    // is the pair of cases an observer's callback can miss.
    const arrived = () =>
      node.getBoundingClientRect().top <= window.innerHeight * ARRIVAL;

    let done = false;
    const play = () => {
      if (done) return;
      done = true;
      setPlayed(true);
    };

    const check = () => {
      if (arrived()) play();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        // `top <= 0` is the block the page loaded already scrolled past: the
        // observer's first callback reports it as not intersecting, and
        // without this it would sit on its first frame — invisible — until
        // the reader scrolled back up to it.
        const reached = entries.some(
          (entry) => entry.isIntersecting || entry.boundingClientRect.top <= 0,
        );
        if (reached) play();
      },
      // A tenth of the viewport of margin at the bottom, so a band starts on
      // the reader reaching it rather than on its first pixel clearing the
      // fold, where the movement would happen off the edge of their attention.
      { rootMargin: `0px 0px -${Math.round((1 - ARRIVAL) * 100)}% 0px` },
    );
    observer.observe(node);

    // The jump, and the load that lands mid-page: both are a block that is
    // already past the line before any crossing happens.
    const unwatch = watchScroll(check);
    const armed = requestAnimationFrame(check);

    return () => {
      cancelAnimationFrame(armed);
      observer.disconnect();
      unwatch();
    };
  }, [played]);

  return (
    <div
      ref={ref}
      data-reveal={played ? "play" : "idle"}
      className={cn(styles.reveal, className)}
      style={step ? ({ "--reveal-step": step } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
