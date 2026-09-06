// The blurred-gradient "orb" tile hyperagent.com draws for agent templates
// (New agent > Start from a template, and the composer's Agent picker). Values
// are transcribed from docs/reference/overlays/new-agent-menu-templates.html
// and composer-agent-picker.html so the tiles render identically.

export type AgentTemplate = {
  name: string;
  description: string;
  emoji: string;
  base: string;
  /** Three blurred radial orbs: [top%, left%, size%, colour]. */
  orbs: [number, number, number, string][];
  /** Specular highlight position [x%, y%]. */
  highlight: [number, number];
};

export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    name: "Daily Briefing",
    description: "Structured morning briefing delivered to your inbox",
    emoji: "📋",
    base: "rgb(196, 114, 142)",
    orbs: [
      [-5.77414, 30.9405, 68.8431, "rgb(247, 183, 49)"],
      [42.3618, 36.8508, 76.5294, "rgb(232, 67, 147)"],
      [23.4123, -7.79129, 83.1176, "rgb(108, 92, 231)"],
    ],
    highlight: [73.1796, 40.6348],
  },
  {
    name: "Context Builder",
    description: "Auto-learn your projects, teammates, and tools from connected integrations",
    emoji: "🧠",
    base: "rgb(135, 111, 246)",
    orbs: [
      [26.2986, 47.2824, 83.902, "rgb(99, 102, 241)"],
      [40.4779, 0.904046, 84.2941, "rgb(139, 92, 246)"],
      [-6.77653, 11.8136, 84.6078, "rgb(167, 139, 250)"],
    ],
    highlight: [63.248, 71.2012],
  },
  {
    name: "Chief of Staff",
    description: "Inbox triage, meeting prep, and daily priorities",
    emoji: "☀️",
    base: "rgb(109, 94, 64)",
    orbs: [
      [-7.28236, 26.2986, 72.451, "rgb(30, 58, 95)"],
      [39.096, 40.4779, 65.8627, "rgb(245, 158, 11)"],
      [28.1864, -6.77653, 71.6667, "rgb(51, 65, 85)"],
    ],
    highlight: [71.2012, 36.752],
  },
  {
    name: "Developer",
    description: "Write, debug, and ship code from a conversation",
    emoji: "🚀",
    base: "rgb(34, 33, 59)",
    orbs: [
      [47.9829, 20.9772, 68.6078, "rgb(30, 30, 46)"],
      [6.8548, -4.72253, 71.6667, "rgb(45, 43, 85)"],
      [5.16226, 43.7453, 68.6078, "rgb(26, 26, 46)"],
    ],
    highlight: [32.95, 68.2838],
  },
  {
    name: "Investment Analyst",
    description: "Research companies and draft investment memos",
    emoji: "💹",
    base: "rgb(80, 118, 55)",
    orbs: [
      [-0.808055, 1.26434, 69.6275, "rgb(6, 78, 59)"],
      [14.1785, 47.3881, 69.3137, "rgb(212, 175, 55)"],
      [46.6296, 11.3475, 69.0784, "rgb(22, 101, 52)"],
    ],
    highlight: [51.3084, 25.0343],
  },
  {
    name: "Recruiter",
    description: "Source candidates and craft personalized outreach",
    emoji: "🎯",
    base: "rgb(158, 43, 190)",
    orbs: [
      [32.2744, -5.16623, 83.3529, "rgb(147, 51, 234)"],
      [-7.93179, 21.9532, 74.3333, "rgb(219, 39, 119)"],
      [35.6574, 43.2131, 82.0196, "rgb(109, 40, 217)"],
    ],
    highlight: [26.362, 41.8608],
  },
  {
    name: "Sales Prospector",
    description: "Find prospects, enrich leads, and draft outreach",
    emoji: "📈",
    base: "rgb(218, 60, 29)",
    orbs: [
      [2.76148, 42.0643, 67.1961, "rgb(185, 28, 28)"],
      [47.7275, 23.8968, 67.9804, "rgb(220, 38, 38)"],
      [9.51102, -5.96115, 66.7255, "rgb(249, 115, 22)"],
    ],
    highlight: [74.8137, 53.0467],
  },
];

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** The gradient layers shared by both tile sizes. */
function OrbLayers({ template }: { template: AgentTemplate }) {
  return (
    <>
      {template.orbs.map(([top, left, size, color], i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            top: `${top}%`,
            left: `${left}%`,
            width: `${size}%`,
            height: `${size}%`,
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            filter: "blur(clamp(3px, 18cqmin, 28px))",
            opacity: 0.95,
          }}
        />
      ))}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(transparent 45%, rgba(0, 0, 0, 0.15) 100%)" }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(at ${template.highlight[0]}% ${template.highlight[1]}%, rgba(255, 255, 255, 0.12) 0%, transparent 55%)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: NOISE, backgroundRepeat: "repeat", opacity: 0.3, mixBlendMode: "soft-light" }}
      />
    </>
  );
}

/** 16px tile used in the "Start from a template" submenu. */
export function AgentOrbSmall({ template }: { template: AgentTemplate }) {
  return (
    <div className="mt-0.5 shrink-0 overflow-hidden rounded h-4 w-4">
      <div className="relative overflow-hidden size-full" style={{ backgroundColor: template.base, containerType: "size" }}>
        <OrbLayers template={template} />
      </div>
    </div>
  );
}

/** 24px tile with the emoji overlay used in the composer's Agent picker. */
export function AgentOrbTile({ template }: { template: AgentTemplate }) {
  return (
    <div
      className="relative flex shrink-0 select-none items-center justify-center overflow-hidden rounded-[4px]"
      aria-hidden="true"
      style={{ width: 24, height: 24 }}
    >
      <div className="overflow-hidden absolute inset-0" style={{ backgroundColor: template.base, containerType: "size" }}>
        <OrbLayers template={template} />
      </div>
      <div className="absolute inset-0 bg-black" style={{ opacity: 0.15 }} />
      <span className="relative leading-none drop-shadow-sm" style={{ fontSize: 12 }}>
        {template.emoji}
      </span>
    </div>
  );
}
