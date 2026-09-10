"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import {
  IconBook,
  IconCheck,
  IconCopy,
  IconDeviceDesktop,
  IconHelpCircle,
  IconLifebuoy,
  IconLogout,
  IconMessageCircleQuestion,
  IconMoon,
  IconPlug,
  IconSettings,
  IconSparkles,
  IconSun,
  IconUserPlus,
} from "@tabler/icons-react";
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
import { Overline } from "@/components/ui/overline";
import { DiscordLogo } from "@/components/app/brand-icons";
import { TokenUsageChart } from "@/components/app/token-usage-chart";

// The account dropdown at the bottom of the sidebar, transcribed from
// docs/reference/overlays/account-menu*.html: plan usage, token usage panel,
// Integrations, Settings, Theme, Help, Add account, Log out. Phase 2 wires
// the Theme choice to next-themes (dark is the app's default; `:root` is
// still the brand's light mapping and `.dark` still only re-maps it).

type ThemeChoice = "light" | "dark" | "system";

const THEMES: { value: ThemeChoice; label: string; icon: typeof IconSun }[] = [
  { value: "light", label: "Light", icon: IconSun },
  { value: "dark", label: "Dark", icon: IconMoon },
  { value: "system", label: "System", icon: IconDeviceDesktop },
];

const TOKEN_STATS = [
  { label: "Total", value: "85k" },
  { label: "Peak / day", value: "85k" },
  { label: "Active days", value: "1" },
];

function UsageRing() {
  // 0.0532% of the $1,000 bonus used: stroke-dasharray is the r=7 circumference.
  return (
    <div
      role="progressbar"
      aria-valuenow={0.053257875}
      aria-valuemin={0}
      aria-valuemax={100}
      className="relative inline-flex items-center justify-center mt-0.5 shrink-0 text-brand-accent"
      style={{ width: 16, height: 16 }}
    >
      <svg className="text-current" viewBox="0 0 16 16" style={{ width: 16, height: 16 }}>
        <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-20" />
        <circle
          cx="8"
          cy="8"
          r="7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="43.982297150257104"
          strokeDashoffset="43.95887311341869"
          className="origin-center -rotate-90 transition-[stroke-dashoffset] duration-500"
          style={{ transitionTimingFunction: "var(--ease-out-expo)", transformOrigin: "center center" }}
        />
      </svg>
    </div>
  );
}

export function AccountMenu({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start">
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <span className="flex items-start gap-2 flex-1">
              <UsageRing />
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium text-sm">Free Plan</span>
                <span className="flex items-center gap-1 whitespace-nowrap text-muted-foreground text-xs">
                  $0.54 / $1,000 bonus used
                </span>
              </span>
            </span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <IconSparkles className="size-4" aria-hidden="true" />
            85k tokens
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-[24rem] p-3">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm">Token usage</h4>
                <p className="mt-0.5 text-muted-foreground text-xs">Last 30 days across all your threads and agents.</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {TOKEN_STATS.map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-surface-secondary px-2.5 py-1.5">
                    <Overline>{stat.label}</Overline>
                    <div className="text-label-14-mono font-medium">{stat.value}</div>
                  </div>
                ))}
              </div>
              <TokenUsageChart />
            </div>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/settings/integrations">
            <IconPlug className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm">Integrations</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <IconSettings className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm">Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <IconMoon className="size-4" aria-hidden="true" />
            <span className="text-sm">Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {THEMES.map(({ value, label, icon: Icon }) => (
              <DropdownMenuItem
                key={value}
                data-drawer-keep-open=""
                onSelect={(e) => {
                  e.preventDefault();
                  setTheme(value);
                }}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm">{label}</span>
                {theme === value && <IconCheck className="ml-auto size-4 shrink-0 opacity-50" aria-hidden="true" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <IconHelpCircle className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm">Help</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>
              <IconMessageCircleQuestion className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm">Ask Hyperagent</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a target="_blank" rel="noopener noreferrer" href="https://www.hyperagent.com/docs">
                <IconBook className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm">Documentation</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem
              aria-label="Copy support@hyperagent.com"
              data-drawer-keep-open=""
              onSelect={() => void navigator.clipboard?.writeText("support@hyperagent.com")}
            >
              <IconLifebuoy className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm">support@hyperagent.com</span>
              <IconCopy className="ml-auto size-4 shrink-0 opacity-50" aria-hidden="true" />
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="https://discord.com/invite/wN6hrjnHzg" target="_blank" rel="noopener noreferrer">
                <DiscordLogo className="h-4 w-4" />
                <span className="text-sm">Join our Discord</span>
              </a>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem>
          <IconUserPlus className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm">Add account</span>
        </DropdownMenuItem>
        <DropdownMenuItem data-drawer-keep-open="">
          <IconLogout className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
