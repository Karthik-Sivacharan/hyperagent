import Link from "next/link";
import {
  Bell,
  ChevronRight,
  CreditCard,
  Download,
  Gift,
  KeyRound,
  Plug,
  Settings,
  Shield,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OpenClawMark } from "@/components/settings/settings-icons";
import type { SettingsCard, SettingsCardIcon } from "@/lib/mock/settings";

// One link card on the settings hub: icon tile, title with a chevron that
// slides in on hover, description. Structure transcribed from
// docs/reference/pages/settings.html. Phase 2 dresses it as the brand card:
// 22px corners, the hairline `shadow-card` at rest lifting to
// `shadow-card-hover`, the serif title on tier 1 and the description on
// tier 2. The site's pastel tiles and hover gradient wash were hue as
// decoration, which the brand does not do (docs/brand/design.md §1, §12):
// the tile is a tint disc with the icon on tier 2, and at most one card on
// the page may carry the tinted brand surface via `accent`.

const ICONS: Record<Exclude<SettingsCardIcon, "openclaw">, LucideIcon> = {
  user: User,
  settings: Settings,
  shield: Shield,
  bell: Bell,
  users: Users,
  plug: Plug,
  download: Download,
  "key-round": KeyRound,
  "credit-card": CreditCard,
  gift: Gift,
};

function CardIcon({ icon }: { icon: SettingsCardIcon }) {
  if (icon === "openclaw") return <OpenClawMark className="size-6" />;
  const Icon = ICONS[icon];
  return <Icon className="size-6" aria-hidden="true" />;
}

export function SettingsLinkCard({ card, accent = false }: { card: SettingsCard; accent?: boolean }) {
  return (
    <Link href={card.href}>
      <div
        data-slot="card"
        className="group relative flex h-full cursor-pointer flex-col gap-6 overflow-hidden rounded-3xl bg-card py-6 text-card-foreground shadow-card transition-[box-shadow] duration-(--duration-slow) ease-out hover:shadow-card-hover"
      >
        <div
          data-slot="card-header"
          className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 relative pb-2"
        >
          <div className="flex items-start justify-between">
            <div
              data-slot="icon-tile"
              className={cn(
                "rounded-xl p-3",
                accent ? "bg-brand-subtle text-brand-subtle-foreground" : "bg-tint-10 text-muted-foreground",
              )}
            >
              <CardIcon icon={card.icon} />
            </div>
          </div>
          <div data-slot="card-title" className="mt-4 flex items-center justify-between font-heading text-lg font-semibold text-foreground">
            {card.title}
            <ChevronRight
              className="size-5 text-foreground-low opacity-0 transition-[opacity,transform] duration-(--duration-normal) ease-out group-hover:translate-x-1 group-hover:opacity-100"
              aria-hidden="true"
            />
          </div>
        </div>
        <div data-slot="card-content" className="relative px-6">
          <div data-slot="card-description" className="text-sm leading-relaxed text-muted-foreground">
            {card.description}
          </div>
        </div>
      </div>
    </Link>
  );
}
