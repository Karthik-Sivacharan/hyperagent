"use client";

import * as React from "react";
import {
  FLEET_AGENTS,
  FLEET_RUNS,
  RUN_STATUS_ORDER,
  TEAM,
  type FleetAgent,
  type FleetRun,
  type RunStatus,
  type Team,
  type TeamMember,
} from "@/lib/mock/teams";

// The one store every /teams view reads. It owns the search query (the
// toolbar writes it, `runs` is filtered by it) and the agent sheet's
// selection (any avatar, row or node calls `openAgent`). The data is the
// static mock; the provider takes it as props so a story or a test can pass
// its own.
//
// `runs` is filtered; `allRuns` and `runsForAgent` never are, since some
// facts belong to the whole team whatever the search: the toolbar's "8 of 24
// runs", the board's queue order, the org chart's asks and live edges, and
// the agent sheet. A query matches a run's title, id or project, or its
// agent's name or role, case-insensitively.

export interface FleetContextValue {
  team: Team;
  agents: FleetAgent[];
  /** Runs matching the query, in the mock's order (status groups, newest first). */
  runs: FleetRun[];
  /** Every run, ignoring the query. */
  allRuns: FleetRun[];
  /** `runs` bucketed by status, every status present (possibly empty). */
  runsByStatus: Record<RunStatus, FleetRun[]>;
  /** Throws on an unknown id: the mock is static, so a miss is a typo. */
  agentById: (id: string) => FleetAgent;
  /** Throws on an unknown id. */
  memberById: (id: string) => TeamMember;
  /** Direct reports of an agent, in the mock's order. */
  subAgentsOf: (id: string) => FleetAgent[];
  /** Every run (unfiltered) the agent is doing. */
  runsForAgent: (id: string) => FleetRun[];
  query: string;
  setQuery: (query: string) => void;
  selectedAgentId: string | null;
  openAgent: (id: string) => void;
  closeAgent: () => void;
}

const FleetContext = React.createContext<FleetContextValue | null>(null);

export function FleetProvider({
  team = TEAM,
  agents = FLEET_AGENTS,
  runs = FLEET_RUNS,
  children,
}: {
  team?: Team;
  agents?: FleetAgent[];
  runs?: FleetRun[];
  children: React.ReactNode;
}) {
  const [query, setQuery] = React.useState("");
  const [selectedAgentId, setSelectedAgentId] = React.useState<string | null>(null);

  const lookups = React.useMemo(() => {
    const agentMap = new Map(agents.map((agent) => [agent.id, agent]));
    const memberMap = new Map(team.members.map((member) => [member.id, member]));
    const agentById = (id: string) => {
      const agent = agentMap.get(id);
      if (!agent) throw new Error(`Unknown fleet agent: ${id}`);
      return agent;
    };
    const memberById = (id: string) => {
      const member = memberMap.get(id);
      if (!member) throw new Error(`Unknown team member: ${id}`);
      return member;
    };
    const subAgentsOf = (id: string) => agents.filter((agent) => agent.parentId === id);
    const runsForAgent = (id: string) => runs.filter((run) => run.agentId === id);
    return { agentMap, agentById, memberById, subAgentsOf, runsForAgent };
  }, [agents, runs, team.members]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return runs;
    return runs.filter((run) => {
      const agent = lookups.agentMap.get(run.agentId);
      return [run.title, run.id, run.project, agent?.name ?? "", agent?.role ?? ""].some((field) =>
        field.toLowerCase().includes(q),
      );
    });
  }, [query, runs, lookups]);

  const runsByStatus = React.useMemo(() => {
    const buckets = Object.fromEntries(RUN_STATUS_ORDER.map((status) => [status, [] as FleetRun[]])) as Record<
      RunStatus,
      FleetRun[]
    >;
    for (const run of filtered) buckets[run.status].push(run);
    return buckets;
  }, [filtered]);

  const openAgent = React.useCallback((id: string) => setSelectedAgentId(id), []);
  const closeAgent = React.useCallback(() => setSelectedAgentId(null), []);

  const value = React.useMemo<FleetContextValue>(
    () => ({
      team,
      agents,
      runs: filtered,
      allRuns: runs,
      runsByStatus,
      agentById: lookups.agentById,
      memberById: lookups.memberById,
      subAgentsOf: lookups.subAgentsOf,
      runsForAgent: lookups.runsForAgent,
      query,
      setQuery,
      selectedAgentId,
      openAgent,
      closeAgent,
    }),
    [team, agents, filtered, runs, runsByStatus, lookups, query, selectedAgentId, openAgent, closeAgent],
  );

  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>;
}

export function useFleet(): FleetContextValue {
  const value = React.useContext(FleetContext);
  if (!value) throw new Error("useFleet must be used inside <FleetProvider>");
  return value;
}
