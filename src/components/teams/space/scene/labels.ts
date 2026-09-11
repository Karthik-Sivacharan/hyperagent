import type { FleetAgent, FleetRun, TeamMember } from "@/lib/mock/teams";
import type { ActorId } from "@/components/teams/space/types";
import type { Cast } from "@/components/teams/space/scene/cast";
import { TONE_GLYPH } from "@/components/teams/fleet/run-caption";

// WORDS. What a tag prints and what a character's accessible name says. The
// name keeps every fact the office draws around a character (its state, its
// asks, who it is with, where it is), so Tab through the map reads the room:
// "Echo, Email copywriter, working, needs you: Approve sending 42 emails, Outbound".

export function firstName(name: string): string {
  return name.split(" ")[0];
}

/** The name a tag or a list uses: an agent's name, a person's first name, "you" for you. */
export function shortName(cast: Cast, id: ActorId, { you = "you" } = {}): string {
  const member = cast.byId.get(id);
  if (!member) return id;
  if (member.kind === "agent") return member.agent.name;
  return member.you ? you : firstName(member.member.name);
}

/** "Iris, Rook and Quill" */
export function listOf(names: readonly string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/** "working", "idle", "paused: Paused at its $80 monthly budget" */
export function stateWords(agent: FleetAgent): string {
  if (agent.state === "paused" || agent.state === "error") {
    const word = TONE_GLYPH[agent.state].label.toLowerCase();
    return agent.activity ? `${word}: ${agent.activity}` : word;
  }
  return agent.state;
}

export function asksWaiting(count: number): string {
  return `${count} ${count === 1 ? "ask" : "asks"} waiting`;
}

export function agentName(
  agent: FleetAgent,
  asks: readonly FleetRun[],
  company: readonly string[],
  room: string | null,
): string {
  return [
    `${agent.name}, ${agent.role}`,
    stateWords(agent),
    ...asks.map((run) => `needs you: ${run.needs ?? run.title}`),
    company.length > 0 ? `with ${listOf(company)}` : null,
    room,
  ]
    .filter(Boolean)
    .join(", ");
}

export function personName(
  member: TeamMember,
  you: boolean,
  waiting: number,
  company: readonly string[],
  room: string | null,
): string {
  return [
    `${member.name}, ${member.role}`,
    you ? "you" : null,
    member.online ? "online" : "away",
    waiting > 0 ? asksWaiting(waiting) : null,
    company.length > 0 ? `with ${listOf(company)}` : null,
    room,
  ]
    .filter(Boolean)
    .join(", ");
}
