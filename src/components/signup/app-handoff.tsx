"use client";

import { AgentPanel } from "@/components/agent-panel/agent-panel";
import { Sidebar } from "@/components/app/sidebar";
import { ThreadHeader } from "@/components/thread/thread-header";
import type { Thread } from "@/lib/mock/threads";
import { cn } from "@/lib/utils";

// The fifth beat: the app arrives around the conversation that is already
// happening, rather than replacing it.
//
// THE IDEA. By the fourth screen the flow is already thread-shaped — a mark
// that speaks, a sentence, cards, a composer at the product's own 752px
// measure. Nothing about it needs to become a chat window, because it is one.
// What is missing is the building it sits in. So the handoff does not navigate
// and does not re-render the conversation: the sidebar slides in from the left,
// the glass and its noise come up under everything, the thread bar fades in
// overhead, and the column steps right to make room. The composer you were
// typing in is the same DOM node before and after.
//
// WHY THE MARK NEEDS NO FIFTH SEAT, which is the load-bearing part. The mark is
// absolutely positioned INSIDE the stage and parked by a transform measured
// against the stage's own box (signup-screen.tsx). Moving the stage therefore
// moves the mark with it, for free, with no re-measure and no second animation
// to keep in step — the seat is stage-relative and the stage's internals do not
// change. That is the whole reason the column shifts by padding on the element
// ABOVE the stage rather than by transforming the stage itself: a transform on
// the stage would be composited under the mark's own transform and the two
// would fight. `ResizeObserver` never fires here either, and does not need to:
// the stage keeps its width and only its position changes.
//
// The sidebar carries its own 20px mark, and that is correct rather than a
// missed trick. The flow's mark is the thing that has been talking for four
// screens; the sidebar's is a nav logo that goes to /threads/new. Flying one
// into the other would say they are the same object, and then the thing that
// was speaking to you would have quietly become a button.
//
// DOCKED AND FLOATING. The panel is a third column while there is room for it
// and a readable conversation both (use-shell-fit.ts does that arithmetic).
// Below that it stops being a column and becomes a drawer: same element, same
// state, same slide, but lifted above the conversation on `shadow-lg` and
// inset under the thread bar, so the conversation keeps its full width and
// simply has something lying over its right-hand end. Two layers rather than
// one, because the layer that holds the glass and the sidebar sits BELOW the
// column (z-0) and a stacking context cannot let one of its children out — so
// the panel needs a layer of its own whose z-index can move.

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")";

/**
 * The sidebar's resting width, used until the live column reports its own on
 * mount. Matches SIDEBAR_WIDTH in src/components/app/sidebar.tsx; it is a
 * starting value now rather than the truth, because the column is collapsible
 * and drag-resizable and reports what it actually is.
 */
export const HANDOFF_SIDEBAR_PX = 256;

/**
 * The thread bar's height (`h-12` in thread-header.tsx).
 *
 * A floating panel is inset by exactly this from the top, which is what keeps
 * the toggle that opened it visible and clickable at the bar's right end. A
 * drawer that covers its own control is a trap for anyone not reaching for
 * Escape, and the bar is the frame rather than the conversation, so sliding
 * under it costs the reader nothing.
 */
const THREAD_BAR_PX = 48;

// The thread this conversation becomes. Titled from the flow rather than from
// the mock list, because the one thing the reader has actually done by now is
// pick an agent, and a bar that opened saying "Welcome to Hyperagent" would be
// the app forgetting the last ninety seconds.
const HANDOFF_THREAD: Thread = {
  id: "signup-handoff",
  title: "Setting up your first agent",
  summary: "",
  updatedLabel: "just now",
  updatedShortLabel: "now",
  updatedAt: new Date(0).toISOString(),
  messageCount: 1,
  starred: false,
  model: "Opus 5",
};

// Travel and fade both ride --duration-slide on --ease-in-out, the pairing the
// mark's own flight settled on (signup-screen.tsx): measured mid-flight, a
// quint-out had the moving part 94% of the way there while the thing behind it
// was still half-opaque, which reads as a flick and then a drift. Everything
// that moves in this beat moves on the same curve so the shell arrives as one
// object rather than as four.
const TRAVEL = "duration-(--duration-slide) ease-in-out motion-reduce:transition-none";

export function AppHandoff({
  entered,
  docked,
  panelOpen,
  panelId,
  panelMax,
  railSidebar,
  onTogglePanel,
  onPanelWidthChange,
  onSidebarWidthChange,
  onSidebarExpandedWidthChange,
}: {
  entered: boolean;
  /** True while the panel is a third column rather than a drawer over one. */
  docked: boolean;
  panelOpen: boolean;
  /** Handed down so the bar's toggle can name the panel in `aria-controls`. */
  panelId: string;
  /** A ceiling, not a width — see `AgentPanel.maxWidth`. */
  panelMax?: number;
  /**
   * The last step of the yield order: hold the sidebar at its rail because an
   * open column and a readable conversation no longer fit. A constraint, not a
   * value — see `Sidebar.forceCollapsed`.
   */
  railSidebar: boolean;
  onTogglePanel: () => void;
  /** The panel is drag-resizable, and the column's padding has to follow it. */
  onPanelWidthChange?: (width: number) => void;
  /** So is the sidebar, and so does the column's other edge. */
  onSidebarWidthChange?: (width: number) => void;
  /** And the width it would take unrailed, which is what decides the rail. */
  onSidebarExpandedWidthChange?: (width: number) => void;
}) {
  // The panel is on screen only when the shell has arrived AND the toggle says
  // so. Written once because five things read it: the slide, the shadow, the
  // pointer events, `inert` and the accessibility tree.
  const panelShown = entered && panelOpen;
  return (
    <>
      {/* Layer one: behind the column, never over it. The conversation stays the
          subject and the building assembles around it. `fixed` rather than
          absolute so the sidebar is full-height regardless of how tall the
          centred column is, and `inert` while away so none of the sidebar's ~40
          controls are reachable by keyboard from the signup screens. */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden={!entered}
        inert={!entered}
      >
        {/* The canvas the app sits on, under everything including the sidebar —
            the same two layers AppShell paints, at the same values. */}
        <div
          className={cn(
            "absolute inset-0 bg-glass-gradient transition-opacity",
            TRAVEL,
            entered ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn("absolute inset-0 mix-blend-overlay transition-opacity", TRAVEL, entered ? "opacity-[0.015]" : "opacity-0")}
          style={{ backgroundImage: NOISE }}
        />

        {/* The thread bar, inset by the sidebar so it spans the column's half of
            the window exactly as it does in the app. It fades without moving:
            a bar that also slid down would be a second direction of travel in a
            beat that already has one, and horizontal is the one that matters.

            Both insets are the live figures the screen above computes, and the
            right one is the SAME figure <main> pads by — the docked panel's
            width, zero when the panel is closed or floating. So a floating panel
            lies over the bar's right end rather than shortening it, and the
            padding transition runs on the same duration and curve as <main>'s so
            the bar and the column below it move as one edge.

            `pointer-events-auto` because the layer above turns them off
            wholesale and this bar now holds a control that does something. The
            whole bar is re-armed rather than the one button: it is the app's own
            thread bar, and half a live bar would be stranger than all of it. It
            cannot steal from the conversation — the stage paints and hit-tests
            above this layer. */}
        <div
          className={cn(
            "absolute inset-x-0 top-0 hidden transition-[opacity,padding] md:block",
            TRAVEL,
            entered ? "opacity-100" : "opacity-0",
            entered && "pointer-events-auto",
          )}
          style={{
            paddingLeft: `var(--handoff-sidebar-w, ${HANDOFF_SIDEBAR_PX}px)`,
            paddingRight: "var(--handoff-panel-w, 0px)",
          }}
        >
          <ThreadHeader
            thread={HANDOFF_THREAD}
            model={HANDOFF_THREAD.model}
            panelOpen={panelOpen}
            onTogglePanel={onTogglePanel}
            panelId={panelId}
          />
        </div>

        {/* The sidebar itself. Transform, not width or margin: it is 256px of
            fairly heavy DOM and animating a layout property would relayout the
            whole column — including the stage the mark is parked against — on
            every frame of the slide. `pointer-events-auto` is re-armed here
            because the layer above turns them off wholesale. */}
        {/* `md:flex`, not `md:block`. The sidebar's whole internal column is
            built on `h-full`, which resolves against a parent with a definite
            height — in AppShell that parent is a `size-full` flex row and the
            sidebar is a stretched flex item. Dropped into a plain block it
            measures 0 and renders an invisible 256px of nothing, which is
            exactly what it did here first. */}
        <div
          className={cn(
            "absolute inset-y-0 left-0 hidden transition-transform md:flex",
            TRAVEL,
            entered ? "translate-x-0" : "-translate-x-full",
            entered && "pointer-events-auto",
          )}
        >
          <Sidebar
            forceCollapsed={railSidebar}
            onWidthChange={onSidebarWidthChange}
            onExpandedWidthChange={onSidebarExpandedWidthChange}
          />
        </div>
      </div>

      {/* Layer two: the configuration panel, on its own so its z-index can move.
          It arrives on the opposite side in the same beat as the sidebar,
          because two columns sliding in from two edges is one gesture — the room
          assembling — where staggering them would read as two events and make
          the second one feel like a consequence of the first.

          DOCKED it sits at z-0, behind the column exactly as layer one does, and
          <main> pads the conversation out of its way. FLOATING it lifts to z-20,
          above the column, and pays for the overlap with `shadow-lg` and the
          thread bar's height of top inset; the conversation underneath keeps its
          full width and is simply partly covered. The z-index has to live on
          this wrapper rather than on the panel because layer one's own `z-0`
          makes it a stacking context, and nothing inside a stacking context can
          paint above something outside it however large its z-index.

          `md:flex` for the same reason the sidebar needs it: the panel's body is
          a `h-full` scroller and a plain block parent gives it nothing to
          resolve against. It reports its width upward so the column beside it
          can keep its padding in step while the splitter is dragged. */}
      <div
        className={cn(
          "pointer-events-none fixed inset-0 overflow-hidden",
          docked ? "z-0" : "z-20",
        )}
        aria-hidden={!panelShown}
        inert={!panelShown}
      >
        <div
          className={cn(
            "absolute bottom-0 right-0 hidden transition-[transform,box-shadow] md:flex",
            TRAVEL,
            panelShown ? "translate-x-0" : "translate-x-full",
            panelShown && "pointer-events-auto",
            // The drawer's elevation, and only while it is actually over
            // something: a shadow on a panel parked off the right edge would
            // smudge the viewport's edge for the whole slide out.
            !docked && panelShown && "shadow-lg",
          )}
          style={{ top: docked ? 0 : THREAD_BAR_PX }}
        >
          <AgentPanel id={panelId} maxWidth={panelMax} onWidthChange={onPanelWidthChange} />
        </div>
      </div>
    </>
  );
}
