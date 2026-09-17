import type { WikiAtom, WikiConflict, WikiGraphPage, WikiGroupId, WikiTopic } from "@/lib/mock/wiki";

// The Topic graph, ported from the prototype: nodes are Topics that carry
// atoms, and an edge means one of three things you pick between — the two
// Topics are mentioned in the same atoms, their pages reference each other,
// or a retained conflict has a side on each. Everything is evaluated at a
// frame (a run sequence), so the same model plays back over the window.

export type GraphNode = {
  id: string;
  topic: WikiTopic;
  atoms: WikiAtom[];
  firstSeq: number;
  pageSeq: number | null;
  group: WikiGroupId;
};

export type AtomEdge = { a: string; b: string; atoms: WikiAtom[] };
export type PageEdge = {
  a: string;
  b: string;
  count: number;
  atoms: WikiAtom[];
  dirs: { from: string; to: string; wikilinks: number; cites: number }[];
  appearSeq: number;
};
export type DisputeCard = {
  id: string;
  sides: WikiAtom[][];
  atoms: WikiAtom[];
  topics: string[];
  appearSeq: number;
  others: string[];
};
export type DisputeEdge = { a: string; b: string; cards: DisputeCard[]; atoms: WikiAtom[] };
export type LensId = "atoms" | "pages" | "dispute";
export type GraphEdge = AtomEdge | PageEdge | DisputeEdge;

export type GraphModel = {
  nodes: GraphNode[];
  lenses: { atoms: AtomEdge[]; pages: PageEdge[]; dispute: DisputeEdge[] };
  cards: DisputeCard[];
  cardsByTopic: Map<string, DisputeCard[]>;
};

export const LENSES: Record<LensId, { label: string; weightLabel: string; defaultMin: number; max: number }> = {
  atoms: { label: "mentioned in the same atoms", weightLabel: "min shared atoms", defaultMin: 2, max: 8 },
  pages: { label: "referenced by each other's pages", weightLabel: "min mentions", defaultMin: 1, max: 8 },
  dispute: { label: "in dispute", weightLabel: "min conflicts", defaultMin: 1, max: 4 },
};

const WIKILINK = /\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g;
const pairKey = (x: string, y: string) => [x, y].sort().join("|");

export const activeAt = (atom: WikiAtom, seq: number) =>
  atom.createdSeq <= seq && (atom.retiredSeq == null || atom.retiredSeq > seq);

export function buildGraphModel({
  atoms,
  topics,
  pages,
  conflicts,
}: {
  atoms: WikiAtom[];
  topics: WikiTopic[];
  pages: WikiGraphPage[];
  conflicts: WikiConflict[];
}): GraphModel {
  const byId = Object.fromEntries(atoms.map((atom) => [atom.id, atom]));
  const onTopic = new Map<string, WikiAtom[]>();
  for (const atom of atoms) {
    for (const id of atom.topicIds) {
      const list = onTopic.get(id);
      if (list) list.push(atom);
      else onTopic.set(id, [atom]);
    }
  }

  const nodes: GraphNode[] = topics
    .filter((topic) => topic.status === "active" && topic.atomCount > 0)
    .map((topic) => {
      const own = (onTopic.get(topic.id) ?? []).filter((atom) => atom.withheld.length === 0);
      return {
        id: topic.id,
        topic,
        atoms: own,
        firstSeq: own.length ? Math.min(...own.map((atom) => atom.createdSeq)) : Number.POSITIVE_INFINITY,
        pageSeq: topic.pageSeq,
        group: topic.group,
      };
    })
    .filter((node) => node.atoms.length > 0);

  const nodeById = Object.fromEntries(nodes.map((node) => [node.id, node]));

  // Atoms lens: an edge for every pair of Topics an atom links.
  const atomEdges = new Map<string, AtomEdge>();
  for (const atom of atoms) {
    if (atom.withheld.length) continue;
    const ids = atom.topicIds.filter((id) => nodeById[id]).sort();
    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) {
        const key = `${ids[i]}|${ids[j]}`;
        const edge = atomEdges.get(key) ?? { a: ids[i], b: ids[j], atoms: [] };
        edge.atoms.push(atom);
        atomEdges.set(key, edge);
      }
    }
  }

  // Pages lens: wikilinks in a page body, plus the atoms it cites that are linked to the other Topic.
  const pageEdges = new Map<string, PageEdge>();
  for (const page of pages) {
    const from = page.topicId;
    const fromNode = nodeById[from];
    if (!fromNode || fromNode.pageSeq == null) continue;
    const mentions = new Map<string, { wikilinks: number; cites: WikiAtom[] }>();
    const get = (id: string) => {
      const found = mentions.get(id);
      if (found) return found;
      const fresh = { wikilinks: 0, cites: [] as WikiAtom[] };
      mentions.set(id, fresh);
      return fresh;
    };
    for (const match of page.content.matchAll(WIKILINK)) {
      const key = match[1].trim().toLowerCase().replace(/\s+/g, "-");
      const target = page.links[key]?.slug ? topicOfSlug(pages, page.links[key].slug as string) : key;
      if (target && nodeById[target] && target !== from) get(target).wikilinks += 1;
    }
    for (const id of page.citations) {
      const atom = byId[id];
      if (!atom || atom.withheld.length) continue;
      for (const topicId of atom.topicIds) if (nodeById[topicId] && topicId !== from) get(topicId).cites.push(atom);
    }
    for (const [to, mention] of mentions) {
      const key = pairKey(from, to);
      const [x, y] = key.split("|");
      const edge = pageEdges.get(key) ?? { a: x, b: y, count: 0, atoms: [], dirs: [], appearSeq: 0 };
      edge.count += mention.wikilinks + mention.cites.length;
      for (const atom of mention.cites) if (!edge.atoms.includes(atom)) edge.atoms.push(atom);
      edge.dirs.push({ from, to, wikilinks: mention.wikilinks, cites: mention.cites.length });
      const toNode = nodeById[to];
      edge.appearSeq = Math.max(edge.appearSeq, fromNode.pageSeq, toNode.pageSeq ?? toNode.firstSeq);
      pageEdges.set(key, edge);
    }
  }

  // Dispute lens: one card per retained conflict, drawn between the pair of
  // Topics its two sides share the most atoms with; the rest are listed on it.
  const disputeEdges = new Map<string, DisputeEdge>();
  const cards: DisputeCard[] = [];
  const cardsByTopic = new Map<string, DisputeCard[]>();
  const sharedCount = (x: string, y: string) => atomEdges.get(pairKey(x, y))?.atoms.length ?? 0;

  for (const conflict of conflicts) {
    const sides = conflict.sides.map((side) =>
      side.map((id) => byId[id]).filter((atom): atom is WikiAtom => Boolean(atom) && atom.withheld.length === 0),
    );
    if (sides.length !== 2 || !sides[0].length || !sides[1].length) continue;
    const topicsOf = (side: WikiAtom[]) => [...new Set(side.flatMap((atom) => atom.topicIds))].filter((id) => nodeById[id]);
    const left = topicsOf(sides[0]);
    const right = topicsOf(sides[1]);
    const all = [...sides[0], ...sides[1]];
    const card: DisputeCard = {
      id: conflict.id,
      sides,
      atoms: all,
      topics: [...new Set([...left, ...right])],
      appearSeq: Math.max(...all.map((atom) => atom.createdSeq)),
      others: [],
    };
    let best: [string, string] | null = null;
    let bestWeight = -1;
    for (const x of left) {
      for (const y of right) {
        if (x === y) continue;
        const weight = sharedCount(x, y);
        if (weight > bestWeight) {
          bestWeight = weight;
          best = [x, y];
        }
      }
    }
    if (best) {
      const key = pairKey(best[0], best[1]);
      const [x, y] = key.split("|");
      card.others = card.topics.filter((id) => id !== best[0] && id !== best[1]);
      const edge = disputeEdges.get(key) ?? { a: x, b: y, cards: [], atoms: [] };
      edge.cards.push(card);
      for (const atom of all) if (!edge.atoms.includes(atom)) edge.atoms.push(atom);
      disputeEdges.set(key, edge);
    }
    cards.push(card);
    for (const id of card.topics) {
      const list = cardsByTopic.get(id);
      if (list) list.push(card);
      else cardsByTopic.set(id, [card]);
    }
  }

  return {
    nodes,
    lenses: { atoms: [...atomEdges.values()], pages: [...pageEdges.values()], dispute: [...disputeEdges.values()] },
    cards,
    cardsByTopic,
  };
}

/** A page slug back to the Topic it sits on, for resolving a wikilink to a node. */
function topicOfSlug(pages: WikiGraphPage[], slug: string) {
  return pages.find((page) => page.slug === slug)?.topicId;
}

export const cardOpen = (card: DisputeCard, seq: number) => card.atoms.every((atom) => activeAt(atom, seq));

export const disputeCount = (model: GraphModel, topicId: string, seq: number) =>
  (model.cardsByTopic.get(topicId) ?? []).filter((card) => cardOpen(card, seq)).length;

export function edgeWeightAt(edge: GraphEdge, lens: LensId, seq: number) {
  if (lens === "atoms") return (edge as AtomEdge).atoms.filter((atom) => activeAt(atom, seq)).length;
  if (lens === "pages") {
    const page = edge as PageEdge;
    return page.appearSeq <= seq ? page.count : 0;
  }
  return (edge as DisputeEdge).cards.filter((card) => cardOpen(card, seq)).length;
}

export type VisibleGraph = {
  nodes: { node: GraphNode; count: number; r: number; disputes: number }[];
  edges: { edge: GraphEdge; weight: number; key: string }[];
};

export function visibleGraph(
  model: GraphModel,
  {
    seq,
    lens,
    minWeight,
    hiddenGroups,
    hideHubs,
    pagesOnly,
  }: { seq: number; lens: LensId; minWeight: number; hiddenGroups: Set<string>; hideHubs: boolean; pagesOnly: boolean },
): VisibleGraph {
  const activeCount = (node: GraphNode) => node.atoms.filter((atom) => activeAt(atom, seq)).length;

  let nodes = model.nodes.filter(
    (node) =>
      node.firstSeq <= seq &&
      !hiddenGroups.has(node.group) &&
      (!pagesOnly || (node.pageSeq != null && node.pageSeq <= seq)) &&
      (lens !== "dispute" || disputeCount(model, node.id, seq) > 0),
  );
  let ids = new Set(nodes.map((node) => node.id));
  let edges = model.lenses[lens]
    .map((edge) => ({ edge: edge as GraphEdge, weight: edgeWeightAt(edge, lens, seq), key: `${edge.a}|${edge.b}` }))
    .filter((entry) => entry.weight >= minWeight && ids.has((entry.edge as AtomEdge).a) && ids.has((entry.edge as AtomEdge).b));

  if (hideHubs) {
    const degree: Record<string, number> = {};
    for (const { edge } of edges) {
      const e = edge as AtomEdge;
      degree[e.a] = (degree[e.a] ?? 0) + 1;
      degree[e.b] = (degree[e.b] ?? 0) + 1;
    }
    const threshold = Math.max(8, nodes.length * 0.3);
    const hubs = new Set(Object.entries(degree).filter(([, d]) => d > threshold).map(([id]) => id));
    nodes = nodes.filter((node) => !hubs.has(node.id));
    ids = new Set(nodes.map((node) => node.id));
    edges = edges.filter(({ edge }) => ids.has((edge as AtomEdge).a) && ids.has((edge as AtomEdge).b));
  }

  return {
    nodes: nodes.map((node) => {
      const count = activeCount(node);
      return {
        node,
        count,
        r: 5 + Math.min(14, Math.sqrt(count) * 1.8),
        disputes: lens === "dispute" ? disputeCount(model, node.id, seq) : 0,
      };
    }),
    edges,
  };
}

export const GRAPH_WIDTH = 960;
export const GRAPH_HEIGHT = 600;
export const ALPHA_MIN = 0.006;
export const ALPHA_DECAY = 0.955;
export const REHEAT = 0.4;

export type Point = { x: number; y: number; vx: number; vy: number };

/**
 * One pass of the force layout: repulsion between every pair, springs along
 * the edges, a weak pull to the centre. Forces scale with `alpha`, which cools
 * each frame, so motion eases to rest instead of running at a cap. Returns the
 * largest step any node took.
 */
export function layoutTick(vis: VisibleGraph, positions: Map<string, Point>, iterations: number, alpha = 1) {
  const list = vis.nodes
    .map((entry) => ({ entry, point: positions.get(entry.node.id) }))
    .filter((item): item is { entry: VisibleGraph["nodes"][number]; point: Point } => Boolean(item.point));
  const n = list.length;
  const repulsion = 3600 * Math.max(0.35, Math.sqrt(60 / Math.max(1, n)));
  const maxStep = 1.2 + 5.8 * alpha;
  let moved = 0;

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    for (let i = 0; i < n; i += 1) {
      const pi = list[i].point;
      for (let j = i + 1; j < n; j += 1) {
        const pj = list[j].point;
        let dx = pi.x - pj.x;
        let dy = pi.y - pj.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 1) {
          dx = Math.random() - 0.5;
          dy = Math.random() - 0.5;
          d2 = 1;
        }
        const minDistance = list[i].entry.r + list[j].entry.r + 26;
        const force = repulsion / d2 + (d2 < minDistance * minDistance ? 0.6 : 0);
        const d = Math.sqrt(d2);
        pi.vx += (dx / d) * force;
        pi.vy += (dy / d) * force;
        pj.vx -= (dx / d) * force;
        pj.vy -= (dy / d) * force;
      }
    }
    for (const { edge, weight } of vis.edges) {
      const e = edge as AtomEdge;
      const pa = positions.get(e.a);
      const pb = positions.get(e.b);
      if (!pa || !pb) continue;
      const dx = pb.x - pa.x;
      const dy = pb.y - pa.y;
      const d = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const rest = 100 + Math.max(0, 30 - weight * 4);
      const force = (d - rest) * 0.02 * Math.min(1, 0.5 + weight / 8);
      pa.vx += (dx / d) * force;
      pa.vy += (dy / d) * force;
      pb.vx -= (dx / d) * force;
      pb.vy -= (dy / d) * force;
    }
    for (const { point } of list) {
      point.vx += (GRAPH_WIDTH / 2 - point.x) * 0.007;
      point.vy += (GRAPH_HEIGHT / 2 - point.y) * 0.011;
      point.vx *= 0.78 * Math.min(1, 0.55 + alpha);
      point.vy *= 0.78 * Math.min(1, 0.55 + alpha);
      const speed = Math.hypot(point.vx, point.vy);
      if (speed > maxStep) {
        point.vx *= maxStep / speed;
        point.vy *= maxStep / speed;
      }
      const nx = Math.max(30, Math.min(GRAPH_WIDTH - 30, point.x + point.vx * alpha));
      const ny = Math.max(26, Math.min(GRAPH_HEIGHT - 30, point.y + point.vy * alpha));
      moved = Math.max(moved, Math.hypot(nx - point.x, ny - point.y));
      point.x = nx;
      point.y = ny;
    }
  }
  return moved;
}

/**
 * A fresh graph starts as a small cloud at the centre and expands as it
 * settles; a Topic that appears mid-playback starts at the mean of its
 * already-placed neighbours, so it grows out of the structure.
 */
export function ensurePositions(vis: VisibleGraph, positions: Map<string, Point>) {
  const present = new Set(vis.nodes.map((entry) => entry.node.id));
  for (const key of [...positions.keys()]) if (!present.has(key)) positions.delete(key);
  const fresh = positions.size === 0;
  let changed = false;

  for (const entry of vis.nodes) {
    if (positions.has(entry.node.id)) continue;
    let sx = 0;
    let sy = 0;
    let count = 0;
    if (!fresh) {
      for (const { edge } of vis.edges) {
        const e = edge as AtomEdge;
        const other = e.a === entry.node.id ? e.b : e.b === entry.node.id ? e.a : null;
        const point = other ? positions.get(other) : undefined;
        if (point) {
          sx += point.x;
          sy += point.y;
          count += 1;
        }
      }
    }
    const jitter = (span: number) => (Math.random() - 0.5) * span;
    positions.set(
      entry.node.id,
      count
        ? { x: sx / count + jitter(40), y: sy / count + jitter(40), vx: 0, vy: 0 }
        : {
            x: GRAPH_WIDTH / 2 + jitter(fresh ? 90 : 120),
            y: GRAPH_HEIGHT / 2 + jitter(fresh ? 60 : 90),
            vx: 0,
            vy: 0,
          },
    );
    changed = true;
  }
  return changed;
}
