import type { StreamParagraph, StreamRow } from "@/lib/mock/agent-stream";

// What an agent is doing on one task, as the thread rail plays it back.
//
// THE CONTRACT, and the reason it is not `AgentScript`. The signup flow's
// script (agent-stream.ts) carries a `question` and answers it with a skills
// card, because that turn exists to ask the person something. A room agent's
// turn exists to be READ — it is work in progress that someone opened to see
// why — so it is the same two materials without the interrogation: the rows a
// tool call prints, and the prose it writes when it is done thinking.
//
// SHORT ON PURPOSE. Three or four rows and two short paragraphs. The rail is
// 400px wide and the reader came here from a one-line status, so anything
// longer is a wall of text arriving where a sentence was promised.
//
// Every id below is a task id from `room-tracker.ts`, and the three of them
// are its `working` tasks in room_capability_checks: the only room whose board
// can reach a thread, because it is the only room with messages. The four
// working cards in the other three rooms have no script and want none, since
// nothing in the UI can open them. A task with no script has an agent working
// somewhere this mock does not follow, and the caller is told so rather than
// handed an empty turn.

/** One agent's working turn on one task. */
export type TaskReasoning = {
  /** The agent's own name, for the turn's byline. */
  agentName: string;
  /** The tool rows, in the order they ran. The last one is the live one. */
  rows: StreamRow[];
  /** What it has written so far. Streams in after the rows land. */
  prose: StreamParagraph[];
};

/** The working turn for a task, or `undefined` for one with no script. */
export function reasoningForTask(taskId: string): TaskReasoning | undefined {
  return REASONING[taskId];
}

/**
 * One line of status for the cell in the thread, present tense, no period:
 * "Reading the deploy log". Falls back to the agent's name alone, which is
 * still true when this mock does not know what it is doing.
 */
export function workingLabelForTask(taskId: string): string | undefined {
  return REASONING[taskId]?.rows.at(-1)?.label;
}

const REASONING: Record<string, TaskReasoning> = {
  // In the order the board lists them, so a reader with both open is reading
  // down the same column twice. Three turns, three different jobs on the same
  // morning: Media Lab Director is chasing the approval gate through its own
  // spawns, Tool-Error Triage is retrying the calls that came back 403, and
  // EvalBot is running the suite. Two of them end up at the same parked
  // render, and each says something different about it, which is the reason a
  // turn is worth opening rather than a status being worth reading.
  t_110: {
    agentName: "Media Lab Director",
    rows: [
      { id: "r1", label: "Reading the worker logs", detail: "last night, four spawns", icon: "reading" },
      { id: "r2", label: "Comparing the spawn payloads", detail: "caller against target", icon: "puzzle" },
      { id: "r3", label: "Checking which the flag reached", detail: "approval mode never_ask", icon: "plug",
        receipt: { kind: "count", text: "0 of 3" } },
    ],
    prose: [
      [{ text: "Three read, and they are the same shape: I am the caller and the target both, so " },
       { text: "the gate reads the spawner, not the flag", strong: true }, { text: "." }],
      [{ text: "never_ask is on and reached none of them. The fourth spawn never started, so there is no fourth log: that one is still parked." }],
    ],
  },
  t_111: {
    agentName: "Tool-Error Triage",
    rows: [
      { id: "r1", label: "Replaying the failed calls", detail: "render.queue, four of them", icon: "plug",
        receipt: { kind: "count", text: "3 of 4" } },
      { id: "r2", label: "Checking the flag has propagated", detail: "every render worker", icon: "puzzle" },
      { id: "r3", label: "Re-queueing the one left", detail: "the fourth call", icon: "plug" },
    ],
    prose: [
      [{ text: "Three went through on the second attempt with nothing changed but the clock, so " },
       { text: "the 403 was the flag arriving late, not a permission we lack", strong: true }, { text: "." }],
      [{ text: "The fourth never got as far as failing. It is parked on the approval gate, and a retry is not a person clicking Approve." }],
    ],
  },
  t_113: {
    agentName: "EvalBot",
    rows: [
      { id: "r1", label: "Loading the suite", detail: "capability/self-delegation", icon: "download" },
      { id: "r2", label: "Running the cases on the new flag", detail: "41 of 62", icon: "puzzle",
        receipt: { kind: "count", text: "2 failing" } },
      { id: "r3", label: "Reading the two that failed", detail: "both on the same call", icon: "reading" },
    ],
    prose: [
      [{ text: "41 cases in, two red, and " }, { text: "both of them are the approval gate", strong: true },
       { text: ": a spawn to myself is accepted and then parked." }],
      [{ text: "The 21 left are delegation scope, all green last night, and none of them touch the gate." }],
    ],
  },
};
