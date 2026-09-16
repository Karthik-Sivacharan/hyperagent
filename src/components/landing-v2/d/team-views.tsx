"use client";

import dynamic from "next/dynamic";
import { useState, type ReactNode } from "react";
import { MotionConfig } from "motion/react";
import {
  IconBuilding,
  IconLayoutKanban,
  IconList,
  IconSitemap,
  type TablerIcon,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { BoardView } from "@/components/teams/board-view";
import { FleetProvider } from "@/components/teams/fleet/fleet-context";
import { ListView } from "@/components/teams/list-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { SectionHeading } from "../a/section";
import {
  SHOWCASE_TEAM,
  SHOWCASE_WEEK,
  TEAM_VIEWS,
  type TeamViewId,
} from "./team-views-content";

// The views band: the same week of work, seen four ways, in one panel that
// never changes size. The pictures are not drawings of the product, they are
// the product: `BoardView`, `ListView`, `OrgView` and `SpaceView` are the
// four views /teams ships, reading the same store through `FleetProvider`.
// Nothing here is a second implementation that can drift from the app.
//
// THE PANEL IS A PICTURE, THOUGH. The view area is `inert` and
// `pointer-events-none`, and the only live control in the band is the tab
// row over it. That is the same line the roster band holds two screens above
// ("nothing here is clickable") and the same one the format showcase holds
// with its `role="img"` panel, and on this band it also closes three doors a
// marketing page should not leave open:
//
//   - a run card or a node opens the agent sheet, which portals over the
//     whole document from a band in the middle of a landing page;
//   - the org chart pans on two-finger scroll, so a reader scrolling the
//     page over it would move the chart instead of the page;
//   - the office is draggable, and a drag that starts on a picture and ends
//     on the page is a gesture nobody asked this band for.
//
// The office keeps its own life regardless, and more of it than the other
// three: the agents at their desks go on typing and reading, the bubbles come
// and go, and a few of them are always up and walking somewhere. That motion
// is the scene's own. It runs whether or not anyone is looking, it answers to
// nothing the reader did, and it is not the page moving because they
// scrolled.
//
// THREE PROPS EXIST FOR THIS BAND, all defaulting to what /teams already did.
// `SpaceView walkWhenIdle={false}` keeps the office from taking the arrow keys
// off the document (it listens on `window` and calls preventDefault, so with
// the office on the page the arrow keys would stop scrolling it). `OrgView
// controls={false}` drops the zoom pad, which would otherwise draw three
// buttons that cannot be pressed. And `SpaceView wander` is what is left of
// the office once the keyboard and the pointer are gone: characters get up,
// walk a few tiles and go back to their chairs, so the floor moves on its own
// (teams/space/scene/use-wander.ts). It turns itself off under reduced
// motion.
//
// LOADED WHEN ASKED FOR. The board and the list are the light two and the
// board is what the band paints first, so both are imported outright. The
// org chart brings React Flow and the office brings 300KB of sprite sheets
// and an animation loop; a reader who never opens those tabs should never
// pay for them, so they arrive as their own chunks on the first click.
const OrgView = dynamic(
  () => import("@/components/teams/org-view").then((m) => m.OrgView),
  { ssr: false },
);
const SpaceView = dynamic(
  () => import("@/components/teams/space-view").then((m) => m.SpaceView),
  { ssr: false },
);

// One glyph per view, the same four the app's own view switch wears
// (teams/fleet/fleet-toolbar.tsx), so a reader who signs up meets the
// control again where it does the real job.
const VIEW_ICONS: Record<TeamViewId, TablerIcon> = {
  board: IconLayoutKanban,
  list: IconList,
  org: IconSitemap,
  office: IconBuilding,
};

// The office draws its map at the largest WHOLE scale that fits the box it is
// given, so the box is set rather than fitted: 36x22 tiles of 16px at 2x is
// exactly this, and a box one pixel short of it would fall back to 1x and
// draw a 576px island in the middle of the panel. The panel is never that
// big, so what the reader gets is a window onto the floor with the walls
// running off the edges, which is the right picture anyway: an office is
// bigger than the frame you look at it through.
//
// WHERE THE WINDOW SITS is a breakpoint, not a nicety. Centred, it lands on
// the corridor and Atlas's office, which is the emptiest part of the floor;
// that is fine at 1136px wide, where every room is in frame around it, and
// useless at 342, where it is the only thing in frame. So under `md` the
// window goes to the top right corner instead, which is Outbound: three
// characters at their desks, one of them waiting on a person.
const OFFICE_STAGE = "h-[704px] w-[1152px]";
const OFFICE_ALIGN = "items-start justify-end md:items-center md:justify-center";

// The height every view shares. It is fixed so the page under the panel does
// not move when a tab changes, which is the same promise the format
// showcase's `md:h-104` makes six bands above.
//
// 576 at `lg` is what the other three views want and what the office can
// live with. The board's deepest lane is four cards and a header, about 520.
// The org chart's tree is 376 tall and fits itself with 48px of padding, so
// 576 leaves it a little air rather than pressing on it. And the office, at
// 704, loses 64px off the top and 64 off the bottom, which is the outer wall
// and the far edge of the desks, and not a single name tag.
const PANEL = "h-[27rem] md:h-[32rem] lg:h-[36rem]";

// WHERE THE WEEK RUNS OFF THE FRAME. The board and the list scroll inside
// themselves on /teams, and here they cannot, because the panel is a picture.
// A row or a card sliced in half across a hard edge reads as a bug; the same
// one under a fade reads as what it is, a week that carries on past the
// frame. So both edges that can cut something are faded into the panel's own
// ground, which is the seam the brief and team cards already lay over their
// gradients (`../a/brief-cards.tsx`).
//
// Both are unconditional, which is measured rather than assumed. The list is
// longer than the panel at every width. The board's five lanes want 1193px at
// their narrowest (four at the 240px minimum, the folded Done, the gaps and
// the 24px gutters) and the panel stops growing at 1136, because the page's
// own `max-w-6xl` stops at 1152 and the tray takes 8 off each side. So the
// board runs 57px past the frame on the widest screen there is, and further
// on every smaller one: 233 at 1024, 489 at 768, 851 on a phone.
const FADE_BOTTOM =
  "absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-background to-transparent";
const FADE_RIGHT =
  "absolute inset-y-0 right-0 w-12 bg-linear-to-l from-background to-transparent";

// THE TWO FIXED STAGES. The org chart and the office are both a drawing at a
// size of its own, and both used to be handed the panel and told to cope. That
// works for neither, for opposite reasons, and the answer is the same for
// both: give each one the box it was drawn for and let the panel be a WINDOW
// onto it, with the edges faded so what the window cuts reads as continuing
// rather than as broken.
//
// The chart is the one that was wrong and looked fine. React Flow fits the
// 1088px tree to whatever it is given and will not shrink past 0.3, so on a
// 342px phone panel it drew the whole chart at 0.3: 3.9px role labels, and
// 76% of the panel left white around a 105px island. It was a picture of an
// org chart in the sense that a photograph of a page of text is a picture of
// a book. At 1136 it draws at 0.89 to 0.96 instead, which is 12px type, and
// the phone sees the top of the tree at a size it can read.
//
// 1136 is the panel's own widest, so this changes nothing from 1200 up, where
// the panel already was 1136: same chart, same zoom, no crop. Everything
// narrower now crops instead of shrinking.
const ORG_STAGE = "h-full w-[1136px]";

// The fades those two windows carry, on both edges, at every width. The office
// needed them for a plainer reason than the chart: a room's nameplate or a
// character's name tag that lands on the edge is cut mid-word, and now that
// the floor wanders (`teams/space/scene/use-wander.ts`) the tags move, so
// there is no arrangement of the crop that keeps them clear.
// 48px where something is actually cut, 32 from `xl`, where the panel is its
// full 1136 and the 1040px tree sits inside it with 48px of margin each side:
// there the fade lands entirely on empty ground and the chart is untouched.
const FADE_SIDE = "absolute inset-y-0 w-12 from-background to-transparent xl:w-8";

export function TeamViews() {
  const { id, heading, tabsLabel, views } = TEAM_VIEWS;
  const [value, setValue] = useState<TeamViewId>(views[0].id);
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="scroll-mt-16 px-4 py-24 sm:px-6 md:py-40"
    >
      <div className="mx-auto flex max-w-6xl flex-col">
        <SectionHeading
          id={headingId}
          heading={heading}
          cut="display"
          className="max-w-4xl"
        />

        <Tabs
          value={value}
          onValueChange={(next) => setValue(next as TeamViewId)}
          className="mt-16 w-full gap-6 md:mt-20 md:gap-8"
        >
          {/* The tab row the roster and the format showcase already draw,
              down to the phone scroller and the 52px track, and deliberately
              the same: `../a/format-showcase.tsx` carries the reasoning. What
              is new is a glyph on each pill, which is how this row says it
              switches a view rather than filtering a list. */}
          <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
            <TabsList
              aria-label={tabsLabel}
              className="w-max group-data-horizontal/tabs:h-13 sm:group-data-horizontal/tabs:h-9"
            >
              {views.map((view) => {
                const Icon = VIEW_ICONS[view.id];
                return (
                  <TabsTrigger key={view.id} value={view.id} className="px-4">
                    <Icon aria-hidden="true" />
                    {view.name}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* The tray the other panels on this page take, at the same corner
              and on the same card shadow, so the band sits in the page's
              rhythm rather than announcing itself as an embed. */}
          <div className="rounded-4xl bg-background p-2 shadow-card">
            <MotionConfig reducedMotion="user">
              <FleetProvider team={SHOWCASE_TEAM} runs={SHOWCASE_WEEK}>
                {views.map((view) => (
                  <TabsContent
                    key={view.id}
                    value={view.id}
                    className="motion-safe:animate-fade-in"
                  >
                    <div
                      role="img"
                      aria-label={view.alt}
                      className={cn("relative overflow-hidden rounded-3xl", PANEL)}
                    >
                      {view.id === "board" || view.id === "list" ? (
                        // Fluid: these two size themselves to the panel and
                        // run off its foot, and the board off its right too.
                        <>
                          <Stage className="absolute inset-0">
                            {view.id === "board" ? <BoardView /> : <ListView />}
                          </Stage>
                          <div className={FADE_BOTTOM} />
                          {view.id === "board" ? (
                            <div className={FADE_RIGHT} />
                          ) : null}
                        </>
                      ) : (
                        // Fixed: a drawing at its own size, seen through the
                        // panel, faded where the window cuts it.
                        <>
                          <div
                            className={cn(
                              "absolute inset-0 flex",
                              view.id === "office"
                                ? OFFICE_ALIGN
                                : "items-center justify-center",
                            )}
                          >
                            <Stage
                              className={cn(
                                view.id === "office" ? OFFICE_STAGE : ORG_STAGE,
                                "shrink-0",
                              )}
                            >
                              {view.id === "office" ? (
                                <SpaceView walkWhenIdle={false} wander />
                              ) : (
                                <OrgView controls={false} />
                              )}
                            </Stage>
                          </div>
                          <div className={cn(FADE_SIDE, "left-0 bg-linear-to-r")} />
                          <div className={cn(FADE_SIDE, "right-0 bg-linear-to-l")} />
                        </>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </FleetProvider>
            </MotionConfig>
          </div>
        </Tabs>
      </div>
    </section>
  );
}

// What every /teams view needs around it, and nothing else: a flex column
// with a real height, since each of them is a `min-h-0 flex-1` child that
// sizes and scrolls itself inside one.
//
// `inert` is what makes the view a picture. It takes the whole subtree out of
// the tab order and out of the accessibility tree, which is why the box above
// carries the `role="img"` and the line that says what is in it, and
// `pointer-events-none` puts the wheel back on the page over the one view
// that would otherwise have taken it.
//
// `scrollbar-hide` is the third of the same thought. The board and the list
// are real scrollers that nobody here can scroll, and `globals.css` styles
// `::-webkit-scrollbar`, which on a platform that draws classic scrollbars
// paints an 8px track down the inside of the panel and along its foot: a
// control in a picture, and one that cannot be dragged. The band already
// takes the same utility off its own tab track.
function Stage({ className, children }: { className: string; children: ReactNode }) {
  return (
    <div
      inert
      className={cn(
        "pointer-events-none scrollbar-hide flex min-h-0 flex-col overflow-hidden",
        "[&_*]:scrollbar-hide",
        className,
      )}
    >
      {children}
    </div>
  );
}
