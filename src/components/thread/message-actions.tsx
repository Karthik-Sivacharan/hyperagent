import { IconCopy, IconGitFork, IconThumbDown, IconThumbUp } from "@tabler/icons-react";

// The hover toolbar under an assistant message (thumbs, copy, fork). Markup
// from docs/reference/pages/thread-detail.html; it fades in on `group-hover`
// of the message row. Phase 2: round icon buttons resting on the third text
// tier; the feedback pair hovers to the quiet status tints (`bg-success/10
// text-success`, the sanctioned status use), copy and fork to a sand tint
// (docs/brand/design.md §1, §5, §8).
const ACTION =
  "cursor-pointer rounded-full p-1 text-foreground-low transition-[color,background-color] duration-(--duration-fast) ease-out-quart";

export function MessageActions() {
  return (
    <div className="flex items-center justify-between gap-1 mt-0.5 opacity-0 transition-opacity duration-(--duration-normal) ease-out group-hover:opacity-100">
      <div className="flex items-center gap-1">
        <button type="button" aria-label="Good response" className={`${ACTION} hover:bg-success/10 hover:text-success`}>
          <IconThumbUp className="size-3.5" aria-hidden="true" />
        </button>
        <button type="button" aria-label="Bad response" className={`${ACTION} hover:bg-warning/10 hover:text-warning`}>
          <IconThumbDown className="size-3.5" aria-hidden="true" />
        </button>
        <button type="button" aria-label="Copy message" className={`${ACTION} hover:bg-tint-10 hover:text-foreground`}>
          <IconCopy className="size-3.5" aria-hidden="true" />
        </button>
        <span className="inline-flex">
          <button
            type="button"
            aria-label="Fork from here"
            className={`${ACTION} hover:bg-tint-10 hover:text-foreground disabled:pointer-events-none disabled:opacity-50`}
          >
            <IconGitFork className="size-3.5" aria-hidden="true" />
          </button>
        </span>
      </div>
    </div>
  );
}
