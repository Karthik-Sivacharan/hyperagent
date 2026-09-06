"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUp, Bot, ChevronDown, ListTodo, Mic, Plus, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AirtableLogo, GmailLogo, SlackLogo } from "@/components/app/brand-icons";

// The message composer from hyperagent.com (home + thread pages). Structure
// and classes follow docs/reference/pages/threads-new.html; the TipTap editor
// is replaced by an auto-growing textarea with the same metrics (14px text,
// 21px line-height, 44px min, 200px max).

type ComposerProps = {
  placeholder?: string;
  /** Show the "Agent" picker pill (home shows it; thread pages do not). */
  showAgentPicker?: boolean;
  /** Show the "Connect your integrations" footer strip. */
  showIntegrationsFooter?: boolean;
  model?: string;
  mode?: string;
  className?: string;
  autoFocus?: boolean;
};

const PILL =
  "flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-[rgba(215,215,215,0.6)] bg-background px-3 font-normal text-muted-foreground text-sm shadow-xs transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-sm:px-2.5";

export function Composer({
  placeholder = "Ask anything or start a task…",
  showAgentPicker = true,
  showIntegrationsFooter = true,
  model = "Opus 5",
  mode = "Plan",
  className,
  autoFocus,
}: ComposerProps) {
  const [value, setValue] = useState("");
  const canSend = value.trim().length > 0;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border bg-background transition-colors duration-200 border-border",
        className,
      )}
      style={{
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1), 0 0 24px 0px rgba(0,0,0,0)",
      }}
    >
      <div className="bg-background relative border-t-0">
        <div className="relative cursor-text px-4">
          <div className="relative scrollbar-hide pt-3 pb-[10px] text-sm">
            <textarea
              aria-label="Message the agent"
              placeholder={placeholder}
              value={value}
              autoFocus={autoFocus}
              rows={1}
              onChange={(e) => setValue(e.target.value)}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
              }}
              className="block w-full min-h-[44px] max-h-[200px] resize-none overflow-y-auto bg-transparent p-0 text-sm leading-[21px] text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="@container flex items-center justify-between gap-2 px-4 max-sm:gap-1 max-sm:px-3 cursor-text pt-1 pb-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-visible max-sm:gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8 shrink-0 rounded-full border border-[rgba(215,215,215,0.6)] bg-background shadow-xs"
              aria-label="Add files or context"
            >
              <Plus className="size-4 text-muted-foreground" />
            </Button>
            <button type="button" aria-label="Thread settings" className={PILL}>
              <Settings2 className="size-4" aria-hidden="true" />
              <span className="inline-flex min-w-0 items-center gap-1.5 @max-lg:hidden max-sm:hidden">
                <span className="truncate">{model}</span>
              </span>
              <ChevronDown className="@max-lg:hidden size-3 max-sm:hidden" aria-hidden="true" />
            </button>
            {showAgentPicker && (
              <div className="flex items-center gap-0.5">
                <button type="button" aria-label="Use an agent" className={PILL}>
                  <Bot className="size-3.5" aria-hidden="true" />
                  <span className="@max-lg:hidden max-sm:hidden">Agent</span>
                  <ChevronDown className="@max-lg:hidden size-3 max-sm:hidden" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2 max-sm:gap-1">
            <button
              type="button"
              aria-label={`Execution mode: ${mode}`}
              className="flex h-8 cursor-pointer items-center rounded-full font-normal text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring gap-1.5 px-3 border border-black/10"
              style={{ backgroundColor: "rgb(10, 22, 40)", color: "rgb(178, 208, 250)" }}
            >
              <ListTodo className="size-3.5" aria-hidden="true" />
              <span className="@max-lg:hidden">{mode}</span>
              <ChevronDown className="@max-lg:hidden size-3" aria-hidden="true" />
            </button>
            <Button variant="ghost" size="icon" className="-ml-1.5 size-9 shrink-0 rounded-full" aria-label="Dictate">
              <Mic className="size-4" />
            </Button>
            <Button
              size="icon"
              className="size-9 shrink-0 rounded-full transition-colors"
              aria-label="Send message"
              disabled={!canSend}
            >
              <ArrowUp className="size-4" />
            </Button>
          </div>
        </div>

        {showIntegrationsFooter && (
          <div className="flex cursor-default items-center gap-2 rounded-b-2xl bg-muted/50 px-4 py-2.5">
            <div className="flex items-center -space-x-1">
              {[AirtableLogo, GmailLogo, SlackLogo].map((Logo, i) => (
                <div
                  key={i}
                  data-slot="icon-tile"
                  className="flex shrink-0 items-center justify-center size-6 rounded-[6px] border border-muted bg-background"
                >
                  <Logo size={16} />
                </div>
              ))}
            </div>
            <Link
              className="flex items-center gap-1 text-muted-foreground text-xs transition-colors hover:text-foreground"
              href="/settings/integrations"
            >
              Connect your integrations
              <ArrowRight className="size-3" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
