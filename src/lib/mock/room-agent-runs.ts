import type { AgentRun } from "@/components/composer/agent-status/types";
import type { StreamParagraph, StreamRow } from "@/lib/mock/agent-stream";
import type { TaskReasoning } from "@/lib/mock/room-reasoning";
import type { Room, RoomMember, RoomMessage } from "@/lib/mock/rooms";

// What an agent starts doing when a room message tags it, so the mention in
// the field turns into a run in the bar above it. Static like every other mock
// here: nothing is dispatched, the bar is simply told the truth about a fleet
// that does not exist.
//
// THE TASK IS THE AGENT'S, NOT THE MESSAGE'S. A tagged agent reads the room
// before it does anything, so the first line every one of them shows is its
// own opening move in the tool-call idiom types.ts asks for — present tense,
// sentence case, no period, one parameter after it. The parameter is the
// message that summoned it, trimmed, because that is the one thing about this
// run the reader did not already know.
//
// A ROOM AGENT KEEPS ITS OWN FACE. The roster gives each one a glyph shape
// (rooms.ts), and the chip wears that shape in the bar, so the figure beside
// the message and the figure in the bar are the same agent rather than two
// drawings that happen to share a name. The TONE is not carried over: the bar
// paints its own from the run's state (run-state.ts), which is what lets a
// working agent be hueless and a stuck one be red.

/** The opening move, per agent. Anything not listed falls back to the last line. */
const OPENING_TASK: Readonly<Record<string, string>> = {
  "media-lab": "Setting up the render",
  triage: "Re-reading the failed calls",
  evalbot: "Queueing the eval suite",
  yuki: "Opening the changelog",
  zippy: "Walking the backlog",
};

/** The quoted message, short enough to sit on one line of a tooltip. */
function excerpt(message: string, max = 48): string {
  const line = message.replace(/\s+/g, " ").trim();
  if (!line) return "No instruction";
  return line.length <= max ? line : `${line.slice(0, max - 1).trimEnd()}…`;
}

/**
 * One tagged agent, as the composer's bar needs to draw it. `running` and a
 * fraction, because a run that has only just been handed its message is the
 * one state this can honestly be in — and it is the state whose glyph moves.
 */
export function runForMention(member: RoomMember, message: string): AgentRun {
  return {
    // A mention's run has no task, so the agent IS the run: one mention of an
    // agent already out replaces its row rather than adding a second.
    id: member.id,
    agentId: member.id,
    name: member.name,
    // Every agent on the roster carries a glyph; `trefoil` is the floor for a
    // member that somehow does not, so the bar never renders a hole.
    glyph: member.glyph?.shape ?? "trefoil",
    state: "running",
    task: OPENING_TASK[member.id] ?? "Picking up your message",
    detail: excerpt(message),
    progress: 0.08,
  };
}

/* ------------------------------------------------------- the working turn */

// What the rail plays back when someone opens a tagged agent's live cell
// before it has answered — the tool rows and a line of what it is thinking, in
// room-reasoning.ts's shape, so RoomAgentThread draws it exactly the way it
// draws a board task's turn. Three rows: the message it was handed, one step
// of its own trade, and last, live, the same opening move the bar's row names
// (OPENING_TASK), so the bar, the cell and the turn all say one thing.

type TurnScript = { middle: Omit<StreamRow, "id">; live: Omit<StreamRow, "id" | "label">; prose: StreamParagraph };

const TURN: Readonly<Record<string, TurnScript>> = {
  "media-lab": {
    middle: { label: "Checking the render workers", detail: "two free", icon: "puzzle" },
    live: { detail: "as a background job", icon: "plug" },
    prose: [
      { text: "Going out as a background job rather than inline, so " },
      { text: "the room keeps moving while it renders", strong: true },
      { text: "." },
    ],
  },
  triage: {
    middle: { label: "Pulling the overnight sweep", detail: "render.queue", icon: "download" },
    live: { detail: "against the new flag", icon: "plug" },
    prose: [
      { text: "Nothing new since the sweep so far. Replaying the last four to be sure " },
      { text: "the flag has reached every worker", strong: true },
      { text: "." },
    ],
  },
  evalbot: {
    middle: { label: "Loading the suite", detail: "capability/self-delegation", icon: "download" },
    live: { detail: "62 cases", icon: "puzzle" },
    prose: [
      { text: "Running the whole suite rather than the two that failed last night, so " },
      { text: "the diff has a baseline to be against", strong: true },
      { text: "." },
    ],
  },
  yuki: {
    middle: { label: "Finding the release it belongs to", detail: "the next train", icon: "reading" },
    live: { detail: "the draft", icon: "pencil" },
    prose: [
      { text: "Writing it in the release notes' voice: " },
      { text: "what changed and who it affects", strong: true },
      { text: ", nothing about how." },
    ],
  },
  zippy: {
    middle: { label: "Checking for a duplicate", detail: "open cards", icon: "puzzle" },
    live: { detail: "by priority", icon: "reading" },
    prose: [
      { text: "Making sure " },
      { text: "nothing like it is already filed", strong: true },
      { text: " before adding a new card." },
    ],
  },
};

/** The live turn for one tagged agent on one message (`text` as stored). */
export function turnForMention(member: RoomMember, text: string): TaskReasoning {
  const ask = askOf(text);
  const script = TURN[member.id];
  const rows: StreamRow[] = [
    { id: "r1", label: "Reading your message", detail: ask ? excerpt(ask, 40) : "the mention", icon: "reading" },
    ...(script ? [{ id: "r2", ...script.middle }] : []),
    {
      id: "r3",
      label: OPENING_TASK[member.id] ?? "Picking up your message",
      detail: script?.live.detail ?? "in this room",
      icon: script?.live.icon ?? "puzzle",
    },
  ];
  return {
    agentName: member.name,
    rows,
    prose: [script?.prose ?? [{ text: "On it. The answer lands in this thread when it is done." }]],
  };
}

/* ------------------------------------------------------------- the answer */

// What a tagged agent posts in the thread once its run lands on `done`, so the
// message that summoned it gains its "1 reply" the way a real one would. One
// line per agent, in its own trade, with the ask quoted back: a canned answer
// that did not name what it was answering would read as a bot talking past
// the message rather than to it. Static like the opening moves above —
// nothing ran, and the thread is told what a finished run would have said.

/** Each agent's answer, handed the ask already quoted (or "this", for none). */
const ANSWER: Readonly<Record<string, (said: string) => string>> = {
  "media-lab": (said) =>
    `Rendered ${said} as a background job rather than inline. Two variants are on the canvas, side by side.`,
  triage: (said) =>
    `Checked ${said} against the overnight sweep. No new failures, and nothing is parked in \`pending_approval\`.`,
  evalbot: (said) => `Ran ${said} on the new flag: **62 of 62** cases pass, nothing regressed against last night.`,
  yuki: (said) => `Added ${said} to the changelog draft. It goes out with the next release notes.`,
  zippy: (said) => `Filed ${said} on the backlog, at the top of the next triage.`,
};

/** The ask with its mentions taken out: what was asked, not who of. */
function askOf(text: string): string {
  return text
    .replace(/@\[[^\]]+\]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[\s,:;.]+/, "")
    .trim();
}

/**
 * The reply a tagged agent posts when its run finishes. `text` is the message
 * as the room stores it, `@[id]` tokens and all; they are stripped, so the
 * quote is the instruction rather than the roll call in front of it.
 */
export function answerForMention(member: RoomMember, text: string): string {
  const ask = askOf(text);
  const said = ask ? `“${excerpt(ask, 80)}”` : "this";
  return ANSWER[member.id]?.(said) ?? `Done with ${said}.`;
}

/* ------------------------------------------------- where an agent is working */

// Picking an agent's chip puts its conversation on screen, which means the bar
// has to answer "where is this one working?" from nothing but an id. A room
// keeps that answer in three places, and they are searched in the order of how
// directly each one is about THIS agent:
//
//   1. a thread the agent has replied in — it is talking there right now;
//   2. the last message that named it — it was asked there, and the rail opens
//      on a root with no replies perfectly well;
//   3. the last message it posted itself, for an agent that speaks on a
//      schedule and was never tagged by anyone.
//
// MEMBERSHIP LINES ARE NOT A DESTINATION, which is why `system` messages are
// skipped. "Yuki was added to the room by Priya" is where a silent agent
// appears, but the column filters those out (room-message-list.tsx), so
// sending a reader there scrolls to an element that is not on screen and opens
// a rail on a join notice. An agent with nothing to its name is better served
// by the other way out of the bar: its card on the tracker.
//
// LAST, NOT FIRST, at every step: an agent that has been in four threads is
// most likely still in the one it was in most recently, and a room reads
// oldest-first, so the scans run from the end.
//
// UNDEFINED IS A REAL ANSWER, and three of this mock's four rooms give it:
// they have no messages at all yet, so there is nowhere in them for any agent
// to be. The caller is told so rather than sent somewhere plausible — a jump
// to the wrong thread costs more than a click that politely does nothing.

/** Every message in the room, oldest first, days flattened away. */
function allMessages(room: Room): RoomMessage[] {
  return room.days.flatMap((day) => day.messages);
}

/** True when this message's prose carries `@[id]` for the given member. */
function mentions(message: RoomMessage, memberId: string): boolean {
  const token = `@[${memberId}]`;
  return message.blocks.some((block) =>
    block.kind === "paragraph" ? block.text.includes(token) : block.items.some((item) => item.includes(token)),
  );
}

/** The root message whose thread an agent belongs in, or `undefined` for one
    the room has not spoken to yet. */
export function threadForAgent(room: Room, agentId: string): string | undefined {
  const spoke = [...room.threads].reverse().find((thread) => thread.replies.some((r) => r.authorId === agentId));
  if (spoke) return spoke.rootId;

  const messages = allMessages(room).reverse();
  return (
    messages.find((message) => mentions(message, agentId))?.id ??
    messages.find((message) => message.authorId === agentId && !message.system)?.id
  );
}
