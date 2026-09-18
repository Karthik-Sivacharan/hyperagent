import { describe, expect, it } from "vitest";

import { roomAgentRuns } from "@/components/rooms/tracker/agent-runs";
import { AGENT_RUNS, THREE_RUNNING_OF_FOUR } from "@/lib/mock/agent-status";
import { tasksForRoom } from "@/lib/mock/room-tracker";

import { foldStack, sameAgent } from "./fold";
import type { AgentRun } from "./types";

// The folded stack's seats (fold.ts). The demo room is tested by name because
// its default — one working, one done, one stuck — is a decision the user
// made, and the rule is only right while it still produces it.

const demo = roomAgentRuns(tasksForRoom("room_capability_checks"));

function distinctAgents(runs: readonly AgentRun[]): number {
  return runs.filter((run, index) => !runs.slice(0, index).some((earlier) => sameAgent(earlier, run))).length;
}

describe("foldStack", () => {
  it("seats the demo room as working, done and stuck, three different agents", () => {
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
