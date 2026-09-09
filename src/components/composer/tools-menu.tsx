"use client";

import * as React from "react";
import {
  IconAppWindow,
  IconBook,
  IconCheck,
  IconDeviceDesktop,
  IconFileText,
  IconHistory,
  IconLayoutGrid,
  IconLink,
  IconMapPin,
  IconMessageCircle,
  IconMicrophone,
  IconPhoto,
  IconPresentation,
  IconSearch,
  IconTable,
  IconUser,
  IconVideo,
  IconVolume,
  IconWorld,
  type TablerIcon,
} from "@tabler/icons-react";

import {
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Overline } from "@/components/ui/overline";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// The Tools panel of the composer's thread-settings menu
// (docs/reference/overlays/composer-thread-settings-tools.html).
//
// The live site paints each tool a different pastel and uses that fill as the
// only on/off signal, so colour reads as a taxonomy it does not carry (nine
// fills over seventeen tools: Audio shares Search's blue, Maps shares
// Browser's green) and the resting state of the panel is its loudest. The
// chips are also plain buttons inside a `role="menu"`, so nothing reaches them
// from the keyboard and no `aria-checked` reaches a screen reader.
//
// These three panels are one answer each to that brief. All three share the
// fix: state is carried by fill plus text tier plus a check, never by hue;
// every tool is a `menuitemcheckbox` in the menu's roving focus; the group
// headers are real `DropdownMenuGroup` labels; descriptions are on the surface
// rather than behind a hover tooltip.

export type ToolGroup = "Research" | "Browser" | "Data" | "Interactive" | "Media";

export type Tool = {
  id: string;
  name: string;
  description: string;
  icon: TablerIcon;
  group: ToolGroup;
};

export const TOOL_GROUPS: ToolGroup[] = ["Research", "Browser", "Data", "Interactive", "Media"];

export const TOOLS: Tool[] = [
  { id: "search", name: "Search", description: "Web search across the open internet.", icon: IconSearch, group: "Research" },
  { id: "find-similar", name: "Find Similar", description: "Find pages like a URL you give it.", icon: IconLink, group: "Research" },
  { id: "exa-answer", name: "Exa Answer", description: "One sourced answer to a direct question.", icon: IconMessageCircle, group: "Research" },
  { id: "exa-research", name: "Exa Research", description: "Multi-step research across many sources.", icon: IconBook, group: "Research" },
  { id: "exa-websets", name: "Exa Websets", description: "Build a structured set of companies or people.", icon: IconLayoutGrid, group: "Research" },
  { id: "thread-search", name: "Thread Search", description: "Search your own past threads.", icon: IconHistory, group: "Research" },
  { id: "browser", name: "Browser", description: "Drive a real browser to click, type and read.", icon: IconDeviceDesktop, group: "Browser" },
  { id: "tables", name: "Tables", description: "Read and write structured tables.", icon: IconTable, group: "Data" },
  { id: "documents", name: "Documents", description: "Draft and edit long-form documents.", icon: IconFileText, group: "Data" },
  { id: "webpages", name: "Webpages", description: "Build and publish a working web page.", icon: IconWorld, group: "Interactive" },
  { id: "slides", name: "Slides", description: "Build a slide deck.", icon: IconPresentation, group: "Interactive" },
  { id: "hyperapps", name: "HyperApps", description: "Build a small interactive app.", icon: IconAppWindow, group: "Interactive" },
  { id: "images", name: "Images", description: "Generate and edit images.", icon: IconPhoto, group: "Media" },
  { id: "video", name: "Video", description: "Generate video clips.", icon: IconVideo, group: "Media" },
  { id: "audio", name: "Audio", description: "Generate speech and sound.", icon: IconVolume, group: "Media" },
  { id: "transcribe", name: "Transcribe", description: "Turn audio and video into text.", icon: IconMicrophone, group: "Media" },
  { id: "avatar", name: "Avatar", description: "Generate a presenter avatar.", icon: IconUser, group: "Media" },
  { id: "maps", name: "Maps", description: "Look up places, routes and geography.", icon: IconMapPin, group: "Media" },
];

const SEARCH_PROVIDERS = ["Standard", "Exa"] as const;
export type SearchProvider = (typeof SEARCH_PROVIDERS)[number];

// The live default: everything on but HyperApps, which is what makes the pill
// read 17.
const DEFAULT_OFF = new Set(["hyperapps"]);

export type ToolsState = ReturnType<typeof useTools>;

export function useTools() {
  const [enabled, setEnabled] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(TOOLS.map((t) => [t.id, !DEFAULT_OFF.has(t.id)])),
  );
  const [provider, setProvider] = React.useState<SearchProvider>("Exa");

  const count = TOOLS.reduce((n, t) => n + (enabled[t.id] ? 1 : 0), 0);

  const toggle = React.useCallback((id: string, on: boolean) => {
    setEnabled((prev) => ({ ...prev, [id]: on }));
  }, []);

  const setMany = React.useCallback((ids: string[]) => {
    const next = new Set(ids);
    setEnabled(Object.fromEntries(TOOLS.map((t) => [t.id, next.has(t.id)])));
  }, []);

  return { enabled, toggle, setMany, count, total: TOOLS.length, provider, setProvider };
}

/* ---------------------------------------------------------------- shared -- */

// The count is the one number in the panel that changes as you work, so it is
// tabular: the row must not reflow between 9 and 10.
function PanelHeader({ count, total, children }: { count: number; total: number; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 px-2 pt-1 pb-1.5">
      <Overline>Tools</Overline>
      <span className="text-foreground-low text-xs tabular-nums">
        {count} of {total} on
      </span>
      {children}
    </div>
  );
}

// One menu item, so the bulk action sits in the same roving focus as the tools
// instead of being a button the keyboard cannot reach.
function BulkAction({ state }: { state: ToolsState }) {
  const allOn = state.count === state.total;
  return (
    <DropdownMenuItem
      className="text-muted-foreground text-xs"
      onSelect={(e) => {
        e.preventDefault();
        state.setMany(allOn ? [] : TOOLS.map((t) => t.id));
      }}
    >
      <IconCheck className="size-3.5" aria-hidden="true" />
      {allOn ? "Turn all off" : "Turn all on"}
    </DropdownMenuItem>
  );
}

function GroupLabel({ group }: { group: ToolGroup }) {
  return (
    <DropdownMenuLabel asChild>
      <Overline className="px-2 pt-2 pb-1">{group}</Overline>
    </DropdownMenuLabel>
  );
}

// The provider belongs to Search and to nothing else, so it sits under the
// Search row rather than floating beside it as a second control of its own:
// indented in the roster, on its own full-width line in the grid, and named
// for its owner in both.
function SearchProviderRow({ state, className, label = "Provider" }: { state: ToolsState; className?: string; label?: string }) {
  if (!state.enabled.search) return null;
  return (
    <div className={cn("flex items-center gap-1.5 pt-0.5 pb-1", className)}>
      <span className="text-foreground-low text-xs">{label}</span>
      <DropdownMenuRadioGroup
        className="flex items-center gap-1"
        value={state.provider}
        onValueChange={(v) => state.setProvider(v as SearchProvider)}
      >
        {SEARCH_PROVIDERS.map((p) => (
          <DropdownMenuRadioItem
            key={p}
            value={p}
            indicator="none"
            className="h-6 rounded-full px-2 text-xs data-[state=checked]:bg-tint-15 data-[state=checked]:font-medium data-[state=checked]:text-foreground text-foreground-low"
            onSelect={(e) => e.preventDefault()}
          >
            {p}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </div>
  );
}

/* ------------------------------------------------------- A · the roster --- */

function RosterRow({ tool, state }: { tool: Tool; state: ToolsState }) {
  const Icon = tool.icon;
  const on = !!state.enabled[tool.id];
  return (
    <DropdownMenuCheckboxItem
      indicator="none"
      checked={on}
      onCheckedChange={(v) => state.toggle(tool.id, !!v)}
      onSelect={(e) => e.preventDefault()}
      className="items-start gap-2.5 px-2 py-2"
    >
      <Icon className={cn("mt-0.5 size-4", on ? "text-foreground" : "text-foreground-low")} aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-sm leading-5", on ? "text-foreground" : "text-muted-foreground")}>{tool.name}</span>
        <span className="block text-xs leading-4 text-foreground-low">{tool.description}</span>
      </span>
      {/* The row is the control (role=menuitemcheckbox, aria-checked); the
          switch is its picture, so it is hidden from the accessibility tree. */}
      <Switch size="sm" checked={on} tabIndex={-1} aria-hidden="true" className="pointer-events-none mt-0.5" />
    </DropdownMenuCheckboxItem>
  );
}

export function ToolsRosterPanel({ state }: { state: ToolsState }) {
  return (
    <>
      <PanelHeader count={state.count} total={state.total} />
      <BulkAction state={state} />
      <DropdownMenuSeparator />
      {TOOL_GROUPS.map((group) => {
        const tools = TOOLS.filter((t) => t.group === group);
        return (
          <DropdownMenuGroup key={group}>
            <GroupLabel group={group} />
            {tools.map((tool) => (
              <React.Fragment key={tool.id}>
                <RosterRow tool={tool} state={state} />
                {tool.id === "search" ? <SearchProviderRow state={state} className="pl-9" /> : null}
              </React.Fragment>
            ))}
          </DropdownMenuGroup>
        );
      })}
    </>
  );
}

/* -------------------------------------------------------- B · the chips --- */

// Fill, text tier and a check all move together, so the on-state survives a
// greyscale print and a colour-blind reader. Off is the outline, which is the
// quiet one, because 17 of 18 on is the resting state of this panel.
const CHIP =
  "h-7 w-fit shrink-0 gap-1.5 rounded-full px-2.5 text-xs transition-[color,background-color,box-shadow] duration-(--duration-instant) ease-out " +
  "data-[state=unchecked]:text-foreground-low data-[state=unchecked]:shadow-edge " +
  "data-[state=checked]:bg-tint-15 data-[state=checked]:font-medium data-[state=checked]:text-foreground";

function ToolChip({ tool, state }: { tool: Tool; state: ToolsState }) {
  const Icon = tool.icon;
  const on = !!state.enabled[tool.id];
  return (
    <DropdownMenuCheckboxItem
      indicator="none"
      checked={on}
      onCheckedChange={(v) => state.toggle(tool.id, !!v)}
      onSelect={(e) => e.preventDefault()}
      className={CHIP}
      title={tool.description}
    >
      <Icon className="size-3.5 text-current" aria-hidden="true" />
      {tool.name}
      {on ? <IconCheck className="size-3 text-current" aria-hidden="true" /> : null}
    </DropdownMenuCheckboxItem>
  );
}

function ChipGrid({ state }: { state: ToolsState }) {
  return (
    <>
      {TOOL_GROUPS.map((group) => (
        <DropdownMenuGroup key={group}>
          <GroupLabel group={group} />
          <div className="flex flex-wrap items-center gap-1.5 px-1 pb-1">
            {TOOLS.filter((t) => t.group === group).map((tool) => (
              <React.Fragment key={tool.id}>
                <ToolChip tool={tool} state={state} />
                {tool.id === "search" ? <SearchProviderRow state={state} className="basis-full pl-1.5" label="Search provider" /> : null}
              </React.Fragment>
            ))}
          </div>
        </DropdownMenuGroup>
      ))}
    </>
  );
}

export function ToolsChipsPanel({ state }: { state: ToolsState }) {
  return (
    <>
      <PanelHeader count={state.count} total={state.total} />
      <BulkAction state={state} />
      <DropdownMenuSeparator />
      <ChipGrid state={state} />
    </>
  );
}

/* ------------------------------------------------------ C · the presets --- */

// Nobody sets eighteen switches by hand; the 17-of-18 default says people want
// a mode. The presets are the fast path and the grid stays for the override,
// which flips the label to Custom.
const PRESETS: { id: string; label: string; ids: string[] }[] = [
  { id: "all", label: "Everything", ids: TOOLS.map((t) => t.id) },
  { id: "research", label: "Research", ids: TOOLS.filter((t) => t.group === "Research" || t.group === "Browser").map((t) => t.id) },
  { id: "make", label: "Make", ids: TOOLS.filter((t) => t.group === "Interactive" || t.group === "Media").map((t) => t.id) },
  { id: "none", label: "None", ids: [] },
];

function activePreset(enabled: Record<string, boolean>) {
  const on = TOOLS.filter((t) => enabled[t.id])
    .map((t) => t.id)
    .sort()
    .join(",");
  return PRESETS.find((p) => [...p.ids].sort().join(",") === on)?.id ?? "custom";
}

export function ToolsPresetPanel({ state }: { state: ToolsState }) {
  const active = activePreset(state.enabled);
  const label = PRESETS.find((p) => p.id === active)?.label ?? "Custom";

  return (
    <>
      <div className="flex items-center justify-between gap-2 px-2 pt-1 pb-1.5">
        <Overline>Tools</Overline>
        <span className="text-foreground-low text-xs tabular-nums">
          {label} · {state.count} of {state.total} on
        </span>
      </div>
      <DropdownMenuRadioGroup
        className="flex flex-wrap items-center gap-1.5 px-1 pb-1.5"
        value={active}
        onValueChange={(v) => state.setMany(PRESETS.find((p) => p.id === v)?.ids ?? [])}
      >
        {PRESETS.map((p) => (
          <DropdownMenuRadioItem
            key={p.id}
            value={p.id}
            indicator="none"
            className={CHIP}
            onSelect={(e) => e.preventDefault()}
          >
            {p.label}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
      <DropdownMenuSeparator />
      <ChipGrid state={state} />
    </>
  );
}

/* ------------------------------------------------------------- exports --- */

export const TOOLS_VARIANTS = {
  roster: { label: "Roster", panel: ToolsRosterPanel, width: "w-88" },
  chips: { label: "Chips", panel: ToolsChipsPanel, width: "w-80" },
  presets: { label: "Presets", panel: ToolsPresetPanel, width: "w-80" },
} as const;

export type ToolsVariant = keyof typeof TOOLS_VARIANTS;
