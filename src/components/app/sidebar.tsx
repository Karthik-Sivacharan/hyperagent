"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  IconArrowUpRight,
  IconBook,
  IconBrain,
  IconBuildingStore,
  IconChevronDown,
  IconChevronRight,
  IconDots,
  IconEdit,
  IconFolderOpen,
  IconHash,
  IconInbox,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconMessageCircle,
  IconPlus,
  IconPuzzle,
  IconRobotFace,
  IconSchool,
  IconSearch,
  IconUsers,
  type TablerIcon,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { NavItem } from "@/components/ui/nav-item";
import { Overline } from "@/components/ui/overline";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HyperagentMark } from "@/components/app/brand-icons";
import { AccountMenu } from "@/components/app/account-menu";
import { LearningMenu } from "@/components/app/learning-menu";
import { NewAgentMenu } from "@/components/app/new-agent-menu";
import { SearchPalette } from "@/components/app/search-palette";
import { ThreadContextMenu, ThreadOptionsMenu } from "@/components/app/thread-menu";
import { currentUser } from "@/lib/mock/user";
import { recentRooms } from "@/lib/mock/rooms";
import { recentThreads } from "@/lib/mock/threads";

// Markup is transcribed from hyperagent.com's sidebar
// (docs/reference/pages/threads-new.html for the expanded column,
// docs/reference/overlays/sidebar-collapsed.html for the 64px rail); the
// layout and metrics are kept. Phase 2 re-skins it with the brand language:
// the sidebar surface token, pill rows with tint hover / active fills,
// group labels as caps on the third text tier, brand motion. Every menu,
// tooltip and toggle is local state only.

const SIDEBAR_WIDTH = 256;
const SIDEBAR_MIN = 250;
const SIDEBAR_MAX = 500;
const RAIL_WIDTH = 64;

/**
 * The column's own collapse motion: what the seventeen cloned routes get, and
 * what this column has always used. `collapseRidesSlide` swaps it for the
 * shell's pairing; nothing else does.
 */
const COLLAPSE_MS = 200;
const COLLAPSE_EASING = "ease-out";

/**
 * What --duration-slide costs if the stylesheet has not applied yet. Same
 * device, and the same reason, as signup-screen.tsx's own token reader: a
 * retune in src/design/brand/brand.css lands here without a code change, and
 * this is that file's current value for the one frame before the sheet
 * applies.
 */
const SLIDE_FALLBACK_MS = 480;

/** How long past the move the inline rule is left in place before teardown. */
const COLLAPSE_CLEANUP_MS = 60;

/**
 * Reads a duration token off a mounted element as a number.
 *
 * The inline transition needs a figure and the cleanup timer needs the same
 * one, so the token is resolved once rather than written down twice. Copied
 * from signup-screen.tsx rather than shared, for the reason that file gives:
 * these are four lines, and widening anyone's surface for them would be worse
 * than the duplication.
 */
function durationToken(el: Element, name: string, fallback: number) {
  const raw = getComputedStyle(el).getPropertyValue(name).trim();
  const value = Number.parseFloat(raw);
  if (Number.isNaN(value)) return fallback;
  return raw.endsWith("ms") ? value : value * 1000;
}

/** The group headers' 22px actions: hidden until the header is hovered or focused. */
const HEADER_ACTION =
  "text-muted-foreground opacity-0 hover:bg-tint-15 hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 group-has-[:focus-visible]:opacity-100";

/** Every nav item is a tooltip trigger; the tooltip only renders on the rail. */
function RailTooltip({ label, collapsed, children }: { label: string; collapsed: boolean; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      {collapsed && <TooltipContent side="right">{label}</TooltipContent>}
    </Tooltip>
  );
}

function NavLabel({
  label,
  collapsed,
  grow,
}: {
  label: string;
  collapsed: boolean;
  /** Search, Inbox and Learning stretch their label (`flex-1 text-left`). */
  grow?: boolean;
}) {
  return (
    <span className={cn("whitespace-nowrap transition-opacity duration-200", collapsed && "opacity-0", grow && "flex-1 text-left")}>
      {label}
    </span>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
  active,
  muted,
  grow,
  collapsed,
}: {
  href: string;
  icon: TablerIcon;
  label: string;
  active?: boolean;
  muted?: boolean;
  grow?: boolean;
  collapsed: boolean;
}) {
  return (
    <RailTooltip label={label} collapsed={collapsed}>
      <NavItem asChild active={active} tone={muted ? "muted" : "default"}>
        <Link href={href}>
          <div className="flex shrink-0 items-center justify-center h-5 w-5">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
          <NavLabel label={label} collapsed={collapsed} grow={grow} />
        </Link>
      </NavItem>
    </RailTooltip>
  );
}

// Section headers toggle plain conditional content: the live site does not
// use a radix Collapsible here (no data-state / measurement styles), so the
// list simply mounts and unmounts.
function SectionHeader({
  label,
  expanded,
  ariaLabel,
  onToggle,
  action,
}: {
  label: string;
  expanded: boolean;
  ariaLabel: string;
  onToggle: () => void;
  action?: React.ReactNode;
}) {
  const Chevron = expanded ? IconChevronDown : IconChevronRight;
  return (
    <Overline className="group mb-1 flex items-center gap-1 pr-1">
      {/* The caps role sits on the button itself (the button base would
          otherwise set 14px), and the ghost open/hover fills are reset: the
          toggle is expanded at rest and only lifts its text on hover. Before
          the sweep these two headers rendered sentence case by accident (the
          browser's button stylesheet reset `text-transform` on the raw
          button); they now take the brand's caps like "Resources". */}
      <Button
        variant="ghost"
        size="none"
        aria-label={ariaLabel}
        aria-expanded={expanded}
        onClick={onToggle}
        className="min-w-0 flex-1 justify-start gap-1 py-1 pl-3.5 text-label-12-caps text-foreground-low hover:bg-transparent hover:text-foreground aria-expanded:bg-transparent"
      >
        <span className="whitespace-nowrap">{label}</span>
        <div className="flex items-center justify-center">
          <Chevron className="size-3" aria-hidden="true" />
        </div>
      </Button>
      {action}
    </Overline>
  );
}

/** Rail-only "Rooms" menu, the same fold the rail gives recent threads. */
function RailRoomsMenu({ children, ...triggerProps }: React.ComponentProps<typeof DropdownMenuTrigger>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild {...triggerProps}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" className="w-64">
        {recentRooms.map((room) => (
          <DropdownMenuItem key={room.id} asChild>
            <Link href={`/rooms/${room.slug}`}>
              <IconHash className="size-4" aria-hidden="true" />
              <span className="truncate text-sm">{room.slug}</span>
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/rooms">
            <IconArrowUpRight className="size-4" aria-hidden="true" />
            <span className="text-sm">View all</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Rail-only "Threads" menu (the collapsed sidebar folds recent threads into a menu). */
function RailThreadsMenu({ children, ...triggerProps }: React.ComponentProps<typeof DropdownMenuTrigger>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild {...triggerProps}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" className="w-64">
        {recentThreads.map((thread) => (
          <DropdownMenuItem key={thread.id} asChild>
            <Link href={`/thread/${thread.id}`}>
              <IconMessageCircle className="size-4" aria-hidden="true" />
              <span className="truncate text-sm">{thread.title}</span>
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/threads">
            <IconArrowUpRight className="size-4" aria-hidden="true" />
            <span className="text-sm">View all</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Sidebar({
  defaultCollapsed = false,
  forceCollapsed = false,
  collapseRidesSlide = false,
  onWidthChange,
  onExpandedWidthChange,
}: {
  /**
   * Start at the 64px rail. A STARTING STATE, NOT A LOCK: it only seeds the
   * reader's own `userCollapsed`, so the rail's expand toggle works as it always
   * does and `forceCollapsed` still layers on top. The signup handoff passes it
   * so the shell arrives with room for the computer beside the conversation.
   * Off by default, so the seventeen cloned routes arrive open as before.
   */
  defaultCollapsed?: boolean;
  /**
   * Holds the column at its rail whatever the reader last chose.
   *
   * A CONSTRAINT, NOT A VALUE, and it is the same shape and the same argument
   * as `AgentPanel.maxWidth` — read that note, the two are one idea. The shell
   * knows when there is no longer room for a 256px column AND a readable
   * conversation; it does not know whether this reader likes their sidebar
   * open. So what comes down is a floor under the collapse, and the reader's
   * own choice goes on living underneath it in `userCollapsed`: widen the
   * window past the threshold and the column comes back open if that is how it
   * was left. A `collapsed` VALUE coming down would have overwritten that
   * preference the first time someone dragged a window edge.
   *
   * This is the third and last step of the shell's yield order — the panel
   * gives up width, then the panel stops being a column, then the sidebar
   * rails — and it exists because the conversation may not be the thing that
   * gives.
   */
  forceCollapsed?: boolean;
  /**
   * Run the collapse on the shell's own travel — `--duration-slide` on
   * `--ease-in-out` — instead of this column's private 200ms ease-out.
   *
   * Opt-in and additive like the three props around it, and off by default, so
   * the seventeen cloned routes keep the 200ms they have always had: a sidebar
   * collapsing on its own in an otherwise still window wants to be quick, and
   * 480ms there would read as the column dawdling.
   *
   * It exists because in ONE place the column is not moving on its own. After
   * the signup handoff the conversation is padded by this column's live width,
   * and that padding rides `--duration-slide` on `--ease-in-out` along with
   * everything else the shell moves. 200ms `ease-out` against 480ms
   * `--ease-in-out` is 2.4x shorter on a different curve, so this column's
   * right-hand edge ran away from the column it was supposed to be pushing:
   * measured at 1512, the sidebar overlapped the conversation by 68px for
   * ~233ms on every expand. Nothing about the collapse itself changes — same
   * inline rule, same teardown, only the two numbers in it — and the timer
   * below follows whichever pairing is in force, so it can never tear the
   * transition down mid-move.
   */
  collapseRidesSlide?: boolean;
  /**
   * Reports the column's live width — the rail's 64 while collapsed, the
   * dragged width otherwise — including the resting one on mount.
   *
   * Opt-in and additive: omit it and this renders exactly what it rendered
   * before, which is what the seventeen cloned routes behind `AppShell` need.
   * It is the same shape, and there for the same reason, as
   * `AgentPanel.onWidthChange`: the column between the two pieces of chrome has
   * to pad by whatever they currently are, and a constant would only be right
   * until the first drag. Without it, collapsing to the rail after the signup
   * handoff left 192px of dead gutter the conversation could not use.
   */
  onWidthChange?: (width: number) => void;
  /**
   * Reports the width this column would take if nothing were forcing it — the
   * dragged width, whether or not the rail is currently showing.
   *
   * It exists to break a circle. Whoever decides `forceCollapsed` cannot decide
   * it from the LIVE width, because forcing the rail changes the live width,
   * which re-runs the decision, which unforces it, and so on. The expanded
   * width does not move when the rail is forced, so a decision made against it
   * is stable. See use-shell-fit.ts.
   */
  onExpandedWidthChange?: (width: number) => void;
}) {
  const pathname = usePathname();
  // Exact match, except section roots with sub-routes (/settings/*). The
  // "View all" link stays inactive on /threads/new, as on the live site.
  const isActive = (href: string) =>
    pathname === href || (href === "/settings" && pathname.startsWith("/settings/"));

  const [searchOpen, setSearchOpen] = useState(false);
  const [agentsOpen, setAgentsOpen] = useState(false);
  const [threadsOpen, setThreadsOpen] = useState(true);
  const [roomsOpen, setRoomsOpen] = useState(true);

  // Collapse to the 64px rail. The live column has no idle transition; the
  // width animates only while toggling, so the settled DOM stays identical.
  // The transition is set straight on the element (and a reflow flushed)
  // before React changes the width, then removed on a timer. transitionend
  // is not used because the label opacity transitions bubble it too early.
  //
  // The duration and curve are whatever `collapseRidesSlide` asked for, read
  // once so the inline rule and the teardown timer cannot disagree — a timer
  // still keyed to 200ms while the move ran for 480 would cut the animation in
  // half and put the snap back in a different place.
  //
  // Two facts, not one: `userCollapsed` is what the reader asked for and
  // `collapsed` is what the column can actually be. Only the reader's own
  // choice is remembered, so lifting `forceCollapsed` restores it rather than
  // leaving the column railed for good.
  const [userCollapsed, setUserCollapsed] = useState(defaultCollapsed);
  const collapsed = userCollapsed || forceCollapsed;
  // ...and the one state the rail's control cannot get out of. `collapsed` is
  // reversible whenever the reader is the one holding it there; `forceCollapsed`
  // is the fit test holding it, and pressing anything cannot widen the window.
  // See the control itself for what it does about that.
  const railLocked = forceCollapsed;
  const columnRef = useRef<HTMLDivElement>(null);
  const cleanupTimer = useRef<number | undefined>(undefined);
  const toggleCollapsed = () => {
    const column = columnRef.current;
    const ms =
      collapseRidesSlide && column ? durationToken(column, "--duration-slide", SLIDE_FALLBACK_MS) : COLLAPSE_MS;
    if (column) {
      // Longhands rather than the `transition` shorthand: the shell's curve is
      // a custom property, and a var() that failed to resolve inside a
      // shorthand would invalidate the whole declaration and silently take the
      // animation with it. On the longhand it can only cost the easing.
      column.style.transitionProperty = "width";
      column.style.transitionDuration = `${ms}ms`;
      column.style.transitionTimingFunction = collapseRidesSlide ? "var(--ease-in-out)" : COLLAPSE_EASING;
      void column.offsetWidth;
    }
    // Against the RENDERED state, not the remembered one: pressing a control
    // that says "Open sidebar" has to mean open, whichever of the two facts
    // above put the rail there.
    setUserCollapsed(!collapsed);
    // One teardown in flight at a time. A second press while the first is
    // still running would otherwise leave the first timer to fire mid-move and
    // strip the transition off it — the same snap this whole change exists to
    // remove, just relocated. The window is 260ms on the column's own motion
    // and 540ms on the shell's, so riding the slide is exactly where a
    // double-press becomes easy.
    window.clearTimeout(cleanupTimer.current);
    cleanupTimer.current = window.setTimeout(() => {
      if (column) column.style.transition = "";
    }, ms + COLLAPSE_CLEANUP_MS);
  };
  useEffect(() => () => window.clearTimeout(cleanupTimer.current), []);
  // No such transition when `forceCollapsed` moves. That one is a correction
  // made while the window is already being dragged, like the panel's own
  // re-clamp, and animating a correction on top of a resize reads as lag.

  // Drag-to-resize, clamped like the live handler (250-500px, double-click
  // resets to 256). Pointer capture keeps the drag alive outside the handle.
  const [width, setWidth] = useState(SIDEBAR_WIDTH);
  const drag = useRef({ startX: 0, startWidth: SIDEBAR_WIDTH });
  const onResizeStart = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const handle = e.currentTarget;
    try {
      handle.setPointerCapture(e.pointerId);
    } catch {
      // Not every pointer can be captured (synthetic or already-released);
      // the drag still works while the pointer stays over the handle.
    }
    drag.current = { startX: e.clientX, startWidth: width };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    const move = (ev: PointerEvent) =>
      setWidth(Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, drag.current.startWidth + (ev.clientX - drag.current.startX))));
    const stop = () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", stop);
      handle.removeEventListener("lostpointercapture", stop);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", stop);
    handle.addEventListener("lostpointercapture", stop, { once: true });
  };

  // The two states above are one fact to anyone outside: how much room this
  // column is taking. Reported from an effect rather than from the toggle and
  // the drag handler, so there is one place it can be wrong instead of three,
  // and so the resting width arrives on mount without the caller having to
  // guess it.
  const liveWidth = collapsed ? RAIL_WIDTH : width;
  useEffect(() => {
    onWidthChange?.(liveWidth);
  }, [liveWidth, onWidthChange]);
  useEffect(() => {
    onExpandedWidthChange?.(width);
  }, [width, onExpandedWidthChange]);

  const accountButton = (
    <AccountMenu>
      <Button
        variant="ghost"
        size="none"
        className="h-auto w-full justify-start gap-2 overflow-hidden rounded-2xl px-2 py-1.5 text-muted-foreground duration-(--duration-normal) ease-out hover:text-foreground"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          width={32}
          height={32}
          className="shrink-0 object-cover rounded-full size-8 text-sm"
          src={currentUser.avatarUrl}
        />
        <div className={cn("flex min-w-0 flex-1 flex-col text-left transition-opacity duration-200", collapsed && "opacity-0")}>
          <span className="truncate font-medium text-foreground text-xs leading-4">{currentUser.name}</span>
          <span className="truncate text-muted-foreground text-xs leading-4">{currentUser.email}</span>
        </div>
        <IconChevronRight
          className={cn("size-4 shrink-0 opacity-50 transition-opacity duration-200", collapsed && "opacity-0")}
          aria-hidden="true"
        />
      </Button>
    </AccountMenu>
  );

  const newAgentPlus = (
    <NewAgentMenu>
      <Button variant="ghost" size="icon-2xs" aria-label="New agent" className={cn(HEADER_ACTION, "data-[state=open]:opacity-100")}>
        <IconPlus className="size-3.5" aria-hidden="true" />
      </Button>
    </NewAgentMenu>
  );

  return (
    <div
      className="safe-area-top-below-banners hidden md:block"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
        marginLeft: "env(safe-area-inset-left)",
      }}
    >
      <div ref={columnRef} className="relative h-full shrink-0" style={{ width: collapsed ? RAIL_WIDTH : width }}>
        <div className="absolute inset-0 z-30 overflow-hidden">
          <div className="h-full overflow-hidden">
            <div className="relative h-full overflow-hidden border-sidebar-border border-r bg-sidebar">
              <div className="flex h-full flex-col">
                {/* Header: logo + collapse */}
                <div className="mt-1 flex shrink-0 items-center gap-2 overflow-hidden pl-[22px] h-14 pr-3">
                  <div className="relative flex min-w-0 flex-1 items-center">
                    <Link
                      aria-label="Hyperagent home"
                      className={cn("flex items-center gap-2", collapsed && "pointer-events-none")}
                      href="/threads/new"
                      aria-hidden={collapsed || undefined}
                      tabIndex={collapsed ? -1 : undefined}
                    >
                      <HyperagentMark className={cn("size-5 shrink-0 text-primary", collapsed && "invisible")} />
                      <span className={cn("whitespace-nowrap text-logo transition-opacity duration-200", collapsed && "opacity-0")}>
                        Hyperagent
                      </span>
                    </Link>
                    {/* The rail's way back. While `forceCollapsed` holds there
                        is no way back — the column is railed because the
                        conversation would otherwise fall under its floor, so
                        opening it is the one thing this control cannot do, and
                        a button that swallows the click and leaves the rail
                        where it was is worse than one that says why.

                        `aria-disabled` rather than `disabled`: the reason lives
                        in the tooltip, and `disabled` takes the element out of
                        the tab order and (through the primitive's
                        `disabled:pointer-events-none`) stops the hover that
                        would show it. Present, unavailable, and explaining
                        itself is the honest third state. It is the same
                        argument agent-panel.tsx makes for its Save button: the
                        usual complaint about a disabled control is that it
                        hides its reason, and these two state theirs. */}
                    {collapsed && (
                      <Button
                        variant="ghost"
                        size="none"
                        aria-label="Open sidebar"
                        aria-disabled={railLocked || undefined}
                        onClick={railLocked ? undefined : toggleCollapsed}
                        className="group absolute top-1/2 left-0 -ml-3.5 -translate-y-1/2 px-3.5 py-1.5 duration-(--duration-normal) ease-out"
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex size-5 shrink-0 items-center justify-center">
                              <HyperagentMark className="size-5 text-primary group-hover:hidden" />
                              <IconLayoutSidebarLeftExpand className="hidden size-4 text-primary group-hover:block" aria-hidden="true" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            {railLocked ? "Widen the window to open the sidebar" : "Open sidebar"}
                          </TooltipContent>
                        </Tooltip>
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className={cn("size-6 text-muted-foreground duration-(--duration-normal)", collapsed && "pointer-events-none opacity-0")}
                    aria-label={collapsed ? "Pin sidebar" : "Hide sidebar"}
                    onClick={toggleCollapsed}
                  >
                    <IconLayoutSidebarLeftCollapse className="size-4" aria-hidden="true" />
                  </Button>
                </div>

                <div
                  aria-hidden="true"
                  className="pointer-events-none relative z-10 -mb-6 h-6 shrink-0 bg-gradient-to-t transition-opacity duration-150 from-sidebar-fade to-sidebar opacity-0"
                />

                <nav className={cn("flex-1 overflow-y-auto overflow-x-hidden py-2", collapsed && "scrollbar-hide", "px-2")}>
                  <div>
                    <div className={cn("space-y-0.5", !collapsed && "mb-2")}>
                      <NavLink href="/threads/new" icon={IconEdit} label="New thread" active={isActive("/threads/new")} collapsed={collapsed} />
                      <RailTooltip label="Search" collapsed={collapsed}>
                        <NavItem className="group pr-2" onClick={() => setSearchOpen(true)}>
                          <div className="flex shrink-0 items-center justify-center h-5 w-5">
                            <IconSearch className="h-4 w-4" aria-hidden="true" />
                          </div>
                          <NavLabel label="Search" collapsed={collapsed} grow />
                          {/* A bare hint, not a keycap: no fill, no weight, revealed on hover. */}
                          <Kbd className="h-auto shrink-0 bg-transparent px-1.5 py-0.5 font-normal opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                            ⌘K
                          </Kbd>
                        </NavItem>
                      </RailTooltip>
                      <NavLink href="/inbox" icon={IconInbox} label="Inbox" active={isActive("/inbox")} grow collapsed={collapsed} />
                    </div>

                    {collapsed && (
                      <>
                        <RailTooltip label="Agents" collapsed>
                          <NewAgentMenu>
                            <NavItem aria-label="Agents">
                              <div className="flex shrink-0 items-center justify-center h-5 w-5">
                                <IconRobotFace className="h-4 w-4" aria-hidden="true" />
                              </div>
                              <NavLabel label="Agents" collapsed />
                            </NavItem>
                          </NewAgentMenu>
                        </RailTooltip>
                        <RailTooltip label="Threads" collapsed>
                          <RailThreadsMenu>
                            <NavItem aria-label="Threads">
                              <div className="flex shrink-0 items-center justify-center h-5 w-5">
                                <IconMessageCircle className="h-4 w-4" aria-hidden="true" />
                              </div>
                              <NavLabel label="Threads" collapsed />
                            </NavItem>
                          </RailThreadsMenu>
                        </RailTooltip>
                        <RailTooltip label="Rooms" collapsed>
                          <RailRoomsMenu>
                            <NavItem aria-label="Rooms">
                              <div className="flex shrink-0 items-center justify-center h-5 w-5">
                                <IconHash className="h-4 w-4" aria-hidden="true" />
                              </div>
                              <NavLabel label="Rooms" collapsed />
                            </NavItem>
                          </RailRoomsMenu>
                        </RailTooltip>
                      </>
                    )}

                    <div>
                      {/* Agents (collapsed on the live account: no agents yet) */}
                      <div className={cn("mb-3", collapsed && "hidden")}>
                        <SectionHeader
                          label="Agents"
                          expanded={agentsOpen}
                          ariaLabel={agentsOpen ? "Collapse agents" : "Expand agents"}
                          onToggle={() => setAgentsOpen((o) => !o)}
                          action={
                            <>
                              {newAgentPlus}
                              <Input type="file" accept=".json,application/json" className="hidden" />
                            </>
                          }
                        />
                        {agentsOpen && (
                          <div className="space-y-0.5">
                            <NewAgentMenu>
                              <NavItem tone="muted">
                                <div className="flex shrink-0 items-center justify-center h-5 w-5">
                                  <IconPlus className="h-4 w-4" aria-hidden="true" />
                                </div>
                                <span className="whitespace-nowrap transition-opacity duration-200">New agent</span>
                              </NavItem>
                            </NewAgentMenu>
                            <Input type="file" accept=".json,application/json" className="hidden" />
                          </div>
                        )}
                      </div>

                      {/* Recent threads (folded into the rail's Threads menu when collapsed) */}
                      {!collapsed && (
                          <div>
                            <SectionHeader
                              label="Recent threads"
                              expanded={threadsOpen}
                              ariaLabel={threadsOpen ? "Collapse threads" : "Expand threads"}
                              onToggle={() => setThreadsOpen((o) => !o)}
                              action={
                                <Button variant="ghost" size="icon-2xs" asChild className={HEADER_ACTION}>
                                  <Link aria-label="New thread" href="/threads/new">
                                    <IconPlus className="size-3.5" aria-hidden="true" />
                                  </Link>
                                </Button>
                              }
                            />
                            {threadsOpen && (
                              <div className="space-y-0.5">
                                {recentThreads.map((thread) => {
                                  const active = pathname === `/thread/${thread.id}`;
                                  return (
                                    <div key={thread.id}>
                                      <ThreadContextMenu thread={thread}>
                                        <div
                                          tabIndex={-1}
                                          className={cn(
                                            "group relative flex items-center rounded-full transition-[color,background-color] duration-(--duration-normal) ease-out text-foreground",
                                            active ? "bg-tint-15 font-medium" : "hover:bg-tint-10",
                                          )}
                                        >
                                          <Link
                                            className="flex flex-1 items-start gap-2 overflow-hidden py-2 pl-3.5 text-sm pr-3.5"
                                            href={`/thread/${thread.id}`}
                                          >
                                            <div className="flex w-5 shrink-0 items-center justify-center h-5">
                                              <div className="relative size-4">
                                                <IconMessageCircle className="size-4 text-muted-foreground" aria-hidden="true" />
                                              </div>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <span className="flex items-center gap-1.5">
                                                <span className="truncate">{thread.title}</span>
                                              </span>
                                            </div>
                                          </Link>
                                          <div className="absolute top-1.5 right-0 flex items-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 group-has-[:focus-visible]:opacity-100 transition-opacity">
                                            <div className="pr-1">
                                              <ThreadOptionsMenu thread={thread}>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="size-6 bg-tint-15 hover:bg-tint-20"
                                                  aria-label={`Options for ${thread.title}`}
                                                >
                                                  <IconDots className="size-4" aria-hidden="true" />
                                                </Button>
                                              </ThreadOptionsMenu>
                                            </div>
                                          </div>
                                        </div>
                                      </ThreadContextMenu>
                                    </div>
                                  );
                                })}
                                {/* "View all" is the one nav row without a tooltip trigger on the live site. */}
                                <NavItem asChild active={isActive("/threads")} tone="muted">
                                  <Link href="/threads">
                                    <div className="flex shrink-0 items-center justify-center h-5 w-5">
                                      <IconArrowUpRight className="h-4 w-4" aria-hidden="true" />
                                    </div>
                                    <span className="whitespace-nowrap transition-opacity duration-200">View all</span>
                                  </Link>
                                </NavItem>
                              </div>
                            )}
                          </div>
                      )}

                      {/* Rooms: the shared channels, folded into the rail's
                          Rooms menu when the column collapses. Unread counts
                          sit at the end of the row as tier-3 figures rather
                          than as a coloured badge; a room is not an alert. */}
                      {!collapsed && (
                        <div className="mt-3">
                          <SectionHeader
                            label="Rooms"
                            expanded={roomsOpen}
                            ariaLabel={roomsOpen ? "Collapse rooms" : "Expand rooms"}
                            onToggle={() => setRoomsOpen((o) => !o)}
                            action={
                              <Button variant="ghost" size="icon-2xs" asChild className={HEADER_ACTION}>
                                <Link aria-label="New room" href="/rooms">
                                  <IconPlus className="size-3.5" aria-hidden="true" />
                                </Link>
                              </Button>
                            }
                          />
                          {roomsOpen && (
                            <div className="space-y-0.5">
                              {recentRooms.map((room) => {
                                const active = pathname === `/rooms/${room.slug}`;
                                return (
                                  <NavItem key={room.id} asChild active={active}>
                                    <Link href={`/rooms/${room.slug}`}>
                                      <div className="flex shrink-0 items-center justify-center h-5 w-5">
                                        <IconHash className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                      </div>
                                      <span className="min-w-0 flex-1 truncate">{room.slug}</span>
                                      {room.unread ? (
                                        <span className="shrink-0 text-xs text-foreground-low tabular-nums">
                                          {room.unread}
                                        </span>
                                      ) : null}
                                    </Link>
                                  </NavItem>
                                );
                              })}
                              <NavItem asChild active={isActive("/rooms")} tone="muted">
                                <Link href="/rooms">
                                  <div className="flex shrink-0 items-center justify-center h-5 w-5">
                                    <IconArrowUpRight className="h-4 w-4" aria-hidden="true" />
                                  </div>
                                  <span className="whitespace-nowrap transition-opacity duration-200">View all</span>
                                </Link>
                              </NavItem>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Resources */}
                      <div className={collapsed ? "mt-1" : "mt-3"}>
                        <Overline className={cn("mb-1", !collapsed && "flex", "items-center gap-1 py-1 pl-3.5 pr-1", collapsed && "hidden")}>
                          <span className="whitespace-nowrap">Resources</span>
                        </Overline>
                        <div className="space-y-0.5">
                          <NavLink href="/teams" icon={IconUsers} label="Teams" active={isActive("/teams")} collapsed={collapsed} />
                          <NavLink href="/skills" icon={IconPuzzle} label="Skills" active={isActive("/skills")} collapsed={collapsed} />
                          <NavLink href="/memories" icon={IconBrain} label="Memories" active={isActive("/memories")} collapsed={collapsed} />
                          <RailTooltip label="Learning" collapsed={collapsed}>
                            <LearningMenu>
                              <NavItem aria-label="Learning" active={isActive("/learning")}>
                                <div className="flex shrink-0 items-center justify-center h-5 w-5">
                                  <IconSchool className="h-4 w-4" aria-hidden="true" />
                                </div>
                                <NavLabel label="Learning" collapsed={collapsed} grow />
                                <IconChevronRight className="size-4 shrink-0 opacity-50" aria-hidden="true" />
                              </NavItem>
                            </LearningMenu>
                          </RailTooltip>
                          <NavLink href="/projects" icon={IconFolderOpen} label="Projects" active={isActive("/projects")} collapsed={collapsed} />
                          <NavLink href="/library" icon={IconBook} label="Library" active={isActive("/library")} collapsed={collapsed} />
                          <NavLink href="/marketplace" icon={IconBuildingStore} label="Marketplace" active={isActive("/marketplace")} collapsed={collapsed} />
                        </div>
                      </div>
                    </div>
                  </div>
                </nav>

                <div
                  aria-hidden="true"
                  className="pointer-events-none relative z-10 -mt-6 h-6 shrink-0 bg-gradient-to-b transition-opacity duration-150 from-sidebar-fade to-sidebar opacity-0"
                />

                {/* Account */}
                <div className="shrink-0 space-y-0.5 p-2">
                  <div className="[&_button]:!h-auto [&_button]:font-normal [&_button]:text-foreground [&_button]:hover:text-foreground space-y-0.5">
                    {collapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>{accountButton}</div>
                        </TooltipTrigger>
                        <TooltipContent side="right">{currentUser.name}</TooltipContent>
                      </Tooltip>
                    ) : (
                      <div>{accountButton}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Resize handle (250-500px; double-click resets to 256) */}
              {!collapsed && (
                <div
                  className="group absolute inset-y-0 z-40 flex w-5 cursor-col-resize touch-none items-center justify-center"
                  style={{ right: -10 }}
                  onPointerDown={onResizeStart}
                  onDoubleClick={() => setWidth(SIDEBAR_WIDTH)}
                >
                  <div className="h-8 w-[3px] rounded-full transition-colors bg-transparent group-hover:bg-tint-40" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <SearchPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
