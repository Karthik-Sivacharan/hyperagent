"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void) {
  const query = window.matchMedia(REDUCED);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const readReduced = () => window.matchMedia(REDUCED).matches;
const readReducedOnServer = () => false;

// The visitor's motion preference, as an external store so it is correct
// from the first client render and follows a change. The server reports
// `false`; a component that would otherwise start a timer checks this
// before its first tick.
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReduced,
    readReduced,
    readReducedOnServer,
  );
}

// True once the element has been at least `threshold` visible. Latches: a
// demo that starts when seen should not restart every time it scrolls by.
export function useInViewOnce(
  ref: RefObject<Element | null>,
  threshold = 0.4,
): boolean {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || seen) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, seen, threshold]);
  return seen;
}
