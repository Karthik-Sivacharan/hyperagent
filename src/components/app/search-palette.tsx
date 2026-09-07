"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconActivity,
  IconAppWindow,
  IconBook,
  IconRobot,
  IconBrain,
  IconClipboardCheck,
  IconFiles,
  IconFolderOpen,
  IconSchool,
  IconInbox,
  IconMessage,
  IconMessages,
  IconPlug,
  IconPuzzle,
  IconBuildingStore,
  IconUsers,
  IconSchema,
  type TablerIcon,
} from "@tabler/icons-react";
import { CommandDialog, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { recentThreads } from "@/lib/mock/threads";

// The ⌘K search palette from hyperagent.com (docs/reference/overlays/search.html):
// a cmdk dialog listing recent threads ("Past week") and a "Go to" group of
// routes. Only local state; selecting navigates when the route exists here.

const KBD =
  "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-sm px-1 font-mono text-[10px] bg-tint-10 text-muted-foreground leading-none";
const FOOTER_KBD =
  "inline-flex h-[18px] items-center justify-center rounded-sm bg-tint-10 px-1 font-mono text-[9px]";

type GoTo = { value: string; label: string; icon: TablerIcon; href?: string };

const GO_TO: GoTo[] = [
  { value: "projects", label: "Projects", icon: IconFolderOpen, href: "/projects" },
  { value: "threads", label: "Threads", icon: IconMessage, href: "/threads" },
  { value: "inbox", label: "Inbox", icon: IconInbox, href: "/inbox" },
  { value: "agents", label: "Agents", icon: IconRobot, href: "/agents" },
  { value: "command-center", label: "Command Center", icon: IconActivity },
  { value: "teams", label: "Teams", icon: IconUsers, href: "/teams" },
  { value: "skills", label: "Skills", icon: IconPuzzle, href: "/skills" },
  { value: "memories", label: "Memories", icon: IconBrain, href: "/memories" },
  { value: "documents", label: "Documents", icon: IconFiles },
  { value: "rubrics", label: "Rubrics", icon: IconClipboardCheck },
  { value: "hyperapps", label: "HyperApps", icon: IconAppWindow },
  { value: "workflows", label: "Workflows", icon: IconSchema },
  { value: "library", label: "Library", icon: IconBook, href: "/library" },
  { value: "learning", label: "Learning", icon: IconSchool, href: "/learning" },
  { value: "marketplace", label: "Marketplace", icon: IconBuildingStore, href: "/marketplace" },
  { value: "integrations", label: "Integrations", icon: IconPlug, href: "/settings/integrations" },
];

export function SearchPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [modifier, setModifier] = useState<"idle" | "held">("idle");

  // ⌘K / Ctrl+K toggles the palette from anywhere in the app.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  // The site swaps the row hints ("open" -> "open in new tab") while ⌘ is held.
  useEffect(() => {
    if (!open) return;
    const down = (e: KeyboardEvent) => (e.metaKey || e.ctrlKey) && setModifier("held");
    const up = (e: KeyboardEvent) => !(e.metaKey || e.ctrlKey) && setModifier("idle");
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      setModifier("idle");
    };
  }, [open]);

  const go = (href?: string) => {
    onOpenChange(false);
    if (href) router.push(href);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search"
      description="Search for a thread, agent, project, message, document, or table by name"
    >
      <div className="contents">
        <CommandInput placeholder="Search threads, agents, projects, messages, documents, or tables..." />
        <CommandList className="group/cmdk max-h-[min(60vh,24rem)]" data-modifier={modifier} aria-label="Suggestions">
          <CommandGroup heading="Past week">
            {recentThreads.map((thread) => (
              <CommandItem
                key={thread.id}
                value={thread.id}
                className="!pr-3 flex h-12 items-center gap-2 overflow-hidden rounded-xl px-2 py-1.5 group"
                data-copy-thread-id={thread.id}
                onSelect={() => go(`/thread/${thread.id}`)}
              >
                <div className="flex size-8 shrink-0 items-center justify-center">
                  <IconMessages className="size-5 text-muted-foreground" aria-hidden="true" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-foreground text-sm leading-5">{thread.title}</span>
                </div>
                <div className="ml-auto flex shrink-0 items-center">
                  <span className="text-muted-foreground text-xs leading-4 group-data-[selected=true]:hidden">
                    {thread.updatedLabel}
                  </span>
                  <div className="hidden items-center gap-2.5 text-[11px] text-muted-foreground group-data-[selected=true]:flex">
                    <span className="flex items-center gap-1.5 group-data-[modifier=held]/cmdk:hidden">
                      <kbd className={KBD}>↵</kbd>open
                    </span>
                    <span className="hidden items-center gap-1.5 group-data-[modifier=held]/cmdk:flex">
                      <span className="flex items-center gap-0.5">
                        <kbd className={KBD}>⌘</kbd>
                        <kbd className={KBD}>↵</kbd>
                      </span>
                      open in new tab
                    </span>
                    <span className="h-3 w-px bg-border-loud" aria-hidden="true" />
                    <button
                      type="button"
                      aria-label="Copy link"
                      className="flex items-center gap-1.5 rounded hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        void navigator.clipboard?.writeText(`${window.location.origin}/thread/${thread.id}`);
                      }}
                    >
                      <span className="flex items-center gap-0.5">
                        <kbd className={KBD}>⌘</kbd>
                        <kbd className={KBD}>C</kbd>
                      </span>
                      copy
                    </button>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Go to">
            {GO_TO.map(({ value, label, icon: Icon, href }) => (
              <CommandItem
                key={value}
                value={value}
                className="!pr-3 flex h-12 items-center gap-2 overflow-hidden rounded-xl px-2 py-1.5 group"
                onSelect={() => go(href)}
              >
                <div className="flex size-8 shrink-0 items-center justify-center">
                  <Icon className="text-muted-foreground size-4" aria-hidden="true" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-foreground text-sm leading-5">{label}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </div>
      <div className="flex items-center gap-3 border-t border-border-subtle bg-surface-secondary px-3 pt-1.5 pb-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <kbd className={FOOTER_KBD}>↑</kbd>
          <kbd className={FOOTER_KBD}>↓</kbd>
          <span className="ml-0.5">navigate</span>
        </span>
        <span className="flex items-center gap-1">
          <kbd className={FOOTER_KBD}>↵</kbd>
          <span className="ml-0.5">open</span>
        </span>
        <span className="flex items-center gap-1">
          <kbd className={FOOTER_KBD}>esc</kbd>
          <span className="ml-0.5">close</span>
        </span>
      </div>
    </CommandDialog>
  );
}
