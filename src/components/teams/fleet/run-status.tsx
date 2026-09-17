import {
  IconCircleCheck,
  IconCircleDashed,
  IconProgress,
  IconProgressCheck,
  IconProgressHelp,
} from "@tabler/icons-react";
import type { RunStatus } from "@/lib/mock/teams";
import { TrackerStatusIcon, type TrackerStatusMeta } from "@/components/tracker/status";

// The five run statuses and how each one looks, shared by every fleet view.
// The shape is the tracker shell's (tracker/status.tsx), so the board and the
// list draw this table without knowing a run from anything else a tracker
// holds (docs/plans/2026-09-17-room-tracker.md §5). This file is /teams'
// vocabulary, and the only place it is written down.
//
// Icons are one family, Tabler's progress circles: dashed while nothing has
// happened (queued), part drawn while the run is under way (working, needs
// you, in review, each with its own glyph inside), whole once it is done.
// One glyph per meaning, and the same glyph wherever a status appears
// (docs/brand/icons.md).
//
// Colour means a person is needed (docs/plans/2026-09-11-teams-fleet-polish.md
// §3), so /teams spends two of the shell's three tones. "Needs you" is
// `brand`: its glyph is the tangerine accent, the one place /teams spends it.
// Every other status is `neutral`, on the third text tier
// (`foreground-low`), because its glyph and its label already say which
// status it is and a hue would only repeat them. `danger` belongs to work
// that has stopped and cannot ask its way out, which is not a status a run
// has: a stuck agent is marked on the run's caption instead
// (fleet/run-caption.ts). No status has a fill or a pill: an ask or a status
// is set as words and a glyph, never on a tinted block.

export const RUN_STATUS_META: Record<RunStatus, TrackerStatusMeta> = {
  "needs-you": { label: "Needs you", icon: IconProgressHelp, tone: "brand" },
  working: { label: "Working", icon: IconProgress, tone: "neutral" },
  queued: { label: "Queued", icon: IconCircleDashed, tone: "neutral" },
  review: { label: "In review", icon: IconProgressCheck, tone: "neutral" },
  done: { label: "Done", icon: IconCircleCheck, tone: "neutral" },
};

/** The status glyph alone, in its tone: the shell's glyph, looked up by run status. */
export function RunStatusIcon({ status, className }: { status: RunStatus; className?: string }) {
  return <TrackerStatusIcon meta={RUN_STATUS_META[status]} className={className} />;
}
