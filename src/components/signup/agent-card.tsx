import { ToolIconRow } from "@/components/signup/tool-icon-row";
import { Card } from "@/components/ui/card";
import type { SuggestedAgent } from "@/lib/mock/suggested-agents";
import { cn } from "@/lib/utils";

// One suggested agent, as a tile: what it is called, what it does in two
// lines, and the tools it would touch.
//
// It wears found-card.tsx's shell — `size="none"` Card, `bg-tint-7`, 16px
// padding, the `after:` rim light — but it is not built on FoundCard, and the
// reason is the anatomy rather than the skin. FoundCard's row is media +
// title + subtitle + corner action, and an agent has none of those three
// besides the title: no avatar, no second identity line, and nothing to edit
// before it exists. Composing it would mean making its media, its subtitle
// and its action all optional and then passing three nulls, which leaves a
// row wrapper and a 12px gap holding nothing and turns a card with one clear
// shape into a card with four ways to be empty. The two are siblings on the
// same screen rather than one wrapping the other, and the shared shell is what
// makes them read as one family — the sentence found-card.tsx makes about
// `bg-tint-7` (a percentage of the theme's own neutral, so both themes get the
// same step and neither needs a `dark:` variant) is true here for the same
// reason, so it is deliberately the same fill rather than a near miss.
//
// Presentational, with no hover lift and no cursor: the interface takes an
// agent and a className and nothing else, so the card has no action of its own
// to advertise. A caller that makes these pickable owns that affordance and
// can pass it through `className`.

export function AgentCard({ agent, className }: { agent: SuggestedAgent; className?: string }) {
  return (
    <Card
      size="none"
      className={cn(
        // `h-full` so a grid row of these squares up on the tallest card
        // rather than each one sitting at its own height.
        "relative h-full w-full gap-3 bg-tint-7 p-4",
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-3xl after:shadow-rim",
        className,
      )}
    >
      {/* gap-0.5 between the two lines, the same pair found-card.tsx sets: a
          title and the line that belongs to it, not two stacked paragraphs. */}
      <div className="flex flex-col gap-0.5">
        <p className="truncate font-heading text-base leading-snug font-medium text-foreground">{agent.name}</p>
        {/* Two lines, the measurement taken off the Gumloop tile and already
            used by the company card upstairs. The third line is never the one
            that matters, and letting it exist makes a row of cards ragged. */}
        <p className="line-clamp-2 text-sm text-muted-foreground">{agent.description}</p>
      </div>

      {/* mt-auto so the strip stays on the card's floor when a short
          description leaves the stretched card with room to spare — the row is
          the card's base line, not something trailing the copy. */}
      <ToolIconRow toolIds={agent.toolIds} className="mt-auto" />
    </Card>
  );
}
