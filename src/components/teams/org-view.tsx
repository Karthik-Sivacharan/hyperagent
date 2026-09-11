"use client";

import * as React from "react";
import { cubicBezier } from "motion/react";

import {
  FlowCanvas,
  FlowControls,
  FlowProvider,
  useNodesInitialized,
  useNodesState,
  useReactFlow,
  type FitViewOptions,
  type FlowEdge,
  type NodeTypes,
} from "@/components/ui/flow";
import { DURATION, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useFleet } from "@/components/teams/fleet/fleet-context";
import { useViewEntrance } from "@/components/teams/fleet/view-entrance";
import { AgentNode } from "@/components/teams/org/agent-node";
import { TeamNode } from "@/components/teams/org/team-node";
import { NodeTipProvider } from "@/components/teams/org/node-tip";
import { useNodeIntent } from "@/components/teams/org/node-intent";
import { OrgEntranceProvider, edgeEntranceClass, type OrgEntrancePhase } from "@/components/teams/org/org-entrance";
import {
  TEAM_NODE_ID,
  buildOrgEdges,
  buildOrgNodes,
  chainOf,
  searchMatches,
  type OrgNode,
} from "@/components/teams/org/org-graph";

// The Org chart view: who reports to whom. The team at the top, Atlas under
// it, the four leads in a row and each lead's specialists stacked under it on
// Linear's delegate line (org/layout.ts, org/org-graph.ts). Every node is a
// small card with a face, a name, a role and at most one glyph for a person
// being needed (org/agent-node.tsx); hairlines for "reports to" and
// travelling dashes where a working run has handed work down right now.
//
// The canvas is the view area itself, full bleed on the page ground: no
// frame, no dotted grid. It fits the tree with 48px to spare and never zooms
// in past 1, and the tree is built to fit a 1456×868 window at exactly 1, so
// the chart's text renders at its true size. The zoom controls sit top
// right, where the narrow top of the tree leaves the corner empty.
//
// READING THE CHART. Hovering a card, focusing one from the keyboard, or
// selecting one lights its chain of command (everyone above it up to the
// team, everyone below it) and dims the rest to 40% over 200ms; a 90ms grace
// on leaving a card keeps the chart from flashing back to full while the
// pointer crosses a gap. 250ms after the pointer or focus lands, the card's
// tooltip shows what it no longer prints (org/node-intent.ts has the timing).
// Search lights the agents it finds instead of removing anyone, so the shape
// of the team never changes under the reader; how many it found is said to
// screen readers only, since the lit cards show it. Precedence: the card
// under the pointer, then the card with keyboard focus, then the search, then
// the selection (a stale selection must not hide what the reader just typed).
// Click, or Enter on a focused card, opens the agent sheet; Tab walks the
// cards and the canvas pans to the one it lands on.
//
// ARRIVING. When the chart is the first view the page paints, the canvas
// fits the tree, starts 6% further out and settles in over 400ms (reveal,
// ease-out-expo) while the rows fade up rank by rank (org/org-entrance.tsx).
// Arriving from another view it fits at once and the page cross-fade does
// the rest. Reduced motion: an instant fit and no entrance.

const NODE_TYPES: NodeTypes = { team: TeamNode, agent: AgentNode };

const ORG_FIT: FitViewOptions = { padding: "48px", maxZoom: 1 };

const SETTLE_FROM = 0.94;
const settleEase = cubicBezier(...EASE.outExpo);

const NODE_WRAPPER = "transition-opacity duration-(--duration-normal) ease-out";
const EDGE_WRAPPER = "transition-opacity duration-(--duration-normal)";
const DIMMED = "opacity-40";

export function OrgView() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <FlowProvider>
        <OrgCanvas />
      </FlowProvider>
    </div>
  );
}

function OrgCanvas() {
  const { team, agents, allRuns, runs, query, openAgent } = useFleet();

  const initialNodes = React.useMemo(() => buildOrgNodes(team, agents, allRuns), [team, agents, allRuns]);
  const [nodes, , onNodesChange] = useNodesState<OrgNode>(initialNodes);
  const edges = React.useMemo(() => buildOrgEdges(team, agents, allRuns), [team, agents, allRuns]);
  const rankOf = React.useMemo(() => new Map(initialNodes.map((node) => [node.id, node.data.rank])), [initialNodes]);

  const frameRef = React.useRef<HTMLDivElement>(null);
  const entrance = useViewEntrance();
  const phase = useSettleIn(frameRef, entrance);

  // What is lit: the chain under the pointer, else the one with keyboard
  // focus, else the search, else the selection.
  const intent = useNodeIntent();

  const trimmed = query.trim();
  const matches = React.useMemo(
    () => (trimmed ? searchMatches(trimmed, team, agents, runs) : null),
    [trimmed, team, agents, runs],
  );
  const selectedId = nodes.find((node) => node.selected)?.id ?? null;
  const focusId = intent.hoveredId ?? intent.focusedId ?? (matches ? null : selectedId);
  const lit = React.useMemo(() => (focusId ? chainOf(focusId, agents) : matches), [focusId, agents, matches]);

  const shownNodes = React.useMemo(
    () => nodes.map((node): OrgNode => ({ ...node, className: cn(NODE_WRAPPER, lit && !lit.has(node.id) && DIMMED) })),
    [nodes, lit],
  );
  const shownEdges = React.useMemo(
    () =>
      edges.map(
        (edge): FlowEdge => ({
          ...edge,
          className: cn(
            EDGE_WRAPPER,
            edgeEntranceClass(phase, rankOf.get(edge.target) ?? 1),
            lit && !(lit.has(edge.source) && lit.has(edge.target)) && DIMMED,
          ),
        }),
      ),
    [edges, phase, rankOf, lit],
  );

  const matchCount = matches ? [...matches].filter((id) => id !== TEAM_NODE_ID).length : null;
  const openFromNode = (id: string) => {
    intent.dismiss();
    if (id !== TEAM_NODE_ID) openAgent(id);
  };

  return (
    <div ref={frameRef} className="relative min-h-0 flex-1 overflow-hidden">
      <OrgEntranceProvider value={phase}>
        <NodeTipProvider value={intent.tipId}>
          <FlowCanvas<OrgNode, FlowEdge>
            aria-label={`${team.name} org chart`}
            className="bg-background"
            background={false}
            nodes={shownNodes}
            edges={shownEdges}
            onNodesChange={onNodesChange}
            nodeTypes={NODE_TYPES}
            fitViewOptions={ORG_FIT}
            onNodeClick={(_, node) => openFromNode(node.id)}
            onNodeMouseEnter={(_, node) => intent.pointerEnter(node.id)}
            onNodeMouseLeave={() => intent.pointerLeave()}
            // A pan or zoom the reader starts closes the tooltip (it is
            // anchored to where the card was); the settle-in, a programmatic
            // move, has no source event and leaves it alone.
            onMoveStart={(event) => {
              if (event) intent.dismiss();
            }}
            // Keyboard focus lights a chain the way the pointer does. Only
            // `:focus-visible`, so the focus a click leaves behind does not
            // outrank the search; the selection covers the clicked card.
            onFocus={(event) => {
              const node = focusedNodeOf(event.target);
              if (node) intent.focus(node.matches(":focus-visible") ? (node.dataset.id ?? null) : null);
            }}
            onBlur={(event) => {
              if (focusedNodeOf(event.target) && !focusedNodeOf(event.relatedTarget)) intent.blur();
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") intent.dismiss();
              // React Flow selects a focused node on Enter or Space; the sheet opens with it.
              if (event.key !== "Enter" && event.key !== " ") return;
              const id = focusedNodeOf(event.target)?.dataset.id;
              if (id && id !== TEAM_NODE_ID) openFromNode(id);
            }}
          >
            {/* In the page's 24px gutter, so its right edge lines up with the
                view switch above it. */}
            <FlowControls position="top-right" orientation="horizontal" fitViewOptions={ORG_FIT} className="mr-6" />
          </FlowCanvas>
        </NodeTipProvider>
      </OrgEntranceProvider>
      {/* Always mounted, so a screen reader hears it fill. */}
      <p aria-live="polite" className="sr-only">
        {matchCount === null ? "" : matchCount === 0 ? "No agents match" : `${matchCount} of ${agents.length} agents match`}
      </p>
    </div>
  );
}

/** The React Flow node wrapper an event target is, if it is one (what Tab lands on). */
function focusedNodeOf(target: EventTarget | null): HTMLElement | null {
  return target instanceof HTMLElement && target.classList.contains("react-flow__node") ? target : null;
}

/**
 * The entrance phase, and the camera settle that goes with it. React Flow
 * fits the canvas (with ORG_FIT) synchronously in the same update that
 * measures the nodes, before `useNodesInitialized()` can turn true, so by
 * the time the cards may enter, the viewport already IS the fit: the settle
 * reads it as its end, jumps out 6% about the frame's centre before paint,
 * and eases back. (Awaiting a second `fitView()` here would race the
 * canvas's own: its tail clears the shared resolver and the promise never
 * settles.) The phase latches once measured, so a later re-measure never
 * replays it; without `entrance` it goes straight to "rest" and nothing moves.
 */
function useSettleIn(frameRef: React.RefObject<HTMLDivElement | null>, entrance: boolean): OrgEntrancePhase {
  const initialized = useNodesInitialized();
  const { getViewport, setViewport } = useReactFlow();
  const [phase, setPhase] = React.useState<OrgEntrancePhase>("measuring");
  if (initialized && phase === "measuring") setPhase(entrance ? "enter" : "rest");

  const settledRef = React.useRef(false);
  React.useLayoutEffect(() => {
    if (phase !== "enter" || settledRef.current) return;
    settledRef.current = true;
    const frame = frameRef.current;
    if (!frame || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const end = getViewport();
    const cx = frame.clientWidth / 2;
    const cy = frame.clientHeight / 2;
    void setViewport({
      zoom: end.zoom * SETTLE_FROM,
      x: cx - (cx - end.x) * SETTLE_FROM,
      y: cy - (cy - end.y) * SETTLE_FROM,
    });
    void setViewport(end, { duration: DURATION.reveal * 1000, ease: settleEase });
  }, [phase, frameRef, getViewport, setViewport]);

  return phase;
}
