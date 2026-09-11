import {
  IconCircleCheck,
  IconCircleDashed,
  IconProgress,
  IconProgressCheck,
  IconProgressHelp,
  type TablerIcon,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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
// §3). "Needs you" is the only status with a hue: its glyph is the tangerine
// accent, the one place /teams spends it. Every other status sits on the
// third text tier (`foreground-low`), because its glyph and its label
// already say which status it is and a hue would only repeat them. The
// `info`, `warning` and `success` tones stay as keys so every caller keeps
// compiling, but they now paint exactly as `neutral` does. No tone has a
// fill: `tint` is empty for all five, since an ask or a status is set as
// words and a glyph, never on a tinted block.

export type RunTone = "brand" | "info" | "neutral" | "warning" | "success";

export const RUN_STATUS_META: Record<RunStatus, { label: string; icon: TablerIcon; tone: RunTone }> = {
  "needs-you": { label: "Needs you", icon: IconProgressHelp, tone: "brand" },
  working: { label: "Working", icon: IconProgress, tone: "info" },
  queued: { label: "Queued", icon: IconCircleDashed, tone: "neutral" },
  review: { label: "In review", icon: IconProgressCheck, tone: "warning" },
  done: { label: "Done", icon: IconCircleCheck, tone: "success" },
};

/**
 * Class strings per tone, spelled out so Tailwind sees every literal.
 * `text` is for a glyph on the canvas, `dot` for a small status dot, `badge`
 * the matching `Badge` variant, `tint` a fill (empty: no tone has one).
 */
export const RUN_TONE_CLASSES: Record<
  RunTone,
  { text: string; dot: string; tint: string; badge: "secondary" }
> = {
  brand: { text: "text-brand-accent", dot: "bg-brand-accent", tint: "", badge: "secondary" },
  info: { text: "text-foreground-low", dot: "bg-foreground-low", tint: "", badge: "secondary" },
  neutral: { text: "text-foreground-low", dot: "bg-foreground-low", tint: "", badge: "secondary" },
  warning: { text: "text-foreground-low", dot: "bg-foreground-low", tint: "", badge: "secondary" },
  success: { text: "text-foreground-low", dot: "bg-foreground-low", tint: "", badge: "secondary" },
};

/** The status glyph alone, in its tone. Decorative unless given a label. */
export function RunStatusIcon({ status, className }: { status: RunStatus; className?: string }) {
  const meta = RUN_STATUS_META[status];
  const Icon = meta.icon;
  return <Icon className={cn("size-4 shrink-0", RUN_TONE_CLASSES[meta.tone].text, className)} aria-hidden="true" />;
}

/**
 * A neutral pill with the status glyph and label ("Needs you", "In review").
 * The glyph carries the tone, so the Needs you pill has a tangerine glyph on
 * a grey pill rather than a tinted one.
 */
export function RunStatusBadge({
  status,
  className,
  showIcon = true,
}: {
  status: RunStatus;
  className?: string;
  showIcon?: boolean;
}) {
  const meta = RUN_STATUS_META[status];
  const Icon = meta.icon;
  const tone = RUN_TONE_CLASSES[meta.tone];
  return (
    <Badge variant={tone.badge} data-status={status} className={className}>
      {showIcon ? <Icon data-icon="inline-start" className={tone.text} aria-hidden="true" /> : null}
      {meta.label}
    </Badge>
  );
}
