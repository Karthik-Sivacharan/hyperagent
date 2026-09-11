"use client";

import * as React from "react";

// Which node the reader means right now, and when its tooltip may show.
//
// A node is MEANT while the pointer is over it or it has keyboard focus
// (`:focus-visible` only; org-view.tsx filters). Meaning a node lights its
// chain of command at once. Its tooltip waits 250ms, so sweeping the pointer
// across the chart lights chains without a trail of tooltips; once one is
// open, moving on to a neighbour (within 300ms of leaving) opens the next at
// once, the way a row of toolbar tooltips behaves (Radix's skipDelayDuration).
// Leaving a node keeps it lit, and its tooltip open, for a 90ms grace, so the
// chart does not flash back to full while the pointer crosses a gap.
// `dismiss` closes the tooltip with no grace and no warm hand-off: a click
// (the sheet opens), Escape, or the reader panning the canvas.

/** The tooltip waits this long after the pointer or focus lands on a node. */
const TIP_DELAY_MS = 250;
/** After leaving a node whose tooltip was open, the next one opens at once for this long. */
const TIP_SKIP_MS = 300;
/** How long a node stays meant after the pointer or focus leaves it. */
const GRACE_MS = 90;

export function useNodeIntent() {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const [focusedId, setFocusedId] = React.useState<string | null>(null);
  const [tipId, setTipState] = React.useState<string | null>(null);

  // Read inside timers and handlers, which must see the latest value.
  const tipRef = React.useRef<string | null>(null);
  const openTimer = React.useRef<number | undefined>(undefined);
  const graceTimer = React.useRef<number | undefined>(undefined);
  const warmUntil = React.useRef(0);

  React.useEffect(
    () => () => {
      window.clearTimeout(openTimer.current);
      window.clearTimeout(graceTimer.current);
    },
    [],
  );

  const handlers = React.useMemo(() => {
    const setTip = (id: string | null) => {
      tipRef.current = id;
      setTipState(id);
    };

    const land = (id: string) => {
      window.clearTimeout(graceTimer.current);
      window.clearTimeout(openTimer.current);
      if (tipRef.current !== null || performance.now() < warmUntil.current) setTip(id);
      else openTimer.current = window.setTimeout(() => setTip(id), TIP_DELAY_MS);
    };

    const leave = (forget: () => void) => {
      window.clearTimeout(openTimer.current);
      window.clearTimeout(graceTimer.current);
      if (tipRef.current !== null) warmUntil.current = performance.now() + TIP_SKIP_MS;
      graceTimer.current = window.setTimeout(() => {
        forget();
        setTip(null);
      }, GRACE_MS);
    };

    return {
      pointerEnter(id: string) {
        setHoveredId(id);
        land(id);
      },
      pointerLeave() {
        leave(() => setHoveredId(null));
      },
      /** Keyboard focus landed on a node; null when focus landed on one
       *  without `:focus-visible` (a click), which means nothing by itself. */
      focus(id: string | null) {
        setFocusedId(id);
        if (id) land(id);
      },
      blur() {
        leave(() => setFocusedId(null));
      },
      dismiss() {
        window.clearTimeout(openTimer.current);
        warmUntil.current = 0;
        setTip(null);
      },
    };
  }, []);

  return { hoveredId, focusedId, tipId, ...handlers };
}
