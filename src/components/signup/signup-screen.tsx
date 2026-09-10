"use client";

import { useEffect, useRef, useState } from "react";

import { MaterialMark } from "@/components/brand/logo-motion/material-mark";
import { EmailForm } from "@/components/signup/email-form";
import { LoadingStep, LOADING_TOTAL_MS } from "@/components/signup/loading-step";
import { ProfileStep } from "@/components/signup/profile-step";
import { ProviderList } from "@/components/signup/provider-list";
import { SignupLegal } from "@/components/signup/signup-legal";
import { WorkEmailNudge } from "@/components/signup/work-email-nudge";
import { cn } from "@/lib/utils";

// The three screens the page moves through, in order and one way: you pick a
// provider, you wait, you confirm what came back. Nothing goes backwards,
// which is why this is a plain string and not a history stack.
type Step = "signin" | "loading" | "profile";

// ...and the two panels the first screen swaps between.
type Mode = "providers" | "email";

// Everything that shares a cell crossfades on these three classes: full
// opacity in place, or transparent and lifted 4px out of the way. The panel
// that is off screen is `inert`, which takes it out of the tab order and the
// accessibility tree while it is still painted mid-fade.
//
// Both the screen swap and the panel swap use them, and both put every child
// in `col-start-1 row-start-1` of a one-cell grid. That is what buys a
// crossfade with no reflow: the cell is always as tall as the tallest thing in
// it, so the change is opacity and a 4px settle and nothing moves.
//
// The screen grid is therefore as tall as `profile`, its tallest member, even
// while `signin` is showing. That costs nothing visible: the cell has no
// surface of its own, each screen is `self-center` inside it, and the cell is
// itself centred in the viewport — so the signin column lands on exactly the
// axis it would have without the grid.
const PANEL =
  "col-start-1 row-start-1 transition-[opacity,transform] duration-(--duration-normal) ease-out motion-reduce:transition-none";
const PANEL_SHOWN = "translate-y-0 opacity-100";
const PANEL_HIDDEN = "pointer-events-none opacity-0 motion-safe:-translate-y-1";

/** The screen swap gets the longer curve: it is a bigger change than a panel. */
const SCREEN = "col-start-1 row-start-1 w-full self-center transition-[opacity,transform] duration-(--duration-slow) ease-out motion-reduce:transition-none";

export function SignupScreen() {
  const [step, setStep] = useState<Step>("signin");
  const [mode, setMode] = useState<Mode>("providers");
  const emailFieldRef = useRef<HTMLInputElement>(null);
  const emailTriggerRef = useRef<HTMLButtonElement>(null);
  const profileHeadingRef = useRef<HTMLHeadingElement>(null);
  const focusedFor = useRef(mode);

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
  // provider waits out the status sequence and then shows the record. The
  // delay is the loading screen's own total, so the handover lands on its last
  // line rather than cutting one short.
  useEffect(() => {
    if (step !== "loading") return;
    const id = window.setTimeout(() => setStep("profile"), LOADING_TOTAL_MS);
    return () => window.clearTimeout(id);
  }, [step]);

  // A screen change is a route change as far as the keyboard is concerned, so
  // focus goes to the new heading rather than to its first control: landing on
  // the primary button would skip the two cards the screen exists to show. The
  // heading takes tabIndex={-1} for that and nothing else — it stays out of
  // the tab order.
  useEffect(() => {
    if (step !== "profile") return;
    profileHeadingRef.current?.focus({ preventScroll: true });
  }, [step]);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-5 py-12">
      <div className="grid w-full max-w-96">
        {/* 1. Pick a provider, or fall back to email. */}
        <div
          className={cn(SCREEN, step === "signin" ? PANEL_SHOWN : PANEL_HIDDEN)}
          inert={step !== "signin"}
        >
          <div className="flex w-full flex-col items-center">
            {/* The material mark: 64px because its filters are gated at 40 and
                degrade to flat gradients below that. It paints ~12px outside its own
                box (overflow: visible keeps the hover spin from being cropped), owns
                its cursor and its latching hover fill, and renders aria-hidden here
                because the heading below already names the product. Nothing above it
                may clip overflow, and nothing may wrap it in a competing hover. */}
            <MaterialMark size={64} />
            {/* The heading pair is one block: the same size for both lines, no gap
                between them beyond their own leading, and the second line dropped to
                the third text tier so the contrast, not the scale, separates them.
                Every heading SIZE bakes `--font-weight-heading` (600) — including on
                a <p> — so the weight has to be set explicitly on both lines. This is
                a name-over-tagline lockup rather than a sentence ("Welcome to" was
                boilerplate the OAuth rows below already make redundant), so the name
                takes `font-strong` (550) to hold the pair together and the tagline
                `font-normal` (400). Rule 7 caps the range at 400-600. The name still
                has to be set in type: the mark is a symbol, not a logotype. */}
            <h1 className="mt-7 text-center font-heading text-2xl font-strong">Hyperagent</h1>
            <p className="text-center text-2xl font-normal text-foreground-low">Create agents that ship real work</p>

            {/* Onboarding incentive. Remove this line and work-email-nudge.tsx to cut it. */}
            <WorkEmailNudge className="mt-8" />

            <div className="mt-4 grid w-full">
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

            <SignupLegal className="mt-10" />
          </div>
        </div>

        {/* 2. The wait, with the mark turning on its own. */}
        <div
          className={cn(SCREEN, step === "loading" ? PANEL_SHOWN : PANEL_HIDDEN)}
          inert={step !== "loading"}
        >
          {/* Mounted only while it is the live screen, so its timers start when
              the screen does and are torn down with it — a status sequence that
              had already run to its last line behind a hidden panel would show
              "Finding your company" the moment it faded in. */}
          {step === "loading" && <LoadingStep />}
        </div>

        {/* 3. The record, to confirm or correct. */}
        <div
          className={cn(SCREEN, step === "profile" ? PANEL_SHOWN : PANEL_HIDDEN)}
          inert={step !== "profile"}
        >
          <ProfileStep headingRef={profileHeadingRef} />
        </div>
      </div>
    </main>
  );
}
