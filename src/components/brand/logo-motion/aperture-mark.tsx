"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import {
  FULL_MARK_PATH,
  LOBES,
  LOBE_RADIUS,
  MARK_VIEWBOX,
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

// The entrance's first frame is the closed aperture, not the rest state, so it
// has to be scheduled before the browser paints; a plain useEffect runs after
// paint and flashes the finished mark for a frame. Nothing animates on the
// server, where React also warns about useLayoutEffect, so fall back there.
const useMountEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

// How far toward TURN_PIVOT each lobe starts, as a fraction of its own distance
// from it, and how small it starts. At 0.5 / 0.8 the four discs overlap into one
// soft blob with four readable lumps - an iris nearly shut, not a scatter.
const CLOSED_PULL = 0.5;
const CLOSED_SCALE = 0.8;

// The bridge is held back this long so it resolves after the two diagonal lobes
// have visibly seated. Expo-out puts a lobe at 98% of its travel by ~55% of its
// run, so 240ms is already past the moment the eye calls them landed.
const BRIDGE_DELAY_MS = 240;

// The light pass crosses a longer path than any UI element brand.css measured,
// so it runs a third past --duration-slide (480ms). Under 700ms keeps it a pass
// rather than an effect; the hover replay drops back to the token itself.
const SHEEN_ENTRANCE_MS = 620;

// The band is authored vertical and tilted by the group above it. -26deg is the
// shallowest angle that still crosses both diagonal lobes on its way through.
const SHEEN_TILT_DEG = -26;

// Travel of the band's centre in the tilted frame. The mark spans [-3.6, 25.1]
// there once the 21.44-wide artwork is rotated about TURN_PIVOT; adding the
// band's own 8-unit half-width at each end starts and ends it fully off-mark.
const SHEEN_FROM = -13;
const SHEEN_TO = 34;

// Below this rendered size the grain and the terminator stop being material and
// start being damage: at 20px one mark unit is 0.9 device pixels, so the 0.83
// unit grain cell lands under a pixel and aliases into mush, and the terminator's
// ~1 unit band eats the bottom-right edge and reads as a mis-rendered logo. The
// top-lit gradient is sub-pixel-safe and stays on at every size.
const MATERIAL_MIN_PX = 40;

// Corner discs first, then the two lobes the concave bridge joins - so the
// bridge has the last word. One beat of --duration-stagger between the pairs.
const OPENING_ORDER = [
  { key: "topLeft", beat: 0 },
  { key: "bottomRight", beat: 0 },
  { key: "topRight", beat: 1 },
  { key: "bottomLeft", beat: 1 },
] as const;

/**
 * Variant B - Aperture. The four lobes open outward from the centre, then a
 * single pass of light crosses the matte face.
 *
 * The entrance needs the four discs to move independently, which the shipped
 * compound path cannot do, so while it plays the mark is drawn as four
 * `<circle>`s (LOBES / LOBE_RADIUS) plus TURN_PATH for the bridge. The instant
 * it lands the component swaps back to the single FULL_MARK_PATH: at rest the
 * silhouette is the shipped path's, byte for byte, with no doubled antialiased
 * edge where the circles overlap the bridge's own two lobes.
 *
 * Everything that gives the mark its material - the top-lit gradient, the
 * grain, the bottom-right terminator - is baked. No filter is ever animated;
 * a filter re-rasterises every frame and would cost more than the motion.
 */
export function ApertureMark({ size = 72, className, label }: MarkMotionProps) {
  // The gallery (src/app/design/logo/page.tsx) renders this component four
  // times on one page, and this variant carries six ids. A shared id would make
  // every instance resolve to the first one's. The colons React puts in useId()
  // are legal in a fragment reference but not in a CSS identifier, so they come
  // out along with anything else that is not identifier-safe.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const fillId = `aperture-fill-${uid}`;
  const grainId = `aperture-grain-${uid}`;
  const terminatorId = `aperture-terminator-${uid}`;
  const matteId = `aperture-matte-${uid}`;
  const clipId = `aperture-clip-${uid}`;
  const bandId = `aperture-band-${uid}`;

  const rootRef = useRef<SVGSVGElement>(null);
  const lobeRefs = useRef<(SVGCircleElement | null)[]>([]);
  const bridgeRef = useRef<SVGPathElement>(null);
  const sheenRef = useRef<SVGGElement>(null);
  // One handle for the light pass, so a re-hover mid-flight cancels the run in
  // progress instead of stacking a second one on top of it.
  const sheenAnimation = useRef<Animation | null>(null);

  // False while the aperture is opening, true from the moment it lands. It also
  // starts true for reduce-motion, which is how that path renders straight to
  // the rest state without a frame of the closed cluster.
  const [seated, setSeated] = useState(false);

  // Grain and terminator are gated on the rendered size, not on taste - see
  // MATERIAL_MIN_PX. The gradient is unconditional.
  const material = size >= MATERIAL_MIN_PX;

  function playSheen(durationMs: number, peak: number) {
    const el = sheenRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    // cancel() drops the previous run's effect in the same frame, so the band
    // never doubles and never jumps: the new pass simply starts from off-mark.
    sheenAnimation.current?.cancel();
    sheenAnimation.current = el.animate(
      [
        { transform: `translateX(${SHEEN_FROM}px)`, opacity: 0 },
        { opacity: peak, offset: 0.2 },
        { opacity: peak, offset: 0.72 },
        { transform: `translateX(${SHEEN_TO}px)`, opacity: 0 },
      ],
      {
        duration: durationMs,
        // The band is an on-screen element moving across a face, which is the
        // ease-in-out case; an out-curve would fling it in and leave it loitering.
        easing: easingToken(
          el,
          "--ease-in-out",
          "cubic-bezier(0.4, 0, 0.2, 1)",
        ),
        // No fill: the group's own opacity: 0 is the rest state, so a cancel at
        // any point in the run leaves nothing behind.
        fill: "none",
      },
    );
  }

  function replay() {
    // Hover and focus replay only the light pass. Re-opening the aperture every
    // time a pointer crosses the logo would make the mark feel unstable.
    playSheen(
      durationToken(rootRef.current ?? document.body, "--duration-slide", 480),
      // Quieter than the entrance's pass: the first one is the payoff, this one
      // is an acknowledgement.
      0.7,
    );
  }

  useMountEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) {
      setSeated(true);
      return;
    }

    // --duration-entrance / --ease-out-expo is brand.css's first-paint pairing,
    // and --duration-stagger the delay it prescribes between siblings.
    const entrance = durationToken(root, "--duration-entrance", 500);
    const stagger = durationToken(root, "--duration-stagger", 80);
    const expo = easingToken(
      root,
      "--ease-out-expo",
      "cubic-bezier(0.16, 1, 0.3, 1)",
    );

    const running: Animation[] = [];

    OPENING_ORDER.forEach(({ key, beat }, index) => {
      const el = lobeRefs.current[index];
      if (!el) return;
      const { cx, cy } = LOBES[key];
      // Toward TURN_PIVOT, not the viewBox centre: the artwork is 21.4404 wide
      // in a 22 box, so aiming at 11 would send the top-left lobe half a unit
      // further than the bottom-right one and the iris would open lopsided.
      const dx = (TURN_PIVOT - cx) * CLOSED_PULL;
      const dy = (TURN_PIVOT - cy) * CLOSED_PULL;
      running.push(
        el.animate(
          [
            {
              transform: `translate(${dx.toFixed(4)}px, ${dy.toFixed(4)}px) scale(${CLOSED_SCALE})`,
              opacity: 0,
            },
            // The cluster is opaque for three quarters of the run; the short
            // fade only takes the hard edge off first paint.
            { opacity: 1, offset: 0.24 },
            { transform: "translate(0px, 0px) scale(1)", opacity: 1 },
          ],
          {
            duration: entrance,
            delay: beat * stagger,
            easing: expo,
            // fill: both so the closed frame is what paints during the delay -
            // the swap to FULL_MARK_PATH at the end is what clears it.
            fill: "both",
          },
        ),
      );
    });

    const bridgeReveal = durationToken(root, "--duration-reveal", 400);
    if (bridgeRef.current) {
      running.push(
        bridgeRef.current.animate([{ opacity: 0 }, { opacity: 1 }], {
          // --duration-reveal / --ease-out-quart: quart is deliberately softer
          // than the lobes' expo so the bridge is still arriving when they have
          // stopped, which is the whole point of holding it back.
          duration: bridgeReveal,
          delay: BRIDGE_DELAY_MS,
          easing: easingToken(
            root,
            "--ease-out-quart",
            "cubic-bezier(0.165, 0.84, 0.44, 1)",
          ),
          fill: "both",
        }),
      );
    }

    let live = true;
    let settled = false;
    // Swapping to the single path is what makes the rest state exact. It also
    // brings in the grain and the terminator, which cannot ride along on moving
    // pieces without re-rasterising a filter every frame.
    const settle = () => {
      if (!live || settled) return;
      settled = true;
      setSeated(true);
      playSheen(SHEEN_ENTRANCE_MS, 1);
    };

    Promise.all(running.map((animation) => animation.finished))
      .then(settle)
      // finished rejects when an animation is cancelled, which is the unmount
      // path (a replay from the gallery remounts with a new key).
      .catch(() => {});

    // Belt and braces, because the rest state is the one state this component
    // must always reach. A tab that is backgrounded across the mount can have
    // its animations dropped rather than finished, which rejects above and
    // would otherwise leave the mark stuck on the decomposed render - right
    // silhouette, but no material - for as long as the page lives. The clock
    // is the token values plus a margin, so it can only ever fire after the
    // entrance was due to end.
    const total =
      Math.max(stagger + entrance, BRIDGE_DELAY_MS + bridgeReveal) + 250;
    const fallback = window.setTimeout(settle, total);

    return () => {
      live = false;
      window.clearTimeout(fallback);
      for (const animation of running) animation.cancel();
      sheenAnimation.current?.cancel();
    };
  }, []);

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
      // wrapped in something focusable.
      onFocus={replay}
    >
      <defs>
        {/*
          The matte base. A matte surface has a narrow specular range, so this
          is a 5.5% fall-off and nothing more: full strength at the top-left
          edge, imperceptibly down at the bottom-right, lit from where every
          other surface in the product is lit from. Both stops are currentColor,
          so the mark still takes its colour from the text around it, and it is
          userSpaceOnUse so the four pieces of the opening aperture share one
          continuous ramp instead of each carrying its own copy.
        */}
        <linearGradient
          id={fillId}
          gradientUnits="userSpaceOnUse"
          x1="3.2"
          y1="0"
          x2="18.8"
          y2={MARK_VIEWBOX}
        >
          <stop offset="0" stopColor="currentColor" stopOpacity="1" />
          <stop offset="0.55" stopColor="currentColor" stopOpacity="0.984" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.945" />
        </linearGradient>

        {material && (
          <>
            {/*
              Grain. fractalNoise reduced to black-with-noisy-alpha: the colour
              matrix zeroes RGB and sets alpha to (red - 0.35), which leaves
              roughly half the cells transparent and the rest a soft speckle.
              Both numbers were tuned against the rendered page, not guessed.
              baseFrequency is in MARK UNITS, not pixels: 2.6 is one cell every
              0.38 units, ~1.1 CSS px at the 64px signup size, which on a 2x
              screen is a two-pixel tooth. The obvious 0.8 gives a 3.6px cell
              and the mark comes out looking like stucco. numOctaves is 2, not
              3: the third octave is a low-frequency layer that shows up as
              blotching rather than tooth. sRGB is forced because the default
              linearRGB shifts the midpoint and skews the speckle dark.
            */}
            <filter
              id={grainId}
              x="0%"
              y="0%"
              width="100%"
              height="100%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="2.6"
                numOctaves="2"
                seed="11"
                result="noise"
              />
              <feColorMatrix
                in="noise"
                type="matrix"
                values="0 0 0 0 0
                        0 0 0 0 0
                        0 0 0 0 0
                        1 0 0 0 -0.35"
              />
            </filter>

            {/*
              The terminator: the mark's own alpha, minus a copy of itself
              shifted up and left and blurred, which leaves a soft band hugging
              the bottom-right rim. That band is what makes four flat discs read
              as four solids - the linear ramp alone shades the mark as a sheet.

              The erode is the part that matters. Without it the band peaks ON
              the silhouette's antialiased edge, which softens the outline and
              makes the mark look mis-rendered next to the other variants;
              clipping it to an alpha eroded by 0.32 units keeps the outer edge
              at full strength and puts the shading just inside it. The blur is
              deliberately wide (0.95) - a tight band reads as an emboss, and
              emboss is the opposite of matte.
            */}
            <filter
              id={terminatorId}
              x="-25%"
              y="-25%"
              width="150%"
              height="150%"
              colorInterpolationFilters="sRGB"
            >
              <feOffset in="SourceAlpha" dx="-0.9" dy="-1" result="lifted" />
              <feGaussianBlur in="lifted" stdDeviation="0.95" result="soft" />
              <feComposite
                in="SourceAlpha"
                in2="soft"
                operator="out"
                result="band"
              />
              <feMorphology
                in="SourceAlpha"
                operator="erode"
                radius="0.32"
                result="core"
              />
              <feComposite in="band" in2="core" operator="in" />
            </filter>

            {/*
              Both are folded into one luminance mask rather than painted on
              top, so the material costs the mark alpha instead of adding a
              layer. On the dark ground that is exactly right: less alpha is
              less light returned, which is what matte means, and it stays
              correct whatever surface the mark is placed on. `white` and
              `black` here are mask luminance values, not brand colour - the
              mark's colour is entirely the gradient's. The region runs a unit
              past the viewBox so the mask's own edge never clips the silhouette.
            */}
            <mask
              id={matteId}
              maskUnits="userSpaceOnUse"
              x="-1"
              y="-1"
              width="24"
              height="24"
              colorInterpolation="sRGB"
            >
              <rect x="-1" y="-1" width="24" height="24" fill="white" />
              <rect
                x="-1"
                y="-1"
                width="24"
                height="24"
                filter={`url(#${grainId})`}
                opacity="0.07"
              />
              <path
                d={FULL_MARK_PATH}
                fill="black"
                filter={`url(#${terminatorId})`}
                opacity="0.13"
              />
            </mask>
          </>
        )}

        {/* The light pass is clipped to the mark's own shape - it crosses the
            face, it does not spill onto the ground behind it. */}
        <clipPath id={clipId}>
          <path d={FULL_MARK_PATH} />
        </clipPath>

        {/*
          The band itself. It brightens rather than glows: currentColor at 0.55
          over a base that is already 0.945-1.0 opaque lifts the shaded side of
          the mark by at most 5.5% and the lit side by nothing at all, which is
          how light actually moves across a matte surface. The narrower
          --brand-accent core at 0.05 gives the pass a colour temperature; any
          more and it stops being light on the logo and starts being a tint of
          it - at 0.10 the mark photographs cream rather than white.

          16 units wide against a 21.44-unit mark, so the band is a pass with a
          front and a back edge. Widening it much past this makes the whole face
          brighten and dim together, which reads as a flicker, not a light.
        */}
        <linearGradient id={bandId}>
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop offset="0.5" stopColor="currentColor" stopOpacity="0.55" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${bandId}-warm`}>
          <stop
            offset="0"
            style={{ stopColor: "var(--brand-accent)", stopOpacity: 0 }}
          />
          <stop
            offset="0.5"
            style={{ stopColor: "var(--brand-accent)", stopOpacity: 0.05 }}
          />
          <stop
            offset="1"
            style={{ stopColor: "var(--brand-accent)", stopOpacity: 0 }}
          />
        </linearGradient>
      </defs>

      {seated ? (
        // Rest: the shipped compound path, one element, one fill.
        <path
          d={FULL_MARK_PATH}
          fill={`url(#${fillId})`}
          mask={material ? `url(#${matteId})` : undefined}
        />
      ) : (
        // Opening: the same silhouette, taken apart. The circles are LOBES /
        // LOBE_RADIUS; TURN_PATH supplies the bridge (and, harmlessly, its own
        // two lobes underneath the circles that sit on them).
        <g fill={`url(#${fillId})`}>
          {OPENING_ORDER.map(({ key }, index) => (
            <circle
              key={key}
              ref={(node) => {
                lobeRefs.current[index] = node;
              }}
              cx={LOBES[key].cx}
              cy={LOBES[key].cy}
              r={LOBE_RADIUS}
              style={{
                // Each lobe scales about its OWN centre while it travels toward
                // the mark's - `view-box` keeps both origins in mark units, so
                // they hold at 20px and at 64px alike.
                transformBox: "view-box",
                transformOrigin: `${LOBES[key].cx}px ${LOBES[key].cy}px`,
              }}
            />
          ))}
          {/*
            No opacity: 0 here on purpose. This is also what the server sends,
            and what paints in the window between that HTML arriving and React
            hydrating - at full opacity that window shows the complete mark,
            where a hard-coded 0 would show it with its bridge missing. The
            entrance's first keyframe (fill: "both", scheduled in a layout
            effect) is what takes it to 0, before the first hydrated paint.
          */}
          <path ref={bridgeRef} d={TURN_PATH} />
        </g>
      )}

      <g clipPath={`url(#${clipId})`}>
        <g transform={`rotate(${SHEEN_TILT_DEG} ${TURN_PIVOT} ${TURN_PIVOT})`}>
          {/* One group, two rects: the broad lift and the narrower warm core
              travel as a unit off a single animation. Transform and opacity
              only - the tilt is a static attribute above, never animated. */}
          <g ref={sheenRef} style={{ transformBox: "view-box", opacity: 0 }}>
            <rect
              x="-8"
              y="-6"
              width="16"
              height="38"
              fill={`url(#${bandId})`}
            />
            <rect
              x="-5"
              y="-6"
              width="10"
              height="38"
              fill={`url(#${bandId}-warm)`}
            />
          </g>
        </g>
      </g>
    </svg>
  );
}
