"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  BookOpen,
  Brain,
  ChevronDown,
  ChevronRight,
  Ellipsis,
  FolderOpen,
  GraduationCap,
  Inbox,
  MessageCircle,
  PanelLeftClose,
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
import { HyperagentMark } from "@/components/app/brand-icons";
import { currentUser } from "@/lib/mock/user";
import { recentThreads } from "@/lib/mock/threads";

// Markup and classes are transcribed from hyperagent.com's sidebar
// (docs/reference/pages/threads-new.html). Keep the class strings verbatim;
// they are the source of the pixel match.

const NAV_ITEM =
  "flex w-full cursor-pointer items-center gap-2 overflow-hidden rounded-[8px] transition-all duration-200 ease-out px-3.5 py-1.5 text-sm";

function NavLink({
  href,
  icon: Icon,
  label,
  active,
  muted,
  trailing,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active?: boolean;
  muted?: boolean;
  trailing?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        NAV_ITEM,
        active
          ? "bg-primary/10 text-foreground"
          : muted
            ? "text-muted-foreground hover:bg-accent hover:text-foreground"
            : "text-foreground hover:bg-accent",
      )}
    >
      <div className="flex shrink-0 items-center justify-center h-5 w-5">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <span className="whitespace-nowrap transition-opacity duration-200 flex-1 text-left">
        {label}
      </span>
      {trailing}
    </Link>
  );
}

function SectionHeader({
  label,
  expanded,
  onToggle,
  action,
  ariaLabel,
}: {
  label: string;
  expanded?: boolean;
  onToggle?: () => void;
  action?: React.ReactNode;
  ariaLabel?: string;
}) {
  const Chevron = expanded ? ChevronDown : ChevronRight;
  return (
    <div className="group mb-1 flex items-center gap-1 font-medium text-muted-foreground pr-1 text-xs">
      {onToggle ? (
        <button
          type="button"
          aria-label={ariaLabel}
          aria-expanded={expanded}
          onClick={onToggle}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-1 rounded-[6px] py-1 pl-3.5 transition-colors hover:text-foreground"
        >
          <span className="whitespace-nowrap">{label}</span>
          <div className="flex items-center justify-center">
            <Chevron className="size-3" aria-hidden="true" />
          </div>
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-1 py-1 pl-3.5">
          <span className="whitespace-nowrap">{label}</span>
        </div>
      )}
      {action}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  // Exact match, except section roots with sub-routes (/settings/*). The
  // "View all" link stays inactive on /threads/new, as on the live site.
  const isActive = (href: string) =>
    pathname === href || (href === "/settings" && pathname.startsWith("/settings/"));

  return (
    <div
      className="safe-area-top-below-banners hidden md:block"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
        marginLeft: "env(safe-area-inset-left)",
      }}
    >
      <div className="relative h-full shrink-0" style={{ width: 256 }}>
        <div className="absolute inset-0 z-30 overflow-hidden">
          <div className="h-full overflow-hidden">
            <div className="relative h-full overflow-hidden border-sidebar-border border-r bg-[#f5f5f5] dark:bg-sidebar">
              <div className="flex h-full flex-col">
                {/* Header: logo + collapse */}
                <div className="mt-1 flex shrink-0 items-center gap-2 overflow-hidden pl-[22px] h-14 pr-3">
                  <div className="relative flex min-w-0 flex-1 items-center">
                    <Link aria-label="Hyperagent home" className="flex items-center gap-2" href="/threads/new">
                      <HyperagentMark className="size-5 shrink-0 text-primary" />
                      <span className="whitespace-nowrap text-logo transition-opacity duration-200">
                        Hyperagent
                      </span>
                    </Link>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="size-6 rounded-[6px] text-muted-foreground duration-200"
                    aria-label="Hide sidebar"
                  >
                    <PanelLeftClose className="size-4" />
                  </Button>
                </div>

                <div
                  aria-hidden="true"
                  className="pointer-events-none relative z-10 -mb-6 h-6 shrink-0 bg-gradient-to-t transition-opacity duration-150 from-[#f5f5f500] to-[#f5f5f5] dark:from-sidebar-fade dark:to-sidebar opacity-0"
                />

                <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2">
                  <div>
                    <div className="space-y-0.5 mb-2">
                      <NavLink href="/threads/new" icon={SquarePen} label="New thread" active={isActive("/threads/new")} />
                      <button
                        type="button"
                        className={cn(
                          "group flex w-full cursor-pointer items-center gap-2 overflow-hidden rounded-[8px] text-foreground transition-all duration-200 ease-out hover:bg-accent px-3.5 pr-2 py-1.5 text-sm",
                        )}
                      >
                        <div className="flex shrink-0 items-center justify-center h-5 w-5">
                          <Search className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <span className="whitespace-nowrap transition-opacity duration-200 flex-1 text-left">
                          Search
                        </span>
                        <kbd className="min-w-[1.25rem] shrink-0 py-0.5 text-center text-muted-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100 px-1.5 text-xs">
                          ⌘K
                        </kbd>
                      </button>
                      <NavLink href="/inbox" icon={Inbox} label="Inbox" active={isActive("/inbox")} />
                    </div>

                    <div>
                      {/* Agents (collapsed on the live account: no agents yet) */}
                      <div className="mb-3">
                        <SectionHeader
                          label="Agents"
                          expanded={false}
                          ariaLabel="Expand agents"
                          onToggle={() => {}}
                          action={
                            <button
                              type="button"
                              aria-label="New agent"
                              className="flex cursor-pointer items-center justify-center rounded-[6px] p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[state=open]:opacity-100 opacity-0 focus-visible:opacity-100 group-hover:opacity-100 group-has-[:focus-visible]:opacity-100"
                            >
                              <Plus className="size-3.5" aria-hidden="true" />
                            </button>
                          }
                        />
                      </div>

                      {/* Recent threads */}
                      <div>
                        <SectionHeader
                          label="Recent threads"
                          expanded
                          ariaLabel="Collapse threads"
                          onToggle={() => {}}
                          action={
                            <Link
                              aria-label="New thread"
                              href="/threads/new"
                              className="flex cursor-pointer items-center justify-center rounded-[6px] p-1 text-muted-foreground opacity-0 transition-colors hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 group-has-[:focus-visible]:opacity-100"
                            >
                              <Plus className="size-3.5" aria-hidden="true" />
                            </Link>
                          }
                        />
                        <div className="space-y-0.5">
                          {recentThreads.map((thread) => {
                            const active = pathname === `/thread/${thread.id}`;
                            return (
                              <div key={thread.id}>
                                <div
                                  tabIndex={-1}
                                  className={cn(
                                    "group relative flex items-center rounded-[8px] transition-all duration-200 ease-out text-foreground",
                                    active ? "bg-primary/10" : "hover:bg-accent",
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
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-6 rounded-[6px] bg-accent dark:hover:bg-accent"
                                        aria-label={`Options for ${thread.title}`}
                                      >
                                        <Ellipsis className="size-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          <NavLink href="/threads" icon={ArrowUpRight} label="View all" muted active={isActive("/threads")} />
                        </div>
                      </div>

                      {/* Resources */}
                      <div className="mt-3">
                        <SectionHeader label="Resources" />
                        <div className="space-y-0.5">
                          <NavLink href="/teams" icon={Users} label="Teams" active={isActive("/teams")} />
                          <NavLink href="/skills" icon={Puzzle} label="Skills" active={isActive("/skills")} />
                          <NavLink href="/memories" icon={Brain} label="Memories" active={isActive("/memories")} />
                          <NavLink
                            href="/learning"
                            icon={GraduationCap}
                            label="Learning"
                            active={isActive("/learning")}
                            trailing={<ChevronRight className="size-4 shrink-0 opacity-50" aria-hidden="true" />}
                          />
                          <NavLink href="/projects" icon={FolderOpen} label="Projects" active={isActive("/projects")} />
                          <NavLink href="/library" icon={BookOpen} label="Library" active={isActive("/library")} />
                          <NavLink href="/marketplace" icon={Store} label="Marketplace" active={isActive("/marketplace")} />
                        </div>
                      </div>
                    </div>
                  </div>
                </nav>

                <div
                  aria-hidden="true"
                  className="pointer-events-none relative z-10 -mt-6 h-6 shrink-0 bg-gradient-to-b transition-opacity duration-150 from-[#f5f5f500] to-[#f5f5f5] dark:from-sidebar-fade dark:to-sidebar opacity-0"
                />

                {/* Account */}
                <div className="shrink-0 space-y-0.5 p-2">
                  <div className="[&_button]:!h-auto [&_button]:font-normal [&_button]:text-foreground [&_button]:hover:text-foreground space-y-0.5">
                    <div>
                      <button
                        type="button"
                        className="inline-flex shrink-0 items-center whitespace-nowrap font-medium font-ui outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 dark:hover:bg-accent/50 h-auto w-full cursor-pointer justify-start gap-2 overflow-hidden rounded-[8px] px-2 text-muted-foreground hover:bg-accent hover:text-foreground has-[>svg]:px-2 py-1.5 text-sm"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          alt=""
                          width={32}
                          height={32}
                          className="shrink-0 object-cover rounded-full size-8 text-sm"
                          src={currentUser.avatarUrl}
                        />
                        <div className="flex min-w-0 flex-1 flex-col text-left transition-opacity duration-200">
                          <span className="truncate font-medium text-foreground text-xs leading-4">{currentUser.name}</span>
                          <span className="truncate text-muted-foreground text-xs leading-4">{currentUser.email}</span>
                        </div>
                        <ChevronRight className="size-4 shrink-0 opacity-50 transition-opacity duration-200" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resize handle */}
              <div
                className="group absolute inset-y-0 z-40 flex w-5 cursor-col-resize touch-none items-center justify-center"
                style={{ right: -10 }}
              >
                <div className="h-8 w-[3px] rounded-full transition-colors bg-transparent group-hover:bg-muted-foreground/25" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
