"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
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
 *
 * Only the Web Animations entrance needs this: WAAPI wants a number. The hover
 * runs on CSS transitions, which can name `var(--duration-normal)` directly and
 * therefore stay live without a second lookup.
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

// The entrance's first frame is the S held above the discs, not the rest state,
// so it has to be scheduled before the browser paints; a plain useEffect runs
// after paint and flashes the finished mark for a frame. Nothing animates on
// the server, where React also warns about useLayoutEffect, so fall back there.
const useMountEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

// Below this rendered size every filter in here is sub-pixel and turns to mud.
// The widest blur is 0.34 mark units; at 20px one unit is 0.909 CSS px, so that
// rim is a third of a pixel - it does not read as a lit edge, it reads as a
// smudged outline. Same gate, same reasoning as aperture-mark.tsx's own
// MATERIAL_MIN_PX. The two diagonal gradients are sub-pixel-safe and stay on at
// every size, so the 20/32px row still shows the S brighter than the discs.
const MATERIAL_MIN_PX = 40;

// Where the floating S starts its entrance, in mark units: up and a little
// left, so it comes down along the same top-left light axis every surface in
// brand.css is lit from, and 5% oversize so it reads as nearer the eye before
// it seats. Small numbers on purpose - this is a settle, not a drop.
const ENTRANCE_LIFT_X = -0.55;
const ENTRANCE_LIFT_Y = -1.15;
const ENTRANCE_SCALE = 1.05;

// The cast shadow starts this much wider than its resting self. Scaling a
// shadow that is already rasterised is a transform, so "the shadow tightens as
// the S lands" costs one composited layer instead of a filter re-render.
const CONTACT_SPREAD = 1.5;

// A hover spins the mark through a full turn. 360 deg is the only angle that
// is seamless for the WHOLE mark: 180 deg maps it onto itself (the bridge's
// two lobes swap), but 90 deg does not - it would land the bridge on the other
// diagonal, i.e. a mirrored logo. See mark-geometry.ts on TURN's symmetry.
const HOVER_SPIN_DEG = 360;

// ...and it takes longer than the token ladder's ceiling to do it. A full turn
// covers far more visual distance than the "large transform move" that
// --duration-slide (480ms) was measured for, so at the token's own value it
// reads as a flick rather than a turn. The scale keeps the spin derived from
// the token - a retune in brand.css still moves it - while giving one full
// revolution the time it needs: 480ms x 1.25 = 600ms, about 600 deg/sec.
const HOVER_SPIN_SCALE = 1.25;

// Strength of the --brand-accent wash. The colour has to carry the whole
// affordance on its own, and a wash faint enough to read as "warmer" does not.
// At 0.78 the mark lands close to --brand-accent itself (dark-mode
// tangerine-400, the brightest orange in the ramp) while the rim layers, which
// paint OVER this wash, keep the material legible.
const TINT_STRENGTH = 0.78;

/**
 * Variant D - Material. The mark as a lit solid: two discs bedded into the
 * surface, and the S floating above them on its own cast shadow.
 *
 * The technique is ported from https://lemni.com/signin, whose logo is built
 * from stacked SVG `<use>` layers. The workhorse is an inner shadow written as
 * `SourceAlpha - offset(blur(SourceAlpha))` (an `feComposite` with
 * `k2="-1" k3="1"`), painted as a SEPARATE layer on top of a filled copy of the
 * same path. That difference is exactly the inner rim, and it is what makes a
 * flat shape read as an object rather than a sticker.
 *
 * Their page is light and ours is dark, so the lighting is rebuilt rather than
 * copied - see the comments on the filters below and on the contact shadow.
 * Nothing here animates a filter: a filter re-rasterises every frame, so the
 * material is baked and only transforms, opacity and one fill move.
 */
export function MaterialMark({ size = 72, className, label }: MarkMotionProps) {
  // The gallery (src/app/design/logo/page.tsx) renders this component four
  // times on one page and this variant carries six ids; a shared id would make
  // every instance resolve to the first one's. The colons React puts in useId()
  // are legal in a fragment reference but not in a CSS identifier, so they come
  // out along with anything else that is not identifier-safe.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const discFillId = `material-disc-fill-${uid}`;
  const turnFillId = `material-turn-fill-${uid}`;
  const discShadeId = `material-disc-shade-${uid}`;
  const turnShadeId = `material-turn-shade-${uid}`;
  const contactId = `material-contact-${uid}`;
  const discClipId = `material-disc-clip-${uid}`;

  const rootRef = useRef<SVGSVGElement>(null);
  const discsRef = useRef<SVGGElement>(null);
  const turnRef = useRef<SVGGElement>(null);
  const contactRef = useRef<SVGGElement>(null);
  const spinRef = useRef<SVGGElement>(null);

  // The tint LATCHES: each hover spins the mark and flips it between its own
  // colour and the brand orange, and it stays where the last hover left it.
  // That is why this is not called `hovered` - it is not a pointer state and
  // it deliberately does not reset on pointer-leave.
  const [tinted, setTinted] = useState(false);

  // Filters are gated on the rendered size, not on taste - see MATERIAL_MIN_PX.
  const material = size >= MATERIAL_MIN_PX;

  useMountEffect(() => {
    const root = rootRef.current;
    const discs = discsRef.current;
    const turn = turnRef.current;
    if (!root || !discs || !turn) return;

    // Hover carries no motion, so reduce only has the entrance to suppress.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // --duration-reveal / --ease-out-expo is brand.css's icon-reveal pairing,
    // --duration-entrance / --ease-out-expo its first-paint one, and
    // --duration-stagger the delay it prescribes between siblings.
    const reveal = durationToken(root, "--duration-reveal", 400);
    const entrance = durationToken(root, "--duration-entrance", 500);
    const stagger = durationToken(root, "--duration-stagger", 80);
    const expo = easingToken(
      root,
      "--ease-out-expo",
      "cubic-bezier(0.16, 1, 0.3, 1)",
    );
    const quart = easingToken(
      root,
      "--ease-out-quart",
      "cubic-bezier(0.165, 0.84, 0.44, 1)",
    );

    const running: Animation[] = [];

    // The bed lands first, so the S has a surface to land on.
    running.push(
      discs.animate(
        [
          { opacity: 0, transform: "scale(0.94)" },
          { opacity: 1, transform: "scale(1)" },
        ],
        { duration: reveal, easing: expo, fill: "both" },
      ),
    );

    // ...then the S comes down onto it, one --duration-stagger behind. This is
    // the whole point of the variant: it has to be visibly ABOVE the discs
    // before it seats, or the material reads as one flat plate.
    running.push(
      turn.animate(
        [
          {
            opacity: 0,
            transform: `translate(${ENTRANCE_LIFT_X}px, ${ENTRANCE_LIFT_Y}px) scale(${ENTRANCE_SCALE})`,
          },
          // Opaque for most of the run; the short fade only takes the hard
          // edge off the first frame.
          { opacity: 1, offset: 0.3 },
          { opacity: 1, transform: "translate(0px, 0px) scale(1)" },
        ],
        { duration: entrance, delay: stagger, easing: expo, fill: "both" },
      ),
    );

    // The shadow tightens under it. Quart is deliberately softer than the S's
    // expo, so the shadow is still closing when the S has stopped - which is
    // what selling contact looks like.
    if (contactRef.current) {
      running.push(
        contactRef.current.animate(
          [
            { opacity: 0, transform: `scale(${CONTACT_SPREAD})` },
            { opacity: 1, transform: "scale(1)" },
          ],
          { duration: entrance, delay: stagger, easing: quart, fill: "both" },
        ),
      );
    }

    return () => {
      // Nothing survives unmount: a gallery replay remounts with a new key.
      for (const animation of running) animation.cancel();
    };
  }, []);

  // Every group turns and scales about TURN_PIVOT, not the viewBox centre - see
  // its docstring in mark-geometry.ts. `view-box` keeps the origin in mark
  // units, so it holds at every rendered size, 20px nav to 64px signup.
  const pivot = {
    transformBox: "view-box",
    transformOrigin: `${TURN_PIVOT.toFixed(5)}px ${TURN_PIVOT.toFixed(5)}px`,
  } as const;

  // The hover states are CSS transitions rather than WAAPI on purpose: a
  // transition is interruptible by construction, so a pointer swept back and
  // forth retargets from wherever it is instead of stacking a second run.
  // --duration-normal (200ms) is brand.css's own line for colour changes, and
  // --ease-out-quart its short-interaction curve.
  // The wash sits BETWEEN the fill and the rim layers, so the lighting always
  // paints over it and the material survives the colour change.
  const tintStyle = {
    fill: "var(--brand-accent)",
    opacity: tinted ? TINT_STRENGTH : 0,
    transition: "opacity var(--duration-normal) var(--ease-out-quart)",
  } as const;

  /**
   * One full turn of the whole mark, alongside the colour change. WAAPI rather
   * than a CSS transition because the start and end values are identical -
   * a transition between rotate(0) and rotate(360deg) has nothing to
   * interpolate and simply never runs.
   *
   * --duration-slide / --ease-in-out, not the entrance's out-curves: this is
   * on-screen movement that begins and ends at rest, and a strong out-curve
   * over 360 deg spends most of the turn crawling, which reads as a flick
   * followed by a drift (the same finding orbit-mark.tsx records for its 180).
   */
  function spin() {
    const el = spinRef.current;
    if (!el) return;
    // Unlike the tint, this IS motion, so it is the one thing here that reduce
    // suppresses. Read at call time; no state to keep in sync.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // A turn already in flight ends where a restart would have, so a second
    // hover mid-spin is ignored rather than stacked into a double rotation.
    if (el.getAnimations().some((a) => a.playState === "running")) return;

    el.animate(
      [
        { transform: "rotate(0deg)" },
        { transform: `rotate(${HOVER_SPIN_DEG}deg)` },
      ],
      {
        duration: durationToken(el, "--duration-slide", 480) * HOVER_SPIN_SCALE,
        easing: easingToken(
          el,
          "--ease-in-out",
          "cubic-bezier(0.4, 0, 0.2, 1)",
        ),
      },
    );
  }

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
      // The reference logo carries `cursor: pointer` and that is half of why
      // hovering it reads as an affordance rather than as decoration moving on
      // its own. This variant is the one that is meant to look clickable, so it
      // keeps the cursor; a wrapper that makes the mark a real control should
      // own it instead.
      // `overflow: visible` is what keeps the spin from being cropped. Every
      // lobe centre sits sqrt(5.76^2 + 5.76^2) = 8.15 units from TURN_PIVOT, so
      // with LOBE_RADIUS on top the mark's circumradius is 13.11 - against a
      // viewport half-width of 11. At rest the corners are empty so nothing
      // shows, but a turn sweeps them through the diagonal and 2.11 units of
      // lobe would be sliced off at 45 deg. Widening the viewBox instead would
      // shrink the mark relative to the other variants at the same `size`; an
      // SVG root that simply does not clip keeps it pixel-comparable with them.
      style={{ cursor: "pointer", overflow: "visible" }}
      onPointerEnter={(event) => {
        // Touch fires pointerenter on tap, which would spin and recolour the
        // mark for someone who only meant to scroll past it. Hover is a
        // mouse/pen idea, so touch gets neither half.
        if (event.pointerType === "touch") return;
        spin();
        setTinted((on) => !on);
      }}
      // Deliberately inert today: the mark is decoration, not a control, so it
      // takes no tabindex and nothing inside it is focusable - React delegates
      // this from focusin, which only reaches the svg from itself or a
      // descendant. It is here so the hover state comes free if the mark is
      // ever wrapped in something focusable (it toggles, same as a hover). Do
      // NOT "fix" it by making the logo
      // tabbable: on the signup page it sits above the heading, hover is the
      // real trigger, and the gallery gives keyboard users replay buttons.
      onFocus={() => {
        spin();
        setTinted((on) => !on);
      }}
    >
      <defs>
        {/*
          The bed, and the ramp runs BACKWARDS on purpose. Every raised piece
          in brand.css is lit from the top-left, so a piece that is lit from the
          bottom-right instead reads as a recess: the near wall of a dent is the
          one in shadow and the far wall is the one catching the light. Held at
          currentColor so the mark still takes its colour from the text around
          it. The reference runs its equivalent at rotate(225deg) from
          near-black to #cccccc; that is a LIGHT-page ramp and porting the
          values would give us a dark object on a dark canvas. What ports is the
          axis, not the numbers.
        */}
        <linearGradient
          id={discFillId}
          gradientUnits="userSpaceOnUse"
          x1="3.2"
          y1="0"
          x2="18.8"
          y2={MARK_VIEWBOX}
        >
          <stop offset="0" stopColor="currentColor" stopOpacity="0.91" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.99" />
        </linearGradient>

        {/*
          The S runs the same ramp brighter and shorter. On a near-black canvas
          "nearer the light" is the only cue that survives, so the ribbon being
          uniformly brighter than the bed is doing the work a cast shadow does
          on a light page. Full currentColor at the lit end, so at rest the S is
          exactly the shipped mark's colour and the discs sit back from it.
        */}
        <linearGradient
          id={turnFillId}
          gradientUnits="userSpaceOnUse"
          x1="3.2"
          y1="0"
          x2="18.8"
          y2={MARK_VIEWBOX}
        >
          <stop offset="0" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.91" />
        </linearGradient>

        {material && (
          <>
            {/*
              The bed's inner shadow, the reference's recipe verbatim in
              structure: blur SourceAlpha, offset it, then subtract it from
              SourceAlpha with an arithmetic composite (k2 = -1, k3 = 1). Where
              the offset copy has moved off the shape, the difference is the
              rim; everywhere else it cancels to nothing. Offsetting DOWN leaves
              the residue at the TOP edge, offsetting up leaves it at the
              bottom. Two passes merged is exactly what the reference does to
              its left lobe.

              Which pass gets which colour is the whole depth cue. Here the
              DARK pass is on top and the light one underneath, which is the
              signature of a shape pressed INTO the surface - the same reading
              the reference gets by punching a logo-shaped hole in a
              page-coloured backdrop. That trick itself does not survive the
              move to dark (see the note on the contact shadow), but this does,
              and it buys the same thing: a bed for the S to float over. The S's
              own filter below is the mirror image, light on top, so the two
              read as opposite sides of the same surface rather than as four
              bevelled stickers.

              Their numbers are in a 500 viewBox where the logo spans ~241
              units; ours spans 21.44 of 22, so the ratio is ~11.2:1. Their
              light pass (blur 4, dy 8) lands at blur 0.36 / dy 0.71 here and
              their dark pass (blur 2, dy -4) at blur 0.18 / dy -0.36. Both were
              then re-tuned against the rendered page, because a light object on
              a dark ground needs a harder terminator than the same object on a
              light one to read as round at all.

              White and black here are light and shade, not brand colour - the
              mark's colour is entirely the gradient's currentColor underneath.
              The alphas are the dark-mode `--highlight` family's own idea of a
              rim (white at 0.05-0.15 for a 1-2px CSS inset); over a 0.3-unit
              SVG rim they need to be higher to return the same light.
            */}
            <filter
              id={discShadeId}
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur
                in="SourceAlpha"
                stdDeviation="0.26"
                result="topBlur"
              />
              <feOffset in="topBlur" dy="0.46" result="topOffset" />
              <feComposite
                in="topOffset"
                in2="SourceAlpha"
                operator="arithmetic"
                k2="-1"
                k3="1"
                result="topRim"
              />
              <feFlood floodColor="black" floodOpacity="0.38" result="shade" />
              <feComposite in="shade" in2="topRim" operator="in" result="top" />

              <feGaussianBlur
                in="SourceAlpha"
                stdDeviation="0.34"
                result="footBlur"
              />
              <feOffset in="footBlur" dy="-0.42" result="footOffset" />
              <feComposite
                in="footOffset"
                in2="SourceAlpha"
                operator="arithmetic"
                k2="-1"
                k3="1"
                result="footRim"
              />
              <feFlood floodColor="white" floodOpacity="0.3" result="lit" />
              <feComposite in="lit" in2="footRim" operator="in" result="foot" />

              <feMerge>
                <feMergeNode in="top" />
                <feMergeNode in="foot" />
              </feMerge>
            </filter>

            {/*
              The S's own inner shadow: same construction, tighter and brighter.
              A harder, whiter top rim is what makes it read as the piece
              closest to the light, and on a dark canvas that is the substitute
              for the reference's cast shadow onto its own lobes.
            */}
            <filter
              id={turnShadeId}
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur
                in="SourceAlpha"
                stdDeviation="0.3"
                result="topBlur"
              />
              <feOffset in="topBlur" dy="0.55" result="topOffset" />
              <feComposite
                in="topOffset"
                in2="SourceAlpha"
                operator="arithmetic"
                k2="-1"
                k3="1"
                result="topRim"
              />
              <feFlood floodColor="white" floodOpacity="0.55" result="lit" />
              <feComposite in="lit" in2="topRim" operator="in" result="top" />

              <feGaussianBlur
                in="SourceAlpha"
                stdDeviation="0.22"
                result="footBlur"
              />
              <feOffset in="footBlur" dy="-0.4" result="footOffset" />
              <feComposite
                in="footOffset"
                in2="SourceAlpha"
                operator="arithmetic"
                k2="-1"
                k3="1"
                result="footRim"
              />
              <feFlood floodColor="black" floodOpacity="0.34" result="shade" />
              <feComposite
                in="shade"
                in2="footRim"
                operator="in"
                result="foot"
              />

              <feMerge>
                <feMergeNode in="foot" />
                <feMergeNode in="top" />
              </feMerge>
            </filter>

            {/*
              The contact shadow the S casts, and the one place this port had to
              be re-derived rather than translated. The reference's crossing
              band physically COVERS its two lobes, so its drop shadow
              (feOffset 10,10 -> blur 10 -> black at 0.5) falls on a light
              surface and reads hard. Ours never overlaps: the S's concave
              bridge arcs AROUND the top-left and bottom-right discs at a
              constant 1.6-unit gap (radius 6.5605 from each disc centre, minus
              LOBE_RADIUS 4.96). A shadow cast into that gap lands on the
              #1e1e1d canvas, where black on near-black is nothing.

              So the shadow is clipped to the two discs and only exists where it
              has a lit surface to darken - which is also the only place a real
              one would be visible. `operator="out"` drops the part under the S
              itself, so the layer is purely what falls on the bed. The offset
              is kept small against the blur (0.35 / 0.5 against stdDeviation
              0.72) so it stays a soft occlusion that reaches both discs across
              that 1.6-unit gap, biased down-right by the top-left light.
            */}
            <filter
              id={contactId}
              x="-45%"
              y="-45%"
              width="190%"
              height="190%"
              colorInterpolationFilters="sRGB"
            >
              <feOffset
                in="SourceAlpha"
                dx="0.4"
                dy="0.6"
                result="castOffset"
              />
              <feGaussianBlur
                in="castOffset"
                stdDeviation="0.85"
                result="castBlur"
              />
              <feComposite
                in="castBlur"
                in2="SourceAlpha"
                operator="out"
                result="cast"
              />
              <feFlood floodColor="black" floodOpacity="0.72" result="ink" />
              <feComposite in="ink" in2="cast" operator="in" />
            </filter>

            {/* The bed, as a clip. This is what keeps the cast shadow off the
                canvas and on the only surface that can show it. */}
            <clipPath id={discClipId}>
              <path d={TOP_LEFT_PATH} />
              <path d={BOTTOM_RIGHT_PATH} />
            </clipPath>
          </>
        )}
      </defs>

      {/* Everything the mark is made of rides in one group so a hover turns it
          as a single object. The lighting rotates with it, which is only
          honest for a full turn: it ends exactly where it started, top-lit. */}
      <g ref={spinRef} style={pivot}>
        {/* 1. The bed: two discs, filled, then the hover wash, then the
             inner-shadow layer on top of both - exactly the `<use>` stacking
             the reference uses, with the tint slipped under the lighting so a
             hover recolours the object without flattening its rims. The tint
             rides inside this group so it follows the entrance transform. */}
        <g ref={discsRef} style={pivot}>
          <g fill={`url(#${discFillId})`}>
            <path d={TOP_LEFT_PATH} />
            <path d={BOTTOM_RIGHT_PATH} />
          </g>
          <g style={tintStyle}>
            <path d={TOP_LEFT_PATH} />
            <path d={BOTTOM_RIGHT_PATH} />
          </g>
          {material && (
            <g fill="black" filter={`url(#${discShadeId})`}>
              <path d={TOP_LEFT_PATH} />
              <path d={BOTTOM_RIGHT_PATH} />
            </g>
          )}
        </g>

        {/* 2. What the S drops onto the bed. */}
        {material && (
          <g clipPath={`url(#${discClipId})`}>
            <g ref={contactRef} style={pivot}>
              <g style={pivot}>
                <path
                  d={TURN_PATH}
                  fill="black"
                  filter={`url(#${contactId})`}
                />
              </g>
            </g>
          </g>
        )}

        {/* 3. The floating S, same three layers as the bed, one level brighter. */}
        <g ref={turnRef} style={pivot}>
          <g style={pivot}>
            <path d={TURN_PATH} fill={`url(#${turnFillId})`} />
            <path d={TURN_PATH} style={tintStyle} />
            {material && (
              <path
                d={TURN_PATH}
                fill="black"
                filter={`url(#${turnShadeId})`}
              />
            )}
          </g>
        </g>
      </g>
    </svg>
  );
}
