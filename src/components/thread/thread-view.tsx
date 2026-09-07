"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconArrowDown } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Composer } from "@/components/composer/composer";
import type { Thread } from "@/lib/mock/threads";
import type { Conversation, ConversationItem } from "@/lib/mock/conversation";
import { ThreadHeader } from "@/components/thread/thread-header";
import { AssistantMessage } from "@/components/thread/assistant-message";
import { OptionCards } from "@/components/thread/option-cards";
import { UserMessage } from "@/components/thread/user-message";

// The thread detail screen from hyperagent.com (docs/reference/pages/
// thread-detail.html): a rounded panel holding the top bar, the brand scroll
// area with the conversation pinned to its bottom edge, and the composer.
// Phase 2: the panel is a 22px paper card edged with the brand hairline; the
// site's per-thread accent (a navy that tinted the bubble and the send
// button) is gone, the shared composer carries its own skin and the user
// bubble is the brand's (docs/brand/design.md §1, §5).
//
// The dump also carries, at z-0 behind the chat column, a blurred radial
// gradient backdrop (`background-color: rgb(183, 172, 180)` plus three
// gradient circles). It is the floor of the preview/window panel that the
// "Open panel" button reveals; with the panel closed the chat column (z-10,
// full width) covers it completely, so it is not reproduced.

type UserItem = Extract<ConversationItem, { role: "user" }>;
type AgentItem = Exclude<ConversationItem, { role: "user" }>;
type Turn = { kind: "user"; item: UserItem } | { kind: "agent"; items: AgentItem[] };

// Consecutive assistant/tool items form one turn (rendered in a `space-y-2`
// group when there is more than one); each user message is its own turn.
function groupTurns(items: ConversationItem[]): Turn[] {
  const turns: Turn[] = [];
  for (const item of items) {
    if (item.role === "user") {
      turns.push({ kind: "user", item });
      continue;
    }
    const last = turns[turns.length - 1];
    if (last && last.kind === "agent") last.items.push(item);
    else turns.push({ kind: "agent", items: [item] });
  }
  return turns;
}

function AgentItemView({ item }: { item: AgentItem }) {
  return item.role === "assistant" ? (
    <AssistantMessage id={item.id} blocks={item.blocks} />
  ) : (
    <OptionCards cards={item.cards} />
  );
}

const SCROLL_END_THRESHOLD = 40;

// The viewport's own classes on top of the primitive's: the site's focus
// ring, no scroll anchoring, and the flex column that pins a short
// conversation to the bottom edge (radix wraps the children in a `display:
// table` div, hence the `!` overrides).
const VIEWPORT =
  "overflow-auto duration-(--duration-fast) ease-out-quart focus-visible:outline-1 focus-visible:ring-[3px] focus-visible:ring-ring/50 [overflow-anchor:none] pb-10 [&>div]:!flex [&>div]:!flex-col [&>div]:!justify-end [&>div]:!min-h-full";

export function ThreadView({ thread, conversation }: { thread: Thread; conversation: Conversation }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    const el = viewportRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  // The site opens a thread at its latest message.
  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const handleScroll = () => {
    const el = viewportRef.current;
    if (el) setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_END_THRESHOLD);
  };

  return (
    <div className="flex-1 overflow-y-auto md:pt-2 md:pr-2 md:pb-2">
      <div className="relative flex h-full flex-col">
        <div className="relative flex min-h-0 min-w-0 flex-1 overflow-clip rounded-3xl border border-border-subtle">
          <div className="relative z-10 h-full min-h-0 bg-surface-secondary min-w-0 flex-1 transition-[width] duration-(--duration-slow) ease-out">
            <div className="safe-area-bottom relative flex h-full min-w-0 flex-col bg-background">
              <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-border-subtle border-r bg-background">
                <ThreadHeader thread={thread} model={conversation.model} />

                <ScrollArea
                  className="relative overflow-hidden min-h-0 min-w-0 flex-1"
                  viewportRef={viewportRef}
                  viewportProps={{ onScroll: handleScroll, className: VIEWPORT }}
                >
                  <div className="min-w-0 space-y-2 pt-4 mx-auto w-full max-w-[816px] px-6">
                    {groupTurns(conversation.items).map((turn, i) => {
                      if (turn.kind === "user") {
                        return (
                          <UserMessage
                            key={turn.item.id}
                            id={turn.item.id}
                            text={turn.item.text}
                            knowledgeHints={turn.item.knowledgeHints}
                            sentAtLabel={turn.item.sentAtLabel}
                          />
                        );
                      }
                      if (turn.items.length === 1) {
                        return <AgentItemView key={turn.items[0].id} item={turn.items[0]} />;
                      }
                      return (
                        <div key={i} className="space-y-2">
                          {turn.items.map((item) => (
                            <AgentItemView key={item.id} item={item} />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mx-auto w-full max-w-[816px] px-6 pt-2" />
                </ScrollArea>

                <div className="relative shrink-0">
                  {/* `to-background-fade` on the site is background at 0% alpha; `to-background/0` is the stock spelling. */}
                  <div className="pointer-events-none absolute right-0 bottom-full left-0 h-8 bg-gradient-to-t from-background to-background/0" />
                  <div
                    className={cn(
                      "pointer-events-none absolute right-0 bottom-full left-0 z-10 mb-2 flex justify-center transition-[opacity,transform] duration-(--duration-normal) ease-out",
                      atBottom ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100",
                    )}
                  >
                    {/* A floating glass pill: the outline button carrying the raised-control shadow over a hairline ring (design.md §6). */}
                    <Button
                      type="button"
                      variant="outline"
                      size="none"
                      tabIndex={-1}
                      aria-hidden={atBottom}
                      onClick={() => scrollToBottom("smooth")}
                      className={cn(
                        "gap-1.5 px-4 py-2 font-normal text-xs bg-surface-elevated/90 text-muted-foreground shadow-md ring-1 ring-border-subtle backdrop-blur-sm hover:bg-surface-elevated hover:text-foreground",
                        atBottom ? "pointer-events-none" : "pointer-events-auto cursor-pointer",
                      )}
                    >
                      <IconArrowDown className="size-3.5" aria-hidden="true" />
                      Scroll to bottom
                    </Button>
                  </div>
                  <div className="mx-auto w-full max-w-[816px] px-4 pb-4">
                    <div className="relative shrink-0">
                      <div className="pointer-events-none absolute -top-9 right-3 z-20">
                        <div className="pointer-events-auto" />
                      </div>
                      <Composer placeholder="Add a follow-up..." showAgentPicker={false} className="shrink-0" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
