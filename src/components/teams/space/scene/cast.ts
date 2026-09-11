import type { FleetAgent, FleetRun, Team, TeamMember } from "@/lib/mock/teams";
import type { ActorId, Placement, Seat } from "@/components/teams/space/types";
import type { ProximityGroup } from "@/components/teams/space/scene/groups";
import type { Rest } from "@/components/teams/space/scene/store";

// Who is in the office and what the fleet says about each of them, derived
// once from the static mock: the characters (every agent, and every person
// the seed places, which leaves the offline ones out), their asks, the live
// runs they share, and the pose each one rests in.

/** You: the person the keyboard walks and the ask card answers to. */
export const YOU: ActorId = "m-priya";

export type CastMember =
  | { id: ActorId; kind: "agent"; agent: FleetAgent }
  | { id: ActorId; kind: "person"; member: TeamMember; you: boolean };

export interface Cast {
  /** Every character, in tab order: the agents in the fleet's order, then the people. */
  members: CastMember[];
  byId: Map<ActorId, CastMember>;
  /** The order names are listed in a group tag: agents, then people, you last. */
  nameOrder: ActorId[];
  /** Runs under way right now. */
  liveRuns: FleetRun[];
  /** An agent's needs-you runs, in the mock's order. */
  asksOf: (id: ActorId) => FleetRun[];
  /** The needs-you runs a person answers for. */
  waitingOn: (id: ActorId) => FleetRun[];
  /** Everyone on a live run with this agent (its lead and helpers), itself excluded. */
  collaborators: (id: ActorId) => Set<ActorId>;
  /** The run an agent is on right now: the one its group shares, else its own, else one it helps with. */
  currentRun: (id: ActorId, group: ProximityGroup | null) => FleetRun | null;
  restFor: (id: ActorId, seat: Seat | null) => Rest;
}

const participantsOf = (run: FleetRun): ActorId[] => [run.agentId, ...(run.helpers ?? [])];

export function buildCast(team: Team, agents: readonly FleetAgent[], runs: readonly FleetRun[], seed: Record<ActorId, Placement>): Cast {
  const people = team.members
    .filter((member) => member.online && seed[member.id])
    .sort((a, b) => (a.id === YOU ? -1 : b.id === YOU ? 1 : 0));
  const members: CastMember[] = [
    ...agents.filter((agent) => seed[agent.id]).map((agent): CastMember => ({ id: agent.id, kind: "agent", agent })),
    ...people.map((member): CastMember => ({ id: member.id, kind: "person", member, you: member.id === YOU })),
  ];
  const byId = new Map(members.map((member) => [member.id, member]));
  const nameOrder = [
    ...members.filter((m) => m.kind === "agent").map((m) => m.id),
    ...people.filter((p) => p.id !== YOU).map((p) => p.id),
    YOU,
  ];

  const liveRuns = runs.filter((run) => run.status === "working");
  const asks = runs.filter((run) => run.status === "needs-you");
  const asksOf = (id: ActorId) => asks.filter((run) => run.agentId === id);
  const waitingOn = (id: ActorId) => asks.filter((run) => run.ownerId === id);

  const collaborators = (id: ActorId) => {
    const found = new Set<ActorId>();
    for (const run of liveRuns) {
      const ids = participantsOf(run);
      if (ids.includes(id)) for (const other of ids) if (other !== id) found.add(other);
    }
    return found;
  };

  const currentRun = (id: ActorId, group: ProximityGroup | null) => {
    if (group?.run && participantsOf(group.run).includes(id)) return group.run;
    return (
      liveRuns.find((run) => run.agentId === id) ?? liveRuns.find((run) => run.helpers?.includes(id)) ?? null
    );
  };

  const restFor = (id: ActorId, seat: Seat | null): Rest => {
    const member = byId.get(id);
    if (!member || !seat) return { pose: "idle", animate: false };
    const meeting = seat.room === "meeting";
    if (member.kind === "person") return meeting ? { pose: "type", animate: false } : { pose: "type", animate: true };
    switch (member.agent.state) {
      case "working":
        return { pose: meeting ? "read" : "type", animate: true };
      case "idle":
        return { pose: "idle", animate: false };
      case "paused":
      case "error":
        return { pose: "type", animate: false };
    }
  };

  return { members, byId, nameOrder, liveRuns, asksOf, waitingOn, collaborators, currentRun, restFor };
}
