import { Bot, MessageCircleQuestionMark, Network } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OptionCard, OptionCardIcon } from "@/lib/mock/conversation";
import { OpenClawIcon } from "@/components/thread/openclaw-icon";

// The "four paths" cards the welcome message offers. On the live thread the
// choice has been made, so every card is disabled and the chosen one keeps
// its full opacity and a foreground border.
const CARD =
  "flex cursor-pointer flex-col items-start justify-start gap-1 rounded-xl border bg-white px-4 py-3 text-left shadow-xs dark:bg-card transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-default disabled:hover:bg-white dark:disabled:hover:bg-card";

function CardIcon({ icon, className }: { icon: OptionCardIcon; className: string }) {
  switch (icon) {
    case "bot":
      return <Bot className={className} aria-hidden="true" />;
    case "network":
      return <Network className={className} aria-hidden="true" />;
    case "message-circle-question-mark":
      return <MessageCircleQuestionMark className={className} aria-hidden="true" />;
    case "openclaw":
      return <OpenClawIcon className={className} />;
  }
}

export function OptionCards({ cards }: { cards: OptionCard[] }) {
  return (
    <div className="group relative flex min-w-0 gap-3 flex-row" data-role="tool_start">
      <div className="flex min-w-0 flex-col gap-1 w-full items-start">
        <div className="w-full max-w-full overflow-hidden break-words px-4 transition-all duration-200 rounded-none py-1 pr-8 pl-0">
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {cards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  disabled
                  aria-pressed={card.selected ? "true" : "false"}
                  className={cn(CARD, card.selected ? "border-foreground" : "border-border opacity-50")}
                >
                  <CardIcon icon={card.icon} className="size-5 shrink-0 text-foreground" />
                  <span className="font-medium text-foreground text-sm">{card.title}</span>
                  <span className="text-muted-foreground text-sm">{card.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
