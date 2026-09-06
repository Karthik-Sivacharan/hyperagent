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

// One link card on the settings hub: tinted icon tile, title with a chevron
// that slides in on hover, description. Transcribed from
// docs/reference/pages/settings.html; the site renders these with shadcn's
// older Card (border + shadow-sm), so the class strings are inlined here
// rather than going through src/components/ui/card.tsx (ring-based).

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

export function SettingsLinkCard({ card }: { card: SettingsCard }) {
  return (
    <Link href={card.href}>
      <div
        data-slot="card"
        className="flex flex-col gap-6 rounded-xl py-6 border bg-card text-card-foreground shadow-sm group relative h-full overflow-hidden transition-all duration-300 border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
      >
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
            card.gradient,
          )}
        />
        <div
          data-slot="card-header"
          className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 relative pb-2"
        >
          <div className="flex items-start justify-between">
            <div
              className={cn(
                "rounded-xl bg-gradient-to-br p-3 transition-transform duration-300 group-hover:scale-110",
                card.gradient,
              )}
            >
              <CardIcon icon={card.icon} />
            </div>
          </div>
          <div data-slot="card-title" className="font-heading font-semibold mt-4 flex items-center justify-between text-lg">
            {card.title}
            <ChevronRight
              className="size-5 transform text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
              aria-hidden="true"
            />
          </div>
        </div>
        <div data-slot="card-content" className="px-6 relative">
          <div data-slot="card-description" className="font-body text-muted-foreground text-sm leading-relaxed">
            {card.description}
          </div>
        </div>
      </div>
    </Link>
  );
}
