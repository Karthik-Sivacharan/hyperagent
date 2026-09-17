import type { TablerIcon } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

// What a status looks like, for any board or list built on the tracker shell
// (docs/plans/2026-09-17-room-tracker.md §5). A page owns its own vocabulary —
// /teams has five run statuses, a room has five task statuses, and only three
// names are shared — so the shell never names a status. It is handed a table.
//
// Icons are one family wherever a vocabulary is drawn, Tabler's progress
// circles: dashed while nothing has happened, part drawn while the work is
// under way, whole once it is finished (docs/brand/icons.md).
//
// Colour means a person is needed (docs/plans/2026-09-11-teams-fleet-polish.md
// §3), so there are three tones and two of them are hues. `brand` is the ask —
// the tangerine accent, the one place a fleet view spends it. `danger` is work
// that has stopped and cannot ask its way out, which is the same call the
// composer's agent strip makes for `stuck`. Everything else is `neutral`, on
// the third text tier, because the glyph and the label already say which
// status it is and a hue would only repeat them. No status has a fill or a
// pill: a status is set as words and a glyph, never on a tinted block.

export type TrackerTone = "brand" | "neutral" | "danger";

export type TrackerStatusMeta = { label: string; icon: TablerIcon; tone: TrackerTone };

/** The glyph colour per tone, spelled out so Tailwind sees every literal. */
export const TRACKER_TONE_CLASSES: Record<TrackerTone, string> = {
  brand: "text-brand-accent",
  neutral: "text-foreground-low",
  danger: "text-destructive",
};

/** The status glyph alone, in its tone. Always decorative: the label beside it says the word. */
export function TrackerStatusIcon({ meta, className }: { meta: TrackerStatusMeta; className?: string }) {
  const Icon = meta.icon;
  return <Icon className={cn("size-4 shrink-0", TRACKER_TONE_CLASSES[meta.tone], className)} aria-hidden="true" />;
}
