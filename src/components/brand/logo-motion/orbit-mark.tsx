"use client";

import { useEffect, useId, useLayoutEffect, useRef } from "react";
import {
  BOTTOM_RIGHT_PATH,
  MARK_VIEWBOX,
  TOP_LEFT_PATH,
  TURN_PATH,
  TURN_PIVOT,
} from "./mark-geometry";
import type { MarkMotionProps } from "./types";

/**
 * Reads a duration token off the mounted element, so a retune in
 * src/design/brand/brand.css lands here without a code change. The fallback is
 * that file's current value and is only used if the sheet has not applied.
 */
function durationToken(el: Element, name: string, fallback: number) {
  const raw = getComputedStyle(el).getPropertyValue(name).trim();
  const value = Number.parseFloat(raw);
  if (Number.isNaN(value)) return fallback;
  return raw.endsWith("ms") ? value : value * 1000;
}

/** The easing half of the same lookup. See brand.css "MOTION TOKENS". */
function easingToken(el: Element, name: string, fallback: string) {
  return getComputedStyle(el).getPropertyValue(name).trim() || fallback;
}

// The entrance's first frame is not the rest state, so it has to be scheduled
// before the browser paints; a plain useEffect runs after paint and flashes the
// finished mark for a frame. There is nothing to animate while rendering on the
// server, where React also warns about useLayoutEffect, so fall back there.
const useMountEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Variant A - Orbit. The S turns a quarter into place; the two corner discs
 * are already there to catch it.
 *
 * At the first frame the S sits rotated -90 deg, which puts its two lobes
 * exactly on top of the two corner discs: the mark starts as its own mirror
 * image and unwinds into itself. Hover and focus replay a 180 deg turn, which
 * TURN_PATH maps onto itself, so the loop needs no return trip and never snaps.
 */
export function OrbitMark({ size = 72, className, label }: MarkMotionProps) {
  // The gallery (src/app/design/logo/page.tsx) renders this component four
  // times on one page; a shared gradient id would make every instance resolve
  // to the first one's. The colons React puts in useId() are legal in a
  // fragment reference but not in a CSS identifier, so they come out.
  const uid = useId().replace(/:/g, "");
  const sheenId = `orbit-sheen-${uid}`;

  const rootRef = useRef<SVGSVGElement>(null);
  const cornersRef = useRef<SVGGElement>(null);
  const entranceRef = useRef<SVGGElement>(null);
  const replayRef = useRef<SVGGElement>(null);

  // The half turn lives on its own group, one level above the entrance's
  // quarter turn. Two elements means the two animations compose instead of
  // replacing each other, so hovering mid-entrance blends rather than jumping.
  function replay() {
    const el = replayRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    // Re-hovering while the turn is still in flight is ignored rather than
    // restarted: 180 deg maps TURN_PATH onto itself, so the run already in
    // progress ends at exactly the rest state a restart would have reached.
    if (el.getAnimations().some((a) => a.playState === "running")) return;

    el.animate(
      [{ transform: "rotate(0deg)" }, { transform: "rotate(180deg)" }],
      {
        // The mark is already on screen and only moves, which is the ease-in-out
        // case; the strong out-curves used for the entrance are too front-loaded
        // for a half turn and read as a flick. 400ms is --duration-reveal.
        duration: durationToken(el, "--duration-reveal", 400),
        easing: easingToken(
          el,
          "--ease-in-out",
          "cubic-bezier(0.4, 0, 0.2, 1)",
        ),
      },
    );
  }

  useMountEffect(() => {
    const root = rootRef.current;
    const corners = cornersRef.current;
    const entrance = entranceRef.current;
    if (!root || !corners || !entrance) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stopIfReduced = () => {
      if (!reduced.matches) return;
      // Nothing here uses fill: forwards, so cancelling drops every element
      // straight back to the rest state - the shipped mark, unchanged.
      for (const animation of root.getAnimations({ subtree: true })) {
        animation.cancel();
      }
    };
    reduced.addEventListener("change", stopIfReduced);

    if (!reduced.matches) {
      // The two corner discs land first, so the S has something to turn into.
      // They start hidden underneath its rotated lobes, which is why there is
      // no pop: by the time the S has swept off them they are already opaque.
      // --duration-reveal + --ease-out-expo is brand.css's icon-reveal pairing.
      corners.animate(
        [
          { opacity: 0, transform: "scale(0.92)" },
          { opacity: 1, transform: "scale(1)" },
        ],
        {
          duration: durationToken(root, "--duration-reveal", 400),
          easing: easingToken(
            root,
            "--ease-out-expo",
            "cubic-bezier(0.16, 1, 0.3, 1)",
          ),
        },
      );

      // ...and the S turns the last quarter into them, finishing 80ms behind so
      // the whole thing reads as one settle. A 90 deg rotation is the "large
      // transform move" brand.css measured --duration-slide / --ease-out-quint
      // on; the softer out-curve keeps it a settle rather than a spin.
      entrance.animate(
        [{ transform: "rotate(-90deg)" }, { transform: "rotate(0deg)" }],
        {
          duration: durationToken(root, "--duration-slide", 480),
          easing: easingToken(
            root,
            "--ease-out-quint",
            "cubic-bezier(0.22, 1, 0.36, 1)",
          ),
        },
      );
    }

    return () => reduced.removeEventListener("change", stopIfReduced);
  }, []);

  // Every rotation turns about TURN_PIVOT, not the viewBox centre - see its
  // docstring in mark-geometry.ts for why. `view-box` keeps that origin in
  // mark units, so it holds at every rendered size, 20px nav to 64px signup.
  const pivot = {
    transformBox: "view-box",
    // Rounded only to keep the serialised style tidy; 5 decimals is well
    // under a thousandth of a device pixel at any size the mark is used at.
    transformOrigin: `${TURN_PIVOT.toFixed(5)}px ${TURN_PIVOT.toFixed(5)}px`,
  } as const;

  return (
    <svg
      ref={rootRef}
      width={size}
      height={size}
      viewBox={`0 0 ${MARK_VIEWBOX} ${MARK_VIEWBOX}`}
      fill="none"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      onPointerEnter={(event) => {
        // Touch fires pointerenter on tap, which would replay the mark for
        // someone who only meant to scroll past it. Hover is a mouse/pen idea.
        if (event.pointerType === "touch") return;
        replay();
      }}
      // Deliberately inert today: the mark is decoration, not a control, so it
      // takes no tabindex and nothing inside it is focusable - React delegates
      // this from focusin, which only reaches the svg from itself or a
      // descendant. It is here so the replay comes free if the mark is ever
      // wrapped in something focusable. Do NOT "fix" it by making the logo
      // tabbable: on the signup page it sits above the heading, hover is the
      // real trigger, and the gallery gives keyboard users replay buttons.
      onFocus={replay}
    >
      <defs>
        {/*
          Matte finish: a top-lit fall-off of 4% across the mark's height, the
          quiet end of a material rather than a sticker. It is currentColor at
          both stops so the mark still takes its colour from the text around
          it, and it is opaque throughout, so the silhouette is the shipped
          path's to the pixel. Because it is userSpaceOnUse inside the rotating
          groups, the light also swings as the mark turns - the one place this
          costs nothing and gives something back.
        */}
        <linearGradient
          id={sheenId}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="0"
          y2={MARK_VIEWBOX}
        >
          <stop offset="0" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.96" />
        </linearGradient>
      </defs>

      <g fill={`url(#${sheenId})`}>
        <g ref={cornersRef} style={pivot}>
          <path d={TOP_LEFT_PATH} />
          <path d={BOTTOM_RIGHT_PATH} />
        </g>
        <g ref={replayRef} style={pivot}>
          <g ref={entranceRef} style={pivot}>
            <path d={TURN_PATH} />
          </g>
        </g>
      </g>
    </svg>
  );
}
