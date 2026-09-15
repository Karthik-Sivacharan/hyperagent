import {
  IconChartBar,
  IconCode,
  IconHeadset,
  IconPencil,
  IconSpeakerphone,
  IconUsers,
  type TablerIcon,
} from "@tabler/icons-react";

import type { DemoAgentId } from "./demo-agents";

// One glyph per demo agent, the same in the window's sidebar and in the
// phone's chip row: brackets for code, a megaphone for campaigns, a pencil
// for words, a headset for support, people for sales, bars for numbers.
export const AGENT_ICONS: Record<DemoAgentId, TablerIcon> = {
  engineering: IconCode,
  marketing: IconSpeakerphone,
  copywriting: IconPencil,
  support: IconHeadset,
  sales: IconUsers,
  data: IconChartBar,
};
