"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import {
  IconCrown,
  IconMail,
  IconMoon,
  IconPencil,
  IconReceipt,
  IconSearch,
  IconSun,
  IconUsers,
  type TablerIcon,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  FlowCanvas,
  FlowControls,
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
  type FlowEdge,
  type FlowNodeHandles,
  type Node,
  type NodeProps,
  type NodeTypes,
} from "@/components/ui/flow";
import { IconTile } from "@/components/ui/icon-tile";
import { Overline } from "@/components/ui/overline";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

// The flow primitives (src/components/ui/flow.tsx) on a six-node sample org,
// the way /design/agent-stream shows its blocks: the real parts in every look
// they have. The /teams org chart composes the same parts from the fleet data;
// this page is where the parts themselves can be judged, in both themes.
//
// Static on purpose: fixed positions, pre-baked strings, nothing random.

type TeamData = { name: string; summary: string; about: string };
type AgentData = {
  name: string;
  role: string;
  icon: TablerIcon;
  spend: string;
  state: "working" | "queued" | "idle";
  status: string;
};

type SampleNode = Node<TeamData, "team"> | Node<AgentData, "agent">;

// Positions are top-left corners; every node is 240px wide (FlowNode's w-60),
// so a centre line at x = 0 puts a node at x = -120. Quill is stacked under
// Relay, 40px in, on an elbow from Relay's bottom-left corner.
const NODES: SampleNode[] = [
  {
    id: "team",
    type: "team",
    position: { x: -120, y: 0 },
    ariaLabel: "Growth Ops team",
    data: { name: "Growth Ops", summary: "3 people · 5 agents", about: "Research, outbound and finance ops for the founders." },
  },
  {
    id: "atlas",
    type: "agent",
    position: { x: -120, y: 170 },
    ariaLabel: "Atlas, Chief of staff",
    data: { name: "Atlas", role: "Chief of staff", icon: IconCrown, spend: "$41", state: "working", status: "Delegating 2 runs" },
  },
  {
    id: "scout",
    type: "agent",
    position: { x: -420, y: 340 },
    ariaLabel: "Scout, Research lead",
    data: { name: "Scout", role: "Research lead", icon: IconSearch, spend: "$18", state: "working", status: "Reading 14 competitor sites" },
  },
  {
    id: "relay",
    type: "agent",
    position: { x: -140, y: 340 },
    ariaLabel: "Relay, Outbound lead",
    data: { name: "Relay", role: "Outbound lead", icon: IconMail, spend: "$26", state: "idle", status: "Idle · 9 runs this week" },
  },
  {
    id: "ledger",
    type: "agent",
    position: { x: 180, y: 340 },
    ariaLabel: "Ledger, Finance ops lead",
    data: { name: "Ledger", role: "Finance ops lead", icon: IconReceipt, spend: "$7", state: "queued", status: "Refund triage queued" },
  },
  {
    id: "quill",
    type: "agent",
    position: { x: -100, y: 450 },
    ariaLabel: "Quill, Copywriter",
    data: { name: "Quill", role: "Copywriter", icon: IconPencil, spend: "$12", state: "idle", status: "Idle · 6 runs this week" },
  },
];

// Every edge is a reporting line; the live one is Atlas handing the weekly
// competitor digest to Scout, the queued one a run waiting on Ledger. The live
// edge shares Atlas's trunk with its siblings, so it sits one layer up. Relay
// to Quill is the elbow, out of Relay's extra source handle.
const EDGES: FlowEdge[] = [
  { id: "team-atlas", source: "team", target: "atlas" },
  { id: "atlas-scout", source: "atlas", target: "scout", type: "animated", zIndex: 1 },
  { id: "atlas-relay", source: "atlas", target: "relay" },
  { id: "atlas-ledger", source: "atlas", target: "ledger", type: "temporary" },
  { id: "relay-quill", source: "relay", target: "quill", sourceHandle: "elbow", data: { curve: "elbow" } },
];

// Where each node's lines meet it: the bus in on top and out at the bottom
// centre, Relay's elbow out of its bottom edge 24px in, Quill's in on its left.
const HANDLES: Record<string, FlowNodeHandles> = {
  team: { target: false, source: true },
  atlas: { target: true, source: true },
  scout: { target: true, source: false },
  relay: { target: true, source: false, extraSource: { id: "elbow", at: { side: "bottom", offset: 24 } } },
  ledger: { target: true, source: false },
  quill: { target: "left", source: false },
};

const STATE_DOT: Record<AgentData["state"], string> = {
  working: "bg-foreground motion-safe:animate-pulse",
  queued: "bg-foreground-low",
  idle: "bg-tint-40",
};

function TeamNode({ id, data }: NodeProps<Node<TeamData, "team">>) {
  return (
    <FlowNode handles={HANDLES[id]}>
      <FlowNodeHeader>
        <FlowNodeMedia>
          <IconTile size="lg" shape="soft" tone="raised" className="size-9">
            <IconUsers className="size-4.5" aria-hidden="true" />
          </IconTile>
        </FlowNodeMedia>
        <FlowNodeTitle>{data.name}</FlowNodeTitle>
        <FlowNodeDescription>{data.summary}</FlowNodeDescription>
      </FlowNodeHeader>
      <FlowNodeContent>{data.about}</FlowNodeContent>
    </FlowNode>
  );
}

function AgentNode({ id, data }: NodeProps<Node<AgentData, "agent">>) {
  const Icon = data.icon;
  return (
    <FlowNode handles={HANDLES[id]}>
      <FlowToolbar>
        <Button variant="ghost" size="xs">
          Profile
        </Button>
        <Button variant="ghost" size="xs">
          Runs
        </Button>
      </FlowToolbar>
      <FlowNodeHeader>
        <FlowNodeMedia>
          <IconTile size="lg" shape="circle" tone="tint" className="size-9">
            <Icon className="size-4.5" aria-hidden="true" />
          </IconTile>
        </FlowNodeMedia>
        <FlowNodeTitle>{data.name}</FlowNodeTitle>
        <FlowNodeDescription>{data.role}</FlowNodeDescription>
        <FlowNodeAction className="text-foreground-low text-label-12-mono">{data.spend}</FlowNodeAction>
      </FlowNodeHeader>
      <FlowNodeFooter>
        <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", STATE_DOT[data.state])} />
        <span className="truncate">{data.status}</span>
      </FlowNodeFooter>
    </FlowNode>
  );
}

const NODE_TYPES: NodeTypes = { team: TeamNode, agent: AgentNode };

// The three edge looks, drawn the way flow.tsx draws them.
const LEGEND = [
  { label: "Reports to", stroke: "var(--flow-edge)", dash: undefined },
  { label: "Delegating now", stroke: "var(--foreground-low)", dash: "4 4" },
  { label: "Queued", stroke: "var(--flow-edge)", dash: "4 4" },
] as const;

function Legend() {
  return (
    <FlowPanel position="top-left" className="px-3 py-2.5">
      <ul className="flex flex-col gap-1.5 text-muted-foreground text-xs">
        {LEGEND.map((row) => (
          <li key={row.label} className="flex items-center gap-2">
            <svg width="24" height="4" viewBox="0 0 24 4" aria-hidden="true" className="shrink-0">
              <line x1="0" y1="2" x2="24" y2="2" stroke={row.stroke} strokeWidth={1} strokeDasharray={row.dash} />
            </svg>
            {row.label}
          </li>
        ))}
      </ul>
    </FlowPanel>
  );
}

const subscribeNever = () => () => {};

// The app theme (next-themes on <html>, the same switch as the account menu),
// so the canvas is judged in the mapping it will ship in, not a local one.
function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

  return (
    <ToggleGroup
      type="single"
      spacing={0}
      aria-label="Theme"
      // "" (nothing pressed) until mounted, so the group is controlled from
      // its first render.
      value={mounted ? (resolvedTheme ?? "") : ""}
      onValueChange={(value) => value && setTheme(value)}
    >
      <ToggleGroupItem value="light" className="gap-1.5">
        <IconSun aria-hidden="true" />
        Light
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" className="gap-1.5">
        <IconMoon aria-hidden="true" />
        Dark
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

export default function FlowDesignPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-8 py-12">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Overline>Primitives · flow</Overline>
            <h1 className="font-heading text-2xl">Flow canvas</h1>
            <p className="max-w-content text-muted-foreground text-sm">
              The parts in src/components/ui/flow.tsx on a six-node sample org: a static, a live and a
              queued edge on the bus, an elbow into a stacked report, a panel, the zoom controls and a
              node toolbar. Drag or two-finger scroll to pan, ⌘ or Ctrl with scroll (or a pinch) to
              zoom, Tab to walk the nodes, click one to select it.
            </p>
          </div>
          <ThemeSwitch />
        </header>

        <div className="h-[600px] overflow-hidden rounded-3xl shadow-card">
          <FlowCanvas<SampleNode, FlowEdge> defaultNodes={NODES} defaultEdges={EDGES} nodeTypes={NODE_TYPES}>
            <Legend />
            <FlowControls />
          </FlowCanvas>
        </div>
      </div>
    </div>
  );
}
