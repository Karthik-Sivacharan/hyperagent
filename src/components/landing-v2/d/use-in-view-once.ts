"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * "idle" holds the first frame, "play" runs the entrance, "skip" means there
 * is no entrance to run and the picture is simply finished.
 */
export type IntroState = "idle" | "play" | "skip";

// True once any of the element has been seen, and true from then on. The
// hero window's entrance plays when the reader reaches it and never again,
// least of all on the way back up the page. The threshold is a sliver rather
// than a share of the element on purpose: the window is nearly a screen tall,
// so a fifth of it is a long way down, and a picture that waits that long is
// a picture the reader first meets empty. (Variant b keeps its own copy of
// this in b/motion.ts; the variants stay independent of each other.)
//
// `introKey` makes the entrance a once-per-VISIT thing rather than a
// once-per-page-load thing. An intro is worth watching the first time and is
// an obstacle every time after: a reader who opens the pricing page and comes
// back, or who reloads, has already seen the window draw itself and now just
// wants to look at it. The key is kept in `sessionStorage`, not
// `localStorage`, so it lasts a visit and no longer — somebody returning next
// week meets the page as a first-time reader again, which is who the entrance
// is for.
//
// Storage can throw outright (Safari's private mode has historically done so),
// and it is a decoration either way, so every access is wrapped and a failure
// falls back to playing the entrance.
export function useInViewOnce(
  ref: RefObject<Element | null>,
  threshold = 0.01,
  introKey?: string,
): IntroState {
  // Always "idle" on the server and on the first client frame, whatever
  // storage says: a state that differs between the two is a hydration
  // mismatch, so the skip is decided in the effect below instead.
  // Always "idle" on the server and on the first client frame, whatever
  // storage says: a state that differs between the two is a hydration
  // mismatch, so the decision is made below, when the element is first seen.
  const [state, setState] = useState<IntroState>("idle");

  useEffect(() => {
    const node = ref.current;
    if (!node || state !== "idle") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();

        // Both branches resolve here, in the observer's callback, so there is
        // exactly one `setState` and it is never called synchronously from the
        // effect body — which would cascade a render, and which the repo's
        // lint rule rejects outright.
        let alreadySeen = false;
        if (introKey) {
          try {
            alreadySeen = window.sessionStorage.getItem(introKey) === "1";
          } catch {
            // No storage to read: treat it as a first visit.
          }
        }

        setState(alreadySeen ? "skip" : "play");

        if (introKey && !alreadySeen) {
          try {
            window.sessionStorage.setItem(introKey, "1");
          } catch {
            // Nothing to record it in; the entrance simply plays again.
          }
        }
      },
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, state, threshold, introKey]);

  return state;
}
