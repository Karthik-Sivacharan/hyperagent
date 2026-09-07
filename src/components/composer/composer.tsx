"use client";

import { useState } from "react";
import Link from "next/link";
import { IconArrowRight, IconArrowUp, IconRobot, IconChevronDown, IconListCheck, IconMicrophone, IconPlus, IconSettings2 } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AirtableLogo, GmailLogo, SlackLogo } from "@/components/app/brand-icons";
import { AddMenu } from "@/components/composer/add-menu";
import { AgentPicker } from "@/components/composer/agent-picker";
import { EXECUTION_MODES, PlanMenu, type ExecutionMode } from "@/components/composer/plan-menu";
import { ThreadSettingsMenu, type Effort } from "@/components/composer/thread-settings-menu";

// The message composer (home + thread pages). Structure follows
// docs/reference/pages/threads-new.html: an auto-growing textarea with the
// site's metrics (14px text, 21px line-height, 44px min, 200px max), a row of
// pills, and the integrations strip. Phase 2 dresses it in the brand's chat
// composer: 32px corners on the elevated surface, the glass shadow with the
// `input` tint outline, tint pills, an ink pill for the execution mode and
// the single tangerine action on send (docs/brand/design.md §1, §5, §6, §11).
// Every pill opens the menu captured under docs/reference/overlays/composer-*.html.

type ComposerProps = {
  placeholder?: string;
  /** Show the "Agent" picker pill (home shows it; thread pages do not). */
  showAgentPicker?: boolean;
  /** Show the "Connect your integrations" footer strip. */
  showIntegrationsFooter?: boolean;
  model?: string;
  mode?: ExecutionMode;
  className?: string;
  autoFocus?: boolean;
};

const PILL =
  "flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-tint-10 px-3 font-medium text-muted-foreground text-sm transition-[color,background-color,transform] duration-(--duration-normal) ease-out hover:bg-tint-15 hover:text-foreground aria-expanded:bg-tint-15 aria-expanded:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 motion-safe:active:scale-(--scale-press) max-sm:px-2.5";

export function Composer({
  placeholder = "Ask anything or start a task…",
  showAgentPicker = true,
  showIntegrationsFooter = true,
  model: initialModel = "Opus 5",
  mode: initialMode = "plan",
  className,
  autoFocus,
}: ComposerProps) {
  const [value, setValue] = useState("");
  const [model, setModel] = useState(initialModel);
  const [effort, setEffort] = useState<Effort>("Medium");
  const [mode, setMode] = useState<ExecutionMode>(initialMode);
  const canSend = value.trim().length > 0;
  const modeLabel = EXECUTION_MODES[mode].pill;
  const planning = mode === "plan";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-5xl bg-surface-elevated shadow-lg ring-1 ring-input transition-[box-shadow] duration-(--duration-slow) ease-out",
        className,
      )}
    >
      <div className="relative">
        <input className="hidden" type="file" multiple />
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
              className="block w-full min-h-[44px] max-h-[200px] resize-none overflow-y-auto bg-transparent p-0 text-sm leading-[21px] text-foreground outline-none placeholder:text-foreground-low"
            />
          </div>
        </div>

        <div className="@container flex items-center justify-between gap-2 px-4 max-sm:gap-1 max-sm:px-3 cursor-text pt-1 pb-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-visible max-sm:gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <AddMenu>
                  <Button variant="ghost" size="icon-sm" className="size-8 shrink-0 bg-tint-10 text-muted-foreground hover:bg-tint-15 hover:text-foreground" aria-label="Add files or context">
                    <IconPlus className="size-4" aria-hidden="true" />
                  </Button>
                </AddMenu>
              </TooltipTrigger>
              <TooltipContent>Add files or context</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <ThreadSettingsMenu model={model} onModelChange={setModel} effort={effort} onEffortChange={setEffort}>
                  <button type="button" aria-label="Thread settings" className={PILL}>
                    <IconSettings2 className="size-4" aria-hidden="true" />
                    <span className="inline-flex min-w-0 items-center gap-1.5 @max-lg:hidden max-sm:hidden">
                      <span className="truncate">{model}</span>
                    </span>
                    <IconChevronDown className="@max-lg:hidden size-3 max-sm:hidden" aria-hidden="true" />
                  </button>
                </ThreadSettingsMenu>
              </TooltipTrigger>
              <TooltipContent>Thread settings</TooltipContent>
            </Tooltip>

            {showAgentPicker && (
              <div className="flex items-center gap-0.5">
                <AgentPicker>
                  <button type="button" data-dd-action-name="Agent picker" aria-label="Use an agent" className={PILL}>
                    <IconRobot className="size-3.5" aria-hidden="true" />
                    <span className="@max-lg:hidden max-sm:hidden">Agent</span>
                    <IconChevronDown className="@max-lg:hidden size-3 max-sm:hidden" aria-hidden="true" />
                  </button>
                </AgentPicker>
              </div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2 max-sm:gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <PlanMenu mode={mode} onModeChange={setMode}>
                  <button
                    type="button"
                    aria-label={`Execution mode: ${modeLabel}`}
                    className={cn(
                      PILL,
                      // Plan mode is the composer's stated intent, so it reads as the ink pill;
                      // the execute modes step back to the tint chip.
                      planning && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground aria-expanded:bg-primary/90 aria-expanded:text-primary-foreground",
                    )}
                  >
                    <IconListCheck className="size-3.5" aria-hidden="true" />
                    <span className="@max-lg:hidden">{modeLabel}</span>
                    <IconChevronDown className="@max-lg:hidden size-3" aria-hidden="true" />
                  </button>
                </PlanMenu>
              </TooltipTrigger>
              <TooltipContent>Execution mode</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="-ml-1.5 size-9 shrink-0 text-muted-foreground hover:text-foreground"
                  aria-label="Dictate"
                  aria-pressed={false}
                  data-testid="composer-voice-input-button"
                >
                  <IconMicrophone className="size-4" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Dictate</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="brand"
                  size="icon"
                  className="size-9 shrink-0 disabled:bg-tint-10 disabled:text-foreground-low disabled:opacity-100 disabled:shadow-none"
                  aria-label="Send message"
                  disabled={!canSend}
                >
                  <IconArrowUp className="size-4" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send message</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {showIntegrationsFooter && (
          <div className="flex cursor-default items-center gap-2 rounded-b-5xl border-t border-border-subtle bg-surface-secondary px-4 py-2.5">
            <div className="flex items-center -space-x-1">
              {[AirtableLogo, GmailLogo, SlackLogo].map((Logo, i) => (
                <div key={i} data-slot="icon-tile" className="flex shrink-0 items-center justify-center size-6 rounded-md bg-background shadow-edge">
                  <Logo size={16} />
                </div>
              ))}
            </div>
            <Link
              className="flex items-center gap-1 text-muted-foreground text-xs transition-colors duration-(--duration-fast) hover:text-foreground"
              href="/settings/integrations"
            >
              Connect your integrations
              <IconArrowRight className="size-3" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
