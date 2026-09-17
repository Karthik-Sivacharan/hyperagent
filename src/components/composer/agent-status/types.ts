/**
 * The vocabulary for a composer that watches several agents at once.
 *
 * The variant this belongs to replaces the "Working… / Stop" strip
 * (composer-status.tsx): the left of the bar goes empty and the right carries
 * a stack of agent glyphs, each one wearing its own state. It is the avatar
 * pattern from the 2026-09-17 desk research — the presence signal lives ON the
 * figure rather than in a layer beside it, motion carries reassurance and
 * hover reveals the current action — narrowed to the four states this product
 * can actually be in.
 */

/**
 * Four states, and no `idle`: a bar that is on screen at all means at least
 * one agent has work, so "nothing happening" is the bar not being there.
 *
 * - `running`  — working now. Carries NO hue; the glyph's own motion (eyes
 *                moving, body morphing) is the signal, which is the one part
 *                of this the research is emphatic about.
 * - `done`     — finished, nothing wanted. Green.
 * - `input`    — stopped and waiting on the person. Amber, the only state
 *                that is asking for something.
 * - `stuck`    — failed or blocked on something it cannot pass. Red.
 */
export type AgentRunState = "running" | "done" | "input" | "stuck";

/** One agent's turn, as the bar needs to draw it. */
export type AgentRun = {
  /**
   * This RUN's id, which is not the agent's: one agent doing three things is
   * three runs. The bar keys chips and the open detail on it.
   */
  id: string;
  /**
   * The agent behind the run, when the caller has an id for it. It is what
   * lets the bar gather one agent's runs into a single expanded row, and it is
   * optional because a bar handed four unrelated runs never needs to — those
   * fall back to matching on `name`, which is the only other thing a run
   * carries that belongs to the agent rather than to the work.
   */
  agentId?: string;
  /** The agent's own name, shown in the tooltip and the expanded row. */
  name: string;
  /** A glyph id from the registry (`ALL_GLYPHS`), e.g. "trefoil". */
  glyph: string;
  state: AgentRunState;
  /**
   * What it is doing, present tense, sentence case, no period — the tool-call
   * idiom ("Reading the library"). The tooltip's second line, and the headline
   * of the expanded row.
   */
  task: string;
  /** The one parameter after the task, as a tool-call row carries one. */
  detail?: string;
  /**
   * 0 to 1. Drives the dial that stands in front of the expanded row, so a
   * half-done task reads as half a disc. Omit and the dial is the state's
   * plain mark.
   */
  progress?: number;
};
