import { Copy, GitFork, ThumbsDown, ThumbsUp } from "lucide-react";

// The hover toolbar under an assistant message (thumbs, copy, fork). Markup
// from docs/reference/pages/thread-detail.html; it fades in on `group-hover`
// of the message row.
export function MessageActions() {
  return (
    <div className="flex items-center justify-between gap-1 mt-0.5 opacity-0 transition-opacity group-hover:opacity-100">
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Good response"
          className="rounded p-1 transition-colors cursor-pointer text-muted-foreground/50 hover:bg-green-500/20 hover:text-green-600 dark:hover:text-green-400"
        >
          <ThumbsUp className="size-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Bad response"
          className="rounded p-1 transition-colors cursor-pointer text-muted-foreground/50 hover:bg-amber-500/20 hover:text-amber-600 dark:hover:text-amber-400"
        >
          <ThumbsDown className="size-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Copy message"
          className="cursor-pointer rounded p-1 transition-colors text-muted-foreground/50 hover:bg-muted/50 hover:text-foreground"
        >
          <Copy className="size-3.5" aria-hidden="true" />
        </button>
        <span className="inline-flex">
          <button
            type="button"
            aria-label="Fork from here"
            className="cursor-pointer rounded p-1 text-muted-foreground/50 transition-colors hover:bg-muted/50 hover:text-foreground disabled:pointer-events-none disabled:text-muted-foreground/30"
          >
            <GitFork className="size-3.5" aria-hidden="true" />
          </button>
        </span>
      </div>
    </div>
  );
}
