"use client";

import {
  Brain,
  FileText,
  Files,
  FolderOpen,
  Globe,
  Image,
  MapPin,
  Paperclip,
  Plus,
  Presentation,
  Puzzle,
  Search,
  Shapes,
  Table,
  Video,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";

// The composer's "+" menu (docs/reference/overlays/composer-add-menu*.html):
// Upload files, then Skills / Memories / Assets pickers, Output as..., and Add
// to a project. Skills and Output as... are transcribed from captures; the
// Memories and Assets panels mirror the Skills panel (the live ones were not
// captured) and Add to a project mirrors the thread menu's Move to project.

const SKILLS = [
  "advanced-image-techniques",
  "website-to-hyperframes",
  "video-prompting",
  "video-continuation-patterns",
  "remotion-to-hyperframes",
  "hyperframes-registry",
  "hyperframes-cli",
  "hyperframes",
  "gsap",
  "context-builder",
  "connection-setup-wizard",
  "xlsx",
  "pptx",
  "pdf",
  "docx",
];

const OUTPUTS: { label: string; icon: LucideIcon }[] = [
  { label: "Image", icon: Image },
  { label: "Video", icon: Video },
  { label: "Audio", icon: Volume2 },
  { label: "Webpage", icon: Globe },
  { label: "Slides", icon: Presentation },
  { label: "Table", icon: Table },
  { label: "Map", icon: MapPin },
  { label: "Doc", icon: FileText },
];

/** Searchable list panel (w-[300px] p-0) used by the Skills / Memories / Assets subs. */
function PickerPanel({
  placeholder,
  icon: Icon,
  items,
  empty,
}: {
  placeholder: string;
  icon: LucideIcon;
  items: string[];
  empty: string;
}) {
  return (
    <DropdownMenuSubContent className="w-[300px] p-0">
      <div className="flex w-full flex-col overflow-hidden p-1">
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            placeholder={placeholder}
            className="h-5 w-full bg-transparent text-[13px] text-foreground outline-none placeholder:text-foreground-low"
            type="text"
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
        <div className="mx-2 my-1 h-px bg-border-subtle" />
        <div className="max-h-[280px] overflow-y-auto">
          {items.length === 0 && <div className="px-2 py-1.5 text-muted-foreground text-sm">{empty}</div>}
          {items.map((name) => (
            <Tooltip key={name}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="flex w-full min-w-0 cursor-pointer items-center gap-2 overflow-hidden rounded-md px-2 py-1.5 text-left transition-colors duration-(--duration-instant) hover:bg-tint-10"
                >
                  <div className="flex size-5 shrink-0 items-center justify-center">
                    <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <span className="min-w-0 truncate font-medium text-popover-foreground text-sm">{name}</span>
                </button>
              </TooltipTrigger>
            </Tooltip>
          ))}
        </div>
      </div>
    </DropdownMenuSubContent>
  );
}

// Rest props are the ones an enclosing TooltipTrigger slot injects; forwarding
// them keeps the tooltip working and yields data-slot="tooltip-trigger" as on
// the live button.
export function AddMenu({ children, ...triggerProps }: React.ComponentProps<typeof DropdownMenuTrigger>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild {...triggerProps}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[calc(100vw-2rem)] max-w-[300px] p-1">
        <DropdownMenuItem className="gap-2">
          <Paperclip className="size-4" aria-hidden="true" />
          <span className="text-sm">Upload files...</span>
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            <Puzzle className="size-4" aria-hidden="true" />
            <span className="flex-1 text-sm">Skills</span>
          </DropdownMenuSubTrigger>
          <PickerPanel placeholder="Search skills" icon={Puzzle} items={SKILLS} empty="No skills yet" />
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            <Brain className="size-4" aria-hidden="true" />
            <span className="flex-1 text-sm">Memories</span>
          </DropdownMenuSubTrigger>
          <PickerPanel placeholder="Search memories" icon={Brain} items={[]} empty="No memories yet" />
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            <Files className="size-4" aria-hidden="true" />
            <span className="flex-1 text-sm">Assets</span>
          </DropdownMenuSubTrigger>
          <PickerPanel placeholder="Search assets" icon={Files} items={[]} empty="No assets yet" />
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            <Shapes className="size-4" aria-hidden="true" />
            <span className="flex-1 text-sm">Output as...</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-[200px] p-1">
            {OUTPUTS.map(({ label, icon: Icon }) => (
              <DropdownMenuItem key={label} className="gap-2">
                <Icon className="size-4" aria-hidden="true" />
                <span className="text-sm">{label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            <FolderOpen className="size-4" aria-hidden="true" />
            <span className="flex-1 text-sm">Add to a project</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem disabled>No projects yet</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem data-drawer-keep-open="true">
              <Plus className="size-4" aria-hidden="true" />
              Create new project…
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
