// The org chart's layout: small, deterministic, no dependency.
//
// Two ways to hang children under a parent, picked per parent:
//
//   ROW. The children's subtrees side by side, `column` px between their
//   bounding boxes, top-aligned one `rank` gap under the parent, and the
//   parent centred over its first and last child, so the bus under it is
//   symmetric and a single child sits straight below. The team over Atlas,
//   Atlas over the four leads.
//
//   STACK. When every child is a leaf, the children list down under the
//   parent, `indent` px in from its left edge and `stack` px apart (the first
//   one `stack` under the parent): an outline, the way Linear nests a
//   delegated agent under its owner. A lead over its specialists. Stacking
//   the bottom rank is what keeps the chart narrow enough to read at its true
//   size: seven specialists in a row made the old tree 1360px wide; stacked,
//   the widest rank is the four leads' columns.
//
// Each subtree is laid out on its own origin first and its bounding box read
// from the boxes actually placed, then packed into its parent's row, so a
// parent wider than its row, or a stack wider than its parent, never
// overlaps a neighbour. Positions are top-left corners (React Flow's default
// `nodeOrigin`), shifted so the chart's left edge is x = 0. An item of width 0
// is placed as a point: the team node sizes to its content, and org-graph.ts
// centres it on that point with `origin: [0.5, 0]`.

export type TreeItem = {
  id: string;
  /** null, or an id not in the list, makes the item a root. */
  parentId: string | null;
  width: number;
  height: number;
};

export type TreeSpacing = {
  /** Between a row parent's bottom and its children's tops. */
  rank: number;
  /** Between neighbouring subtrees in a row. */
  column: number;
  /** How far a stacked child's left edge sits in from its parent's. */
  indent: number;
  /** Between a stack parent and its first child, and between the children. */
  stack: number;
};

export type TreeArrangement = "row" | "stack";

export type TreePlacement = {
  x: number;
  y: number;
  /** Depth from the root: 0 for the root. */
  rank: number;
  /** How this item's children hang under it; null for a leaf. */
  children: TreeArrangement | null;
};

type Subtree = { boxes: Map<string, { x: number; y: number }>; left: number; right: number };

export function layoutOrgTree(items: readonly TreeItem[], spacing: TreeSpacing): Map<string, TreePlacement> {
  const byId = new Map(items.map((item) => [item.id, item]));
  const childrenOf = new Map<string, TreeItem[]>();
  const roots: TreeItem[] = [];
  for (const item of items) {
    const parent = item.parentId === null ? undefined : byId.get(item.parentId);
    if (!parent) {
      roots.push(item);
      continue;
    }
    const siblings = childrenOf.get(parent.id);
    if (siblings) siblings.push(item);
    else childrenOf.set(parent.id, [item]);
  }

  const kidsOf = (item: TreeItem) => childrenOf.get(item.id) ?? [];
  const arrangementOf = (item: TreeItem): TreeArrangement | null => {
    const kids = kidsOf(item);
    if (kids.length === 0) return null;
    return kids.every((kid) => kidsOf(kid).length === 0) ? "stack" : "row";
  };

  const bounds = (boxes: Subtree["boxes"]): Subtree => {
    let left = Infinity;
    let right = -Infinity;
    for (const [id, box] of boxes) {
      left = Math.min(left, box.x);
      right = Math.max(right, box.x + (byId.get(id)?.width ?? 0));
    }
    return { boxes, left, right };
  };

  // Subtrees side by side from x = 0, `column` apart, each dropped by `top`.
  // Returns the boxes and the centre of each subtree's own root.
  const packRow = (row: readonly TreeItem[], top: number) => {
    const boxes: Subtree["boxes"] = new Map();
    const centres: number[] = [];
    let cursor = 0;
    for (const item of row) {
      const sub = layout(item);
      const dx = cursor - sub.left;
      for (const [id, box] of sub.boxes) boxes.set(id, { x: box.x + dx, y: box.y + top });
      centres.push(dx + (sub.boxes.get(item.id)?.x ?? 0) + item.width / 2);
      cursor = sub.right + dx + spacing.column;
    }
    return { boxes, centres };
  };

  // `item`'s subtree with the item's own top at y = 0.
  const layout = (item: TreeItem): Subtree => {
    const kids = kidsOf(item);
    const arrangement = arrangementOf(item);

    if (arrangement === "stack") {
      const boxes: Subtree["boxes"] = new Map([[item.id, { x: 0, y: 0 }]]);
      let y = item.height + spacing.stack;
      for (const kid of kids) {
        boxes.set(kid.id, { x: spacing.indent, y });
        y += kid.height + spacing.stack;
      }
      return bounds(boxes);
    }

    if (arrangement === "row") {
      const { boxes, centres } = packRow(kids, item.height + spacing.rank);
      const centre = (centres[0] + centres[centres.length - 1]) / 2;
      boxes.set(item.id, { x: centre - item.width / 2, y: 0 });
      return bounds(boxes);
    }

    return bounds(new Map([[item.id, { x: 0, y: 0 }]]));
  };

  const { boxes } = packRow(roots, 0);
  const { left } = bounds(boxes);

  const rankOf = new Map<string, number>();
  const assignRank = (item: TreeItem, rank: number) => {
    rankOf.set(item.id, rank);
    for (const kid of kidsOf(item)) assignRank(kid, rank + 1);
  };
  for (const root of roots) assignRank(root, 0);

  const placements = new Map<string, TreePlacement>();
  for (const item of items) {
    const box = boxes.get(item.id) ?? { x: 0, y: 0 };
    placements.set(item.id, {
      x: box.x - left,
      y: box.y,
      rank: rankOf.get(item.id) ?? 0,
      children: arrangementOf(item),
    });
  }
  return placements;
}
