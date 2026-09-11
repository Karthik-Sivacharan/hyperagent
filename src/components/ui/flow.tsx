"use client";

import * as React from "react";
import {
  Background,
  BackgroundVariant,
  BaseEdge,
  getBezierPath,
  getSmoothStepPath,
  Handle,
  NodeToolbar,
  Panel,
  Position,
  ReactFlow,
  useReactFlow,
  useStore,
  type DefaultEdgeOptions,
  type Edge,
  type EdgeProps,
  type EdgeTypes,
  type FitViewOptions,
  type Node,
  type PanelPosition,
  type ProOptions,
  type ReactFlowProps,
} from "@xyflow/react";
import { IconFocusCentered, IconMinus, IconPlus } from "@tabler/icons-react";
import { cva, type VariantProps } from "class-variance-authority";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import "./flow.css";

// The node-and-edge canvas: React Flow (`@xyflow/react` 12) behind our own
// parts, modelled on Vercel AI Elements' workflow components (Canvas, Node
// with Header / Title / Description / Content / Footer, Edge.Animated and
// Edge.Temporary, Controls, Panel, Toolbar). This is the ONLY file in the repo
// that imports `@xyflow/react` (components.test.ts locks it), so everything a
// view needs is exported from here, React Flow's types and hooks included.
//
// The React Flow CSS comes in through ./flow.css, which imports React Flow's
// structural sheet into `@layer components` (so Tailwind classes on any part
// beat it) and maps its `--xy-*` variables onto the brand tokens (so light
// and dark follow next-themes' `.dark` on <html>). React Flow's own
// `colorMode` is left at its default: its `.dark` only swaps defaults that
// flow.css already overrides, and a `.dark` class on the canvas would re-map
// the brand tokens inside it on its own schedule instead of <html>'s.
//
// Defaults are a VIEWER's, not an editor's: pan by dragging or two-finger
// scroll, zoom with ⌘/Ctrl + scroll or a pinch, nodes selectable and
// focusable but not draggable, connectable or deletable. Every one is a plain
// React Flow prop, so a caller can turn editing back on.

// ===== CANVAS ===============================================================

// Hoisted so the canvas never hands React Flow a new object per render (it
// diffs these by reference).
const PRO_OPTIONS: ProOptions = { hideAttribution: true };
const FIT_VIEW_OPTIONS: FitViewOptions = { padding: 0.15, maxZoom: 1 };
const DEFAULT_EDGE_OPTIONS: DefaultEdgeOptions = { type: "static", selectable: false, focusable: false };
// React Flow's stock descriptions tell a screen reader to press Delete, which
// this canvas ignores.
const ARIA_LABEL_CONFIG: ReactFlowProps["ariaLabelConfig"] = {
  "node.a11yDescription.default": "Press enter or space to select.",
  "node.a11yDescription.keyboardDisabled": "Press enter or space to select.",
};

type FlowCanvasProps<N extends Node = Node, E extends Edge = Edge> = ReactFlowProps<N, E> & {
  /** The dotted ground. On by default. */
  background?: boolean;
};

/**
 * The canvas: React Flow with the viewer defaults, the brand edge types and a
 * dotted ground on `bg-surface-secondary`. Give its parent a height.
 *
 * It brings its own React Flow store, so `useReactFlow()` works in any node,
 * edge or panel inside it. To reach the store from OUTSIDE the canvas (a
 * toolbar beside it), wrap both in `FlowProvider`; the canvas adopts that one
 * instead of creating a second.
 *
 * Selection lives on the nodes, so pass `defaultNodes` / `defaultEdges`
 * (uncontrolled) or `nodes` with `onNodesChange` (`useNodesState`); a
 * controlled `nodes` with no change handler can never become selected.
 */
function FlowCanvas<N extends Node = Node, E extends Edge = Edge>({
  className,
  background = true,
  children,
  ...props
}: FlowCanvasProps<N, E>) {
  return (
    <ReactFlow<N, E>
      data-slot="flow-canvas"
      className={cn("bg-surface-secondary", className)}
      proOptions={PRO_OPTIONS}
      ariaLabelConfig={ARIA_LABEL_CONFIG}
      edgeTypes={flowEdgeTypes}
      defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
      fitView
      fitViewOptions={FIT_VIEW_OPTIONS}
      minZoom={0.3}
      maxZoom={1.5}
      // Two-finger scroll and the mouse wheel pan; ⌘/Ctrl + wheel zooms (React
      // Flow's default zoom key) and so does a trackpad pinch, which the
      // browser reports as a ctrl + wheel.
      panOnDrag
      panOnScroll
      zoomOnScroll={false}
      zoomOnPinch
      zoomOnDoubleClick={false}
      nodesDraggable={false}
      nodesConnectable={false}
      edgesFocusable={false}
      deleteKeyCode={null}
      selectionKeyCode={null}
      multiSelectionKeyCode={null}
      {...props}
    >
      {background ? <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} /> : null}
      {children}
    </ReactFlow>
  );
}

// ===== NODE =================================================================

// Rendered as the ROOT of a custom node component: the selected, focus and
// hover states read React Flow's wrapper classes through the direct-child
// arbitrary variants below (`.selected>&`, `.selectable>&`, `:focus-visible>&`),
// so nothing has to thread `selected` through by hand. The surface is the
// native card's (`bg-card shadow-card`, the hover lift `shadow-card-hover`).
//
// Selected is an ink outline and keyboard focus the brand's tangerine one,
// never both at once (`:not(:focus-visible)`), and neither transitions:
// selection answers a click and has to land with it. The hover lift is the
// card's own (`shadow-card-hover`, 300ms ease-out) and so is the press
// (`--scale-press` at the button speed, motion-safe), both only on
// selectable nodes, the same pair every pressable card in the app wears.
//
// HANDLES. Where lines meet the node. `direction` puts the pair on its
// sides ("TB": in on top, out at the bottom; "LR": left to right); either
// can move to another side, or to a point along one (`{ side, offset }`,
// px from the side's top or left end), and one more source can leave from
// its own spot (`extraSource`, named by an `id` the edge gives as
// `sourceHandle`): an org chart's bus out of the bottom centre and a tree
// elbow out of the bottom-left corner, say. Every handle is a point with no
// size and no paint: the canvas is a viewer's, never connectable, so there is
// nothing to grab, and a line meets the card exactly at its edge.
//
// No `overflow-hidden` on the root, because the handles sit on its edge;
// the footer rounds its own bottom corners instead.

type FlowHandleSide = "top" | "right" | "bottom" | "left";

/** A side (the handle sits at its middle), or a side and a distance along it
 *  in px from its top or left end. */
type FlowHandleAt = FlowHandleSide | { side: FlowHandleSide; offset: number };

type FlowNodeHandles = {
  /** Where edges arrive: `true` for the direction's entry side, or a spot. */
  target?: boolean | FlowHandleAt;
  /** Where edges leave: `true` for the direction's exit side, or a spot. */
  source?: boolean | FlowHandleAt;
  /** A second source, for a second kind of line leaving the node. */
  extraSource?: { id: string; at: FlowHandleAt };
};

const DIRECTION_SIDES = {
  TB: { target: "top", source: "bottom" },
  LR: { target: "left", source: "right" },
} as const satisfies Record<string, { target: FlowHandleSide; source: FlowHandleSide }>;

/** A handle's React Flow position, and its offset along the side as an inline
 *  `left` / `top` (which beats base.css's centring `50%`). */
function handleSpot(
  at: boolean | FlowHandleAt | undefined,
  fallback: FlowHandleSide,
): { position: Position; style?: React.CSSProperties } | null {
  if (!at) return null;
  const spot = at === true ? fallback : at;
  // Position's values are these same four strings.
  if (typeof spot === "string") return { position: spot as Position };
  const horizontal = spot.side === "top" || spot.side === "bottom";
  return { position: spot.side as Position, style: horizontal ? { left: spot.offset } : { top: spot.offset } };
}

function FlowNode({
  className,
  handles = { target: true, source: true },
  direction = "TB",
  children,
  ...props
}: React.ComponentProps<"div"> & {
  /** Which connection points to render and where. A node with no handle of a
   *  type cannot be connected that way (React Flow drops the edge and warns). */
  handles?: FlowNodeHandles;
  /** "TB": edges arrive on top and leave from the bottom (an org chart).
   *  "LR": left to right (a pipeline). */
  direction?: "TB" | "LR";
}) {
  const sides = DIRECTION_SIDES[direction];
  const target = handleSpot(handles.target, sides.target);
  const source = handleSpot(handles.source, sides.source);
  const extra = handles.extraSource ? handleSpot(handles.extraSource.at, sides.source) : null;

  return (
    <div
      data-slot="flow-node"
      data-direction={direction}
      className={cn(
        "relative flex w-60 flex-col gap-(--node-spacing) rounded-2xl bg-card py-(--node-spacing) text-foreground shadow-card [--node-spacing:--spacing(3)] has-data-[slot=flow-node-footer]:pb-0",
        "[transition:box-shadow_var(--duration-slow)_var(--ease-out),scale_var(--duration-fast)_var(--ease-out-quart)] [.selectable>&]:hover:shadow-card-hover motion-safe:[.selectable>&]:active:scale-(--scale-press)",
        "[.selected:not(:focus-visible)>&]:outline-[1.5px] [.selected:not(:focus-visible)>&]:outline-offset-2 [.selected:not(:focus-visible)>&]:outline-primary",
        "[:focus-visible>&]:outline-2 [:focus-visible>&]:outline-offset-2 [:focus-visible>&]:outline-ring",
        className,
      )}
      {...props}
    >
      {target ? <FlowNodeHandle type="target" {...target} /> : null}
      {children}
      {source ? <FlowNodeHandle type="source" {...source} /> : null}
      {extra ? <FlowNodeHandle type="source" id={handles.extraSource?.id} {...extra} /> : null}
    </div>
  );
}

// A point, not a dot: no size, no border, no fill, so React Flow reads the
// card's own edge as the line's end. Not a control: it takes no pointer and
// no focus.
function FlowNodeHandle({ className, ...props }: React.ComponentProps<typeof Handle>) {
  return (
    <Handle
      data-slot="flow-node-handle"
      isConnectable={false}
      className={cn("size-0 min-h-0 min-w-0 border-0 bg-transparent", className)}
      {...props}
    />
  );
}

// The header is a three-column grid, `media | text | action`, with the two
// outer columns `auto`: when a node has no media or no action its column
// collapses to nothing, and because the spacing is a margin on the part rather
// than a grid gap, no empty gutter is left behind.
function FlowNodeHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="flow-node-header"
      className={cn("grid grid-cols-[auto_minmax(0,1fr)_auto] items-center px-(--node-spacing)", className)}
      {...props}
    />
  );
}

/** The avatar or icon tile at the head of the node; spans both text rows. */
function FlowNodeMedia({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="flow-node-media"
      className={cn("col-start-1 row-span-2 row-start-1 mr-2.5 flex shrink-0 items-center", className)}
      {...props}
    />
  );
}

function FlowNodeTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="flow-node-title"
      className={cn("col-start-2 row-start-1 truncate font-heading font-semibold text-sm", className)}
      {...props}
    />
  );
}

function FlowNodeDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="flow-node-description"
      className={cn("col-start-2 row-start-2 truncate text-md text-muted-foreground", className)}
      {...props}
    />
  );
}

/** A badge, count or menu at the right of the header; spans both text rows. */
function FlowNodeAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="flow-node-action"
      className={cn("col-start-3 row-span-2 row-start-1 ml-2 flex items-center", className)}
      {...props}
    />
  );
}

function FlowNodeContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="flow-node-content"
      className={cn("px-(--node-spacing) text-md text-muted-foreground", className)}
      {...props}
    />
  );
}

// The card footer's tray (border-t, surface-secondary), one step tighter:
// a meta line, scanned rather than read, so tier-3 text.
function FlowNodeFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="flow-node-footer"
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-b-2xl border-border-subtle border-t bg-surface-secondary px-(--node-spacing) py-2 text-foreground-low text-xs",
        className,
      )}
      {...props}
    />
  );
}

// ===== EDGES ================================================================

// Three looks, one path: `static` is the "reports to" hairline, `animated`
// is live delegation (dashes travelling source → target, motion-safe only; the
// keyframes are in flow.css), `temporary` is the same dash standing still
// (queued, planned, paused). All three draw a rounded step by default (an org
// chart's bus: siblings share one trunk under their parent), a bezier with
// `data.curve: "bezier"`, or an elbow with `data.curve: "elbow"`: one
// rounded right angle, straight out of the source's side and straight into
// the target (Linear's delegate line, from a bottom handle into a report
// stacked below and to the right).
//
// Colour is a tone, not a hex: `neutral` is the hairline, `strong` the tier-3
// text colour (what the live dash draws in by default: visibly a different
// line from the hairline, in no hue), the rest are the status tokens. Stroke
// goes inline because React Flow paints the path through its own class;
// inline wins, and the tone then flips with the theme like any token.
//
// A live edge usually shares its parent's trunk with static siblings. Give it
// `zIndex: 1` (or list it last) so its dashes draw OVER the hairline, not
// under it.

type FlowEdgeTone = "neutral" | "strong" | "success" | "warning" | "destructive";

type FlowEdgeData = {
  /** "step" (default): rounded right angles. "bezier": one smooth curve.
   *  "elbow": one rounded corner between the source's side and the target's. */
  curve?: "step" | "bezier" | "elbow";
  tone?: FlowEdgeTone;
};

type FlowEdgeType = "static" | "animated" | "temporary";

/** An edge for `FlowCanvas`: `type` picks the look, `data` the curve and tone. */
type FlowEdge = Edge<FlowEdgeData, FlowEdgeType>;

const EDGE_TONES: Record<FlowEdgeTone, string> = {
  neutral: "var(--flow-edge)",
  strong: "var(--foreground-low)",
  success: "var(--success)",
  warning: "var(--warning)",
  destructive: "var(--destructive)",
};

/** Dashes for the live and temporary edges: 4 on, 4 off (flow.css moves the
 *  live one by one period, 8px, per cycle). */
const EDGE_DASH = "4 4";

/** The step's corners and the elbow's one corner. */
const EDGE_RADIUS = { step: 10, elbow: 8 } as const;

/**
 * The elbow: out of the source along its side's normal to the target's line,
 * one quadratic corner (React Flow's own step corners are the same curve),
 * then straight into the target. The radius shrinks to fit a short leg, so a
 * target straight across or straight below draws a plain line.
 */
function elbowPath({ sourceX, sourceY, sourcePosition, targetX, targetY }: EdgeProps<FlowEdge>): string {
  const verticalFirst = sourcePosition === Position.Top || sourcePosition === Position.Bottom;
  const cornerX = verticalFirst ? sourceX : targetX;
  const cornerY = verticalFirst ? targetY : sourceY;
  const r = Math.min(EDGE_RADIUS.elbow, Math.abs(targetX - sourceX), Math.abs(targetY - sourceY));
  const dx = Math.sign(targetX - sourceX);
  const dy = Math.sign(targetY - sourceY);
  const [inX, inY, outX, outY] = verticalFirst
    ? [cornerX, cornerY - r * dy, cornerX + r * dx, cornerY]
    : [cornerX - r * dx, cornerY, cornerX, cornerY + r * dy];
  return `M${sourceX},${sourceY} L${inX},${inY} Q${cornerX},${cornerY} ${outX},${outY} L${targetX},${targetY}`;
}

function flowEdgePath(props: EdgeProps<FlowEdge>): string {
  const { sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, data } = props;
  if (data?.curve === "elbow") return elbowPath(props);
  const ends = { sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition };
  const [path] =
    data?.curve === "bezier" ? getBezierPath(ends) : getSmoothStepPath({ ...ends, borderRadius: EDGE_RADIUS.step });
  return path;
}

function FlowEdgeStatic(props: EdgeProps<FlowEdge>) {
  const { id, data, style, markerStart, markerEnd } = props;
  return (
    <BaseEdge
      id={id}
      data-slot="flow-edge"
      data-variant="static"
      path={flowEdgePath(props)}
      markerStart={markerStart}
      markerEnd={markerEnd}
      interactionWidth={0}
      style={{ stroke: EDGE_TONES[data?.tone ?? "neutral"], strokeWidth: 1, ...style }}
    />
  );
}

function FlowEdgeAnimated(props: EdgeProps<FlowEdge>) {
  const { id, data, style, markerStart, markerEnd } = props;
  return (
    <BaseEdge
      id={id}
      data-slot="flow-edge"
      data-variant="animated"
      path={flowEdgePath(props)}
      markerStart={markerStart}
      markerEnd={markerEnd}
      interactionWidth={0}
      style={{ stroke: EDGE_TONES[data?.tone ?? "strong"], strokeWidth: 1, strokeDasharray: EDGE_DASH, ...style }}
    />
  );
}

function FlowEdgeTemporary(props: EdgeProps<FlowEdge>) {
  const { id, data, style, markerStart, markerEnd } = props;
  return (
    <BaseEdge
      id={id}
      data-slot="flow-edge"
      data-variant="temporary"
      path={flowEdgePath(props)}
      markerStart={markerStart}
      markerEnd={markerEnd}
      interactionWidth={0}
      style={{ stroke: EDGE_TONES[data?.tone ?? "neutral"], strokeWidth: 1, strokeDasharray: EDGE_DASH, ...style }}
    />
  );
}

/** FlowCanvas registers these and makes `static` the default edge type. */
const flowEdgeTypes = {
  static: FlowEdgeStatic,
  animated: FlowEdgeAnimated,
  temporary: FlowEdgeTemporary,
} satisfies EdgeTypes;

// ===== PANEL, CONTROLS, TOOLBAR =============================================

// A positioned overlay on the canvas (React Flow's Panel). `card` is the
// node's own surface, `bare` only positions. The 12px inset replaces React
// Flow's 15px, which a class can now override (see flow.css).
const flowPanelVariants = cva("m-3", {
  variants: {
    variant: {
      card: "rounded-2xl bg-surface-elevated p-1.5 shadow-card",
      bare: "",
    },
  },
  defaultVariants: {
    variant: "card",
  },
});

function FlowPanel({
  className,
  variant = "card",
  ...props
}: React.ComponentProps<typeof Panel> & VariantProps<typeof flowPanelVariants>) {
  return (
    <Panel
      data-slot="flow-panel"
      data-variant={variant}
      className={cn(flowPanelVariants({ variant }), className)}
      {...props}
    />
  );
}

// Zoom moves are 220ms, the brand's --duration-move (a position change), and
// jump instead when the reader prefers reduced motion. Read at click time, so
// there is no media-query state to hydrate.
const ZOOM_DURATION_MS = 220;

function zoomDuration(): number {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : ZOOM_DURATION_MS;
}

/** The side a control's tooltip opens on: away from the canvas edge it sits on. */
function tooltipSide(position: PanelPosition, orientation: "vertical" | "horizontal") {
  if (orientation === "horizontal") return position.startsWith("top") ? "bottom" : "top";
  return position.endsWith("left") ? "right" : "left";
}

function FlowControl({
  label,
  side,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { label: string; side: "top" | "right" | "bottom" | "left" }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={label} {...props}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side={side}>{label}</TooltipContent>
    </Tooltip>
  );
}

/**
 * Zoom in, zoom out and fit, on the Button primitive: a pill of ghost icon
 * buttons, each with a tooltip and an aria-label. Render inside FlowCanvas.
 */
function FlowControls({
  className,
  position = "bottom-right",
  orientation = "vertical",
  fitViewOptions = FIT_VIEW_OPTIONS,
  ...props
}: Omit<React.ComponentProps<typeof Panel>, "children"> & {
  orientation?: "vertical" | "horizontal";
  /** What "Fit to view" frames; pass the canvas's own `fitViewOptions` when it sets them. */
  fitViewOptions?: FitViewOptions;
}) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const atMaxZoom = useStore((state) => state.transform[2] >= state.maxZoom);
  const atMinZoom = useStore((state) => state.transform[2] <= state.minZoom);
  const side = tooltipSide(position, orientation);

  return (
    <Panel
      data-slot="flow-controls"
      data-orientation={orientation}
      role="group"
      aria-label="Zoom"
      position={position}
      className={cn(
        "m-3 flex items-center gap-0.5 rounded-full bg-surface-elevated p-1 shadow-card",
        orientation === "vertical" ? "flex-col" : "flex-row",
        className,
      )}
      {...props}
    >
      <FlowControl label="Zoom in" side={side} disabled={atMaxZoom} onClick={() => zoomIn({ duration: zoomDuration() })}>
        <IconPlus aria-hidden="true" />
      </FlowControl>
      <FlowControl label="Zoom out" side={side} disabled={atMinZoom} onClick={() => zoomOut({ duration: zoomDuration() })}>
        <IconMinus aria-hidden="true" />
      </FlowControl>
      <Separator
        orientation={orientation === "vertical" ? "horizontal" : "vertical"}
        className="data-horizontal:my-0.5 data-horizontal:w-4 data-vertical:mx-0.5 data-vertical:h-4 data-vertical:self-center"
      />
      <FlowControl
        label="Fit to view"
        side={side}
        onClick={() => fitView({ ...fitViewOptions, duration: zoomDuration() })}
      >
        <IconFocusCentered aria-hidden="true" />
      </FlowControl>
    </Panel>
  );
}

/**
 * A floating bar tied to a node (React Flow's NodeToolbar): shown while its
 * node is selected, drawn at screen scale whatever the zoom. Render inside a
 * custom node component.
 */
function FlowToolbar({ className, ...props }: React.ComponentProps<typeof NodeToolbar>) {
  return (
    <NodeToolbar
      data-slot="flow-toolbar"
      className={cn("flex items-center gap-0.5 rounded-full bg-surface-elevated p-1 shadow-md", className)}
      {...props}
    />
  );
}

// ===== RE-EXPORTS ===========================================================

// Everything a view needs from React Flow, so no other file imports it.
export {
  Handle,
  Position,
  ReactFlowProvider as FlowProvider,
  useEdgesState,
  useNodesInitialized,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
export type { Edge, EdgeProps, EdgeTypes, FitViewOptions, Node, NodeProps, NodeTypes } from "@xyflow/react";

export {
  FlowCanvas,
  FlowControls,
  FlowEdgeAnimated,
  FlowEdgeStatic,
  FlowEdgeTemporary,
  flowEdgeTypes,
  FlowNode,
  FlowNodeAction,
  FlowNodeContent,
  FlowNodeDescription,
  FlowNodeFooter,
  FlowNodeHeader,
  FlowNodeMedia,
  FlowNodeTitle,
  FlowPanel,
  FlowToolbar,
};
export type {
  FlowCanvasProps,
  FlowEdge,
  FlowEdgeData,
  FlowEdgeTone,
  FlowEdgeType,
  FlowHandleAt,
  FlowHandleSide,
  FlowNodeHandles,
};
