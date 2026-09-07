// The settings hub as hyperagent.com/settings lists it
// (docs/reference/pages/settings.html, captured 2026-09-06): three overline
// sections of link cards. Icon names are the captured dump's lucide class
// names, resolved to Tabler icons by the ICONS table in settings-link-card.tsx;
// "openclaw" is the brand mark copied into settings-icons.tsx. Gradient
// classes are kept as literal strings so Tailwind picks them up.

export type SettingsCardIcon =
  | "user"
  | "settings"
  | "shield"
  | "bell"
  | "users"
  | "plug"
  | "openclaw"
  | "download"
  | "key-round"
  | "credit-card"
  | "gift";

export interface SettingsCard {
  slug: string;
  href: string;
  title: string;
  description: string;
  icon: SettingsCardIcon;
  /** `from-* to-*` pair applied to both the hover wash and the icon tile. */
  gradient: string;
}

export interface SettingsSection {
  label: string;
  cards: SettingsCard[];
}

export const settingsSections: SettingsSection[] = [
  {
    label: "General",
    cards: [
      {
        slug: "profile",
        href: "/settings/profile",
        title: "Profile",
        description: "Your account identity — display name and how you appear across Hyperagent.",
        icon: "user",
        gradient: "from-sky-500/20 to-blue-500/20",
      },
      {
        slug: "personalization",
        href: "/settings/personalization",
        title: "Personalization",
        description:
          "Tell Hyperagent about your company and preferences for recommendations tailored to your industry.",
        icon: "settings",
        gradient: "from-indigo-500/20 to-violet-500/20",
      },
      {
        slug: "security",
        href: "/settings/security",
        title: "Security",
        description: "Manage your sessions and security settings.",
        icon: "shield",
        gradient: "from-red-500/20 to-rose-500/20",
      },
      {
        slug: "notifications",
        href: "/settings/notifications",
        title: "Notifications",
        description: "Configure notifications for agent activity on background threads.",
        icon: "bell",
        gradient: "from-yellow-500/20 to-orange-500/20",
      },
      {
        slug: "agent-defaults",
        href: "/settings/agent-defaults",
        title: "Agent defaults",
        description: "Choose the model, tools, execution time, and delegation policy for new home threads.",
        icon: "users",
        gradient: "from-purple-500/20 to-fuchsia-500/20",
      },
    ],
  },
  {
    label: "Data access",
    cards: [
      {
        slug: "integrations",
        href: "/settings/integrations",
        title: "Integrations",
        description:
          "Connect third-party services like GitHub, Slack, Gmail, and 250+ more via OAuth. Enable your agents to interact with external tools.",
        icon: "plug",
        gradient: "from-orange-500/20 to-amber-500/20",
      },
      {
        slug: "openclaw",
        href: "/import/openclaw",
        title: "Import from OpenClaw",
        description:
          "Bring your OpenClaw agent to Hyperagent. Drop your workspace files and get a working agent with its memories and schedules.",
        icon: "openclaw",
        gradient: "from-red-500/20 to-rose-500/20",
      },
      {
        slug: "manus-import",
        href: "/settings/manus-import",
        title: "Manus import",
        description:
          "Browse and import your Manus AI tasks into Hyperagent threads to continue or reference past work.",
        icon: "download",
        gradient: "from-blue-500/20 to-cyan-500/20",
      },
      {
        slug: "mcp-access",
        href: "/settings/mcp-access",
        title: "MCP access",
        description:
          "Connect external apps (Claude, IDEs, agents) to your Hyperagent account over MCP, and review or revoke their active connections.",
        icon: "key-round",
        gradient: "from-cyan-500/20 to-blue-500/20",
      },
    ],
  },
  {
    label: "Subscription",
    cards: [
      {
        slug: "billing",
        href: "/settings/billing",
        title: "Billing",
        description: "Manage your subscription, apply coupon codes, and view billing details.",
        icon: "credit-card",
        gradient: "from-emerald-500/20 to-teal-500/20",
      },
      {
        slug: "connected-ai-providers",
        href: "/settings/connected-ai-providers",
        title: "AI providers",
        description:
          "Connect your ChatGPT subscription so your agents run on it, billed to your OpenAI account instead of ours.",
        icon: "key-round",
        gradient: "from-violet-500/20 to-fuchsia-500/20",
      },
      {
        slug: "referrals",
        href: "/settings/referrals",
        title: "Referrals",
        description: "Share Hyperagent and earn $100 in credits for each referral. Your friends get $100.",
        icon: "gift",
        gradient: "from-pink-500/20 to-rose-500/20",
      },
    ],
  },
];

export const settingsCards = settingsSections.flatMap((s) => s.cards);

export function findSettingsCard(href: string) {
  return settingsCards.find((c) => c.href === href);
}
