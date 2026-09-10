"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { MaterialMark } from "@/components/brand/logo-motion/material-mark";
import { EmailForm } from "@/components/signup/email-form";
import { ChatStep } from "@/components/signup/chat-step";
import { LoadingStep, LOADING_SEQUENCE_MS } from "@/components/signup/loading-step";
import { ProfileStep } from "@/components/signup/profile-step";
import { ProviderList } from "@/components/signup/provider-list";
import { SignupLegal } from "@/components/signup/signup-legal";
import { WorkEmailNudge } from "@/components/signup/work-email-nudge";
import { cn } from "@/lib/utils";

// The four screens the page moves through, in order and one way: you pick a
// provider, you wait, you confirm what came back, and then it starts working.
// Nothing goes backwards, which is why this is a plain string and not a
// history stack.
type Step = "signin" | "loading" | "profile" | "personalize";

// ...and the two panels the first screen swaps between.
type Mode = "providers" | "email";

/**
 * Reads a duration token off a mounted element as a number, because WAAPI
 * wants one. Same shape and the same reason as material-mark.tsx's private
 * copy: a retune in src/design/brand/brand.css lands here without a code
 * change, and the fallback is that file's current value for the one frame
 * before the sheet applies. Duplicated rather than shared because those
 * helpers are internal to the mark and widening its surface for this is not
 * this branch's business.
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

// The mark has to be seated before the browser paints or it shows up in the
// stage's top-left corner for a frame; a plain useEffect runs after paint.
// Nothing is measured on the server, where React also warns about
// useLayoutEffect, so fall back there. Same device as material-mark.tsx.
const useBeforePaint = typeof window === "undefined" ? useEffect : useLayoutEffect;

// The mark is rendered at ONE size for the whole flow and scaled to reach its
// smaller state, never re-rendered at a new pixel size. Re-rendering the SVG
// re-rasterises six filters mid-flight, which reads as the mark dissolving and
// re-forming; a scale on a baked layer is one composited transform. 64 is also
// the size that keeps the material alive — material-mark.tsx gates its filters
// at 40px RENDERED size (MATERIAL_MIN_PX), and a 64px mark scaled to 0.6875 is
// still a 64px render.
//
// The two numbers are the ones the three screens already used: 64 at rest on
// the signin column, 44 turning on the loading screen and 44 still on the
// profile column. The seats in those screens (`data-mark-slot`) are sized to
// match — size-16 and size-11 — so a change here needs a change there.
const MARK_PX = 64;
const MARK_SMALL_PX = 44;
const MARK_SMALL = MARK_SMALL_PX / MARK_PX;

// What the travel costs if the stylesheet has not applied yet. --duration-slide
// is brand.css's ceiling for a large transform move and this is the largest one
// on the page: most of a column's height, plus the shrink.
const MARK_TRAVEL_FALLBACK_MS = 480;

// Everything that shares a cell crossfades on these three classes: full
// opacity in place, or transparent and lifted 4px out of the way. The panel
// that is off screen is `inert`, which takes it out of the tab order and the
// accessibility tree while it is still painted mid-fade.
//
// Both panels put every child in `col-start-1 row-start-1` of a one-cell grid.
// That is what buys a crossfade with no reflow: the cell is always as tall as
// the tallest thing in it, so the change is opacity and a 4px settle and
// nothing moves.
const PANEL =
  "col-start-1 row-start-1 transition-[opacity,transform] duration-(--duration-normal) ease-out motion-reduce:transition-none";
const PANEL_SHOWN = "translate-y-0 opacity-100";
const PANEL_HIDDEN = "pointer-events-none opacity-0 motion-safe:-translate-y-1";

// The three screens sit in one grid cell, each `self-center` inside it. The
// cell is therefore as tall as `profile`, its tallest member, even while
// `signin` is showing — which costs nothing visible, because the cell has no
// surface of its own and is itself centred in the viewport, so the signin
// column lands on exactly the axis it would have without the grid.
//
// The screens carry NO transform of their own any more. They used to lift 4px
// on the way out like the panels do, and that 4px was measured into every seat
// the mark flies to: a slot inside a screen that is mid-transform reports a
// moving rect, and the mark would land 4px off and then creep. The exit
// movement now lives on the signin screen's individual parts, where it reads
// better anyway (see LEAVE below).
const SCREEN = "col-start-1 row-start-1 w-full self-center";

// The three narrow screens cap themselves at the column's 384px and centre
// inside the cell, rather than taking their width from the stage. That is what
// lets the stage widen for the fourth screen (see the note on the stage below)
// without the profile cards stretching to 752px as they fade out — and it
// keeps every `data-mark-slot` on the same vertical axis in all four screens,
// which the mark's FLIP would otherwise read as a sideways move.
const COLUMN = "mx-auto max-w-96";

/** Opacity only, on the two screens that still crossfade as a block. */
const SCREEN_FADE =
  "transition-opacity duration-(--duration-slow) ease-out motion-reduce:transition-none";

// The signin screen does not leave as one block. Its parts clear out ahead of
// the mark, top first, each one 80ms behind the last, so the column reads as
// making way rather than as a slab blinking off. 8px of drift and no more:
// brand rule 9 is "motion is quick", and this is a fade with a hint of
// direction, not a slide. The whole cascade — four parts, 240ms of stagger
// plus a 200ms fade — finishes at 440ms, just inside the mark's 480ms flight,
// so the mark is always the last thing still moving.
//
// `motion-safe:` on the drift and `motion-reduce:transition-none` on the
// timing: under reduce this is an instant swap with no travel anywhere.
const LEAVE =
  "transition-[opacity,transform] duration-(--duration-normal) ease-out motion-reduce:transition-none";
const LEAVE_SHOWN = "translate-y-0 opacity-100";
const LEAVE_HIDDEN = "opacity-0 motion-safe:translate-y-2";

/** One --duration-stagger per step down the column. */
const LEAVE_DELAY = [
  "",
  "delay-(--duration-stagger)",
  "delay-[calc(var(--duration-stagger)*2)]",
  "delay-[calc(var(--duration-stagger)*3)]",
] as const;

export function SignupScreen() {
  const [step, setStep] = useState<Step>("signin");
  const [mode, setMode] = useState<Mode>("providers");
  const emailFieldRef = useRef<HTMLInputElement>(null);
  const emailTriggerRef = useRef<HTMLButtonElement>(null);
  const profileHeadingRef = useRef<HTMLHeadingElement>(null);
  const chatHeadingRef = useRef<HTMLHeadingElement>(null);
  const focusedFor = useRef(mode);

  // The FLIP rig. `stageRef` is the positioning context the mark is measured
  // against — offsets relative to it survive the page being re-centred by the
  // flex parent, which absolute screen coordinates would not.
  const stageRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const travelRef = useRef<Animation | null>(null);
  // False until the mark has been seated once. The first seating is a jump to
  // the right place, not a move from a previous one, so it must not animate.
  const seated = useRef(false);

  // How long the mark takes to cross, read off --duration-slide once. It is
  // state rather than a constant because three things have to agree on it —
  // the travel itself, the lead the loading screen holds before its first
  // status line, and the timeout that hands over to the profile screen — and
  // agreeing on a token beats agreeing on a number typed three times. Zero
  // under `prefers-reduced-motion`, which collapses the lead as well as the
  // travel: with nothing flying in, there is nothing to wait for.
  const [travelMs, setTravelMs] = useState(MARK_TRAVEL_FALLBACK_MS);
  useBeforePaint(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTravelMs(0);
      return;
    }
    setTravelMs(durationToken(stage, "--duration-slide", MARK_TRAVEL_FALLBACK_MS));
  }, []);

  // FLIP. The mark is one persistent element for the whole flow — unmounting
  // it per screen replays its entrance, which is precisely the blink this
  // replaces — so what changes between steps is not which mark is on screen
  // but which seat this one is parked on.
  //
  // Each screen carries an empty box marked `data-mark-slot`, sized and placed
  // exactly where its mark used to sit. The mark itself is absolutely
  // positioned over the stage and parked on the live seat with a transform.
  // The seats are found by attribute rather than by a ref threaded through
  // three components: a seat is a layout fact of the screen that owns it, and
  // this way LoadingStep and ProfileStep keep the props they had.
  //
  // Then the classic four steps: measure where the mark IS, move it to the new
  // seat with no transition, measure where it LANDED, and play the difference
  // backwards. Only `transform` animates — `top` and `margin` would relayout
  // the column on every frame, and the scale rides in the same transform so
  // the shrink is part of the same composited move rather than a second one.
  useBeforePaint(() => {
    const stage = stageRef.current;
    const mark = markRef.current;
    if (!stage || !mark) return;
    const slot = stage.querySelector<HTMLElement>(`[data-mark-slot="${step}"]`);
    if (!slot) return;

    // FIRST — read before anything is touched. Mid-flight is fine and in fact
    // wanted: an interrupted move should continue from where the eye left it,
    // not from where the last step ended.
    const first = seated.current ? mark.getBoundingClientRect() : null;
    // ...and the in-flight animation has to go before LAST is read, or LAST
    // would report the animated position instead of the new resting one.
    travelRef.current?.cancel();
    travelRef.current = null;

    // LAST. `origin-top-left` is what keeps this arithmetic honest: with the
    // origin at 0 0, `translate(x, y) scale(s)` puts the mark's visible
    // top-left exactly at (x, y) and makes it 64 * s wide — so parking it is
    // "translate to the seat's top-left corner", with no half-size correction.
    // The seat is 44 wide and 64 * 0.6875 is 44, so the two agree by
    // construction.
    const seat = () => {
      const stageBox = stage.getBoundingClientRect();
      const slotBox = slot.getBoundingClientRect();
      const scale = step === "signin" ? 1 : MARK_SMALL;
      const x = slotBox.left - stageBox.left;
      const y = slotBox.top - stageBox.top;
      mark.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      // The mark ships hidden and is revealed by its first seating, because
      // the server-rendered HTML has no transform yet and would paint it in
      // the stage's top-left corner until hydration caught up. A missing mark
      // for those few ms is a better first frame than a misplaced one.
      mark.style.opacity = "1";
      return { x, y, scale };
    };
    const here = seat();

    // The seat moves whenever the column reflows — a narrower viewport, a font
    // finally loading, the profile cards changing height. Re-park without
    // animating: this is a correction, not a move.
    const observer = new ResizeObserver(() => seat());
    observer.observe(stage);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (first && !reduce) {
      // INVERT. Rects are the VISIBLE boxes, so the width ratio is the scale
      // the mark was wearing a moment ago, and multiplying it back in gives
      // the absolute scale the animation has to start from.
      const last = mark.getBoundingClientRect();
      const dx = first.left - last.left;
      const dy = first.top - last.top;
      const fromScale = last.width > 0 ? (first.width / last.width) * here.scale : here.scale;
      const moved =
        Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5 || Math.abs(fromScale - here.scale) > 0.005;

      // PLAY. --ease-in-out, not --duration-slide's usual --ease-out-quint
      // partner. The mark is an object the eye tracks from one rest to another,
      // and quint-out spends 90% of the distance in the first 200ms: measured
      // mid-flight it was already at the centre while the column behind it was
      // still at half opacity, which reads as a flick followed by a drift
      // rather than a move. That is the same finding material-mark.tsx records
      // for its own 360 deg turn, and it lands on the same curve — brand.css's
      // "on-screen movement" line.
      if (moved) {
        travelRef.current = mark.animate(
          [
            { transform: `translate(${here.x + dx}px, ${here.y + dy}px) scale(${fromScale})` },
            { transform: `translate(${here.x}px, ${here.y}px) scale(${here.scale})` },
          ],
          {
            duration: travelMs,
            easing: easingToken(stage, "--ease-in-out", "cubic-bezier(0.4, 0, 0.2, 1)"),
          },
        );
      }
    }

    seated.current = true;
    return () => observer.disconnect();
  }, [step, travelMs]);

  // Focus follows the swap, so the keyboard lands where the eye does — but
  // only on a real swap. The guard holds the mode we last moved focus for and
  // compares against it, rather than asking "have I mounted yet": a mount-flag
  // ref cannot survive StrictMode, which mounts, tears down and remounts, so
  // the first pass would arm the flag and the second would read it as armed
  // and focus the trigger on load. A ref that remembers the *previous mode*
  // survives that remount with its value intact and simply reads "unchanged",
  // so the page takes no focus on load in dev or prod, while a genuine swap
  // still moves it. preventScroll keeps the swap from scrolling the column.
  useEffect(() => {
    if (focusedFor.current === mode) return;
    focusedFor.current = mode;
    const target = mode === "email" ? emailFieldRef.current : emailTriggerRef.current;
    target?.focus({ preventScroll: true });
  }, [mode]);

  // There is no auth here — the repo is static mock data — so picking a
  // provider waits out the loading screen and then shows the record. The wait
  // is the mark's flight plus the status sequence, both derived: the flight
  // from --duration-slide and the sequence from LoadingStep's own STEP_MS, so
  // retuning either one still hands over on the last line rather than cutting
  // one short. About 3.8s at today's values.
  useEffect(() => {
    if (step !== "loading") return;
    const id = window.setTimeout(() => setStep("profile"), travelMs + LOADING_SEQUENCE_MS);
    return () => window.clearTimeout(id);
  }, [step, travelMs]);

  // A screen change is a route change as far as the keyboard is concerned, so
  // focus goes to the new heading rather than to its first control: landing on
  // the primary button would skip the two cards the screen exists to show. The
  // heading takes tabIndex={-1} for that and nothing else — it stays out of
  // the tab order.
  useEffect(() => {
    if (step === "profile") profileHeadingRef.current?.focus({ preventScroll: true });
    if (step === "personalize") chatHeadingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const leaving = step !== "signin";

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-5 py-12">
      {/* The stage is the column's measure, and it is the ONE thing that
          changes between the first three screens and the fourth. 384px is a
          sign-in column; the chat step is a thread, and the product's own
          thread runs at 816px (measured on hyperagent.com, 2026-09-09) — the
          nearest thing the token set has is `max-w-wide`, 752px, which is
          literally the composer's own measure. It snaps rather than animating:
          max-width is a layout property, and nothing occupies the extra width
          until the chat screen has faded in anyway. */}
      <div
        ref={stageRef}
        className={cn(
          "relative grid w-full",
          step === "personalize" ? "max-w-wide" : "max-w-96",
        )}
      >
        {/* 1. Pick a provider, or fall back to email. */}
        <div
          className={cn(SCREEN, COLUMN, leaving && "pointer-events-none")}
          inert={leaving}
        >
          <div className="flex w-full flex-col items-center">
            {/* The mark's seat. The mark itself is the absolutely positioned
                one below, shared with the other two screens; this box only
                holds its place in the column so nothing under it moves when
                the mark flies away. 64px — size-16 — which is MARK_PX. */}
            <div data-mark-slot="signin" className="size-16" />

            {/* The heading pair is one block: the same size for both lines, no gap
                between them beyond their own leading, and the second line dropped to
                the third text tier so the contrast, not the scale, separates them.
                Every heading SIZE bakes `--font-weight-heading` (600) — including on
                a <p> — so the weight has to be set explicitly on both lines. This is
                a name-over-tagline lockup rather than a sentence ("Welcome to" was
                boilerplate the OAuth rows below already make redundant), so the name
                takes `font-strong` (550) to hold the pair together and the tagline
                `font-normal` (400). Rule 7 caps the range at 400-600. The name still
                has to be set in type: the mark is a symbol, not a logotype.

                The pair leaves as one thing, and first, because it is the part
                the mark passes through on its way down. The `mt-7` lives on the
                wrapper rather than on the h1 so the gap stays put while the
                words drift. */}
            <div className={cn("mt-7", LEAVE, LEAVE_DELAY[0], leaving ? LEAVE_HIDDEN : LEAVE_SHOWN)}>
              <h1 className="text-center font-heading text-2xl font-strong">Hyperagent</h1>
              <p className="text-center text-2xl font-normal text-foreground-low">Create agents that ship real work</p>
            </div>

            {/* Onboarding incentive. Remove this line and work-email-nudge.tsx to cut it. */}
            <WorkEmailNudge
              className={cn("mt-8", LEAVE, LEAVE_DELAY[1], leaving ? LEAVE_HIDDEN : LEAVE_SHOWN)}
            />

            <div
              className={cn(
                "mt-4 grid w-full",
                LEAVE,
                LEAVE_DELAY[2],
                leaving ? LEAVE_HIDDEN : LEAVE_SHOWN,
              )}
            >
              <div className={cn(PANEL, mode === "providers" ? PANEL_SHOWN : PANEL_HIDDEN)} inert={mode !== "providers"}>
                <ProviderList
                  onChooseEmail={() => setMode("email")}
                  emailButtonRef={emailTriggerRef}
                  onSelectGoogle={() => setStep("loading")}
                />
              </div>
              <div className={cn(PANEL, mode === "email" ? PANEL_SHOWN : PANEL_HIDDEN)} inert={mode !== "email"}>
                <EmailForm onBack={() => setMode("providers")} inputRef={emailFieldRef} />
              </div>
            </div>

            <SignupLegal
              className={cn("mt-10", LEAVE, LEAVE_DELAY[3], leaving ? LEAVE_HIDDEN : LEAVE_SHOWN)}
            />
          </div>
        </div>

        {/* 2. The wait, with the mark turning on its own. Its fade-in is held
            back by one --duration-slide so the mark arrives on an empty stage
            and the status line joins it rather than racing it; the delay is on
            the shown state only, so the way out is immediate. */}
        <div
          className={cn(
            SCREEN,
            COLUMN,
            SCREEN_FADE,
            step === "loading"
              ? "opacity-100 delay-(--duration-slide)"
              : "pointer-events-none opacity-0",
          )}
          inert={step !== "loading"}
        >
          {/* Mounted only while it is the live screen, so its timers start when
              the screen does and are torn down with it — a status sequence that
              had already run to its last line behind a hidden panel would show
              "Finding your company" the moment it faded in. */}
          {step === "loading" && <LoadingStep leadMs={travelMs} />}
        </div>

        {/* 3. The record, to confirm or correct. */}
        <div
          className={cn(
            SCREEN,
            COLUMN,
            SCREEN_FADE,
            step === "profile" ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          inert={step !== "profile"}
        >
          <ProfileStep
            headingRef={profileHeadingRef}
            onPersonalize={() => setStep("personalize")}
          />
        </div>

        {/* 4. The thread. No COLUMN cap: this screen IS the wide measure. */}
        <div
          className={cn(
            SCREEN,
            SCREEN_FADE,
            step === "personalize" ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          inert={step !== "personalize"}
        >
          {/* `active` rather than a conditional mount: this screen has to be
              in the cell from the start (it is the tallest, and the cell's
              height is what keeps the other three from moving), so it takes a
              flag to say when its research pass may start rather than relying
              on its own mount. LoadingStep, which is not the tallest, is
              conditionally mounted for the same problem. */}
          <ChatStep headingRef={chatHeadingRef} active={step === "personalize"} />
        </div>

        {/* The material mark, rendered ONCE for the whole flow and flown
            between the three seats above. It paints ~12px outside its own box
            (`overflow: visible` keeps the hover spin from being cropped), owns
            its cursor and its latching hover fill, and renders aria-hidden
            because a heading always names the product beside it. Nothing above
            it may clip overflow, and nothing may wrap it in a competing hover.

            Last in the stage so it paints over the screens and keeps its own
            hover target; absolutely positioned so moving it costs no layout;
            `size-16` because the wrapper has to be exactly the rendered size
            for the scale arithmetic above to hold; `block` on the svg so it
            fills that wrapper instead of sitting on a text baseline.

            `spin="auto"` for the wait and `"hover"` either side of it: the loop
            already opens with a --duration-entrance (500ms) delay, which is
            just past the 480ms flight, so the first turn starts the moment the
            mark settles. */}
        <div ref={markRef} className="absolute left-0 top-0 size-16 origin-top-left opacity-0">
          <MaterialMark
            size={MARK_PX}
            spin={step === "loading" ? "auto" : "hover"}
            className="block"
          />
        </div>
      </div>
    </main>
  );
}
