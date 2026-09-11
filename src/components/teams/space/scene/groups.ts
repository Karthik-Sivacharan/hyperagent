import type { FleetRun } from "@/lib/mock/teams";
import type { ActorId, RoomId, Tile } from "@/components/teams/space/types";

// Proximity groups (docs/plans/2026-09-11-teams-space-v1.md §4): characters
// within 2 tiles of each other, in the same room, form a group, and a group
// is a connected component of that relation, so a chain of neighbours is one
// conversation. A group's tags merge into one; its members that share a live
// run make it a meeting (IconUsers, the "…" bubble at the run's lead), and
// anything else is an ad hoc chat (IconMessageCircle).
//
// Two characters working at their own desks never link, however close the
// desks: a desk is where you go to be heads down (Gather's home base), and
// neighbours at their desks are not in a conversation. Walking up to a desk,
// or dragging someone to one, is.

export const GROUP_RADIUS = 2;

export interface Placed {
  id: ActorId;
  tile: Tile;
  room: RoomId | null;
  /** At rest on an owned desk's chair. */
  atDesk: boolean;
}

export interface ProximityGroup {
  /** Stable while the membership is: its members' ids, sorted. */
  key: string;
  /** In tag order: the shared run's lead and helpers first, then the fleet's order. */
  members: ActorId[];
  /** The live run most of them are on, when two or more are. */
  run: FleetRun | null;
  /** That run's lead, when it is in the group. */
  lead: ActorId | null;
}

const participantsOf = (run: FleetRun): ActorId[] => [run.agentId, ...(run.helpers ?? [])];

function linked(a: Placed, b: Placed): boolean {
  if (!a.room || a.room !== b.room) return false;
  if (a.atDesk && b.atDesk) return false;
  return Math.max(Math.abs(a.tile.x - b.tile.x), Math.abs(a.tile.y - b.tile.y)) <= GROUP_RADIUS;
}

/**
 * @param liveRuns the runs under way right now (status working)
 * @param order every actor id in the order names are listed (agents, then people)
 */
export function proximityGroups(placed: readonly Placed[], liveRuns: readonly FleetRun[], order: readonly ActorId[]): ProximityGroup[] {
  const parent = new Map(placed.map((p) => [p.id, p.id]));
  const find = (id: ActorId): ActorId => {
    let root = id;
    while (parent.get(root) !== root) root = parent.get(root)!;
    parent.set(id, root);
    return root;
  };
  for (let i = 0; i < placed.length; i++) {
    for (let j = i + 1; j < placed.length; j++) {
      if (linked(placed[i], placed[j])) parent.set(find(placed[i].id), find(placed[j].id));
    }
  }

  const components = new Map<ActorId, ActorId[]>();
  for (const p of placed) {
    const root = find(p.id);
    components.set(root, [...(components.get(root) ?? []), p.id]);
  }

  const rank = new Map(order.map((id, i) => [id, i]));
  const groups: ProximityGroup[] = [];
  for (const ids of components.values()) {
    if (ids.length < 2) continue;
    const members = new Set(ids);
    let run: FleetRun | null = null;
    let best = 1;
    for (const candidate of liveRuns) {
      const count = participantsOf(candidate).filter((id) => members.has(id)).length;
      if (count > best) {
        best = count;
        run = candidate;
      }
    }
    const lead = run && members.has(run.agentId) ? run.agentId : null;
    const first = run ? participantsOf(run).filter((id) => members.has(id)) : [];
    const rest = ids.filter((id) => !first.includes(id)).sort((a, b) => (rank.get(a) ?? 99) - (rank.get(b) ?? 99));
    groups.push({ key: [...ids].sort().join("+"), members: [...first, ...rest], run, lead });
  }
  return groups;
}

/**
 * The agent whose ask the walker is standing next to (1 tile, diagonals
 * included), the nearest when there are several; null when there is none.
 */
export function nearestAsk(
  walker: Tile,
  placed: readonly { id: ActorId; tile: Tile }[],
  hasAsk: (id: ActorId) => boolean,
): ActorId | null {
  let found: ActorId | null = null;
  let best = Infinity;
  for (const p of placed) {
    if (!hasAsk(p.id)) continue;
    const dx = Math.abs(p.tile.x - walker.x);
    const dy = Math.abs(p.tile.y - walker.y);
    if (Math.max(dx, dy) > 1) continue;
    const d = dx * dx + dy * dy;
    if (d < best) {
      best = d;
      found = p.id;
    }
  }
  return found;
}
