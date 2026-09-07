"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconArrowsDiagonal, IconBlocks, IconBolt, IconBrain, IconCheck, IconCpu, IconGauge, IconInfoCircle, IconPlug } from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ClaudeLogo, GeminiLogo, KimiLogo, OpenAILogo, ZaiLogo } from "@/components/app/brand-icons";
import { cn } from "@/lib/utils";

// The "Opus 5" pill menu (docs/reference/overlays/composer-thread-settings-menu.html,
// composer-model-picker.html, composer-reasoning-effort.html). Model and
// reasoning effort are lifted to the composer so the pill label follows.

type Provider = "anthropic" | "openai" | "other" | "open";
type Logo = typeof ClaudeLogo;

export type Model = { name: string; description: string; logo: Logo; provider: Provider };

export const MODELS: Model[] = [
  { name: "Fable 5.1", description: "Model for demanding tasks. Higher cost.", logo: ClaudeLogo, provider: "anthropic" },
  { name: "Opus 5", description: "Powerful model for complex tasks.", logo: ClaudeLogo, provider: "anthropic" },
  { name: "Sonnet 5", description: "Great for everyday tasks. Lower cost.", logo: ClaudeLogo, provider: "anthropic" },
  { name: "GPT-6 Astra", description: "OpenAI's GPT-6 Astra model.", logo: OpenAILogo, provider: "openai" },
  { name: "GPT 5.6 Terra", description: "Balanced OpenAI model. Lower cost.", logo: OpenAILogo, provider: "openai" },
  { name: "Gemini 3.8 Flash", description: "Fast model with 1M context. Lower cost.", logo: GeminiLogo, provider: "other" },
  { name: "Kimi K3", description: "Multimodal open model. Lower cost.", logo: KimiLogo, provider: "open" },
  {
    name: "GLM 5.3 Flash",
    description: "Z.ai's fast multimodal open model for coding and agentic work. Very low cost.",
    logo: ZaiLogo,
    provider: "open",
  },
];

export const EFFORTS = [
  { label: "Low", description: "Fast responses" },
  { label: "Medium", description: "Balanced" },
  { label: "High", description: "Deep reasoning" },
  { label: "Extra high", description: "Deeper reasoning" },
  { label: "Max", description: "Maximum capacity" },
] as const;

export type Effort = (typeof EFFORTS)[number]["label"];

const PROVIDERS: { key: Provider; label: string; logo?: Logo }[] = [
  { key: "anthropic", label: "Anthropic", logo: ClaudeLogo },
  { key: "openai", label: "OpenAI", logo: OpenAILogo },
  { key: "other", label: "Other providers" },
  { key: "open", label: "Open weights" },
];

const GROUP_HEADING = "flex items-center gap-1 px-2 py-1.5 text-label-12-caps text-foreground-low";

function ModelRow({ model, selected, onSelect }: { model: Model; selected: boolean; onSelect: () => void }) {
  const Logo = model.logo;
  return (
    <button
      type="button"
      className="flex w-full cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors duration-(--duration-instant) hover:bg-tint-10"
      aria-pressed={selected}
      onClick={onSelect}
    >
      <span className="flex h-5 shrink-0 items-center">
        <Logo className="shrink-0 size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className={cn("min-w-0 truncate text-foreground leading-5", selected && "font-medium")}>{model.name}</span>
        </span>
        <span className="block truncate text-muted-foreground text-xs leading-4">{model.description}</span>
      </span>
      <span className="flex h-5 shrink-0 items-center">
        <IconCheck className={cn("size-4", selected ? "text-foreground" : "opacity-0")} aria-hidden="true" />
      </span>
    </button>
  );
}

export function ThreadSettingsMenu({
  children,
  model,
  onModelChange,
  effort,
  onEffortChange,
  ...triggerProps
}: React.ComponentProps<typeof DropdownMenuTrigger> & {
  model: string;
  onModelChange: (model: string) => void;
  effort: Effort;
  onEffortChange: (effort: Effort) => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [fast, setFast] = useState(false);
  const current = MODELS.find((m) => m.name === model) ?? MODELS[1];
  const CurrentLogo = current.logo;

  const pick = (name: string) => {
    onModelChange(name);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild {...triggerProps}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[calc(100vw-2rem)] max-w-80 p-1">
        <div className="">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 pl-2 pr-1 py-1.5" data-dd-action-name="Model picker">
              <IconBrain className="size-4" aria-hidden="true" />
              <span className="flex-1 text-sm">Model</span>
              <span className="text-muted-foreground text-sm">
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <CurrentLogo className="size-4 shrink-0" />
                  <span className="truncate">{current.name}</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex shrink-0 items-center rounded-full bg-tint-10 px-2 py-0.5 font-medium text-xs text-muted-foreground leading-4">
                        Latest
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Always uses the latest model in this family.</TooltipContent>
                  </Tooltip>
                </span>
              </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-80 p-1">
              <div className={GROUP_HEADING}>
                Latest models
                <Tooltip>
                  <TooltipTrigger asChild>
                    <IconInfoCircle
                      className="size-3"
                      aria-label="We'll automatically use the latest model in the selected family when you create a new thread."
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    We&apos;ll automatically use the latest model in the selected family when you create a new thread.
                  </TooltipContent>
                </Tooltip>
              </div>
              {MODELS.map((m) => (
                <ModelRow key={m.name} model={m} selected={m.name === current.name} onSelect={() => pick(m.name)} />
              ))}
              <DropdownMenuSeparator />
              <div className={GROUP_HEADING}>All models</div>
              {PROVIDERS.map(({ key, label, logo: Logo }) => (
                <DropdownMenuSub key={key}>
                  <DropdownMenuSubTrigger>
                    {Logo ? <Logo className="shrink-0 size-4" /> : <IconCpu className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
                    <span className="flex-1 text-sm">{label}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-80 p-1">
                    {MODELS.filter((m) => m.provider === key).map((m) => (
                      <ModelRow key={m.name} model={m} selected={m.name === current.name} onSelect={() => pick(m.name)} />
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <IconGauge className="size-4" aria-hidden="true" />
              <span className="flex-1 text-sm">Reasoning effort</span>
              <span className="text-muted-foreground text-sm">{effort}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-80 p-1">
              {EFFORTS.map((e) => {
                const selected = e.label === effort;
                return (
                  <button
                    key={e.label}
                    type="button"
                    className="flex w-full cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-left transition-colors duration-(--duration-instant) hover:bg-tint-10"
                    onClick={() => {
                      onEffortChange(e.label);
                      setOpen(false);
                    }}
                  >
                    <IconCheck className={cn("mt-0.5 size-4 shrink-0", selected ? "text-brand-accent" : "opacity-0")} aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <div className={cn("truncate text-sm leading-5 text-foreground", selected ? "font-medium" : "font-normal")}>
                        {e.label}
                      </div>
                      <div className="whitespace-normal text-muted-foreground text-xs leading-4">{e.description}</div>
                    </div>
                  </button>
                );
              })}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setFast((f) => !f);
            }}
          >
            <span className="flex h-5 items-center">
              <IconBolt className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-popover-foreground text-sm leading-5">Fast inference</div>
              <div className="truncate text-muted-foreground text-xs leading-4">Faster output, billed at 2x token cost</div>
            </div>
            <span className="flex h-5 items-center">
              <Switch className="scale-75" checked={fast} onCheckedChange={setFast} onClick={(e) => e.stopPropagation()} />
            </span>
          </DropdownMenuItem>
        </div>

        <div className="">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <IconBlocks className="size-4" aria-hidden="true" />
              <span className="flex-1 text-sm">Tools</span>
              <span className="text-muted-foreground text-sm">17</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-64 p-1">
              <div className={GROUP_HEADING}>17 tools enabled</div>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </div>

        <div className="">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <IconPlug className="size-4" aria-hidden="true" />
              <span className="flex-1 text-sm">Integrations</span>
              <span className="text-muted-foreground text-sm">Any</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-64 p-1">
              <DropdownMenuItem>
                <IconCheck className="size-4 text-foreground" aria-hidden="true" />
                <span className="text-sm">Any</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </div>

        <DropdownMenuSeparator />
        <button
          type="button"
          className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground text-sm transition-colors duration-(--duration-instant) hover:bg-tint-10 hover:text-foreground"
          onClick={() => {
            setOpen(false);
            router.push("/settings");
          }}
        >
          <IconArrowsDiagonal className="size-4" aria-hidden="true" />
          <span>Open full settings</span>
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
