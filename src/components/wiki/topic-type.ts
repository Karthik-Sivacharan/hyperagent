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
};

const GROUPS: Record<WikiGroupId, GroupMeta> = {
  workspace: { icon: IconBuilding, dot: "bg-chart-2", text: "text-chart-2" },
  person: { icon: IconUser, dot: "bg-chart-3", text: "text-chart-3" },
  agent: { icon: IconRobotFace, dot: "bg-chart-1", text: "text-chart-1" },
  organization: { icon: IconBuildingSkyscraper, dot: "bg-chart-4", text: "text-chart-4" },
  team: { icon: IconUsers, dot: "bg-chart-4", text: "text-chart-4" },
  project: { icon: IconTargetArrow, dot: "bg-chart-5", text: "text-chart-5" },
  system: { icon: IconServer2, dot: "bg-chart-6", text: "text-chart-6" },
  process: { icon: IconRoute, dot: "bg-chart-4", text: "text-chart-4" },
  location: { icon: IconMapPin, dot: "bg-chart-3", text: "text-chart-3" },
  product: { icon: IconPackage, dot: "bg-chart-6", text: "text-chart-6" },
  concept: { icon: IconBulb, dot: "bg-chart-2", text: "text-chart-2" },
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
