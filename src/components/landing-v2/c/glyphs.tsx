import {
  IconBox,
  IconBrush,
  IconCalendar,
  IconCalendarEvent,
  IconChartBar,
  IconChartLine,
  IconChecklist,
  IconClipboardCheck,
  IconCoin,
  IconCreditCard,
  IconDatabase,
  IconFileText,
  IconMailForward,
  IconMapPin,
  IconReport,
  IconScale,
  IconSearch,
  IconSend,
  IconSpeakerphone,
  IconTargetArrow,
  IconTrendingUp,
  IconTruck,
  IconUserSearch,
  IconUsers,
  type IconProps,
} from "@tabler/icons-react";
import type { ComponentType } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { type AgentStatus, type Glyph, STATUS_LABEL } from "./content";

// Content names a glyph; only this file knows the icon behind it.
const GLYPHS: Record<Glyph, ComponentType<IconProps>> = {
  coin: IconCoin,
  target: IconTargetArrow,
  truck: IconTruck,
  users: IconUsers,
  megaphone: IconSpeakerphone,
  scale: IconScale,
  mail: IconMailForward,
  checklist: IconChecklist,
  card: IconCreditCard,
  search: IconSearch,
  database: IconDatabase,
  chart: IconChartBar,
  send: IconSend,
  pin: IconMapPin,
  report: IconReport,
  box: IconBox,
  userSearch: IconUserSearch,
  calendar: IconCalendar,
  file: IconFileText,
  clipboard: IconClipboardCheck,
  calendarEvent: IconCalendarEvent,
  trend: IconTrendingUp,
  chartLine: IconChartLine,
  brush: IconBrush,
};

// An agent's avatar: the brand's round avatar with a role glyph on a tint,
// never a face and never a colour. `lit` is the active card in the use-case
// row: the tint deepens and the glyph takes the first text tier.
export function AgentAvatar({
  glyph,
  size = "default",
  lit = true,
  className,
  fallbackClassName,
}: {
  glyph: Glyph;
  size?: "sm" | "default" | "lg";
  lit?: boolean;
  className?: string;
  // Classes for the disc itself, for a caller whose state lights it.
  fallbackClassName?: string;
}) {
  const Icon = GLYPHS[glyph];
  return (
    <Avatar size={size} className={className}>
      <AvatarFallback
        className={cn(
          "transition-[color,background-color] duration-(--duration-normal) ease-out",
          lit ? "bg-tint-20 text-foreground" : "bg-tint-10 text-foreground-low",
          fallbackClassName,
        )}
      >
        <Icon
          aria-hidden="true"
          className={size === "sm" ? "size-3.5" : "size-4"}
          stroke={1.75}
        />
      </AvatarFallback>
    </Avatar>
  );
}

// An agent's state as the brand's quiet chip. "Needs you" is the page's one
// chroma: the brand-subtle tint with tangerine text.
export function StatusBadge({ status }: { status: AgentStatus }) {
  return (
    <Badge variant={status === "needsYou" ? "brand" : "secondary"}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
