"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Bot,
  Brain,
  ChevronDown,
  ChevronRight,
  Ellipsis,
  FolderOpen,
  GraduationCap,
  Inbox,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Puzzle,
  Search,
  SquarePen,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HyperagentMark } from "@/components/app/brand-icons";
import { AccountMenu } from "@/components/app/account-menu";
import { LearningMenu } from "@/components/app/learning-menu";
import { NewAgentMenu } from "@/components/app/new-agent-menu";
import { SearchPalette } from "@/components/app/search-palette";
import { ThreadContextMenu, ThreadOptionsMenu } from "@/components/app/thread-menu";
import { currentUser } from "@/lib/mock/user";
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

const NAV_ITEM =
  "flex w-full cursor-pointer items-center gap-2 overflow-hidden rounded-full transition-[color,background-color] duration-(--duration-normal) ease-out px-3.5 py-1.5 text-sm";

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
  icon: LucideIcon;
  label: string;
  active?: boolean;
  muted?: boolean;
  grow?: boolean;
  collapsed: boolean;
}) {
  return (
    <RailTooltip label={label} collapsed={collapsed}>
      <Link
        href={href}
        className={cn(
          NAV_ITEM,
          active
            ? "bg-tint-15 font-medium text-foreground"
            : muted
              ? "text-muted-foreground hover:bg-tint-10 hover:text-foreground"
              : "text-foreground hover:bg-tint-10",
        )}
      >
        <div className="flex shrink-0 items-center justify-center h-5 w-5">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <NavLabel label={label} collapsed={collapsed} grow={grow} />
      </Link>
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
  const Chevron = expanded ? ChevronDown : ChevronRight;
  return (
    <div className="group mb-1 flex items-center gap-1 text-label-12-caps text-foreground-low pr-1">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={expanded}
        onClick={onToggle}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-1 rounded-full py-1 pl-3.5 transition-colors duration-(--duration-fast) hover:text-foreground"
      >
        <span className="whitespace-nowrap">{label}</span>
        <div className="flex items-center justify-center">
          <Chevron className="size-3" aria-hidden="true" />
        </div>
      </button>
      {action}
    </div>
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
              <MessageCircle className="size-4" aria-hidden="true" />
              <span className="truncate text-sm">{thread.title}</span>
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/threads">
            <ArrowUpRight className="size-4" aria-hidden="true" />
            <span className="text-sm">View all</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  // Exact match, except section roots with sub-routes (/settings/*). The
  // "View all" link stays inactive on /threads/new, as on the live site.
  const isActive = (href: string) =>
    pathname === href || (href === "/settings" && pathname.startsWith("/settings/"));

  const [searchOpen, setSearchOpen] = useState(false);
  const [agentsOpen, setAgentsOpen] = useState(false);
  const [threadsOpen, setThreadsOpen] = useState(true);

  // Collapse to the 64px rail. The live column has no idle transition; the
  // width animates only while toggling, so the settled DOM stays identical.
  // The transition is set straight on the element (and a reflow flushed)
  // before React changes the width, then removed on a timer. transitionend
  // is not used because the label opacity transitions bubble it too early.
  const [collapsed, setCollapsed] = useState(false);
  const columnRef = useRef<HTMLDivElement>(null);
  const toggleCollapsed = () => {
    const column = columnRef.current;
    if (column) {
      column.style.transition = "width 200ms ease-out";
      void column.offsetWidth;
    }
    setCollapsed((c) => !c);
    window.setTimeout(() => {
      if (column) column.style.transition = "";
    }, 260);
  };

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

  const accountButton = (
    <AccountMenu>
      <button
        type="button"
        data-variant="ghost"
        data-size="default"
        className="inline-flex shrink-0 items-center whitespace-nowrap font-medium outline-none transition-[color,background-color] duration-(--duration-normal) ease-out focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 h-auto w-full cursor-pointer justify-start gap-2 overflow-hidden rounded-2xl px-2 text-muted-foreground hover:bg-tint-10 hover:text-foreground has-[>svg]:px-2 py-1.5 text-sm"
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
        <ChevronRight
          className={cn("size-4 shrink-0 opacity-50 transition-opacity duration-200", collapsed && "opacity-0")}
          aria-hidden="true"
        />
      </button>
    </AccountMenu>
  );

  const newAgentPlus = (
    <NewAgentMenu>
      <button
        type="button"
        aria-label="New agent"
        className="flex cursor-pointer items-center justify-center rounded-full p-1 text-muted-foreground transition-colors hover:bg-tint-15 hover:text-foreground data-[state=open]:opacity-100 opacity-0 focus-visible:opacity-100 group-hover:opacity-100 group-has-[:focus-visible]:opacity-100"
      >
        <Plus className="size-3.5" aria-hidden="true" />
      </button>
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
                    {collapsed && (
                      <button
                        type="button"
                        aria-label="Open sidebar"
                        onClick={toggleCollapsed}
                        className="group absolute top-1/2 left-0 -ml-3.5 flex -translate-y-1/2 cursor-pointer items-center rounded-full px-3.5 py-1.5 transition-[color,background-color] duration-(--duration-normal) ease-out hover:bg-tint-10"
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex size-5 shrink-0 items-center justify-center">
                              <HyperagentMark className="size-5 text-primary group-hover:hidden" />
                              <PanelLeftOpen className="hidden size-4 text-primary group-hover:block" aria-hidden="true" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="right">Open sidebar</TooltipContent>
                        </Tooltip>
                      </button>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className={cn("size-6 text-muted-foreground duration-(--duration-normal)", collapsed && "pointer-events-none opacity-0")}
                    aria-label={collapsed ? "Pin sidebar" : "Hide sidebar"}
                    onClick={toggleCollapsed}
                  >
                    <PanelLeftClose className="size-4" />
                  </Button>
                </div>

                <div
                  aria-hidden="true"
                  className="pointer-events-none relative z-10 -mb-6 h-6 shrink-0 bg-gradient-to-t transition-opacity duration-150 from-sidebar-fade to-sidebar opacity-0"
                />

                <nav className={cn("flex-1 overflow-y-auto overflow-x-hidden py-2", collapsed && "scrollbar-hide", "px-2")}>
                  <div>
                    <div className={cn("space-y-0.5", !collapsed && "mb-2")}>
                      <NavLink href="/threads/new" icon={SquarePen} label="New thread" active={isActive("/threads/new")} collapsed={collapsed} />
                      <RailTooltip label="Search" collapsed={collapsed}>
                        <button
                          type="button"
                          onClick={() => setSearchOpen(true)}
                          className="group flex w-full cursor-pointer items-center gap-2 overflow-hidden rounded-full text-foreground transition-[color,background-color] duration-(--duration-normal) ease-out hover:bg-tint-10 px-3.5 pr-2 py-1.5 text-sm"
                        >
                          <div className="flex shrink-0 items-center justify-center h-5 w-5">
                            <Search className="h-4 w-4" aria-hidden="true" />
                          </div>
                          <NavLabel label="Search" collapsed={collapsed} grow />
                          <kbd className="min-w-[1.25rem] shrink-0 py-0.5 text-center text-muted-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100 px-1.5 text-xs">
                            ⌘K
                          </kbd>
                        </button>
                      </RailTooltip>
                      <NavLink href="/inbox" icon={Inbox} label="Inbox" active={isActive("/inbox")} grow collapsed={collapsed} />
                    </div>

                    {collapsed && (
                      <>
                        <RailTooltip label="Agents" collapsed>
                          <NewAgentMenu>
                            <button
                              type="button"
                              aria-label="Agents"
                              className="flex w-full cursor-pointer items-center gap-2 overflow-hidden rounded-full transition-[color,background-color] duration-(--duration-normal) ease-out px-3.5 py-1.5 text-sm text-foreground hover:bg-tint-10"
                            >
                              <div className="flex shrink-0 items-center justify-center h-5 w-5">
                                <Bot className="h-4 w-4" aria-hidden="true" />
                              </div>
                              <NavLabel label="Agents" collapsed />
                            </button>
                          </NewAgentMenu>
                        </RailTooltip>
                        <RailTooltip label="Threads" collapsed>
                          <RailThreadsMenu>
                            <button
                              type="button"
                              aria-label="Threads"
                              className="flex w-full cursor-pointer items-center gap-2 overflow-hidden rounded-full transition-[color,background-color] duration-(--duration-normal) ease-out px-3.5 py-1.5 text-sm text-foreground hover:bg-tint-10"
                            >
                              <div className="flex shrink-0 items-center justify-center h-5 w-5">
                                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                              </div>
                              <NavLabel label="Threads" collapsed />
                            </button>
                          </RailThreadsMenu>
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
                              <input type="file" accept=".json,application/json" className="hidden" />
                            </>
                          }
                        />
                        {agentsOpen && (
                          <div className="space-y-0.5">
                            <NewAgentMenu>
                              <button
                                type="button"
                                className="flex w-full cursor-pointer items-center gap-2 overflow-hidden rounded-full text-muted-foreground transition-[color,background-color] duration-(--duration-normal) ease-out hover:bg-tint-10 hover:text-foreground px-3.5 py-1.5 text-sm"
                              >
                                <div className="flex shrink-0 items-center justify-center h-5 w-5">
                                  <Plus className="h-4 w-4" aria-hidden="true" />
                                </div>
                                <span className="whitespace-nowrap transition-opacity duration-200">New agent</span>
                              </button>
                            </NewAgentMenu>
                            <input accept=".json,application/json" className="hidden" type="file" />
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
                                <Link
                                  aria-label="New thread"
                                  href="/threads/new"
                                  className="flex cursor-pointer items-center justify-center rounded-full p-1 text-muted-foreground opacity-0 transition-colors hover:bg-tint-15 hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 group-has-[:focus-visible]:opacity-100"
                                >
                                  <Plus className="size-3.5" aria-hidden="true" />
                                </Link>
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
                                                <MessageCircle className="size-4 text-muted-foreground" aria-hidden="true" />
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
                                                  <Ellipsis className="size-4" />
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
                                <Link
                                  href="/threads"
                                  className={cn(
                                    "flex w-full cursor-pointer items-center gap-2 overflow-hidden rounded-full",
                                    isActive("/threads") ? "bg-tint-15 font-medium text-foreground" : "text-muted-foreground",
                                    "transition-[color,background-color] duration-(--duration-normal) ease-out hover:bg-tint-10 hover:text-foreground px-3.5 py-1.5 text-sm",
                                  )}
                                >
                                  <div className="flex shrink-0 items-center justify-center h-5 w-5">
                                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                                  </div>
                                  <span className="whitespace-nowrap transition-opacity duration-200">View all</span>
                                </Link>
                              </div>
                            )}
                          </div>
                      )}

                      {/* Resources */}
                      <div className={collapsed ? "mt-1" : "mt-3"}>
                        <div
                          className={cn(
                            "mb-1",
                            !collapsed && "flex",
                            "items-center gap-1 py-1 pl-3.5 text-label-12-caps text-foreground-low pr-1",
                            collapsed && "hidden",
                          )}
                        >
                          <span className="whitespace-nowrap">Resources</span>
                        </div>
                        <div className="space-y-0.5">
                          <NavLink href="/teams" icon={Users} label="Teams" active={isActive("/teams")} collapsed={collapsed} />
                          <NavLink href="/skills" icon={Puzzle} label="Skills" active={isActive("/skills")} collapsed={collapsed} />
                          <NavLink href="/memories" icon={Brain} label="Memories" active={isActive("/memories")} collapsed={collapsed} />
                          <RailTooltip label="Learning" collapsed={collapsed}>
                            <LearningMenu>
                              <button
                                type="button"
                                aria-label="Learning"
                                className={cn(
                                  NAV_ITEM,
                                  isActive("/learning") ? "bg-tint-15 font-medium text-foreground" : "text-foreground hover:bg-tint-10",
                                )}
                              >
                                <div className="flex shrink-0 items-center justify-center h-5 w-5">
                                  <GraduationCap className="h-4 w-4" aria-hidden="true" />
                                </div>
                                <NavLabel label="Learning" collapsed={collapsed} grow />
                                <ChevronRight className="size-4 shrink-0 opacity-50" aria-hidden="true" />
                              </button>
                            </LearningMenu>
                          </RailTooltip>
                          <NavLink href="/projects" icon={FolderOpen} label="Projects" active={isActive("/projects")} collapsed={collapsed} />
                          <NavLink href="/library" icon={BookOpen} label="Library" active={isActive("/library")} collapsed={collapsed} />
                          <NavLink href="/marketplace" icon={Store} label="Marketplace" active={isActive("/marketplace")} collapsed={collapsed} />
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
