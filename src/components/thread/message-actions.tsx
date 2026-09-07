import { IconCopy, IconGitFork, IconThumbDown, IconThumbUp } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

// The hover toolbar under an assistant message (thumbs, copy, fork). Markup
// from docs/reference/pages/thread-detail.html; it fades in on `group-hover`
// of the message row. Phase 2: round icon buttons resting on the third text
// tier; the feedback pair hovers to the quiet status tints (`bg-success/10
// text-success`, the sanctioned status use), copy and fork to a sand tint
// (docs/brand/design.md §1, §5, §8). Each is the ghost `icon-2xs` button
// (the 22px box with a 14px icon); the per-button hover tint is the only
// thing the primitive does not carry.

export function MessageActions() {
  return (
    <div className="flex items-center justify-between gap-1 mt-0.5 opacity-0 transition-opacity duration-(--duration-normal) ease-out group-hover:opacity-100">
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-2xs"
          aria-label="Good response"
          className="text-foreground-low hover:bg-success/10 hover:text-success"
        >
          <IconThumbUp className="size-3.5" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-2xs"
          aria-label="Bad response"
          className="text-foreground-low hover:bg-warning/10 hover:text-warning"
        >
          <IconThumbDown className="size-3.5" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-2xs"
          aria-label="Copy message"
          className="text-foreground-low hover:text-foreground"
        >
          <IconCopy className="size-3.5" aria-hidden="true" />
        </Button>
        <span className="inline-flex">
          <Button
            type="button"
            variant="ghost"
            size="icon-2xs"
            aria-label="Fork from here"
            className="text-foreground-low hover:text-foreground"
          >
            <IconGitFork className="size-3.5" aria-hidden="true" />
          </Button>
        </span>
      </div>
    </div>
  );
}
