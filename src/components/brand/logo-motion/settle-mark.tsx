"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

import {
  FULL_MARK_PATH,
  LOBE_RADIUS,
  LOBES,
  MARK_VIEWBOX,
  TURN_PIVOT,
} from "./mark-geometry";
import type { MarkMotionProps } from "./types";

/**
 * The bridge on its own - `TURN_PATH` with its two lobes taken away.
 *
 * Both concave edges are lifted verbatim out of `TURN_PATH` (mark-geometry.ts):
 * the first cubic is the fillet that clears the top-left disc, the second the
 * one that clears the bottom-right. Where `TURN_PATH` follows the top-right and
 * bottom-left discs, this cuts the chord instead - straight from each disc's
 * edge point across its inside - so the join is buried well under the `<circle>`
 * drawn on top of it rather than sitting on the silhouette.
 *
 * The union of this and the four lobes is the shipped mark, but it is not
 * pixel-for-pixel the shipped *path*: at the two points where a chord meets its
 * disc the two shapes are tangent, and SVG composites each shape's antialiased
 * edge separately, so about a dozen edge pixels at 64px come out ~18% more
 * opaque than they should. Invisible, but not identical - which is why this
 * decomposition is only ever on screen while something is moving, and
 * `FULL_MARK_PATH` carries every resting frame. See `setMoving` below.
 */
const BRIDGE_PATH =
  "M16.4805 9.91992C12.8578 9.91992 9.91992 12.8578 9.91992 16.4805L4.95996 11.5205C8.58259 11.5205 11.5205 8.58259 11.5205 4.95996L16.4805 9.91992Z";

/**
 * The order the lobes take their seats: reading order, which on a 2x2 grid is
 * also a wave down the anti-diagonal. It is chosen for the bridge's sake - the
 * two lobes the bridge joins (top-right, bottom-left) land on consecutive
 * beats, so the connector closing behind them reads as a consequence of that
 * pair arriving rather than as a fifth, unrelated event.
 */
const SEAT_ORDER = [
  { key: "topLeft", ...LOBES.topLeft },
  { key: "topRight", ...LOBES.topRight },
  { key: "bottomLeft", ...LOBES.bottomLeft },
  { key: "bottomRight", ...LOBES.bottomRight },
] as const;

/* Motion tokens, read from src/design/brand/brand.css. They are written out as
   numbers because the Web Animations API takes no `var()`; each one names the
   token it mirrors so a retune in brand.css has somewhere obvious to land. */

/** `--duration-reveal` (400ms), the token brand.css reserves for icon reveals. */
const DURATION_REVEAL = 400;
/** `--duration-move` (220ms), for the bridge closing and for the hover re-seat. */
const DURATION_MOVE = 220;
/** Half of `--duration-stagger` (80ms). A whole step reads as four events; half
    of one reads as a single gesture with grain, which is this variant's brief. */
const STAGGER = 40;
/** Four whole `--duration-stagger` steps - the bridge waits out all four lobes,
    finishing at 540ms, the last thing to move and still well inside 700ms. */
const BRIDGE_DELAY = 320;
/** `--ease-out-expo`, which brand.css pairs with reveals and entrances. */
const EASE_OUT_EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";
/** `--ease-in-out`, brand.css's easing for something on screen that only moves. */
const EASE_IN_OUT = "cubic-bezier(0.4, 0, 0.2, 1)";

/** Entrance scale. `--scale-enter` is 0.95; a lobe carries less area than a
    card, so it can start a little further back before the jump reads as
    theatre. Nowhere near a scale(0) pop. */
const SEAT_SCALE = 0.88;
/** How far above its seat a lobe starts, in mark units - 0.4 of 22, so about
    1.2px at the gallery's 64px. Down, not up: brand's `--translate-enter` rise
    is for content arriving, and this is a mark taking a seat. */
const SEAT_DROP = 0.4;
/** The bridge's reach - it starts 10% short of both ends and closes the gap. */
const BRIDGE_SCALE = 0.9;
/** The hover re-seat's amplitude. It only ever grows, never shrinks: the bridge
    tucks under the top-right and bottom-left lobes, so a lobe that contracted
    would uncover the chord it is hiding. Growing can only cover more. */
const RESEAT_SCALE = 1.03;

/* The entrance's first frame is not the rest state, so it has to be in place
   before the browser paints; a passive effect runs after paint and shows the
   finished mark for a frame first. `useLayoutEffect` warns through Next's
   server render, so it is swapped there - where neither hook runs anyway. */
const useBeforePaint =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Variant C - Settle. Each lobe arrives on its own beat and comes to rest, then
 * the bridge closes between the two it joins. No spin, no light, no theatre.
 *
 * Hover and focus replay a re-seat rather than the entrance: a ripple of three
 * percent that runs the same way round and is over in a third of a second.
 */
export function SettleMark({ size = 72, className, label }: MarkMotionProps) {
  const restRef = useRef<SVGPathElement>(null);
  const piecesRef = useRef<SVGGElement>(null);
  const lobeRefs = useRef<Array<SVGCircleElement | null>>([]);
  const bridgeRef = useRef<SVGPathElement | null>(null);
  const replayRef = useRef<Animation[]>([]);
  /** Whether a re-seat is in flight. Deliberately a flag of our own rather than
      a read of `playState`: that reports "paused" and "idle" as much as
      "running", so a guard built on it lets a second ripple through and the two
      stack on the same lobes. A boolean we set and clear ourselves cannot. */
  const ripplingRef = useRef(false);
  /** The replay is a re-seat, so there is nothing to re-seat until the entrance
      has finished. It also stays false under reduced motion, which is what
      leaves the hover handler inert there. */
  const seatedRef = useRef(false);

  /**
   * Swaps between the one shipped path and the five pieces that can move.
   * Rest is always `FULL_MARK_PATH`, which is what the server renders, what a
   * reader with JavaScript off or reduce-motion on gets, and what the mark
   * returns to the moment it stops - so every still frame of this component is
   * the logo, byte for byte, and not a reconstruction of it.
   */
  const setMoving = useCallback((moving: boolean) => {
    const rest = restRef.current;
    const pieces = piecesRef.current;
    if (!rest || !pieces) return;
    rest.style.display = moving ? "none" : "";
    pieces.style.display = moving ? "" : "none";
  }, []);

  useBeforePaint(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setMoving(true);

    const lobes = lobeRefs.current.filter(
      (lobe): lobe is SVGCircleElement => lobe !== null,
    );

    // `fill: "backwards"` holds the start state through each lobe's delay and
    // then lets go, because the last keyframe is the element's own rest style.
    // Nothing needs holding forward, so nothing is left holding it.
    const entrance = lobes.map((lobe, index) =>
      lobe.animate(
        [
          {
            opacity: 0,
            transform: `translateY(${-SEAT_DROP}px) scale(${SEAT_SCALE})`,
          },
          { opacity: 1, transform: "translateY(0px) scale(1)" },
        ],
        {
          duration: DURATION_REVEAL,
          delay: index * STAGGER,
          easing: EASE_OUT_EXPO,
          fill: "backwards",
        },
      ),
    );

    const bridge = bridgeRef.current;
    if (bridge) {
      entrance.push(
        bridge.animate(
          [
            { opacity: 0, transform: `scale(${BRIDGE_SCALE})` },
            { opacity: 1, transform: "scale(1)" },
          ],
          {
            duration: DURATION_MOVE,
            delay: BRIDGE_DELAY,
            easing: EASE_OUT_EXPO,
            fill: "backwards",
          },
        ),
      );
    }

    Promise.all(entrance.map((animation) => animation.finished))
      .then(() => {
        seatedRef.current = true;
        setMoving(false);
      })
      .catch(() => {
        // Cancelled by the cleanup below; the mark is on its way out anyway.
      });

    return () => {
      for (const animation of entrance) animation.cancel();
      for (const animation of replayRef.current) animation.cancel();
      replayRef.current = [];
      ripplingRef.current = false;
      seatedRef.current = false;
    };
  }, [setMoving]);

  const replay = useCallback(() => {
    if (!seatedRef.current) return;
    // Re-entering mid-ripple is a no-op rather than a restart. Cancelling would
    // snap every lobe back to 1 within a frame, which is exactly the stutter
    // this is meant to avoid; letting the gesture finish is quieter and cheaper.
    if (ripplingRef.current) return;

    ripplingRef.current = true;
    setMoving(true);
    const anims = lobeRefs.current
      .filter((lobe): lobe is SVGCircleElement => lobe !== null)
      .map((lobe, index) =>
        lobe.animate(
          [
            { transform: "scale(1)" },
            { transform: `scale(${RESEAT_SCALE})`, offset: 0.45 },
            { transform: "scale(1)" },
          ],
          {
            duration: DURATION_MOVE,
            delay: index * STAGGER,
            easing: EASE_IN_OUT,
          },
        ),
      );
    replayRef.current = anims;

    Promise.all(anims.map((animation) => animation.finished))
      .then(() => {
        ripplingRef.current = false;
        setMoving(false);
      })
      .catch(() => {
        // Cancelled on unmount; the cleanup has already cleared the flag.
      });
  }, [setMoving]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${MARK_VIEWBOX} ${MARK_VIEWBOX}`}
      fill="none"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      onPointerEnter={(event) => {
        // Touch fires pointerenter on tap, which would re-seat the mark for
        // someone who only meant to scroll past it. Hover is a mouse/pen idea.
        if (event.pointerType === "touch") return;
        replay();
      }}
      // The mark takes no tabindex and holds nothing focusable, so this is
      // inert today - React delegates focus from focusin, which only reaches
      // the svg from itself or a descendant. It is here so the re-seat comes
      // free if the mark is ever wrapped in something that does take focus.
      onFocus={replay}
    >
      <path ref={restRef} d={FULL_MARK_PATH} fill="currentColor" />

      {/* The same silhouette taken apart, so each lobe can move on its own
          beat. Hidden until something moves, which is also what makes the
          server-rendered and reduce-motion output the shipped path alone. */}
      <g ref={piecesRef} style={{ display: "none" }}>
        {/* First, so the two chords it cuts stay under the lobes.
            `transform-box: view-box` puts the origin in mark units, so it holds
            at every rendered size. The bridge closes about TURN_PIVOT rather
            than the viewBox centre: point-reflecting either of its ends about
            10.72023 lands exactly on the other, so that is the only point it
            can grow from without drifting off its seats. */}
        <path
          ref={bridgeRef}
          d={BRIDGE_PATH}
          fill="currentColor"
          style={{
            transformBox: "view-box",
            transformOrigin: `${TURN_PIVOT}px ${TURN_PIVOT}px`,
          }}
        />
        {SEAT_ORDER.map((lobe, index) => (
          // Each lobe scales about its own centre from LOBES, never the mark's:
          // a shared origin would turn the stagger into a slide.
          <circle
            key={lobe.key}
            ref={(node) => {
              lobeRefs.current[index] = node;
            }}
            cx={lobe.cx}
            cy={lobe.cy}
            r={LOBE_RADIUS}
            fill="currentColor"
            style={{
              transformBox: "view-box",
              transformOrigin: `${lobe.cx}px ${lobe.cy}px`,
            }}
          />
        ))}
      </g>
    </svg>
  );
}
