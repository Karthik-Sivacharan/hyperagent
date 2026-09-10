import { IconPlayerStopFilled } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The strip a composer grows while the agent is working, so the one control
// that can stop it sits where your hands already are.
//
// GROUND TRUTH is the live run in docs/reference/overlays/
// thread-streaming-live.html (2026-09-10), and it is the one part of a running
// turn the 2026-09-09 reconstruction did not have. About a second after send,
// the composer gains a 36px row across its top, above the field: three dots
// and "Working…" on the left at 12px on the muted tier, a ghost "Stop" with a
// filled square on the right, one hairline under it. It leaves when the
// answer starts to arrive, and the composer is one row shorter again. It is
// the only "busy" signal outside the turn itself, and it is not a spinner.
//
// Brand materials over the product's: the hairline is `border-border-subtle`,
// and the dots are the brand's own typing indicator (`animate-typing-dot`,
// 6px `foreground` dots 150ms apart, the specimen on /design/brand) in place of
// the product's three bouncing full stops. A pulse in place rather than a
// bounce, because the strip sits a few pixels above a line of text and a dot
// that jumps 5px there is the loudest thing in the composer.
//
// The strip does not animate its height. It is layout, and the composer is
// docked at the bottom of the screen, so a 36px row that eased open would drag
// the field's top edge up over a quarter of a second for no information. The
// row's CONTENT fades in instead, over --duration-enter: the box is simply
// there, and the words arrive in it, which is how the product's reads.

/** The typing indicator's stagger: brand.css pairs the 1s pulse with 150ms steps. */
const DOT_DELAYS = ["[animation-delay:0ms]", "[animation-delay:150ms]", "[animation-delay:300ms]"] as const;

export function ComposerWorkingStatus({
  label = "Working…",
  onStop,
}: {
  /** Present tense, with the ellipsis, like every running label in a turn. */
  label?: string;
  /** Omit and there is no Stop: a stop that stops nothing is a lie. */
  onStop?: () => void;
}) {
  return (
    <div className="flex h-9 min-w-0 items-center gap-2 border-b border-border-subtle px-4">
      {/* `role="status"` so "Working…" is announced once when the agent
          starts, politely, and not again for every dot. The dots themselves
          are decoration beside a word that already says it. */}
      <div
        role="status"
        className="flex min-w-0 flex-1 items-center gap-2 text-xs text-muted-foreground animate-in fade-in-0 duration-(--duration-enter) ease-out-quart"
      >
        <span className="flex shrink-0 items-center gap-1" aria-hidden="true">
          {DOT_DELAYS.map((delay) => (
            <span key={delay} className={cn("size-1.5 rounded-full bg-foreground animate-typing-dot", delay)} />
          ))}
        </span>
        <span className="truncate">{label}</span>
      </div>
      {onStop && (
        // Ghost at the brand's 28px, the product's own h-7: the strip is 36px
        // and a full-height control would touch its hairline. Filled square
        // rather than the outline, because "stop" is the one media glyph
        // everybody reads at 14px, and the outline square reads as a checkbox.
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={onStop}
          className="-mr-2 shrink-0 gap-1.5 text-muted-foreground hover:text-foreground animate-in fade-in-0 duration-(--duration-enter) ease-out-quart"
        >
          <IconPlayerStopFilled className="size-3.5" aria-hidden="true" />
          Stop
        </Button>
      )}
    </div>
  );
}
