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

// One band of the page arriving: a fade and a short rise, played once, when
// the reader first reaches it. The timing, the held-back first frame and the
// two ways out of it are in reveal.module.css.
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
      const frame = requestAnimationFrame(() => setPlayed(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // `top <= 0` is the block the page loaded already scrolled past: the
        // observer's first callback reports it as not intersecting, and
        // without this it would sit on its first frame — invisible — until
        // the reader scrolled back up to it.
        const arrived = entries.some(
          (entry) => entry.isIntersecting || entry.boundingClientRect.top <= 0,
        );
        if (!arrived) return;
        setPlayed(true);
        observer.disconnect();
      },
      // A tenth of the viewport of margin at the bottom, so a band starts on
      // the reader reaching it rather than on its first pixel clearing the
      // fold, where the movement would happen off the edge of their attention.
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
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
