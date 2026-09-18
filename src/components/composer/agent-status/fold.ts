import { SEAT_PRIORITY, STATE_PRIORITY } from "./run-state";
import type { AgentRun } from "./types";

// Which agents get a disc in the folded stack, and which go behind the +N.
//
// ONE DISC PER AGENT (agentLeads). The stack draws agents, not runs: an agent
// on four tasks is one face, and picking it opens its four
// (composer-agent-status.tsx). Four copies of Media Lab Director down one
// strip read as four agents who happen to share a face, and the question the
// strip answers is who is out there. The disc wears the agent's LOUDEST run,
// the first in STATE_PRIORITY — the one the figure is answering for, which is
// the rule the detail's tile already followed — so an agent stuck on one
// render and fine on another shows stuck, and the list it opens says the rest.
//
// ONE SEAT PER STATE BEFORE ANY STATE GETS TWO. Three seats are too few to be
// a list, so they are a sample: the states the fleet is in, dealt in
// SEAT_PRIORITY (run-state.ts), which in the demo room is one working, one
// done and one stuck. Only when there are fewer states than seats does a state
// get a second disc, and then the rest of the fleet is taken in reading order.
//
// AND A DIFFERENT FACE IN EACH SEAT, WHERE THE FLEET HAS ONE. The stack hands
// `foldStack` one run per agent, so there every seat is a different face by
// construction. The rule still holds for a caller that passes runs: each
// state's run is chosen to put as many different agents on screen as the fleet
// can, taking the first such choice in the fleet's own order — which is what
// keeps the seats still when a mention adds a run at the end: an arrival only
// moves a seat it makes better.
//
// THE REST KEEP READING ORDER. What folds behind the +N is STATE_PRIORITY,
// whoever wants something first, so the counter's tooltip and the row it
// unfolds into lead with the runs the seats passed over for being loud twice.
// Unfolded, the seated three stay where they were and the folded ones follow
// them: the +N opens into what it was counting, in place.

/** How many discs the stack shows before the rest fold into a count. */
export const STACK_MAX = 3;

/** One agent's runs, by the id it carries or, failing that, by its name — the
    only other thing on a run that belongs to the agent and not to the work. */
export function sameAgent(a: AgentRun, b: AgentRun): boolean {
  return a.agentId && b.agentId ? a.agentId === b.agentId : a.name === b.name;
}

/** How many different agents a set of runs is. */
export function agentCount(runs: readonly AgentRun[]): number {
  return runs.filter((run, index) => !runs.slice(0, index).some((earlier) => sameAgent(earlier, run))).length;
}

/**
 * One run from each pool, as many different agents as the pools allow. The
 * walk is in the fleet's order and keeps only a strictly better pick, so the
 * answer is the FIRST best one. Three pools of a handful of runs each is a
 * few dozen leaves, and it stops as soon as no pick could do better.
 */
function mostAgents(pools: readonly (readonly AgentRun[])[]): AgentRun[] {
  let best = pools.map((pool) => pool[0]);
  let most = agentCount(best);
  const ceiling = Math.min(pools.length, agentCount(pools.flat()));
  const walk = (picked: AgentRun[]) => {
    if (most === ceiling) return;
    if (picked.length === pools.length) {
      const n = agentCount(picked);
      if (n > most) {
        best = picked;
        most = n;
      }
      return;
    }
    for (const run of pools[picked.length]) walk([...picked, run]);
  };
  walk([]);
  return best;
}

/**
 * One run per agent: its loudest, in the order the agents first appear. Ties
 * keep the earlier run, so a mention arriving at the end of the fleet does not
 * take over a face that is already saying something as loud.
 */
export function agentLeads(runs: readonly AgentRun[]): AgentRun[] {
  const leads: AgentRun[] = [];
  for (const run of runs) {
    const at = leads.findIndex((lead) => sameAgent(lead, run));
    if (at === -1) leads.push(run);
    else if (STATE_PRIORITY[run.state] < STATE_PRIORITY[leads[at].state]) leads[at] = run;
  }
  return leads;
}

export type FoldedStack = {
  /** The discs, in seat order. */
  seated: AgentRun[];
  /** Everything behind the +N, in reading order. Empty when it all fits. */
  folded: AgentRun[];
};

export function foldStack(runs: readonly AgentRun[], max = STACK_MAX): FoldedStack {
  // Both sorts are stable, so inside one state the fleet keeps its own order.
  const byPriority = [...runs].sort((a, b) => STATE_PRIORITY[a.state] - STATE_PRIORITY[b.state]);
  const bySeat = [...runs].sort((a, b) => SEAT_PRIORITY[a.state] - SEAT_PRIORITY[b.state]);

  const states = [...new Set(bySeat.map((run) => run.state))].slice(0, max);
  const picked = mostAgents(states.map((state) => bySeat.filter((run) => run.state === state)));

  // Seats left over: the fleet in reading order, a new face before a repeat.
  const rest = byPriority.filter((run) => !picked.includes(run));
  while (picked.length < max) {
    const free = rest.filter((run) => !picked.includes(run));
    const next = free.find((run) => !picked.some((seated) => sameAgent(seated, run))) ?? free[0];
    if (!next) break;
    picked.push(next);
  }

  return {
    seated: bySeat.filter((run) => picked.includes(run)),
    folded: byPriority.filter((run) => !picked.includes(run)),
  };
}
