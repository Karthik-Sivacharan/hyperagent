"use client";

import * as React from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// A node's tooltip: the facts the node no longer prints, one interaction
// deeper (docs/plans/2026-09-11-teams-fleet-polish.md §4.4). CONTROLLED:
// org-view.tsx decides whose tooltip is open (org/node-intent.ts has the
// timing) and passes the id down this context, so Radix's own hover timing
// never runs; with no `onOpenChange`, its trigger's open and close calls are
// no-ops. The trigger is the node's card itself (`asChild` on FlowNode, which
// stays the node component's DOM root), so the tooltip anchors to the card.
//
// The ink primitive, under the node and aligned to its left edge, 256px at
// most, taking no pointer (the primitive's `pointer-events-none`). It is a
// reveal, so it fades and does not move: the primitive's zoom and slide are
// zeroed through the variables tw-animate's keyframes read, inline so they
// win over the classes whatever order the stylesheet emits them in; its 140ms
// in and 90ms out stay.

const NodeTipContext = React.createContext<string | null>(null);

/** The id of the node whose tooltip is open, or null. */
export const NodeTipProvider = NodeTipContext.Provider;

const FADE_ONLY = {
  "--tw-enter-scale": "1",
  "--tw-exit-scale": "1",
  "--tw-enter-translate-x": "0",
  "--tw-enter-translate-y": "0",
} as React.CSSProperties;

export function NodeTip({
  id,
  content,
  children,
}: {
  id: string;
  content: React.ReactNode;
  /** The node's FlowNode. */
  children: React.ReactElement;
}) {
  const open = React.useContext(NodeTipContext) === id;
  return (
    <Tooltip open={open}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="bottom" align="start" className="flex max-w-64 flex-col gap-1" style={FADE_ONLY}>
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
