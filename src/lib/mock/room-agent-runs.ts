import type { AgentRun } from "@/components/composer/agent-status/types";
import type { RoomMember } from "@/lib/mock/rooms";

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
    id: member.id,
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
