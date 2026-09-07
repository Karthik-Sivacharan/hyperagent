import Link from "next/link";
import {
  IconBell,
  IconChevronRight,
  IconCreditCard,
  IconDownload,
  IconGift,
  IconKey,
  IconPlug,
  IconSettings,
  IconShield,
  IconUser,
  IconUsers,
  type TablerIcon,
} from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { OpenClawMark } from "@/components/settings/settings-icons";
import type { SettingsCard, SettingsCardIcon } from "@/lib/mock/settings";

// One link card on the settings hub: icon tile, title with a chevron that
// slides in on hover, description. Structure transcribed from
// docs/reference/pages/settings.html. Phase 2 dresses it as the brand's
// interactive card: 22px corners, the hairline `shadow-card` at rest lifting
// to `shadow-card-hover`, the title in the row-title role on tier 1 (the
// role class outranks the card title's base size) and the description on
// tier 2. The site's pastel tiles and hover gradient wash were hue as
// decoration, which the brand does not do (docs/brand/design.md §1, §12):
// the tile is the 48px soft `IconTile` on a tint with the icon on tier 2,
// and at most one card on the page may carry the tinted brand surface via
// `accent`. The card keeps the hub's 24px padding and gap.

const ICONS: Record<Exclude<SettingsCardIcon, "openclaw">, TablerIcon> = {
  user: IconUser,
  settings: IconSettings,
  shield: IconShield,
  bell: IconBell,
  users: IconUsers,
  plug: IconPlug,
  download: IconDownload,
  "key-round": IconKey,
  "credit-card": IconCreditCard,
  gift: IconGift,
};

function CardIcon({ icon }: { icon: SettingsCardIcon }) {
  if (icon === "openclaw") return <OpenClawMark className="size-6" />;
  const Icon = ICONS[icon];
  return <Icon className="size-6" aria-hidden="true" />;
}

export function SettingsLinkCard({ card, accent = false }: { card: SettingsCard; accent?: boolean }) {
  return (
    <Link href={card.href}>
      <Card variant="interactive" size="none" className="group relative h-full cursor-pointer gap-6 py-6">
        <CardHeader className="relative grid-rows-[auto_auto] gap-2 px-6 pb-2 [.border-b]:pb-6">
          <div className="flex items-start justify-between">
            <IconTile size="lg" shape="soft" tone={accent ? "brand" : "tint"}>
              <CardIcon icon={card.icon} />
            </IconTile>
          </div>
          <CardTitle className="mt-4 flex items-center justify-between text-heading-lg text-foreground">
            {card.title}
            <IconChevronRight
              className="size-5 text-foreground-low opacity-0 transition-[opacity,transform] duration-(--duration-normal) ease-out group-hover:translate-x-1 group-hover:opacity-100"
              aria-hidden="true"
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="relative px-6">
          <CardDescription className="leading-relaxed">{card.description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
