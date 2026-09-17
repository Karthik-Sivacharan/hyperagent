import type { AgentRun } from "@/components/composer/agent-status/types";
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
