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

// The hue each agent's avatar wears. The fleet avatar takes a hue and sets
// lightness and chroma from the brand's neutral ramp. Four are the brand's
// ramp hues (blue, tangerine, green, amber); red stays with the attention
// dot, so a violet and a teal complete the set, ordered so no two
// neighbours in the list look alike.
export const AGENT_HUES: Record<DemoAgentId, number> = {
  engineering: 252,
  marketing: 42,
  copywriting: 305,
  support: 158,
  sales: 70,
  data: 195,
};

// The agent whose work is waiting on a person: its replies are held for
// approval, so its avatar carries the attention dot.
export const ATTENTION_AGENT: DemoAgentId = "support";
