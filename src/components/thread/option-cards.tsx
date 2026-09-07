import { IconMessageCircleQuestion, IconRobotFace, IconSitemap } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { OptionCard, OptionCardIcon } from "@/lib/mock/conversation";
import { OpenClawIcon } from "@/components/thread/openclaw-icon";

// The "four paths" cards the welcome message offers. On the live thread the
// choice has been made, so every card is disabled. Phase 2: 22px brand cards
// on the resting card shadow; the chosen one is lifted to the hover shadow
// with a hairline ring on the foreground and keeps its text tiers (title on
// tier 1, icon and lede on tier 2), the passed-over ones drop wholly to tier 3
// instead of fading (docs/brand/design.md §4.1, §5, §6). The transparent
// border keeps the phase-1 box so the grid does not move.
const CARD =
  "flex cursor-pointer flex-col items-start justify-start gap-1 rounded-3xl border border-transparent bg-card px-4 py-3 text-left shadow-card transition-[box-shadow,color,background-color] duration-(--duration-slow) ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-default";

function CardIcon({ icon, className }: { icon: OptionCardIcon; className: string }) {
  switch (icon) {
    case "bot":
      return <IconRobotFace className={className} aria-hidden="true" />;
    case "network":
      return <IconSitemap className={className} aria-hidden="true" />;
    case "message-circle-question-mark":
      return <IconMessageCircleQuestion className={className} aria-hidden="true" />;
    case "openclaw":
      return <OpenClawIcon className={className} />;
  }
}

export function OptionCards({ cards }: { cards: OptionCard[] }) {
  return (
    <div className="group relative flex min-w-0 gap-3 flex-row" data-role="tool_start">
      <div className="flex min-w-0 flex-col gap-1 w-full items-start">
        <div className="w-full max-w-full overflow-hidden break-words px-4 rounded-none py-1 pr-8 pl-0">
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {cards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  disabled
                  aria-pressed={card.selected ? "true" : "false"}
                  className={cn(CARD, card.selected && "shadow-card-hover ring-1 ring-foreground")}
                >
                  <CardIcon
                    icon={card.icon}
                    className={cn("size-5 shrink-0", card.selected ? "text-muted-foreground" : "text-foreground-low")}
                  />
                  <span className={cn("font-medium text-sm", card.selected ? "text-foreground" : "text-foreground-low")}>
                    {card.title}
                  </span>
                  <span className={cn("text-sm", card.selected ? "text-muted-foreground" : "text-foreground-low")}>
                    {card.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
