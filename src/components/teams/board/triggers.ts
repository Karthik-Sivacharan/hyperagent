import {
  IconBrandSlack,
  IconCalendarRepeat,
  IconMail,
  IconMessage,
  IconRobotFace,
  IconWebhook,
  type TablerIcon,
} from "@tabler/icons-react";
import type { RunTrigger } from "@/lib/mock/teams";

// What started a run, as a glyph beside its project on a board card. The
// glyphs match the rest of the app: a thread is the sidebar's Threads icon
// (IconMessage), another agent is the Agents icon (IconRobotFace). The label
// is the tooltip and the screen-reader text, so the glyph is never the only
// carrier of the meaning (docs/brand/icons.md, "An icon alone is not a label").

export const RUN_TRIGGER_META: Record<RunTrigger, { label: string; icon: TablerIcon }> = {
  thread: { label: "Started from a thread", icon: IconMessage },
  slack: { label: "Started from Slack", icon: IconBrandSlack },
  schedule: { label: "Runs on a schedule", icon: IconCalendarRepeat },
  email: { label: "Started from an email", icon: IconMail },
  webhook: { label: "Started by a webhook", icon: IconWebhook },
  agent: { label: "Handed off by another agent", icon: IconRobotFace },
};
