import { ToolIconRow } from "@/components/signup/tool-icon-row";
import { Card } from "@/components/ui/card";
import type { SuggestedAgent } from "@/lib/mock/suggested-agents";
import { cn } from "@/lib/utils";

// One suggested agent, as a tile: what it is called, what it does in two
// lines, and the tools it would touch. It has three states — pending, ready,
// picked — and it is a control in all of them.
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
// PENDING COSTS NOTHING IN HEIGHT, which is the whole trick of the working
// state. The loaded content and the skeleton share ONE grid cell, so the card
// is as tall as its loaded self from the very first frame and resolving one
// moves nothing — not the card, not the grid, not the centred column above it,
// not the mark flying at the top of it. Reserving a height by hand would mean
// re-deriving 132px every time the type scale moves; letting the real content
// hold the cell open means it can never be wrong.
//
// The skeleton is NOT animated. Everything that pulses on a loading screen is
// competing with everything else that pulses, and the activity on this screen
// belongs to the signal row and the heading. A pending card is the third state
// worth having: not working, not ready, just next.
//
// SELECTION SPENDS NO ACCENT. Brand rule 3 gives this screen exactly one
// tangerine and it is the composer's send arrow, so being picked is told in
// the two tokens the system already names for it: `bg-tint-20` ("active fill")
// and `border-loud` ("loud outline"), rule 4's own words. The fills then run
// 7 at rest, 10 on hover, 20 picked, which is two clear steps rather than one
// ambiguous one — 7 to 15 was tried first and could not be read at a glance
// against a hovered neighbour in either theme.
//
// It cannot lean on `after:shadow-rim` for this: HANDOFF records that the rim
// is close to invisible in light, so it would be a dark-only selected state.
// It also lifts to `shadow-card-hover` while picked, which is the treatment
// thread/option-cards.tsx already gives a chosen card — the one place in this
// repo that had this exact problem before.

export function AgentCard({
  agent,
  ready,
  selected,
  onPick,
  className,
}: {
  agent: SuggestedAgent;
  /** False while the research pass is still working: skeleton, and inert. */
  ready: boolean;
  selected: boolean;
  onPick: () => void;
  className?: string;
}) {
  return (
    // The sanctioned raw-control shape: the card IS the pressable element, so
    // it is a Card with a button as its element and nothing between them,
    // exactly as thread/option-cards.tsx does it (components.test.ts checks
    // for the button being the asChild component's immediate child, comments
    // included). `aria-pressed` rather than a radio role because the set is a
    // suggestion strip, not a required choice: leaving all four alone and
    // typing instead is a legitimate answer.
    <Card
      asChild
      size="none"
      className={cn(
        // `h-full` so a grid row of these squares up on the tallest card
        // rather than each one sitting at its own height. `grid` replaces the
        // Card's own `flex` (tailwind-merge keeps the last display) so the two
        // layers below can share one cell.
        "relative grid h-full w-full p-4 text-left",
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-3xl after:shadow-rim",
        "transition-[background-color,box-shadow] duration-(--duration-slow) ease-out motion-reduce:transition-none",
        selected ? "bg-tint-20 shadow-card-hover ring-1 ring-border-loud" : "bg-tint-7",
        ready && !selected && "hover:bg-tint-10",
        ready ? "cursor-pointer" : "cursor-default",
        // The `.focus-ring` class expanded rather than applied. It sets a raw
        // `box-shadow`, which would wipe both the Card's own `shadow-card` and
        // the selected hairline for as long as the card had focus; the ring
        // utilities compose through the same custom properties instead, so a
        // picked card that is also focused keeps everything it is wearing.
        "outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <button type="button" disabled={!ready} aria-pressed={selected} onClick={onPick}>
        {/* Both layers in one cell. Spans, not divs: a button's content model
            is phrasing content, and this one is full of boxes. */}
        <span
          className={cn(
            "col-start-1 row-start-1 flex h-full flex-col gap-3 transition-opacity duration-(--duration-normal) ease-out motion-reduce:transition-none",
            ready ? "opacity-100" : "opacity-0",
          )}
        >
          {/* gap-0.5 between the two lines, the same pair found-card.tsx sets: a
              title and the line that belongs to it, not two stacked paragraphs. */}
          <span className="flex flex-col gap-0.5">
            <span className="truncate font-heading text-base leading-snug font-medium text-foreground">
              {agent.name}
            </span>
            {/* Two lines, the measurement taken off the Gumloop tile and already
                used by the company card upstairs. The third line is never the one
                that matters, and letting it exist makes a row of cards ragged. */}
            <span className="line-clamp-2 text-sm text-muted-foreground">{agent.description}</span>
          </span>

          {/* mt-auto so the strip stays on the card's floor when a short
              description leaves the stretched card with room to spare — the row is
              the card's base line, not something trailing the copy. */}
          <ToolIconRow toolIds={agent.toolIds} className="mt-auto" />
        </span>

        {/* The pending layer mirrors the anatomy above rather than filling the
            card with bars: one short bar for the title, two for the clamped
            description, one tile-sized block for the tool run. It is shorter
            than the content it stands in for, which is exactly why the content
            is the layer that sets the height. */}
        <span
          aria-hidden="true"
          className={cn(
            "col-start-1 row-start-1 flex h-full flex-col gap-3 transition-opacity duration-(--duration-normal) ease-out motion-reduce:transition-none",
            ready ? "opacity-0" : "opacity-100",
          )}
        >
          <span className="flex flex-col gap-2 pt-1">
            <span className="block h-3 w-1/2 rounded-md bg-tint-10" />
            <span className="block h-2.5 w-full rounded-md bg-tint-10" />
            <span className="block h-2.5 w-3/5 rounded-md bg-tint-10" />
          </span>
          <span className="mt-auto block h-6 w-18 rounded-md bg-tint-10" />
        </span>
      </button>
    </Card>
  );
}
