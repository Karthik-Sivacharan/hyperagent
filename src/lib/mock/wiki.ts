import data from "./wiki-data.json";

// The workspace wiki: knowledge a dreaming job composed from a fortnight of
// threads, documents and saved memories over a synthetic supply-company
// workspace. Ported from a local prototype; every value here is static mock
// data (docs/clone-conventions.md rule 2), trimmed to what the pages render:
// workspace-shared pages, the topics they sit on, and the atoms they cite.
// Each assistant's private pages sit beside the shared set, never in it, so
// every selector that reads `pages` reads the workspace wiki alone; only the
// scoped selectors at the end of this file read the private pages.

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
  /** The run that wrote this atom, and the one that retired it: the graph's frame coordinates. */
  createdSeq: number;
  retiredSeq: number | null;
  /** Index of validFrom in the source-day calendar, -1 when it falls outside the window. */
  dayIdx: number;
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

/** A page one assistant composed for itself: the shared shape, plus its owner and the kind of page it is. */
export type WikiPrivatePage = WikiPage & { namedAgentId: string; pageKind: string | null };

/** A Topic whose visibility depends on the assistant reading it; a Topic without one is shared and excluded for no one. */
type WikiTopicScope = { namedAgentId: string | null; excludedForAgents: string[] };

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
  /** The frame at which this Topic's page first existed; null while no page is composed. */
  pageSeq: number | null;
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

/** A retained conflict: reconciliation kept both sides rather than picking one. */
export type WikiConflict = { id: string; atomIds: string[]; sides: string[][] };

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
  conflicts: WikiConflict[];
  dayFinalSeq: number[];
  days: string[];
  agents: { id: string; name: string }[];
  pages: WikiPage[];
  topics: Record<string, WikiTopic>;
  atoms: Record<string, WikiAtom>;
  linkedFrom: Record<string, WikiLinkedFrom[]>;
  privatePages: WikiPrivatePage[];
  topicScopes: Record<string, WikiTopicScope>;
};

const store = data as unknown as WikiStore;

export const wikiWorkspace = store.workspace;
export const wikiJob = store.job;
export const wikiPages = store.pages;
export const wikiTopics = store.topics;
export const wikiRuns = store.runs;
export const wikiDays = store.days;
export const wikiAgents = store.agents;
export const wikiConflicts = store.conflicts;
/** The last run of each source day: the frame a day-mode step lands on. */
export const wikiDayFinalSeq = store.dayFinalSeq;

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

/** The label of each Topic group ("People"), and the order the index lists the groups in. */
export const wikiGroupLabels: Record<WikiGroupId, string> = store.groupLabels;
export const wikiGroupOrder: WikiGroupId[] = store.groupOrder;

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

export type WikiGraphPage = Pick<WikiPage, "slug" | "title" | "topicId" | "content" | "citations" | "links">;

/** What the Topic graph reads from the pages: bodies and citations, without the revision history. */
export const wikiPagesForGraph = (): WikiGraphPage[] =>
  store.pages.map(({ slug, title, topicId, content, citations, links }) => ({
    slug,
    title,
    topicId,
    content,
    citations,
    links,
  }));

/** A Topic as a chip draws it: its name, its group, and its page when one is composed. */
export type WikiTopicRef = { title: string; group: WikiGroupId; slug: string | null };

export type WikiView = {
  page: WikiPage;
  topic: WikiTopic;
  /** The page's cited atoms plus everything its drawer can reach: chains, merges, conflicts. */
  atoms: Record<string, WikiAtom>;
  topicTitles: Record<string, WikiTopicRef>;
  /** The Topic this page's Topic was merged into, when it was. */
  mergedInto: WikiTopicRef | null;
  linkedFrom: WikiLinkedFrom[];
};

const topicRef = (id: string | null): WikiTopicRef | null => {
  const topic = id ? store.topics[id] : undefined;
  return topic ? { title: topic.title, group: topic.group, slug: topic.pageSlug } : null;
};

/** One page with the slice of the store it can open, so a route ships its own data and no more. */
export function getWikiView(slug: string): WikiView | null {
  const page = store.pages.find((candidate) => candidate.slug === slug);
  return page ? viewOf(page) : null;
}

function viewOf(page: WikiPage): WikiView {
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

  const topicTitles: Record<string, WikiTopicRef> = {};
  for (const atom of Object.values(atoms)) {
    for (const id of atom.topicIds) {
      const ref = topicRef(id);
      if (ref) topicTitles[id] = ref;
    }
  }

  return {
    page,
    topic: store.topics[page.topicId],
    atoms,
    topicTitles,
    mergedInto: topicRef(store.topics[page.topicId].mergedIntoId),
    linkedFrom: store.linkedFrom[page.topicId] ?? [],
  };
}

/** The group of every Topic a page links to, keyed as the page's `links` are: what an inline mention's icon shows. */
export function wikiLinkGroups(page: WikiPage): Record<string, WikiGroupId> {
  return Object.fromEntries(
    Object.keys(page.links).map((key) => [key, store.topics[key]?.group ?? "concept"]),
  );
}

// Scope: whose wiki is being read. The workspace scope is the shared pages
// and nothing else, exactly what every selector above returns. An assistant's
// scope adds the pages that assistant composed for itself, lets each one stand
// in for the shared page on its Topic, and drops every Topic excluded for that
// assistant. A scope is an assistant id, or null for the workspace.

export type WikiIndexGroup = { id: WikiGroupId; label: string; pages: WikiIndexEntry[] };

/** The workspace scope's id where a scope travels as a string (a cookie, a select). */
export const WIKI_WORKSPACE_SCOPE = "workspace";

/** The assistant a stored scope names, or null (the workspace) when it names none on the roster. */
export const wikiScopeOf = (value: string | null | undefined): string | null =>
  value && store.agents.some((agent) => agent.id === value) ? value : null;

/** The scopes a reader can pick: the workspace, then each assistant; a repeated name is marked as the copy it is. */
export function wikiScopeOptions(): { id: string; label: string }[] {
  const named = new Set<string>();
  return [
    { id: WIKI_WORKSPACE_SCOPE, label: "Workspace wiki (shared pages)" },
    ...store.agents.map(({ id, name }) => {
      const label = named.has(name) ? `${name} (copy)` : name;
      named.add(name);
      return { id, label };
    }),
  ];
}

const toEntry = ({ slug, title, summary, group, hidden }: WikiPage): WikiIndexEntry => ({ slug, title, summary, group, hidden });

function scopeOf(scope: string | null) {
  const excluded = (page: WikiPage) => Boolean(scope && store.topicScopes[page.topicId]?.excludedForAgents.includes(scope));
  const own = scope
    ? store.privatePages.filter((page) => page.namedAgentId === scope && !excluded(page)).sort((a, b) => a.title.localeCompare(b.title))
    : [];
  // A private page is a supplement, not a replacement: it opens by pointing
  // at the shared page on its Topic and adds only what this assistant knows
  // beyond it. So the shared pages all stay listed beside it, as they do in
  // the prototype, and only an exclusion takes one away.
  const shared = store.pages.filter((page) => !excluded(page));
  return { own, shared };
}

/** The pages one scope can open: its own private pages, then every shared page it is not excluded from. */
export function wikiScopedPages(scope: string | null): WikiPage[] {
  const { own, shared } = scopeOf(scope);
  return [...own, ...shared];
}

/**
 * The index for one scope. `privatePages` is null in the workspace (it has no
 * such group) and a list, possibly empty, for an assistant; `groups` and
 * `hiddenPages` are the workspace's own, less the pages the scope leaves out.
 */
export function wikiScopedIndex(scope: string | null): {
  privatePages: WikiIndexEntry[] | null;
  groups: WikiIndexGroup[];
  hiddenPages: WikiIndexEntry[];
} {
  const { own, shared } = scopeOf(scope);
  const kept = new Set(shared.map((page) => page.slug));
  return {
    privatePages: scope ? own.filter((page) => !page.hidden).map(toEntry) : null,
    groups: wikiIndexGroups()
      .map((group) => ({ ...group, pages: group.pages.filter((page) => kept.has(page.slug)) }))
      .filter((group) => group.pages.length > 0),
    hiddenPages: wikiHiddenPages().filter((page) => kept.has(page.slug)),
  };
}

/**
 * Where a slug lands in one scope: itself when the scope can open it, else
 * the shared page on the same Topic, else null. So another assistant's
 * private page opens as the shared page it supplements, and a private page
 * with no shared counterpart is not found outside its own assistant.
 */
export function wikiScopedSlug(slug: string, scope: string | null): string | null {
  const page =
    store.pages.find((candidate) => candidate.slug === slug) ??
    store.privatePages.find((candidate) => candidate.slug === slug);
  if (!page) return null;
  const pages = wikiScopedPages(scope);
  if (pages.includes(page)) return slug;
  return pages.find((candidate) => candidate.topicId === page.topicId)?.slug ?? null;
}

/** `getWikiView` within a scope: a page the scope can open, a private one included. */
export function getWikiScopedView(slug: string, scope: string | null): WikiView | null {
  const page = wikiScopedPages(scope).find((candidate) => candidate.slug === slug);
  return page ? viewOf(page) : null;
}
