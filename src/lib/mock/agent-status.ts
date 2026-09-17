import type { AgentRun, AgentRunState } from "@/components/composer/agent-status/types";

// The fleet the composer's agent bar watches (composer-agent-status.tsx), and
// the material its design page is built from. Static, like everything else in
// this directory: nothing is running behind this screen, so every state is
// written out.
//
// SEVEN, NOT FIVE. The bar shows three chips and folds the rest into a count,
// so a fleet of exactly one per state would only ever prove the exact-fit case
// and the overflow would never be seen. Seven puts three figures on the right
// and a "+4" behind them, which is the shape the bar exists for. It also lets
// `running` and `done` appear twice, so the stack reads as a group of agents
// rather than as one chip per state, which is the thing a one-each fleet
// quietly implies.
//
// THE ORDER HERE IS NOT THE ORDER ON SCREEN. The stack sorts by
// STATE_PRIORITY (run-state.ts): whoever wants something first, then trouble,
// then the ones still going, then the ones already finished. So this file is
// written in the order a person would have started them, oldest first, and the
// sorting is left to the thing that draws it. Anything that only reads right
// in source order is a bug in the reader, and writing it pre-sorted would hide
// exactly that.
//
// TASKS ARE THE TOOL-CALL IDIOM, the one types.ts asks for and the one a
// running turn already prints (thread/tool-call-row.tsx): present tense,
// sentence case, no period, and exactly one parameter after it. So the chip's
// tooltip and the expanded row say the same sentence the thread would have
// said, and nothing has to be rewritten to move between them. The parameter is
// a thing, not a sentence: a count, a company, a person, a reason.
//
// PROGRESS ONLY WHERE THERE IS ANY. `running` and `input` carry a fraction, so
// the dial in front of the expanded row has an arc to draw; `done` and `stuck`
// do not, because a finished run is not 100% of anything a person wants to
// read and a stuck one stopped where it stopped. Omitted, the dial falls back
// to the state's plain mark (run-state.ts).
//
// EVERY NAME IS INVENTED. The companies and the people below are made up, and
// they are deliberately dull: an agent fleet is most legible when the work is
// somebody's ordinary Tuesday, and a mock that name-drops is a mock that gets
// read as a claim.

export const AGENT_RUNS: readonly AgentRun[] = [
  {
    id: "inbox-triage",
    name: "Inbox triage",
    glyph: "sweep",
    state: "running",
    task: "Sorting last night's mail",
    detail: "48 threads",
    progress: 0.34,
  },
  {
    id: "expense-review",
    name: "Expense review",
    glyph: "bell",
    state: "input",
    task: "Waiting on your approval",
    detail: "Tomas Beck, 4 receipts",
    progress: 0.62,
  },
  {
    id: "weekly-digest",
    name: "Weekly digest",
    glyph: "trefoil",
    state: "done",
    task: "Drafting the Friday note",
    detail: "9 merges, 3 releases",
  },
  {
    id: "release-watch",
    name: "Release watch",
    glyph: "portal",
    state: "stuck",
    task: "Opening the deploy log",
    detail: "No access to staging",
  },
  {
    id: "market-sweep",
    name: "Market sweep",
    glyph: "hammerhead",
    state: "running",
    task: "Reading the quarterly filings",
    detail: "Halcyon Foods",
    progress: 0.71,
  },
  {
    id: "spend-check",
    name: "Spend check",
    glyph: "pinwheel",
    state: "done",
    task: "Reconciling the month",
    detail: "Calder and Rowe, 3 gaps",
  },
  // The one state nothing about the work produced: somebody pressed Stop on
  // it. It keeps the task it was part way through and carries no fraction,
  // because a run that was called off is not a fraction of anything — the same
  // reason `done` and `stuck` carry none.
  {
    id: "deck-build",
    name: "Deck build",
    glyph: "slot-stack",
    state: "stopped",
    task: "Laying out the quarterly deck",
    detail: "Stopped at slide 6 of 18",
  },
];

/**
 * One agent on four tasks, for the specimen that shows the expanded row
 * stacking. It is the case the board makes routine and the bar has to survive:
 * an agent can be stuck on one piece of work and perfectly fine on another, so
 * the four states here sit on ONE name and one glyph rather than four. Written
 * out rather than derived from AGENT_RUNS, because every line has to be a
 * sentence that agent could really be saying at the same moment as the others.
 */
export const ONE_AGENT_MANY_TASKS: readonly AgentRun[] = [
  {
    id: "render-second",
    agentId: "media-lab",
    name: "Media Lab Director",
    glyph: "pinwheel",
    state: "stuck",
    task: "Start the second background render",
    detail: "The spawn is parked in pending approval",
  },
  {
    id: "allowlist",
    agentId: "media-lab",
    name: "Media Lab Director",
    glyph: "pinwheel",
    state: "input",
    task: "Widen the delegation allowlist",
    detail: "Drafted and parked, it needs a yes",
    progress: 0.8,
  },
  {
    id: "trace-gate",
    agentId: "media-lab",
    name: "Media Lab Director",
    glyph: "pinwheel",
    state: "running",
    task: "Trace the approval gate through the logs",
    detail: "41 of 60 spawns",
    progress: 0.68,
  },
  {
    id: "first-render",
    agentId: "media-lab",
    name: "Media Lab Director",
    glyph: "pinwheel",
    state: "done",
    task: "Render the team as a background job",
    detail: "One image, everyone as a cat",
  },
];

/**
 * One agent, four tasks, three of them still going — the case that puts three
 * Stops in one row.
 *
 * It is the specimen for the control rather than for the state: `running` is
 * the only state that can be stopped, so a fleet of one running task shows the
 * Stop but not what a COLUMN of them does to the right edge. Three does, and
 * three is also the honest number — an agent with four live tasks is normal on
 * a board that is per task, and a person looking at this row is deciding which
 * one to call off, not whether the control exists.
 *
 * The fourth is `input` rather than `done`, so the row also shows the absence:
 * the one line that is not running has no Stop, because it has already
 * stopped and is waiting on a person. Written running-first so the three sit
 * together and the gap at the bottom is visible as a gap.
 */
export const THREE_RUNNING_OF_FOUR: readonly AgentRun[] = [
  {
    id: "eval-flag",
    agentId: "evalbot",
    name: "EvalBot",
    glyph: "trefoil",
    state: "running",
    task: "Running the suite on the delegation flag",
    detail: "41 of 62 cases",
    progress: 0.66,
  },
  {
    id: "eval-replay",
    agentId: "evalbot",
    name: "EvalBot",
    glyph: "trefoil",
    state: "running",
    task: "Replaying yesterday's failures",
    detail: "9 cases, 2 still red",
    progress: 0.22,
  },
  {
    id: "eval-gate",
    agentId: "evalbot",
    name: "EvalBot",
    glyph: "trefoil",
    state: "running",
    task: "Checking the approval gate end to end",
    detail: "3 of 11 spawns",
    progress: 0.27,
  },
  {
    id: "eval-flaky",
    agentId: "evalbot",
    name: "EvalBot",
    glyph: "trefoil",
    state: "input",
    task: "Waiting on a verdict for the flaky case",
    detail: "Case 58, third rerun",
    progress: 0.9,
  },
];

/** The order types.ts declares, which is hueless first and loudest last. */
const STATE_ORDER: readonly AgentRunState[] = ["running", "done", "input", "stuck", "stopped"];

/**
 * One run per state, for the specimen row that compares them side by side.
 * Picked out of the fleet rather than written again, so a state can never be
 * shown on the design page in a dress the bar itself never puts it in.
 */
export const ONE_PER_STATE: readonly AgentRun[] = STATE_ORDER.flatMap((state) => {
  const run = AGENT_RUNS.find((candidate) => candidate.state === state);
  return run ? [run] : [];
});
