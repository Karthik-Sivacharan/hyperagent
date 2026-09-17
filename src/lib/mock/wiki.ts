import data from "./wiki-data.json";

// The workspace wiki: knowledge a dreaming job composed from a fortnight of
// threads, documents and saved memories over a synthetic supply-company
// workspace. Ported from a local prototype; every value here is static mock
// data (docs/clone-conventions.md rule 2), trimmed to what the pages render:
// workspace-shared pages, the topics they sit on, and the atoms they cite.

export type WikiGroupId = string;

export type WikiSource = {
  kind: "thread" | "document" | "memory" | string;
  label: string;
  ref: string;
  title: string;
  meta: string;
  excerpt: string;
};

export type WikiAtom = {
  id: string;
  title: string;
  content: string;
  type: "fact" | "preference" | "rule" | "episode" | "lesson" | string;
  status: "current" | "superseded" | "invalidated" | "retracted" | string;
  statusLabel: string;
  tagged: boolean;
  withheld: string[];
  appliesWhen: string;
  validFrom: string | null;
  validTo: string | null;
  invalidatedAt: string | null;
  supersededById: string | null;
  supersedesIds: string[];
  mergedFromIds: string[];
  userAuthored: boolean;
  extractionGroup: string;
  namedAgent: string | null;
  dreamRunId: string | null;
  topicIds: string[];
  conflictWith: string[];
  sources: WikiSource[];
  citedBy: { slug: string; title: string }[];
};

export type WikiPageVersion = {
  version: number;
  createdAt: string | null;
  sourceDay: string | null;
  dreamRunId: string | null;
  changeNote: string;
  changeNotes: string[];
  changeNoteCount: number;
  addedAtomIds: string[];
  removedAtomIds: string[];
};

export type WikiLinkTarget = { title: string; slug: string | null };

export type WikiPage = {
  links: Record<string, WikiLinkTarget>;
  slug: string;
  title: string;
  topicId: string;
  group: WikiGroupId;
  summary: string;
  content: string;
  citations: string[];
  updatedAt: string | null;
  dreamRunId: string | null;
  /** Its Topic was merged or excluded: out of listings, search and recall, kept as history. */
  hidden: boolean;
  versions: WikiPageVersion[];
};

export type WikiTopic = {
  id: string;
  title: string;
  description: string;
  type: string;
  subtype: string | null;
  status: string;
  group: WikiGroupId;
  mergedIntoId: string | null;
  mergedIntoTitle: string | null;
  aliases: string[];
  atomCount: number;
  currentAtomCount: number;
  pageSlug: string | null;
  versions: {
    version: number;
    changeNote: string;
    createdAt: string | null;
    dreamRunId: string | null;
    changedBy: string | null;
    status: string | null;
  }[];
};

export type WikiRun = {
  id: string;
  sequence: number;
  sourceDay: string | null;
  sourceWindowEnd: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  status: string;
  storeKind: string | null;
  summary: string;
  model: string | null;
  atomsAddedIds: string[];
  atomsSupersededIds: string[];
  atomsMergedCount: number;
  topicsMinted: { id: string; title: string; group: WikiGroupId }[];
  topicsMerged: { id: string; title: string; into: string }[];
  pagesRecomposed: { slug: string; title: string }[];
  conflictCount: number;
  verdictCounts: Record<string, number>;
  aliasQuestions: number;
  inputCounts: Record<string, number>;
  inputLabels: string[];
  extractionGroups: { agent: string; events: number; atomsAdded: number }[];
  memoryCoverage: Record<string, number>;
  tokenUsage: { input?: number; output?: number; calls?: number; model?: string };
};

export type WikiLinkedFrom = { slug: string; title: string; group: WikiGroupId; sentence: string };

type WikiStore = {
  workspace: { name: string; memberCount: number; description: string };
  job: {
    id: string;
    model: string;
    runCount: number;
    windowStart: string;
    windowEnd: string;
    finishedAt: string;
    threadCount: number;
    messageCount: number;
    memoryCount: number;
    documentCount: number;
  };
  groupOrder: WikiGroupId[];
  groupLabels: Record<WikiGroupId, string>;
  runs: WikiRun[];
  days: string[];
  agents: { id: string; name: string }[];
  pages: WikiPage[];
  topics: Record<string, WikiTopic>;
  atoms: Record<string, WikiAtom>;
  linkedFrom: Record<string, WikiLinkedFrom[]>;
};

const store = data as unknown as WikiStore;

export const wikiWorkspace = store.workspace;
export const wikiJob = store.job;
export const wikiPages = store.pages;
export const wikiTopics = store.topics;
export const wikiRuns = store.runs;
export const wikiDays = store.days;
export const wikiAgents = store.agents;

/** Atoms a serving path may return: the sensitivity-tagged and the withheld are counted, never listed. */
export const wikiServableAtoms = () =>
  Object.values(store.atoms).filter((atom) => !atom.tagged && atom.withheld.length === 0);

/** Every atom, for the Knowledge browser: the audit view lists the withheld ones too. */
export const wikiAllAtoms = () => Object.values(store.atoms);

/** The Topics the Knowledge filters and the atom timeline can select: alive, and carrying atoms. */
export const wikiTopicOptions = () =>
  Object.values(store.topics)
    .filter((topic) => topic.status !== "merged" && topic.atomCount > 0)
    .sort((a, b) => a.title.localeCompare(b.title));

/** The counts the view tabs carry. */
export const wikiCounts = () => ({
  pages: store.pages.filter((page) => !page.hidden).length,
  days: store.days.length,
  runs: store.runs.length,
  atoms: wikiServableAtoms().length,
});

/** The page the wiki opens on: the workspace's own page. */
export const wikiDefaultSlug = "brightwell-supply-co";

/** The dot colour per Topic group. Six categorical chart tokens, light and dark (docs/brand/design.md §15). */
export const wikiGroupDot: Record<WikiGroupId, string> = {
  workspace: "bg-chart-2",
  person: "bg-chart-3",
  agent: "bg-chart-1",
  organization: "bg-chart-4",
  team: "bg-chart-4",
  project: "bg-chart-5",
  system: "bg-chart-6",
  process: "bg-chart-4",
  location: "bg-chart-3",
  product: "bg-chart-6",
  concept: "bg-chart-2",
};

export const wikiGroupLabel = (id: WikiGroupId) => store.groupLabels[id] ?? "Concepts";

export type WikiIndexEntry = Pick<WikiPage, "slug" | "title" | "summary" | "group" | "hidden">;

/** Every listed page, grouped by Topic type in the group order, titles sorted. */
export function wikiIndexGroups(): { id: WikiGroupId; label: string; pages: WikiIndexEntry[] }[] {
  return store.groupOrder
    .map((id) => ({
      id,
      label: store.groupLabels[id],
      pages: store.pages
        .filter((page) => !page.hidden && page.group === id)
        .map(({ slug, title, summary, group, hidden }) => ({ slug, title, summary, group, hidden })),
    }))
    .filter((group) => group.pages.length > 0);
}

/** The pages a merge or an exclusion took out of listings; kept readable as history. */
export function wikiHiddenPages(): WikiIndexEntry[] {
  return store.pages
    .filter((page) => page.hidden)
    .map(({ slug, title, summary, group, hidden }) => ({ slug, title, summary, group, hidden }));
}

export type WikiView = {
  page: WikiPage;
  topic: WikiTopic;
  /** The page's cited atoms plus everything its drawer can reach: chains, merges, conflicts. */
  atoms: Record<string, WikiAtom>;
  topicTitles: Record<string, { title: string; group: WikiGroupId }>;
  linkedFrom: WikiLinkedFrom[];
};

/** One page with the slice of the store it can open, so a route ships its own data and no more. */
export function getWikiView(slug: string): WikiView | null {
  const page = store.pages.find((candidate) => candidate.slug === slug);
  if (!page) return null;

  const atoms: Record<string, WikiAtom> = {};
  const queue = [
    ...page.citations,
    ...page.versions.flatMap((version) => [...version.addedAtomIds, ...version.removedAtomIds]),
  ];
  while (queue.length > 0) {
    const id = queue.pop() as string;
    if (atoms[id]) continue;
    const atom = store.atoms[id];
    if (!atom) continue;
    atoms[id] = atom;
    queue.push(
      ...atom.supersedesIds,
      ...atom.mergedFromIds,
      ...atom.conflictWith,
      ...(atom.supersededById ? [atom.supersededById] : []),
    );
  }

  const topicTitles: Record<string, { title: string; group: WikiGroupId }> = {};
  for (const atom of Object.values(atoms)) {
    for (const id of atom.topicIds) {
      const topic = store.topics[id];
      if (topic) topicTitles[id] = { title: topic.title, group: topic.group };
    }
  }

  return {
    page,
    topic: store.topics[page.topicId],
    atoms,
    topicTitles,
    linkedFrom: store.linkedFrom[page.topicId] ?? [],
  };
}
