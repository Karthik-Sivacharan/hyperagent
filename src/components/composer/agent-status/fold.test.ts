import { describe, expect, it } from "vitest";

import { roomAgentRuns } from "@/components/rooms/tracker/agent-runs";
import { AGENT_RUNS, CROWDED_FLEET, THREE_RUNNING_OF_FOUR } from "@/lib/mock/agent-status";
import { tasksForRoom } from "@/lib/mock/room-tracker";

import { agentLeads, foldStack, sameAgent } from "./fold";
import { runCountLabel } from "./run-count";
import type { AgentRun } from "./types";

// The folded stack's seats (fold.ts). The demo room is tested by name because
// its default — one working, one done, one stuck — is a decision the user
// made, and the rule is only right while it still produces it.

const demo = roomAgentRuns(tasksForRoom("room_capability_checks"));

function distinctAgents(runs: readonly AgentRun[]): number {
  return runs.filter((run, index) => !runs.slice(0, index).some((earlier) => sameAgent(earlier, run))).length;
}

describe("agentLeads", () => {
  it("draws each agent once, and every agent in the demo room stands for more than one run", () => {
    const leads = agentLeads(demo);
    expect(leads).toHaveLength(distinctAgents(demo));
    for (const lead of leads) {
      expect(demo.filter((run) => sameAgent(run, lead)).length).toBeGreaterThan(1);
    }
  });

  it("keeps the design page's crowd at one agent per run, so it still overflows at 512", () => {
    expect(agentLeads(CROWDED_FLEET)).toHaveLength(CROWDED_FLEET.length);
    expect(CROWDED_FLEET).toHaveLength(15);
  });

  it("wears each agent's loudest run", () => {
    const mediaLab = agentLeads(demo).find((lead) => lead.agentId === "media-lab");
    expect(mediaLab?.state).toBe("input");
  });

  it("keeps a mention inside the agent it is for", () => {
    const mention: AgentRun = {
      id: "evalbot",
      agentId: "evalbot",
      name: "EvalBot",
      glyph: "trefoil",
      state: "running",
      task: "Queueing the eval suite",
    };
    expect(agentLeads([...demo, mention])).toHaveLength(agentLeads(demo).length);
  });
});

describe("runCountLabel", () => {
  it("counts agents working, not runs", () => {
    const working = demo.filter((run) => run.state === "running");
    expect(runCountLabel(demo)).toBe(`${distinctAgents(working)} agents working`);
  });
});

describe("foldStack", () => {
  it("seats the demo room's agents as working, done and stuck", () => {
    const leads = agentLeads(demo);
    const { seated, folded } = foldStack(leads);
    expect(seated.map((run) => run.state)).toEqual(["running", "done", "stuck"]);
    expect(seated.map((run) => run.agentId)).toEqual(["zippy", "yuki", "triage"]);
    expect(folded).toHaveLength(leads.length - 3);
  });

  it("puts three different agents in the seats even when handed raw runs", () => {
    const { seated, folded } = foldStack(demo);
    expect(seated.map((run) => run.state)).toEqual(["running", "done", "stuck"]);
    expect(distinctAgents(seated)).toBe(3);
    expect(folded).toHaveLength(demo.length - 3);
  });

  it("folds the rest in reading order, whoever wants something first", () => {
    const { folded } = foldStack(demo);
    expect(folded[0]?.state).toBe("input");
  });

  it("loses nothing and repeats nothing", () => {
    for (const fleet of [demo, AGENT_RUNS, THREE_RUNNING_OF_FOUR]) {
      const { seated, folded } = foldStack(fleet);
      const ids = [...seated, ...folded].map((run) => run.id);
      expect(new Set(ids).size).toBe(fleet.length);
      expect(ids.sort()).toEqual(fleet.map((run) => run.id).sort());
    }
  });

  it("gives a state a second seat only when there are fewer states than seats", () => {
    const { seated, folded } = foldStack(THREE_RUNNING_OF_FOUR);
    expect(seated.map((run) => run.state)).toEqual(["running", "running", "input"]);
    expect(folded).toHaveLength(1);
  });

  it("keeps the seats still when a mention adds a run the seats cannot use", () => {
    const before = foldStack(demo).seated.map((run) => run.id);
    const mention: AgentRun = {
      id: "zippy",
      agentId: "zippy",
      name: "Zippy",
      glyph: "sweep",
      state: "running",
      task: "Walking the backlog",
    };
    const after = foldStack([...demo, mention]);
    expect(after.seated.map((run) => run.id)).toEqual(before);
    expect(after.folded).toHaveLength(demo.length - 3 + 1);
  });

  it("folds nothing when the fleet fits", () => {
    const { seated, folded } = foldStack(demo.slice(0, 2));
    expect(seated).toHaveLength(2);
    expect(folded).toHaveLength(0);
  });
});
