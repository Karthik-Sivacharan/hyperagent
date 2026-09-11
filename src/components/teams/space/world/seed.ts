// Where everyone is when the office opens (docs/plans/2026-09-11-teams-space-v1.md
// §2). The mock is a moment in time, so the scene starts where the data says:
// the week 37 growth review (RUN-224: Atlas with Iris, Rook and Quill) sits
// round the meeting table, everyone else works at their own desk, Priya (you)
// stands in the hall outside the meeting room door, Diego is at his Outbound
// desk, and Sam is offline, so his Finance ops desk is empty and tagged away.

import type { ActorId, Placement } from "../types";
import { SEAT_BY_ID } from "./map";

function seated(seat: string): Placement {
  const s = SEAT_BY_ID[seat];
  if (!s) throw new Error(`space seed: no seat "${seat}"`);
  return { tile: { ...s.tile }, facing: s.facing, seat };
}

export const SEED: Record<ActorId, Placement> = {
  // RUN-224, the growth review: Atlas at the head of the table, the three leads round it.
  "a-atlas": seated("meet-1"),
  "a-iris": seated("meet-2"),
  "a-rook": seated("meet-3"),
  "a-quill": seated("meet-4"),

  // Everyone else at their own desk.
  "a-scout": seated("desk-scout"),
  "a-gauge": seated("desk-gauge"),
  "a-finch": seated("desk-finch"),
  "a-echo": seated("desk-echo"),
  "a-cadence": seated("desk-cadence"),
  "a-mosaic": seated("desk-mosaic"),
  "a-ledger": seated("desk-ledger"),
  "a-tally": seated("desk-tally"),

  // People. Priya waits in the hall outside the meeting room door, facing it.
  "m-priya": { tile: { x: 17, y: 12 }, facing: "down" },
  "m-diego": seated("desk-diego"),
};

/** Desks whose owner is away: no character, a quiet "away" tag on the empty chair. */
export const AWAY_DESKS: { memberId: ActorId; seat: string }[] = [{ memberId: "m-sam", seat: "desk-sam" }];
