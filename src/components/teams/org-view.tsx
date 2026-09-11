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
import { OrgLegend } from "@/components/teams/org/org-legend";
import { OrgEntranceProvider, edgeEntranceClass, type OrgEntrancePhase } from "@/components/teams/org/org-entrance";
import {
  TEAM_NODE_ID,
  buildOrgEdges,
  buildOrgNodes,
  chainOf,
  searchMatches,
  type OrgNode,
} from "@/components/teams/org/org-graph";

// The Org chart view: the team's hierarchy on the flow canvas (Paperclip's
// org chart, Relevance AI's named agents on a canvas). The team at the top,
// Atlas under it, the four leads, then their specialists, laid out as a tidy
// tree from `parentId` (org/layout.ts); each agent a profile card
// (org/agent-node.tsx); hairlines for "reports to" and travelling dashes
// where a working run has handed work down right now (org/org-graph.ts).
//
// READING THE CHART. Hovering a card, focusing one from the keyboard, or
// selecting one lights its chain of command (everyone above it up to the
// team, everyone below it) and dims the rest to 40% over 200ms; a short
// grace on leaving a card keeps the chart from flashing back to full while
// the pointer crosses a gap. Search lights the agents it finds instead of
// removing anyone, so the shape of the team never changes under the reader.
// Precedence: the card under the pointer, then the card with keyboard focus,
// then the search, then the selection (a stale selection must not hide what
// the reader just typed). Click, or Enter on a focused card, opens the agent
// sheet; Tab walks the cards and the canvas pans to the one it lands on.
//
// ARRIVING. When the chart is the first view the page paints, the canvas
// fits the tree, starts 6% further out and settles in over 400ms (reveal,
// ease-out-expo) while the rows fade up rank by rank (org/org-entrance.tsx).
// Arriving from another view it fits at once and the page cross-fade does
// the rest. Reduced motion: an instant fit and no entrance.
//
// The canvas is framed in the page gutter like the board's columns, and the
// fit is tighter than the canvas default: the tree is wide (seven
// specialists across, on compact cards, org/org-graph.ts), so every point of
// zoom is legibility. The key sits top left and the zoom controls top right:
// the bottom corners belong to the specialists at the fitted zoom.

const NODE_TYPES: NodeTypes = { team: TeamNode, agent: AgentNode };

const ORG_FIT: FitViewOptions = { padding: "24px", maxZoom: 1 };

const SETTLE_FROM = 0.94;
const settleEase = cubicBezier(...EASE.outExpo);

/** How long the chain stays lit after the pointer leaves a card. */
const HOVER_GRACE_MS = 90;

const NODE_WRAPPER = "transition-opacity duration-(--duration-normal) ease-out";
const EDGE_WRAPPER = "transition-opacity duration-(--duration-normal)";
const DIMMED = "opacity-40";

export function OrgView() {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-6 pb-6">
      <FlowProvider>
        <OrgCanvas />
      </FlowProvider>
    </div>
  );
}

function OrgCanvas() {
  const { team, agents, allRuns, runs, query, openAgent } = useFleet();

  const initialNodes = React.useMemo(() => buildOrgNodes(team, agents), [team, agents]);
  const [nodes, , onNodesChange] = useNodesState<OrgNode>(initialNodes);
  const edges = React.useMemo(() => buildOrgEdges(team, agents, allRuns), [team, agents, allRuns]);
  const rankOf = React.useMemo(() => new Map(initialNodes.map((node) => [node.id, node.data.rank])), [initialNodes]);

  const frameRef = React.useRef<HTMLDivElement>(null);
  const entrance = useViewEntrance();
  const phase = useSettleIn(frameRef, entrance);

  // What is lit: the chain under the pointer, else the one with keyboard
  // focus, else the search, else the selection.
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const [focusedId, setFocusedId] = React.useState<string | null>(null);
  const graceRef = React.useRef<number | undefined>(undefined);
  React.useEffect(() => () => window.clearTimeout(graceRef.current), []);

  const trimmed = query.trim();
  const matches = React.useMemo(
    () => (trimmed ? searchMatches(trimmed, team, agents, runs) : null),
    [trimmed, team, agents, runs],
  );
  const selectedId = nodes.find((node) => node.selected)?.id ?? null;
  const focusId = hoveredId ?? focusedId ?? (matches ? null : selectedId);
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

  const agentMatchCount = matches ? [...matches].filter((id) => id !== TEAM_NODE_ID).length : null;

  return (
    <div ref={frameRef} className="relative min-h-0 flex-1 overflow-hidden rounded-3xl shadow-card">
      <OrgEntranceProvider value={phase}>
        <FlowCanvas<OrgNode, FlowEdge>
          aria-label={`${team.name} org chart`}
          nodes={shownNodes}
          edges={shownEdges}
          onNodesChange={onNodesChange}
          nodeTypes={NODE_TYPES}
          fitViewOptions={ORG_FIT}
          onNodeClick={(_, node) => {
            if (node.type === "agent") openAgent(node.id);
          }}
          onNodeMouseEnter={(_, node) => {
            window.clearTimeout(graceRef.current);
            setHoveredId(node.id);
          }}
          onNodeMouseLeave={() => {
            window.clearTimeout(graceRef.current);
            graceRef.current = window.setTimeout(() => setHoveredId(null), HOVER_GRACE_MS);
          }}
          // Keyboard focus lights a chain the way the pointer does. Only
          // `:focus-visible`, so the focus a click leaves behind does not
          // outrank the search; the selection covers the clicked card.
          onFocus={(event) => {
            const node = focusedNodeOf(event.target);
            setFocusedId(node && node.matches(":focus-visible") ? (node.dataset.id ?? null) : null);
          }}
          onBlur={(event) => {
            if (!focusedNodeOf(event.relatedTarget)) setFocusedId(null);
          }}
          onKeyDown={(event) => {
            // React Flow selects a focused node on Enter or Space; the sheet opens with it.
            if (event.key !== "Enter" && event.key !== " ") return;
            const target = event.target as HTMLElement;
            const id = target.classList.contains("react-flow__node") ? target.dataset.id : undefined;
            if (id && id !== TEAM_NODE_ID) openAgent(id);
          }}
        >
          <OrgLegend matchCount={agentMatchCount} />
          <FlowControls position="top-right" orientation="horizontal" fitViewOptions={ORG_FIT} />
        </FlowCanvas>
      </OrgEntranceProvider>
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
