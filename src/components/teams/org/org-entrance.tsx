"use client";

import * as React from "react";

// The chart's first-mount entrance, rank by rank: the team, then Atlas, then
// the leads, then the specialists, each row fading up from 95% one stagger
// (80ms) after the row above, 200ms apiece, so the last row lands by 440ms.
// Edges fade in with the row they lead to.
//
// TWO PHASES, because React Flow measures each node's handles with
// getBoundingClientRect: a card measured mid-scale would pin its edges a few
// pixels inside the card for good (a transform never re-triggers the
// measurement). So until every node is measured the cards are only
// transparent, at full size; once `useNodesInitialized()` is true the view
// flips `entered` and the scale-and-fade runs. `fill-mode-backwards` holds
// each card at its first keyframe through its delay, so nothing flashes.
//
// Reduced motion: every class is `motion-safe:`, so the cards and edges
// simply appear once measured. (The live edges' dash stops in flow.css.)

const OrgEntranceContext = React.createContext(false);

export const OrgEntranceProvider = OrgEntranceContext.Provider;

export function useOrgEntered(): boolean {
  return React.useContext(OrgEntranceContext);
}

/** Ranks past this start together, so the entrance never runs past 500ms. */
const LAST_STAGGERED_RANK = 3;

const ENTER =
  "motion-safe:animate-in motion-safe:fade-in motion-safe:fill-mode-backwards motion-safe:animation-duration-(--duration-normal) ease-out-expo";

/** For a node's card (the FlowNode root), with `cardEntranceStyle` for its delay. */
export function cardEntranceClass(entered: boolean): string {
  return entered ? `${ENTER} motion-safe:zoom-in-95` : "motion-safe:opacity-0";
}

export function cardEntranceStyle(rank: number): React.CSSProperties {
  return { animationDelay: `calc(var(--duration-stagger) * ${Math.min(rank, LAST_STAGGERED_RANK)})` };
}

// Spelled out so Tailwind sees every literal. An edge's class lands on React
// Flow's <g> for it, where an inline style cannot reach.
const EDGE_DELAY = [
  "motion-safe:[animation-delay:0ms]",
  "motion-safe:[animation-delay:var(--duration-stagger)]",
  "motion-safe:[animation-delay:calc(var(--duration-stagger)*2)]",
  "motion-safe:[animation-delay:calc(var(--duration-stagger)*3)]",
] as const;

/** For an edge, timed with the rank of the node it leads to. */
export function edgeEntranceClass(entered: boolean, targetRank: number): string {
  return entered ? `${ENTER} ${EDGE_DELAY[Math.min(targetRank, LAST_STAGGERED_RANK)]}` : "motion-safe:opacity-0";
}
