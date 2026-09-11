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
// happened (queued), half drawn while the run is under way (working, needs
// you, in review, each with its own glyph inside), whole once it is done.
// Distinct glyphs for distinct meanings, and the same glyph wherever a
// status appears (docs/brand/icons.md).
//
// Tones follow docs/brand/design.md §3: status hues only as small dots,
// icons and tinted chips, never as large fills. The tangerine accent is
// spent on one thing, "Needs you", the run a person is blocking; working is
// info, review warning, done success, queued stays neutral.

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
 * `text` is for an icon or a short label on the canvas, `dot` for a small
 * status dot, `badge` is the matching `Badge` variant, `tint` a quiet fill.
 *
 * The brand tint is the surface an ask sits on (the board card's "Needs
 * you" block, the org node's ask chip), with `text-brand-subtle-foreground`
 * on it. Light keeps `brand-subtle` (tangerine-50). In dark that token is
 * tangerine-950, darker than the neutral-900 card it sits on, so it read as
 * a brown slab; dark instead lays a 7% wash of the accent over the card and
 * draws the edge with a 20% accent hairline: still the one tangerine thing
 * on the card, a fraction of the weight. The ask on it measures 8.9:1
 * (tangerine-300 on the wash over neutral-900, culori, oklab mix).
 */
export const RUN_TONE_CLASSES: Record<
  RunTone,
  { text: string; dot: string; tint: string; badge: "brand" | "info" | "secondary" | "warning" | "success" }
> = {
  brand: {
    text: "text-brand-accent",
    dot: "bg-brand-accent",
    tint: "bg-brand-subtle dark:bg-brand-accent/7 dark:ring-1 dark:ring-brand-accent/20 dark:ring-inset",
    badge: "brand",
  },
  info: { text: "text-info", dot: "bg-info", tint: "bg-info/10", badge: "info" },
  neutral: { text: "text-muted-foreground", dot: "bg-foreground-low", tint: "bg-tint-10", badge: "secondary" },
  warning: { text: "text-warning", dot: "bg-warning", tint: "bg-warning/10", badge: "warning" },
  success: { text: "text-success", dot: "bg-success", tint: "bg-success/10", badge: "success" },
};

/** The status glyph alone, in its tone. Decorative unless given a label. */
export function RunStatusIcon({ status, className }: { status: RunStatus; className?: string }) {
  const meta = RUN_STATUS_META[status];
  const Icon = meta.icon;
  return <Icon className={cn("size-4 shrink-0", RUN_TONE_CLASSES[meta.tone].text, className)} aria-hidden="true" />;
}

/** A tinted pill with the status glyph and label ("Needs you", "In review"). */
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
  return (
    <Badge variant={RUN_TONE_CLASSES[meta.tone].badge} data-status={status} className={className}>
      {showIcon ? <Icon data-icon="inline-start" aria-hidden="true" /> : null}
      {meta.label}
    </Badge>
  );
}
