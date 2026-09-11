import {
  IconCircleCheck,
  IconCircleDashed,
  IconProgress,
  IconProgressCheck,
  IconProgressHelp,
  type TablerIcon,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { RunStatus } from "@/lib/mock/teams";

// The five run statuses and how each one looks, shared by every fleet view.
//
// Icons are one family, Tabler's progress circles: dashed while nothing has
// happened (queued), part drawn while the run is under way (working, needs
// you, in review, each with its own glyph inside), whole once it is done.
// One glyph per meaning, and the same glyph wherever a status appears
// (docs/brand/icons.md).
//
// Colour means a person is needed (docs/plans/2026-09-11-teams-fleet-polish.md
// §3), so there are two tones. "Needs you" is `brand`: its glyph is the
// tangerine accent, the one place /teams spends it. Every other status is
// `neutral`, on the third text tier (`foreground-low`), because its glyph
// and its label already say which status it is and a hue would only repeat
// them. No status has a fill or a pill: an ask or a status is set as words
// and a glyph, never on a tinted block.

export type RunTone = "brand" | "neutral";

export const RUN_STATUS_META: Record<RunStatus, { label: string; icon: TablerIcon; tone: RunTone }> = {
  "needs-you": { label: "Needs you", icon: IconProgressHelp, tone: "brand" },
  working: { label: "Working", icon: IconProgress, tone: "neutral" },
  queued: { label: "Queued", icon: IconCircleDashed, tone: "neutral" },
  review: { label: "In review", icon: IconProgressCheck, tone: "neutral" },
  done: { label: "Done", icon: IconCircleCheck, tone: "neutral" },
};

/** The glyph colour per tone, spelled out so Tailwind sees every literal. */
export const RUN_TONE_CLASSES: Record<RunTone, string> = {
  brand: "text-brand-accent",
  neutral: "text-foreground-low",
};

/** The status glyph alone, in its tone. Decorative unless given a label. */
export function RunStatusIcon({ status, className }: { status: RunStatus; className?: string }) {
  const meta = RUN_STATUS_META[status];
  const Icon = meta.icon;
  return <Icon className={cn("size-4 shrink-0", RUN_TONE_CLASSES[meta.tone], className)} aria-hidden="true" />;
}
