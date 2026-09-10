"use client";

import { useEffect, useRef, useState } from "react";

import { MaterialMark } from "@/components/brand/logo-motion/material-mark";
import { EmailForm } from "@/components/signup/email-form";
import { ProviderList } from "@/components/signup/provider-list";
import { SignupLegal } from "@/components/signup/signup-legal";
import { WorkEmailNudge } from "@/components/signup/work-email-nudge";
import { cn } from "@/lib/utils";

type Mode = "providers" | "email";

// The two panels share one grid cell, so the region is always as tall as the
// taller of them and the vertically centred column does not move when they
// swap: the change is a crossfade and a 4px settle, nothing reflows. The two
// are built to within a few pixels of each other for the same reason. The
// panel that is off screen is `inert`, which takes it out of the tab order
// and the accessibility tree while it is still painted mid-fade.
const PANEL =
  "col-start-1 row-start-1 transition-[opacity,transform] duration-(--duration-normal) ease-out motion-reduce:transition-none";
const PANEL_SHOWN = "translate-y-0 opacity-100";
const PANEL_HIDDEN = "pointer-events-none opacity-0 motion-safe:-translate-y-1";

export function SignupScreen() {
  const [mode, setMode] = useState<Mode>("providers");
  const emailFieldRef = useRef<HTMLInputElement>(null);
  const emailTriggerRef = useRef<HTMLButtonElement>(null);
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

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-5 py-12">
      <div className="flex w-full max-w-96 flex-col items-center">
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
            <ProviderList onChooseEmail={() => setMode("email")} emailButtonRef={emailTriggerRef} />
          </div>
          <div className={cn(PANEL, mode === "email" ? PANEL_SHOWN : PANEL_HIDDEN)} inert={mode !== "email"}>
            <EmailForm onBack={() => setMode("providers")} inputRef={emailFieldRef} />
          </div>
        </div>

        <SignupLegal className="mt-10" />
      </div>
    </main>
  );
}
