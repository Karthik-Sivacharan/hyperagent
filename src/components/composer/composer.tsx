"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconAdjustmentsHorizontal, IconArrowRight, IconArrowUp, IconChevronDown, IconListCheck, IconMicrophone, IconPlus, IconRobotFace } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  /** Controlled value. Omit for the uncontrolled composer every other page uses. */
  value?: string;
  /** Called on every edit when `value` is supplied. */
  onValueChange?: (value: string) => void;
};

// useLayoutEffect warns when React renders this on the server, where there is
// no textarea to measure anyway. Same device as signup-screen.tsx.
const useBeforePaint = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function Composer({
  placeholder = "Ask anything or start a task…",
  showAgentPicker = true,
  showIntegrationsFooter = true,
  model: initialModel = "Opus 5",
  mode: initialMode = "plan",
  className,
  autoFocus,
  value: controlledValue,
  onValueChange,
}: ComposerProps) {
  // Every page but the signup personalize step just types into the composer, so
  // the draft state stays and `value` is the optional override: pass it and the
  // parent owns the text (it can drop a suggested agent's brief in), omit it and
  // nothing outside this file learns the state exists.
  const [draft, setDraft] = useState("");
  const value = controlledValue ?? draft;
  const [model, setModel] = useState(initialModel);
  const [effort, setEffort] = useState<Effort>("Medium");
  const [mode, setMode] = useState<ExecutionMode>(initialMode);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0;
  const modeLabel = EXECUTION_MODES[mode].pill;
  const planning = mode === "plan";

  // Auto-grow, keyed on the rendered value rather than hung off the textarea's
  // own `onInput`: text set by a parent fires no input event, so the box would
  // sit at one row under three lines of it. Measuring before paint keeps the
  // new height in the same frame as the character that caused it, which is what
  // the input handler used to guarantee.
  useBeforePaint(() => {
    const el = editorRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-5xl bg-surface-elevated shadow-lg ring-1 ring-input transition-[box-shadow] duration-(--duration-slow) ease-out",
        className,
      )}
    >
      <div className="relative">
        <Input type="file" multiple className="hidden" />
        <div className="relative cursor-text px-4">
          <div className="relative scrollbar-hide pt-3 pb-[10px] text-sm">
            <Textarea
              variant="bare"
              aria-label="Message the agent"
              placeholder={placeholder}
              ref={editorRef}
              value={value}
              autoFocus={autoFocus}
              rows={1}
              onChange={(e) => {
                setDraft(e.target.value);
                onValueChange?.(e.target.value);
              }}
              className="block min-h-[44px] max-h-[200px] resize-none overflow-y-auto text-sm leading-[21px] md:text-sm"
            />
          </div>
        </div>

        <div className="@container flex items-center justify-between gap-2 px-4 max-sm:gap-1 max-sm:px-3 cursor-text pt-1 pb-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-visible max-sm:gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <AddMenu>
                  <Button variant="tint" size="icon-sm" aria-label="Add files or context">
                    <IconPlus className="size-4" aria-hidden="true" />
                  </Button>
                </AddMenu>
              </TooltipTrigger>
              <TooltipContent>Add files or context</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <ThreadSettingsMenu model={model} onModelChange={setModel} effort={effort} onEffortChange={setEffort}>
                  <Button variant="tint" size="pill" aria-label="Thread settings" className="max-sm:px-2.5">
                    <IconAdjustmentsHorizontal className="size-4" aria-hidden="true" />
                    <span className="inline-flex min-w-0 items-center gap-1.5 @max-lg:hidden max-sm:hidden">
                      <span className="truncate">{model}</span>
                    </span>
                    <IconChevronDown className="@max-lg:hidden size-3 max-sm:hidden" aria-hidden="true" />
                  </Button>
                </ThreadSettingsMenu>
              </TooltipTrigger>
              <TooltipContent>Thread settings</TooltipContent>
            </Tooltip>

            {showAgentPicker && (
              <div className="flex items-center gap-0.5">
                <AgentPicker>
                  <Button variant="tint" size="pill" data-dd-action-name="Agent picker" aria-label="Use an agent" className="max-sm:px-2.5">
                    <IconRobotFace className="size-3.5" aria-hidden="true" />
                    <span className="@max-lg:hidden max-sm:hidden">Agent</span>
                    <IconChevronDown className="@max-lg:hidden size-3 max-sm:hidden" aria-hidden="true" />
                  </Button>
                </AgentPicker>
              </div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2 max-sm:gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <PlanMenu mode={mode} onModeChange={setMode}>
                  {/* Plan mode is the composer's stated intent, so it reads as the ink pill;
                      the execute modes step back to the tint chip. */}
                  <Button
                    variant={planning ? "default" : "tint"}
                    size="pill"
                    aria-label={`Execution mode: ${modeLabel}`}
                    className={cn("max-sm:px-2.5", planning && "aria-expanded:bg-primary/90")}
                  >
                    <IconListCheck className="size-3.5" aria-hidden="true" />
                    <span className="@max-lg:hidden">{modeLabel}</span>
                    <IconChevronDown className="@max-lg:hidden size-3" aria-hidden="true" />
                  </Button>
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
                <IconTile key={i} size="sm" tone="raised">
                  <Logo size={16} />
                </IconTile>
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
