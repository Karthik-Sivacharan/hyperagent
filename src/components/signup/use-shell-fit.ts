"use client";

import { useEffect, useState } from "react";

import { AGENT_PANEL_MIN_WIDTH } from "@/components/agent-panel/agent-panel";

// THE ONE SENTENCE: the conversation has a floor, and the panel yields first.
// Everything in this file is that sentence turned into arithmetic.
//
// The shell is three columns — sidebar, conversation, agent panel — and until
// now the conversation was whatever the other two left over. That is backwards:
// the conversation is the subject of the screen, and the two pieces of chrome
// either side of it are the things that should give.
//
// THE YIELD ORDER, in three steps, cheapest first:
//
//   1. the panel gives up its own width, down to its 440 minimum;
//   2. the panel stops being a column and becomes a drawer over the top;
//   3. the sidebar rails to 64.
//
// The conversation gives up nothing at any step, which is the whole rule. Step
// 3 was missing at first and left one real hole: 768 to 807, where the panel
// had already floated and the 256px sidebar still would not move, so the column
// came out at 472 and the page scrolled 183px under a real wheel. That band is
// iPad portrait. Railing the sidebar there buys 192px and puts the column back
// at 664 and the cards back to two-up.

/**
 * The narrowest the conversation column may be while the panel is docked.
 *
 * Measured rather than picked: the agent cards stop fitting their own height at
 * about 240px of card, which is about 496px of column (docs/plans/
 * 2026-09-10-responsive-shell.md, "Measured numbers"). 512 is Tailwind's `@lg`
 * container breakpoint, comfortably clear of that 496, and it is also the width
 * at which the card grid should drop to one column — so one number does both
 * jobs and W2's container query and this floor cannot drift apart.
 */
export const COLUMN_FLOOR = 512;

/**
 * The air either side of the conversation, in px.
 *
 * This is `px-5` on `<main>` written as a number, because the shell's padding
 * has to ADD to that gutter rather than replace it: `md:pl-64` used to override
 * `pl-5` outright, which is why the cards ended up flush against the panel's
 * hairline at 1180. Change one and change the other.
 */
export const SHELL_GUTTER = 20;

export type ShellFit = {
  /**
   * True while the panel is a third column: it takes width away from nothing
   * and the conversation sits beside it. False when there is no longer room for
   * both, at which point the panel becomes an overlay (see app-handoff.tsx).
   */
  docked: boolean;
  /**
   * True when even an open sidebar and the conversation's floor no longer fit
   * together, so the sidebar has to hold at its rail. Step 3 of the yield
   * order. Passed to `Sidebar.forceCollapsed`, which keeps the reader's own
   * choice underneath it.
   */
  railSidebar: boolean;
  /**
   * The widest the panel may be right now, or undefined before the viewport has
   * been measured. A CONSTRAINT, not a width — see `AgentPanel.maxWidth`.
   */
  panelMax?: number;
  /** Re-exported so callers need only this hook. */
  columnFloor: number;
  /** Viewport less the sidebar and both gutters: everything left to divide. */
  available: number;
};

/**
 * Decides whether the agent panel can still be a column, from the live
 * geometry rather than from a media query.
 *
 * A media query would be wrong here for one concrete reason: the sidebar is
 * collapsible to a 64px rail and drag-resizable between 250 and 500, so "is
 * there room for both" is a different answer at the same viewport width
 * depending on what the sidebar is currently doing. Collapsing the rail has to
 * buy the panel 192px, or the rail means nothing after the handoff — which is
 * exactly the bug this replaces.
 *
 * `window.innerWidth` and a `resize` listener rather than a ResizeObserver on
 * an element: what is being asked is a question about the window, and the
 * element we would observe (`<main>`) has its own width changed by the answer.
 */
export function useShellFit({
  sidebarWidth,
  expandedSidebarWidth,
}: {
  /** What the sidebar is taking right now — 64 while railed. */
  sidebarWidth: number;
  /**
   * What the sidebar WOULD take with nothing forcing it. Step 3 is decided
   * against this and never against the live width, or the decision feeds back
   * into itself: railing changes the live width, which un-makes the decision,
   * which un-rails, which re-makes it. The expanded width does not move when
   * the rail is forced, so the answer is stable.
   */
  expandedSidebarWidth: number;
}): ShellFit {
  // 0 means "not measured yet", which is the server render and the first client
  // frame. It is deliberately not `window.innerWidth` in a lazy initialiser:
  // that would hydrate a different tree than the server sent. Until the first
  // measurement lands the answer is "docked, unconstrained", which is exactly
  // what this screen rendered before this hook existed, so nothing moves.
  const [viewport, setViewport] = useState(0);

  useEffect(() => {
    const read = () => setViewport(window.innerWidth);
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  // Below `md` neither the sidebar nor the panel is displayed at all (both
  // wrappers are `hidden md:flex`), so this arithmetic is answering a question
  // nobody is asking down there. It still answers "floating", which is the
  // harmless answer: a panel that is `display: none` cannot be a column.
  const available = viewport - sidebarWidth - 2 * SHELL_GUTTER;

  if (viewport === 0) {
    return {
      docked: true,
      railSidebar: false,
      panelMax: undefined,
      columnFloor: COLUMN_FLOOR,
      available,
    };
  }

  // Step 3, asked of the sidebar's own width rather than of the room left over:
  // "is there still room for this column open and a readable conversation?"
  const railSidebar = viewport - expandedSidebarWidth - 2 * SHELL_GUTTER < COLUMN_FLOOR;

  const docked = available >= COLUMN_FLOOR + AGENT_PANEL_MIN_WIDTH;

  // The two decisions cannot fight, and the arithmetic says so rather than the
  // hope: railing holds only while viewport < 512 + 40 + expanded, which with
  // the sidebar's own 250-500 drag range tops out below 1052; docking after a
  // rail needs viewport - 64 - 40 >= 952, which is 1056 and up. The bands do
  // not touch, so no width exists where railing the sidebar re-docks the panel
  // and re-opens the question.
  return {
    docked,
    railSidebar,
    // Docked, the panel may have everything the conversation does not need.
    // Floating, the conversation is not paying for the panel at all — it keeps
    // the whole `available` width and the panel lies over the top of it — so
    // the only sensible ceiling is the room there is.
    panelMax: docked ? available - COLUMN_FLOOR : available,
    columnFloor: COLUMN_FLOOR,
    available,
  };
}
