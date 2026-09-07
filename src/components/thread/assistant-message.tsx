import type { MessageBlock } from "@/lib/mock/conversation";
import { MessageActions } from "@/components/thread/message-actions";
import { renderInline } from "@/components/thread/rich-text";

// An assistant turn. Classes are the site's (docs/reference/pages/
// thread-detail.html). The site styles the body with @tailwindcss/typography
// (`prose prose-sm`), which this repo does not ship; the three things the
// plugin contributes here are added explicitly: 14px text on a 24px line and
// 600-weight <strong>. `prose-message` (globals.css) supplies the margins.
// Phase 2: the turn is unbubbled body copy on the first text tier, code and
// pre grounds are tints (so they need no dark: variants) and links are ink
// (docs/brand/design.md §1, §4.1).
const PROSE =
  "prose prose-message max-w-none overflow-hidden break-words text-foreground prose-code:rounded-md prose-code:bg-tint-10 prose-pre:bg-tint-10 prose-code:px-1.5 prose-code:py-0.5 prose-a:text-foreground prose-pre:text-foreground prose-a:no-underline prose-pre:backdrop-blur-sm prose-code:before:content-none prose-code:after:content-none prose-a:hover:underline prose-sm text-sm leading-6 [&_strong]:font-strong";

export function AssistantMessage({ id, blocks }: { id: string; blocks: MessageBlock[] }) {
  return (
    <div className="group relative flex min-w-0 gap-3 flex-row" data-role="assistant" data-message-id={id}>
      <div className="flex min-w-0 flex-col gap-1 w-full items-start">
        <div className="w-full max-w-full overflow-hidden break-words px-4 rounded-none py-1 pr-8 pl-0">
          <div>
            <div className={PROSE}>
              {blocks.map((block, i) =>
                block.kind === "heading" ? (
                  // The site's markup says `mb-3`, but its unlayered
                  // `.prose-message h1 { margin-bottom: .5rem }` rule wins over
                  // the utility; here that rule sits in @layer components and
                  // would lose, so the computed 8px is written directly. The
                  // face is the brand display serif; `text-2xl` carries the
                  // brand tracking on its own (design.md §4).
                  <h1 key={i} className="mt-4 mb-2 font-heading text-2xl text-foreground">
                    {renderInline(block.text)}
                  </h1>
                ) : (
                  <div key={i} className="my-2">
                    {renderInline(block.text)}
                  </div>
                ),
              )}
            </div>
          </div>
          <MessageActions />
        </div>
      </div>
    </div>
  );
}
