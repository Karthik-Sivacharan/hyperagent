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
import { Badge } from "@/components/ui/badge";
import { Overline } from "@/components/ui/overline";
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

function GroupHeading({ className, ...props }: React.ComponentProps<typeof Overline>) {
  return <Overline className={cn("flex items-center gap-1 px-2 py-1.5", className)} {...props} />;
}

function ModelRow({ model, selected, onSelect }: { model: Model; selected: boolean; onSelect: () => void }) {
  const Logo = model.logo;
  return (
    <DropdownMenuItem className="items-start" aria-pressed={selected} onSelect={onSelect}>
      {/* The menu item tints unsized svgs; the OpenAI and Kimi marks draw in
          currentColor, so the logo keeps the popover's text colour explicitly. */}
      <span className="flex h-5 shrink-0 items-center">
        <Logo className="shrink-0 size-4 text-popover-foreground" />
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
    </DropdownMenuItem>
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
  const [fast, setFast] = useState(false);
  const current = MODELS.find((m) => m.name === model) ?? MODELS[1];
  const CurrentLogo = current.logo;

  // Every row is a menu item, so selecting one closes the menu on its own.
  return (
    <DropdownMenu>
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
                      <Badge variant="secondary">Latest</Badge>
                    </TooltipTrigger>
                    <TooltipContent>Always uses the latest model in this family.</TooltipContent>
                  </Tooltip>
                </span>
              </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-80 p-1">
              <GroupHeading>
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
              </GroupHeading>
              {MODELS.map((m) => (
                <ModelRow key={m.name} model={m} selected={m.name === current.name} onSelect={() => onModelChange(m.name)} />
              ))}
              <DropdownMenuSeparator />
              <GroupHeading>All models</GroupHeading>
              {PROVIDERS.map(({ key, label, logo: Logo }) => (
                <DropdownMenuSub key={key}>
                  <DropdownMenuSubTrigger>
                    {Logo ? <Logo className="shrink-0 size-4" /> : <IconCpu className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
                    <span className="flex-1 text-sm">{label}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-80 p-1">
                    {MODELS.filter((m) => m.provider === key).map((m) => (
                      <ModelRow key={m.name} model={m} selected={m.name === current.name} onSelect={() => onModelChange(m.name)} />
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
                  <DropdownMenuItem key={e.label} className="items-start" onSelect={() => onEffortChange(e.label)}>
                    <IconCheck className={cn("mt-0.5 size-4 shrink-0", selected ? "text-brand-accent" : "opacity-0")} aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <div className={cn("truncate text-sm leading-5 text-foreground", selected ? "font-medium" : "font-normal")}>
                        {e.label}
                      </div>
                      <div className="whitespace-normal text-muted-foreground text-xs leading-4">{e.description}</div>
                    </div>
                  </DropdownMenuItem>
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
              <Switch size="sm" checked={fast} onCheckedChange={setFast} onClick={(e) => e.stopPropagation()} />
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
              <GroupHeading>17 tools enabled</GroupHeading>
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
        <DropdownMenuItem className="text-muted-foreground" onSelect={() => router.push("/settings")}>
          <IconArrowsDiagonal className="size-4" aria-hidden="true" />
          <span>Open full settings</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
