// A tidy tree for the org chart: small, deterministic, no dependency.
//
// Top-down, in three passes over the items in the order given (the mock's
// order, so the chart reads the way the data is written):
//
//   1. Ranks. Depth from the root; each rank's top is the previous rank's
//      top plus the TALLEST node in it plus one rank gap, so the gap between
//      the bottom of one row and the top of the next is the same everywhere.
//   2. Leaves. Every node without children takes the next slot left to right,
//      a sibling gap after a leaf with the same parent, a wider cousin gap
//      after one from another family (d3's `separation`: families read as
//      groups before a line is followed).
//   3. Parents. Centred over the span from their first child's centre to
//      their last child's, so a single child sits straight under its parent
//      and the elbows below a parent are symmetric.
//
// A parent wider than its family (a full card over one compact card)
// overhangs its children, into the gap beside them. That is allowed while it
// keeps the gap to the box before it in its own rank; when it would not, the
// whole subtree moves right by the difference (a one-sided contour check,
// which is all a left-to-right placement needs). So nothing ever overlaps,
// and a tree whose parents fit over their families is laid out exactly as
// before.
//
// Positions are top-left corners, React Flow's default `nodeOrigin`, with the
// root centred on x = 0.

export type TreeItem = {
  id: string;
  /** null, or an id not in the list, makes the item a root. */
  parentId: string | null;
  width: number;
  height: number;
};

export type TreeSpacing = {
  /** Between leaves with the same parent. */
  sibling: number;
  /** Between leaves of different parents. */
  cousin: number;
  /** Between the bottom of one rank and the top of the next. */
  rank: number;
};

export type TreePlacement = { x: number; y: number; rank: number };

export function layoutTidyTree(items: readonly TreeItem[], spacing: TreeSpacing): Map<string, TreePlacement> {
  const byId = new Map(items.map((item) => [item.id, item]));
  const children = new Map<string, TreeItem[]>();
  const roots: TreeItem[] = [];
  for (const item of items) {
    const parent = item.parentId === null ? undefined : byId.get(item.parentId);
    if (!parent) {
      roots.push(item);
      continue;
    }
    const siblings = children.get(parent.id);
    if (siblings) siblings.push(item);
    else children.set(parent.id, [item]);
  }

  // 1. Ranks and the top of each.
  const rankOf = new Map<string, number>();
  const rankHeight: number[] = [];
  const assignRank = (item: TreeItem, rank: number) => {
    rankOf.set(item.id, rank);
    rankHeight[rank] = Math.max(rankHeight[rank] ?? 0, item.height);
    for (const child of children.get(item.id) ?? []) assignRank(child, rank + 1);
  };
  for (const root of roots) assignRank(root, 0);

  const rankTop: number[] = [];
  let top = 0;
  for (const [rank, height] of rankHeight.entries()) {
    rankTop[rank] = top;
    top += height + spacing.rank;
  }

  // 2 and 3. Leaf slots, then parents over their children. `lastInRank` is
  // the box placed most recently in each rank (the rightmost, since placement
  // runs left to right) and where its right edge landed.
  const centreOf = new Map<string, number>();
  const lastInRank: { item: TreeItem; right: number }[] = [];
  let cursor = 0;
  let previousLeaf: TreeItem | null = null;

  const shiftSubtree = (item: TreeItem, dx: number) => {
    const centre = (centreOf.get(item.id) ?? 0) + dx;
    centreOf.set(item.id, centre);
    const last = lastInRank[rankOf.get(item.id) ?? 0];
    if (last?.item === item) last.right = centre + item.width / 2;
    for (const child of children.get(item.id) ?? []) shiftSubtree(child, dx);
  };

  const place = (item: TreeItem): number => {
    const kids = children.get(item.id) ?? [];
    const rank = rankOf.get(item.id) ?? 0;
    let centre: number;
    if (kids.length === 0) {
      if (previousLeaf) cursor += previousLeaf.parentId === item.parentId ? spacing.sibling : spacing.cousin;
      centre = cursor + item.width / 2;
      cursor += item.width;
      previousLeaf = item;
    } else {
      const centres = kids.map(place);
      centre = (centres[0] + centres[centres.length - 1]) / 2;
    }
    centreOf.set(item.id, centre);

    const before = lastInRank[rank];
    if (before) {
      const gap = before.item.parentId === item.parentId ? spacing.sibling : spacing.cousin;
      const overlap = before.right + gap - (centre - item.width / 2);
      if (overlap > 0) {
        shiftSubtree(item, overlap);
        cursor += overlap;
        centre += overlap;
      }
    }
    lastInRank[rank] = { item, right: centre + item.width / 2 };
    return centre;
  };
  for (const root of roots) place(root);

  const shift = roots.length > 0 ? (centreOf.get(roots[0].id) ?? 0) : 0;
  const placements = new Map<string, TreePlacement>();
  for (const item of items) {
    const rank = rankOf.get(item.id) ?? 0;
    placements.set(item.id, {
      x: (centreOf.get(item.id) ?? 0) - shift - item.width / 2,
      y: rankTop[rank] ?? 0,
      rank,
    });
  }
  return placements;
}
