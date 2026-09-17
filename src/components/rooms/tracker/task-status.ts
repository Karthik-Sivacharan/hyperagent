import {
  IconCircleCheck,
  IconCircleDashed,
  IconProgress,
  IconProgressAlert,
  IconProgressHelp,
} from "@tabler/icons-react";

import type { TrackerStatusMeta } from "@/components/tracker/status";
import type { TaskStatus } from "@/lib/mock/room-tracker";

// The room's five lanes and how each one looks, in the table the tracker
// shell is handed (docs/plans/2026-09-17-room-tracker.md §3, §5). The shell
// never names a status, so this is the only place the room's vocabulary turns
// into a label, a glyph and a tone, and the board, the list and the card all
// read it rather than agreeing with each other by hand.
//
// Icons are one family, Tabler's progress circles, the same family /teams
// wears: dashed while nothing has happened (queued), part drawn while the
// task is under way, whole once it is finished (docs/brand/icons.md). Blocked
// takes the alert circle because the work stopped somewhere in the middle,
// which is what a part-drawn ring with a warning in it says.
//
// THE COLOUR BUDGET. /teams spends one hue, tangerine on Needs you. This
// spends two: tangerine on Needs you, `destructive` on Blocked. That is not
// an escalation, it is the budget the composer's agent strip already holds,
// where `stuck` is `text-destructive` and `input` is `text-warning`, and this
// board is that strip expanded (§3). The rule underneath both is unchanged:
// colour means a person is needed. Blocked qualifies because the agent has
// stopped and cannot ask its way out, so the only way it moves is somebody in
// the room noticing. Working, the lane that does most of the living, stays
// grey, and so does everything else, because the glyph and the label already
// say which lane it is and a hue would only repeat them.

export const TASK_STATUS_META: Record<TaskStatus, TrackerStatusMeta> = {
  "needs-you": { label: "Needs you", icon: IconProgressHelp, tone: "brand" },
  blocked: { label: "Blocked", icon: IconProgressAlert, tone: "danger" },
  working: { label: "Working", icon: IconProgress, tone: "neutral" },
  queued: { label: "Queued", icon: IconCircleDashed, tone: "neutral" },
  done: { label: "Done", icon: IconCircleCheck, tone: "neutral" },
};

/**
 * The line an empty lane shows outside a search, where a search that keeps
 * nothing says "No matches" instead. Each one names what the lane holds, so
 * an empty board reads as a sentence about the room rather than five blanks.
 */
export const TASK_EMPTY_COPY: Record<TaskStatus, string> = {
  "needs-you": "Nothing needs you right now",
  blocked: "Nothing is stuck",
  working: "No agent is working",
  queued: "The queue is clear",
  done: "Nothing finished yet",
};
