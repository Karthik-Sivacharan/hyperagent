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
  type ColorMode,
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
import { useTheme } from "next-themes";

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
// and dark follow next-themes' `.dark` on <html>).
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

const subscribeNever = () => () => {};

/** React Flow's colour mode, following next-themes. "light" until mounted, so
 *  the server markup and the first client render agree. */
function useFlowColorMode(): ColorMode {
  const { resolvedTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  return mounted && resolvedTheme === "dark" ? "dark" : "light";
}

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
  const colorMode = useFlowColorMode();

  return (
    <ReactFlow<N, E>
      data-slot="flow-canvas"
      className={cn("bg-surface-secondary", className)}
      colorMode={colorMode}
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
// so nothing has to thread `selected` through by hand.
//
// Selected is an ink outline and keyboard focus the brand's tangerine one,
// never both at once (`:not(:focus-visible)`), and neither transitions:
// selection answers a click and has to land with it. The hover lift is the
// card's own (`shadow-card-hover`, 300ms ease-out), only on selectable nodes.
//
// No `overflow-hidden` on the root, because the handles sit half outside it;
// the footer rounds its own bottom corners instead.

type FlowNodeHandles = { target?: boolean; source?: boolean };

const HANDLE_POSITIONS = {
  TB: { target: Position.Top, source: Position.Bottom },
  LR: { target: Position.Left, source: Position.Right },
} as const;

function FlowNode({
  className,
  handles = { target: true, source: true },
  direction = "TB",
  children,
  ...props
}: React.ComponentProps<"div"> & {
  /** Which connection points to render: `target` where edges arrive, `source`
   *  where they leave. A node with no handle on a side cannot be connected on
   *  that side (React Flow drops the edge and warns). */
  handles?: FlowNodeHandles;
  /** "TB": edges arrive on top and leave from the bottom (an org chart).
   *  "LR": left to right (a pipeline). */
  direction?: "TB" | "LR";
}) {
  const positions = HANDLE_POSITIONS[direction];

  return (
    <div
      data-slot="flow-node"
      data-direction={direction}
      className={cn(
        "relative flex w-60 flex-col gap-(--node-spacing) rounded-2xl bg-surface-elevated py-(--node-spacing) text-foreground shadow-card [--node-spacing:--spacing(3)] has-data-[slot=flow-node-footer]:pb-0",
        "transition-[box-shadow] duration-(--duration-slow) ease-out [.selectable>&]:hover:shadow-card-hover",
        "[.selected:not(:focus-visible)>&]:outline-[1.5px] [.selected:not(:focus-visible)>&]:outline-offset-2 [.selected:not(:focus-visible)>&]:outline-primary",
        "[:focus-visible>&]:outline-2 [:focus-visible>&]:outline-offset-2 [:focus-visible>&]:outline-ring",
        className,
      )}
      {...props}
    >
      {handles.target ? <FlowNodeHandle type="target" position={positions.target} /> : null}
      {children}
      {handles.source ? <FlowNodeHandle type="source" position={positions.source} /> : null}
    </div>
  );
}

// A 6px dot in the edge colour, centred on the card's edge, so a line lands on
// something rather than stopping at a hairline. Not a control: the canvas is
// not connectable, so it takes no pointer and no focus.
function FlowNodeHandle({ className, ...props }: React.ComponentProps<typeof Handle>) {
  return (
    <Handle
      data-slot="flow-node-handle"
      isConnectable={false}
      className={cn("size-1.5 min-h-0 min-w-0 rounded-full border-0 bg-(--flow-edge)", className)}
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
// chart's elbows; siblings share one bus under their parent) or a bezier with
// `data.curve: "bezier"`.
//
// Colour is a tone, not a hex: `neutral` is the hairline, the rest are the
// status tokens. The live edge defaults to `info`; pass the tone your
// "working" status uses so edge and badge agree. Stroke goes inline because
// React Flow paints the path through its own class; inline wins, and the tone
// then flips with the theme like any token.
//
// A live edge usually shares its parent's trunk with static siblings. Give it
// `zIndex: 1` (or list it last) so its dashes draw OVER the hairline, not
// under it.

type FlowEdgeTone = "neutral" | "info" | "success" | "warning" | "destructive";

type FlowEdgeData = {
  /** "step" (default): rounded right angles. "bezier": one smooth curve. */
  curve?: "step" | "bezier";
  tone?: FlowEdgeTone;
};

type FlowEdgeType = "static" | "animated" | "temporary";

/** An edge for `FlowCanvas`: `type` picks the look, `data` the curve and tone. */
type FlowEdge = Edge<FlowEdgeData, FlowEdgeType>;

const EDGE_TONES: Record<FlowEdgeTone, string> = {
  neutral: "var(--flow-edge)",
  info: "var(--info)",
  success: "var(--success)",
  warning: "var(--warning)",
  destructive: "var(--destructive)",
};

function flowEdgePath({
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  data,
}: EdgeProps<FlowEdge>): string {
  const ends = { sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition };
  const [path] = data?.curve === "bezier" ? getBezierPath(ends) : getSmoothStepPath({ ...ends, borderRadius: 10 });
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
      style={{ stroke: EDGE_TONES[data?.tone ?? "info"], strokeWidth: 1.5, strokeDasharray: "5 5", ...style }}
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
      style={{ stroke: EDGE_TONES[data?.tone ?? "neutral"], strokeWidth: 1, strokeDasharray: "5 5", ...style }}
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
  ...props
}: Omit<React.ComponentProps<typeof Panel>, "children"> & { orientation?: "vertical" | "horizontal" }) {
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
        onClick={() => fitView({ ...FIT_VIEW_OPTIONS, duration: zoomDuration() })}
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
export type { Edge, EdgeProps, EdgeTypes, Node, NodeProps, NodeTypes } from "@xyflow/react";

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
export type { FlowCanvasProps, FlowEdge, FlowEdgeData, FlowEdgeTone, FlowEdgeType };
