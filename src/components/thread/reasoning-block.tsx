import { SHIMMER, sweepStyle } from "@/components/thread/shimmer";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// The first thing a turn shows: the model is thinking and has nothing to say
// yet.
//
// GROUND TRUTH is the live run in docs/reference/overlays/
// thread-streaming-live.html (2026-09-10): about a second after the user's
// bubble lands, the assistant side shows a "Reasoning…" line shimmering over
// two skeleton bars, and nothing else — no spinner, no avatar, no "thinking"
// dots. When the first tool call starts, this whole block is REPLACED by it.
// A reasoning burst with no text leaves no "Reasoned" collapsible behind; the
// 2026-09-09 reconstruction only has one because those turns had text to show.
// So this component has exactly one state, and its caller unmounts it.
//
// Measured off that run: the label is 12px at weight 400 on the muted tier,
// swept by `foreground` (the product's "prominent" shimmer) with 40px of band
// on its ten characters, and the bars are `h-2.5` at half and a third of the
// column, 6px apart, 8px under the label.
//
// What departs. The product's label also wears `opacity-80`; this one does
// not, because under reduced motion the shimmer is not applied at all
// (shimmer.ts) and an 80%-muted label is a fourth text tier the brand does not
// have. The bars are the brand's own Skeleton (`bg-tint-10` on the 1.2s
// pulse) rather than the product's warm-grey variant, and at full strength
// rather than the product's half: its bars are a solid grey, so half of it
// still reads, but half of a 10% tint is 5% and on the dark canvas the pair
// all but vanished. Full-strength tint-10 is also the tint the agent cards'
// skeletons wear one screen up, so the flow has one loading material. Theirs
// hold still (agent-card.tsx: four pulsing cards would compete with the row
// above them); these keep the primitive's pulse, as the product's do, because
// this block lives for about one 1.2s pulse and is the only thing in its turn.

const LABEL = "Reasoning…";

// The product's prominent shimmer passes once every 1.5s. In shimmer.ts's
// keyframes a cycle holds two crossings, so one every 1.5s is a 3s cycle —
// quicker than a tool row's, which is the point: a row names work that will
// take a while, this line says the model is about to decide what that work is.
const REASONING_CYCLE_MS = 3000;

// Twice the tool row's 2px, off the same capture: `--spread: 40px` on ten
// characters. A wider, softer band on a lighter-weight label.
const REASONING_SPREAD_PER_CHAR_PX = 4;

export function ReasoningBlock({ className }: { className?: string }) {
  return (
    <div className={cn("group/reasoning", className)}>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <span
          className={cn("text-xs font-normal", SHIMMER)}
          style={sweepStyle(LABEL.length, "var(--color-foreground)", "var(--color-muted-foreground)", {
            cycleMs: REASONING_CYCLE_MS,
            spreadPerChar: REASONING_SPREAD_PER_CHAR_PX,
          })}
        >
          {LABEL}
        </span>
      </div>
      {/* Decoration standing in for text that has not arrived, so it is hidden
          from assistive tech: the label above already says what is happening,
          and two unlabelled bars would be read as two empty somethings. */}
      <div className="mt-2 space-y-1.5" aria-hidden="true">
        <Skeleton className="h-2.5 w-1/2" />
        <Skeleton className="h-2.5 w-1/3" />
      </div>
    </div>
  );
}
