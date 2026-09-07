import { IconSparkles } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

// A user turn: right-aligned bubble, then the "N knowledge hints · date" meta
// line. Markup from docs/reference/pages/thread-detail.html. Phase 2 sets the
// bubble on the brand's user surface, the one tangerine fill that carries
// text (docs/brand/design.md §1, §3.2), at the 18px question-bubble radius
// (§5), with the meta line on the third text tier (§4.1). The site's
// per-thread accent colour is no longer read. The "knowledge hints" action
// is an inline text button: the ghost button with no shape of its own, kept
// at the meta line's size, weight and tier.
export function UserMessage({
  id,
  text,
  knowledgeHints,
  sentAtLabel,
}: {
  id: string;
  text: string;
  knowledgeHints: number;
  sentAtLabel: string;
}) {
  return (
    <div className="mt-8 mb-5">
      <div className="group relative flex min-w-0 gap-3 flex-row-reverse" data-role="user" data-message-id={id}>
        <div className="flex min-w-0 flex-col gap-1 max-w-[85%] items-end">
          <div className="w-full max-w-full overflow-hidden break-words rounded-2xl bg-chat-bubble-user px-4 py-3 text-chat-bubble-user-foreground transition-[color,background-color] duration-(--duration-normal) ease-out">
            <div className="space-y-2">
              <div className="break-words text-sm">
                <div className="whitespace-normal">
                  <div className="my-2 break-words first:mt-0 last:mb-0">{text}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-1 flex max-w-[min(100%,560px)] flex-col items-end gap-1.5">
            <span className="flex select-none items-center gap-1.5 text-foreground-low text-xs">
              <Button
                type="button"
                variant="ghost"
                size="none"
                className="gap-1 rounded-none font-normal text-xs text-foreground-low hover:bg-transparent hover:text-foreground"
              >
                <IconSparkles className="size-3" aria-hidden="true" />
                {knowledgeHints} knowledge hint{knowledgeHints === 1 ? "" : "s"}
              </Button>
              <span aria-hidden="true">·</span>
              <span>{sentAtLabel}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
