import {
  IconBookmark,
  IconBuilding,
  IconBuildingSkyscraper,
  IconBulb,
  IconCalendarEvent,
  IconCircleCheck,
  IconFileText,
  IconGavel,
  IconHeart,
  IconMapPin,
  IconMessage,
  IconPackage,
  IconRobotFace,
  IconRoute,
  IconSchool,
  IconServer2,
  IconTargetArrow,
  IconUser,
  IconUsers,
  type TablerIcon,
} from "@tabler/icons-react";
import type { WikiGroupId } from "@/lib/mock/wiki";

// How the wiki draws what kind of thing a Topic, an atom or a source is: one
// icon per kind, and for Topic groups one of the six categorical chart
// tokens. Eleven groups share six colours, so the icon is what tells two
// groups on one colour apart. Presentation only: every label and order comes
// from the store, through the server. This module imports no data, so a
// client component can read it without pulling the store into the browser
// (wiki.test.ts holds the wiki components to that).

type GroupMeta = {
  icon: TablerIcon;
  /** The dot, as a background. */
  dot: string;
  /** The icon, as a text colour. */
  text: string;
  /** The chip's ground: the group's hue at 10%. */
  tint: string;
  /** The step a chip takes on hover, when the chip is a link. */
  tintHover: string;
  /** A label set on the tint in the group's own hue: the ramp's text-safe step, not the chart token. */
  label: string;
};

// Why eleven category hues are allowed a fill here. What kind of thing a
// Topic is is the first thing you read off a chip that stands on its own, in
// the header or under "Linked from", so the hue has to carry from the corner
// of the eye rather than wait to be found inside a 14px glyph. It is a 10%
// tint and never a solid, and a chip that takes one drops its outline
// hairline so it still reads as one box. On those chips the label stays ink
// and only the icon wears the hue, so a 10% tangerine ground stays a wash,
// not an action. The right rail's Mentions skip the tint altogether: each set
// sits under a label naming its type (TopicChip's `tone`).
//
// The body's first mention of a Topic colours its label as well, the way the
// signup flow's identity chips do, and that label cannot be the chart token:
// chart-1 is the tangerine, which fails AA as text (2.9:1 on its own tint).
// So `label` is each ramp's text-safe step. In light that is 700, the step
// the tangerine already uses for brand text on a tint, and on a 10% ground
// over paper it holds 5.0 to 5.8:1 at rest and 4.7 or better on hover. In
// dark the ramp runs the other way and 400 is the readable step, the one the
// chart tokens already lift to, at 6.3 to 6.9:1 on the canvas.
//
// Written out per token rather than composed from a `chart-${n}` string,
// because Tailwind only sees class names it can read whole in the source.
const HUE = {
  1: {
    dot: "bg-chart-1",
    text: "text-chart-1",
    tint: "bg-chart-1/10",
    tintHover: "[a]:hover:bg-chart-1/15",
    label: "text-tangerine-700 dark:text-tangerine-400",
  },
  2: {
    dot: "bg-chart-2",
    text: "text-chart-2",
    tint: "bg-chart-2/10",
    tintHover: "[a]:hover:bg-chart-2/15",
    label: "text-neutral-700 dark:text-neutral-400",
  },
  3: {
    dot: "bg-chart-3",
    text: "text-chart-3",
    tint: "bg-chart-3/10",
    tintHover: "[a]:hover:bg-chart-3/15",
    label: "text-blue-700 dark:text-blue-400",
  },
  4: {
    dot: "bg-chart-4",
    text: "text-chart-4",
    tint: "bg-chart-4/10",
    tintHover: "[a]:hover:bg-chart-4/15",
    label: "text-green-700 dark:text-green-400",
  },
  5: {
    dot: "bg-chart-5",
    text: "text-chart-5",
    tint: "bg-chart-5/10",
    tintHover: "[a]:hover:bg-chart-5/15",
    label: "text-amber-700 dark:text-amber-400",
  },
  6: {
    dot: "bg-chart-6",
    text: "text-chart-6",
    tint: "bg-chart-6/10",
    tintHover: "[a]:hover:bg-chart-6/15",
    label: "text-red-700 dark:text-red-400",
  },
} as const;

const GROUPS: Record<WikiGroupId, GroupMeta> = {
  workspace: { icon: IconBuilding, ...HUE[2] },
  person: { icon: IconUser, ...HUE[3] },
  agent: { icon: IconRobotFace, ...HUE[1] },
  organization: { icon: IconBuildingSkyscraper, ...HUE[4] },
  team: { icon: IconUsers, ...HUE[4] },
  project: { icon: IconTargetArrow, ...HUE[5] },
  system: { icon: IconServer2, ...HUE[6] },
  process: { icon: IconRoute, ...HUE[4] },
  location: { icon: IconMapPin, ...HUE[3] },
  product: { icon: IconPackage, ...HUE[6] },
  concept: { icon: IconBulb, ...HUE[2] },
};

/** The Topic groups this module draws; wiki.test.ts checks it against the store's own list. */
export const WIKI_DRAWN_GROUPS = Object.keys(GROUPS);

export const wikiGroupMeta = (id: WikiGroupId): GroupMeta => GROUPS[id] ?? GROUPS.concept;

/** The dot colour per Topic group. Six categorical chart tokens, light and dark (docs/brand/design.md §15). */
export const wikiGroupDot: Record<WikiGroupId, string> = Object.fromEntries(
  Object.entries(GROUPS).map(([id, meta]) => [id, meta.dot]),
);

/** Atom types, in the order a page's sources list them: standing rules first, one-off events last. */
const ATOM_TYPES: Record<string, TablerIcon> = {
  rule: IconGavel,
  fact: IconCircleCheck,
  preference: IconHeart,
  lesson: IconSchool,
  episode: IconCalendarEvent,
};

export const WIKI_ATOM_TYPE_ORDER = Object.keys(ATOM_TYPES);

export const wikiAtomTypeIcon = (type: string): TablerIcon => ATOM_TYPES[type] ?? IconCircleCheck;

/** Where an atom was extracted from; the drawer uses the same three icons. */
const SOURCE_KINDS: Record<string, TablerIcon> = {
  thread: IconMessage,
  document: IconFileText,
  memory: IconBookmark,
};

export const WIKI_SOURCE_KIND_ORDER = Object.keys(SOURCE_KINDS);

export const wikiSourceKindIcon = (kind: string): TablerIcon => SOURCE_KINDS[kind] ?? IconFileText;

/**
 * Each assistant's face: a shape from the agent glyph registry
 * (src/components/brand/agent-glyph), keyed by the roster's id. Every
 * assistant keeps one face wherever the wiki shows it; the shapes are only
 * distinct, picked for a loose fit with the job, not a code a reader has to
 * learn. The copy of an assistant wears the original's face, since its name
 * already says which it is. The workspace has no face and no entry here, so
 * an id without one is drawn as the workspace (wiki.test.ts checks every
 * assistant in the store has a face).
 */
const AGENT_GLYPHS: Record<string, string> = {
  "ag-ops": "cog",
  "ag-sales": "bell",
  "ag-finance": "hourglass",
  "ag-support": "trefoil",
  "ag-servicedesk": "plug-arrow",
  "ag-quality": "pedestal",
  "ag-purchasing": "slot-stack",
  "ag-purchasing-copy": "slot-stack",
  "ag-dispatch": "sweep",
  "ag-rollout-gate": "portal",
};

export const wikiAgentGlyph = (id: string): string | undefined => AGENT_GLYPHS[id];
