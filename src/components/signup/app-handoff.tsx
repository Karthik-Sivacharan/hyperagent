"use client";

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

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")";

/** Matches SIDEBAR_WIDTH in src/components/app/sidebar.tsx. */
export const HANDOFF_SIDEBAR_PX = 256;

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

export function AppHandoff({ entered }: { entered: boolean }) {
  return (
    // Behind the column, never over it: the conversation stays the subject and
    // the building assembles around it. `fixed` rather than absolute so the
    // sidebar is full-height regardless of how tall the centred column is, and
    // `inert` while away so none of the sidebar's ~40 controls are reachable by
    // keyboard from the signup screens.
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
          beat that already has one, and horizontal is the one that matters. */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 hidden transition-opacity md:block",
          TRAVEL,
          entered ? "opacity-100" : "opacity-0",
        )}
        style={{ paddingLeft: HANDOFF_SIDEBAR_PX }}
      >
        <ThreadHeader thread={HANDOFF_THREAD} model={HANDOFF_THREAD.model} />
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
        <Sidebar />
      </div>
    </div>
  );
}
