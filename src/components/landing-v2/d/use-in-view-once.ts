"use client";

import { useEffect, useState, type RefObject } from "react";

// True once any of the element has been seen, and true from then on. The
// hero window's entrance plays when the reader reaches it and never again,
// least of all on the way back up the page. The threshold is a sliver rather
// than a share of the element on purpose: the window is nearly a screen tall,
// so a fifth of it is a long way down, and a picture that waits that long is
// a picture the reader first meets empty. (Variant b keeps its own copy of
// this in b/motion.ts; the variants stay independent of each other.)
export function useInViewOnce(
  ref: RefObject<Element | null>,
  threshold = 0.01,
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
