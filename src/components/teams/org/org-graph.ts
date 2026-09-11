import type { FlowEdge, Node } from "@/components/ui/flow";
import type { FleetAgent, FleetRun, Team } from "@/lib/mock/teams";
import { layoutTidyTree, type TreeItem } from "@/components/teams/org/layout";

// The org chart as React Flow data, derived from the fleet: one node for the
// team, one per agent, a "reports to" edge per `parentId`, and live
// delegation from the working runs' `helpers`. Pure functions over the static
// mock, so the chart is the same on every render and every machine.

export const TEAM_NODE_ID = "team";

/** Node boxes, in px. The node components set exactly these, so the layout
 *  never waits for a measurement. The team is wider: the root of the chart,
 *  with its people beside its name. */
export const ORG_NODE_SIZE = {
  team: { width: 304, height: 64 },
  agent: { width: 240, height: 168 },
} as const;

// Seven specialists side by side make the tree width-bound on any laptop
// frame, so the vertical gap is free: a generous one gives the elbows and the
// live dashes room to read without costing a point of zoom.
export const ORG_SPACING = { sibling: 20, cousin: 40, rank: 96 } as const;

export type TeamNodeData = { rank: number };
export type AgentNodeData = { agentId: string; rank: number; hasReports: boolean };
export type OrgTeamNode = Node<TeamNodeData, "team">;
export type OrgAgentNode = Node<AgentNodeData, "agent">;
export type OrgNode = OrgTeamNode | OrgAgentNode;

/** An agent's parent in the chart: its lead, or the team for the orchestrator. */
export function chartParentOf(agent: FleetAgent): string {
  return agent.parentId ?? TEAM_NODE_ID;
}

/** Runs that still need something: blocked on a person, under way or waiting to start. */
export function isActiveRun(run: FleetRun): boolean {
  return run.status === "needs-you" || run.status === "working" || run.status === "queued";
}

export function buildOrgNodes(team: Team, agents: readonly FleetAgent[]): OrgNode[] {
  const items: TreeItem[] = [
    { id: TEAM_NODE_ID, parentId: null, ...ORG_NODE_SIZE.team },
    ...agents.map((agent) => ({ id: agent.id, parentId: chartParentOf(agent), ...ORG_NODE_SIZE.agent })),
  ];
  const placed = layoutTidyTree(items, ORG_SPACING);
  const leads = new Set(agents.map((agent) => agent.parentId));

  const teamPlacement = placed.get(TEAM_NODE_ID) ?? { x: 0, y: 0, rank: 0 };
  const teamNode: OrgTeamNode = {
    id: TEAM_NODE_ID,
    type: "team",
    position: { x: teamPlacement.x, y: teamPlacement.y },
    data: { rank: teamPlacement.rank },
    ariaLabel: `${team.name} team, ${team.members.length} people and ${agents.length} agents`,
    // Context, not a destination: nothing to open, so no tab stop and no selection.
    selectable: false,
    focusable: false,
  };

  const agentNodes = agents.map((agent): OrgAgentNode => {
    const placement = placed.get(agent.id) ?? { x: 0, y: 0, rank: 1 };
    return {
      id: agent.id,
      type: "agent",
      position: { x: placement.x, y: placement.y },
      data: { agentId: agent.id, rank: placement.rank, hasReports: leads.has(agent.id) },
      ariaLabel: `${agent.name}, ${agent.role}`,
    };
  });

  return [teamNode, ...agentNodes];
}

/**
 * Edges: a static hairline from every agent up to whoever it reports to, and
 * live delegation drawn from each working run's `helpers`. When the helper is
 * a direct report (always, in today's mock) the reporting line itself turns
 * live, so the chart never doubles a line; a helper elsewhere in the tree
 * gets its own curve. Live edges sit one layer up so their dashes draw over
 * the hairlines that share their trunk.
 */
export function buildOrgEdges(team: Team, agents: readonly FleetAgent[], runs: readonly FleetRun[]): FlowEdge[] {
  const byId = new Map(agents.map((agent) => [agent.id, agent]));
  const nameOf = (id: string) => (id === TEAM_NODE_ID ? team.name : (byId.get(id)?.name ?? id));

  const edges = new Map<string, FlowEdge>();
  for (const agent of agents) {
    const source = chartParentOf(agent);
    edges.set(`${source}->${agent.id}`, {
      id: `${source}->${agent.id}`,
      source,
      target: agent.id,
      type: "static",
      ariaLabel: `${agent.name} reports to ${nameOf(source)}`,
    });
  }

  for (const run of runs) {
    if (run.status !== "working") continue;
    for (const helperId of run.helpers ?? []) {
      const helper = byId.get(helperId);
      if (!helper) continue;
      const ariaLabel = `${nameOf(run.agentId)} delegating ${run.title} to ${helper.name}`;
      const reportingLine = edges.get(`${run.agentId}->${helperId}`);
      if (reportingLine) {
        edges.set(reportingLine.id, { ...reportingLine, type: "animated", zIndex: 1, ariaLabel });
      } else {
        const id = `live:${run.id}:${helperId}`;
        edges.set(id, {
          id,
          source: run.agentId,
          target: helperId,
          type: "animated",
          zIndex: 1,
          data: { curve: "bezier" },
          ariaLabel,
        });
      }
    }
  }

  return [...edges.values()];
}

/**
 * A node's chain of command: everyone it answers to, up to the team, and
 * everyone who answers to it, down to the last specialist. The team's chain
 * is the whole chart.
 */
export function chainOf(id: string, agents: readonly FleetAgent[]): Set<string> {
  const chain = new Set<string>([id]);
  if (id === TEAM_NODE_ID) {
    for (const agent of agents) chain.add(agent.id);
    return chain;
  }

  const byId = new Map(agents.map((agent) => [agent.id, agent]));
  for (let parent = byId.get(id)?.parentId; parent; parent = byId.get(parent)?.parentId) chain.add(parent);
  chain.add(TEAM_NODE_ID);

  const queue = [id];
  while (queue.length > 0) {
    const current = queue.shift();
    for (const agent of agents) {
      if (agent.parentId === current && !chain.has(agent.id)) {
        chain.add(agent.id);
        queue.push(agent.id);
      }
    }
  }
  return chain;
}

/**
 * The nodes a search lights up. An agent matches on its own name, role,
 * model or skills, or when one of its runs survived the shared run filter
 * (`matchingRuns`, already narrowed by the query in fleet-context.tsx), so
 * the chart and the board agree on what "digest" finds.
 */
export function searchMatches(
  query: string,
  team: Team,
  agents: readonly FleetAgent[],
  matchingRuns: readonly FleetRun[],
): Set<string> {
  const q = query.trim().toLowerCase();
  const matches = new Set<string>(matchingRuns.map((run) => run.agentId));
  for (const agent of agents) {
    if ([agent.name, agent.role, agent.model, ...agent.skills].some((field) => field.toLowerCase().includes(q))) {
      matches.add(agent.id);
    }
  }
  if (team.name.toLowerCase().includes(q)) matches.add(TEAM_NODE_ID);
  return matches;
}
