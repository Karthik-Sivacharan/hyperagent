import type { FlowEdge, FlowNodeHandles, Node } from "@/components/ui/flow";
import type { FleetAgent, FleetRun, Team } from "@/lib/mock/teams";
import { formatUsd } from "@/components/teams/fleet/format";
import { layoutOrgTree, type TreeItem } from "@/components/teams/org/layout";

// The org chart as React Flow data, derived from the fleet: one node for the
// team, one per agent, a "reports to" edge per `parentId`, and live
// delegation from the working runs' `helpers`. Pure functions over the static
// mock, so the chart is the same on every render and every machine.

export const TEAM_NODE_ID = "team";

/** Every agent node's box, in px: AgentNode is `w-52 h-14`, at every rank, so
 *  the layout never waits for a measurement. The team node is `h-12` and
 *  sizes its width to its content. */
export const AGENT_NODE_SIZE = { width: 208, height: 56 } as const;
export const TEAM_NODE_HEIGHT = 48;

// THE SHAPE. The team, Atlas under it, the four leads in a row, and each
// lead's specialists stacked under it (layout.ts). A specialist hangs off the
// delegate elbow, the shape an issue tracker draws when work is handed to
// someone who answers to the owner: an elbow out of the lead's bottom edge 24px in from
// its corner (clear of the 14px radius, under the avatar) that turns into the
// specialist's left side. The turn needs room, an 8px corner and 8px of
// straight, so a specialist sits 40px in from its lead rather than 24px (at
// 24px the line would run down the specialist's own edge). Columns sit 32px
// apart, so a clear 32px gutter runs from the leads' row to the bottom of the
// chart and each column reads as one family. Four columns of 248px make the
// tree 1088px wide, inside the 1104px a 1456px window leaves the canvas after
// its 48px fit padding: the chart fits at zoom 1, and its text renders at its
// true size.
export const ORG_SPACING = { rank: 40, column: 32, indent: 40, stack: 12 } as const;

/** The elbow's source: the lead's bottom edge, 24px in from the left corner. */
const ELBOW_SOURCE = { id: "elbow", at: { side: "bottom", offset: 24 } } as const;

export type TeamNodeData = { rank: number };
export type AgentNodeData = { agentId: string; rank: number; handles: FlowNodeHandles };
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

function placeTree(agents: readonly FleetAgent[]) {
  const items: TreeItem[] = [
    { id: TEAM_NODE_ID, parentId: null, width: 0, height: TEAM_NODE_HEIGHT },
    ...agents.map((agent) => ({ id: agent.id, parentId: chartParentOf(agent), ...AGENT_NODE_SIZE })),
  ];
  return layoutOrgTree(items, ORG_SPACING);
}

export function buildOrgNodes(team: Team, agents: readonly FleetAgent[], runs: readonly FleetRun[]): OrgNode[] {
  const placed = placeTree(agents);
  const ownerName = (id: string) => team.members.find((member) => member.id === id)?.name ?? id;
  const at = (id: string) => placed.get(id) ?? { x: 0, y: 0, rank: 0, children: null };

  const teamPlacement = at(TEAM_NODE_ID);
  const teamNode: OrgTeamNode = {
    id: TEAM_NODE_ID,
    type: "team",
    position: { x: teamPlacement.x, y: teamPlacement.y },
    // Its width is its content's, so it is centred on its point.
    origin: [0.5, 0],
    data: { rank: teamPlacement.rank },
    ariaLabel: teamLabel(team, agents),
    // Context, not a destination: nothing opens from it, so no selection. It
    // keeps a tab stop so its tooltip (the team's spend and score) is
    // reachable from the keyboard too.
    selectable: false,
  };

  const agentNodes = agents.map((agent): OrgAgentNode => {
    const placement = at(agent.id);
    const stacked = at(chartParentOf(agent)).children === "stack";
    return {
      id: agent.id,
      type: "agent",
      position: { x: placement.x, y: placement.y },
      data: {
        agentId: agent.id,
        rank: placement.rank,
        handles: {
          target: stacked ? "left" : "top",
          source: placement.children === "row",
          extraSource: placement.children === "stack" ? ELBOW_SOURCE : undefined,
        },
      },
      ariaLabel: agentLabel(
        agent,
        ownerName(agent.ownerId),
        runs.filter((run) => run.agentId === agent.id),
      ),
    };
  });

  return [teamNode, ...agentNodes];
}

/**
 * Edges: a static hairline from every agent up to whoever it reports to (the
 * bus out of a row parent's bottom centre, the elbow out of a lead's corner
 * into a stacked specialist), and live delegation drawn from each working
 * run's `helpers`. When the helper is a direct report (always, in today's
 * mock) the reporting line itself turns live, so the chart never doubles a
 * line; a helper elsewhere in the tree gets its own curve. Live edges sit one
 * layer up so their dashes draw over the hairlines that share their trunk.
 */
export function buildOrgEdges(team: Team, agents: readonly FleetAgent[], runs: readonly FleetRun[]): FlowEdge[] {
  const byId = new Map(agents.map((agent) => [agent.id, agent]));
  const nameOf = (id: string) => (id === TEAM_NODE_ID ? team.name : (byId.get(id)?.name ?? id));
  const placed = placeTree(agents);

  const edges = new Map<string, FlowEdge>();
  for (const agent of agents) {
    const source = chartParentOf(agent);
    const elbow = placed.get(source)?.children === "stack";
    edges.set(`${source}->${agent.id}`, {
      id: `${source}->${agent.id}`,
      source,
      target: agent.id,
      type: "static",
      ...(elbow ? { sourceHandle: ELBOW_SOURCE.id, data: { curve: "elbow" } } : {}),
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

// WORDS. The tooltips (org/node-tip.tsx) and the accessible names say the
// same facts, so both read them from here. A node's wrapper is what Tab lands
// on, so its label carries everything the node and its tooltip show, plus the
// two facts the old card showed that now live in the sheet (active runs, the
// model).

/** The team's totals: people, agents, spend against budget, average score. */
export function teamTotals(team: Team, agents: readonly FleetAgent[]) {
  const spend = agents.reduce((sum, agent) => sum + agent.spend, 0);
  const budget = agents.reduce((sum, agent) => sum + agent.budget, 0);
  const score = agents.length > 0 ? agents.reduce((sum, agent) => sum + agent.score, 0) / agents.length : 0;
  return { people: team.members.length, agents: agents.length, spend, budget, score: Math.round(score) };
}

/** "$1,000 of $1,620" */
export function spendOfBudget(spend: number, budget: number): string {
  return `${formatUsd(spend, { whole: true })} of ${formatUsd(budget, { whole: true })}`;
}

/** What the agent is doing, why it stopped, or how busy it has been. */
export function liveLine(agent: FleetAgent): string {
  if (agent.state === "idle") return `Idle, ${agent.runsThisWeek} runs this week`;
  if (agent.state === "paused") return agent.activity ?? "Paused";
  if (agent.state === "error") return agent.activity ?? "Stopped with an error";
  return agent.activity ?? "Working";
}

/** "Karthik Sivacharan, $119 of $200, score 89" */
export function accountLine(agent: FleetAgent, ownerName: string): string {
  return `${ownerName}, ${spendOfBudget(agent.spend, agent.budget)}, score ${agent.score}`;
}

function listOf(names: readonly string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function teamLabel(team: Team, agents: readonly FleetAgent[]): string {
  const totals = teamTotals(team, agents);
  return [
    `${team.name} team, ${totals.people} people and ${totals.agents} agents`,
    listOf(team.members.map((member) => member.name)),
    team.description.replace(/\.$/, ""),
    `${spendOfBudget(totals.spend, totals.budget)} this month, average score ${totals.score}`,
  ].join(". ");
}

function agentLabel(agent: FleetAgent, ownerName: string, runs: readonly FleetRun[]): string {
  const asks = runs.filter((run) => run.status === "needs-you");
  const active = runs.filter(isActiveRun).length;
  const state = agent.state === "paused" ? "Paused: " : agent.state === "error" ? "Error: " : "";
  return [
    `${agent.name}, ${agent.role}`,
    `${state}${liveLine(agent)}`,
    ...asks.map((run) => `Needs you: ${run.needs ?? run.title}`),
    `Owner ${accountLine(agent, ownerName)}`,
    `${active} active ${active === 1 ? "run" : "runs"}, ${agent.model}`,
  ].join(". ");
}
