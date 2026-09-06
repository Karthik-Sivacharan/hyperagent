// hyperagent.com/marketplace as captured on 2026-09-06
// (docs/reference/pages/marketplace.html). Static for the clone; the images
// are the site's CDN assets downloaded into public/img/marketplace/.

export type ListingAuthor = {
  name: string;
  /** Local avatar. Without one the site renders the name's first letter. */
  avatarUrl?: string;
};

export type ListingTags = {
  category: string;
  /** How many further categories the "+N" pill stands for. */
  more: number;
};

export type Listing = {
  id: string;
  href: string;
  name: string;
  author: ListingAuthor;
  description: string;
  tags: ListingTags;
  stars: number;
  installs: number;
};

export type SkillListing = Listing & {
  /** 16:9 showcase image; only the marketplace grid shows it. */
  cover?: string;
};

export type MeshBlob = {
  top: string;
  left: string;
  size: string;
  color: string;
};

/**
 * An agent's 40px icon tile: either an uploaded image, or the site's generated
 * "mesh" (a base colour, three blurred radial blobs, a vignette, a highlight
 * and a noise layer) with an emoji on top. Values are the inline styles the
 * live page renders.
 */
export type AgentIcon =
  | { kind: "image"; src: string }
  | {
      kind: "mesh";
      emoji: string;
      base: string;
      blobs: MeshBlob[];
      /** Highlight position, as `at x% y%`. */
      highlight: [string, string];
    };

export type AgentListing = Listing & {
  tagline?: string;
  /** Header image; without one the card shows the violet-to-blue gradient. */
  cover?: string;
  icon: AgentIcon;
};

export type CategoryIcon =
  | "megaphone"
  | "microscope"
  | "user-search"
  | "trending-up"
  | "code"
  | "pen-tool"
  | "chart-column"
  | "workflow";

export type MarketplaceCategory = {
  slug: string;
  name: string;
  icon: CategoryIcon;
  background: string;
  color: string;
  summary: string;
};

export const marketplaceHero = {
  headline: "Built by the community,\nready for you",
  subline: "Discover agents and skills behind real workflows",
  image: "/img/marketplace/marketplace-banner.png",
  background: "#291B25",
};

const alexMcDonnell: ListingAuthor = {
  name: "Alex McDonnell",
  avatarUrl: "/img/marketplace/alex-mcdonnell.png",
};

export const featuredAgents: AgentListing[] = [
  {
    id: "cca01KY2P548K_MD7GCZGRBCW6DPEK",
    href: "/marketplace/a/cca01KY2P548K_MD7GCZGRBCW6DPEK",
    name: "Inbound",
    tagline: "Inbound Scheduling Assistant",
    icon: { kind: "image", src: "/img/marketplace/inbound-icon.jpg" },
    author: alexMcDonnell,
    description:
      "An always-on inbound BDR that responds to sales emails within minutes, converts interest into confirmed calendar meetings, and gives its human a private, research-backed prep brief before every call.",
    tags: { category: "Sales & outreach", more: 1 },
    stars: 13,
    installs: 61,
  },
  {
    id: "cca01KWYVSMWK_M740XZMR2ZV26WM1",
    href: "/marketplace/a/cca01KWYVSMWK_M740XZMR2ZV26WM1",
    name: "Job Hunt Copilot",
    cover: "/img/marketplace/job-hunt-copilot-cover.png",
    icon: {
      kind: "mesh",
      emoji: "🎯",
      base: "rgb(120, 140, 200)",
      blobs: [
        { top: "14.1785%", left: "47.3881%", size: "83.1176%", color: "rgb(108, 92, 231)" },
        { top: "46.6296%", left: "11.3475%", size: "80.7647%", color: "rgb(0, 206, 201)" },
        { top: "-0.808055%", left: "1.26434%", size: "78.1765%", color: "rgb(253, 121, 168)" },
      ],
      highlight: ["70.9668%", "63.616%"],
    },
    author: { name: "Abhijay Vuyyuuru" },
    description:
      "Scans fresh roles ranked by resume fit, finds the right contacts, and drafts coffee-chat outreach and per-role resume edits — nothing sent without your approval.",
    tags: { category: "Recruiting", more: 1 },
    stars: 20,
    installs: 723,
  },
  {
    id: "cca01KX3XM2A9_HJCJZXBEFDEXFDBQ",
    href: "/marketplace/a/cca01KX3XM2A9_HJCJZXBEFDEXFDBQ",
    name: "Momentum: Growth Marketing",
    icon: {
      kind: "mesh",
      emoji: "📈",
      base: "rgb(200, 124, 190)",
      blobs: [
        { top: "13.7014%", left: "-7.28236%", size: "76.5294%", color: "rgb(232, 67, 147)" },
        { top: "-0.477904%", left: "39.096%", size: "78.1765%", color: "rgb(253, 121, 168)" },
        { top: "46.7765%", left: "28.1864%", size: "85%", color: "rgb(116, 185, 255)" },
      ],
      highlight: ["36.752%", "28.7988%"],
    },
    author: { name: "Ideabrowser.com", avatarUrl: "/img/marketplace/ideabrowser.png" },
    description:
      "Growth marketing lead for early-stage founders — positioning, brand, acquisition channels, launches, conversion copy, and competitive intel, always shipping real assets you can use this week.",
    tags: { category: "Sales & outreach", more: 2 },
    stars: 39,
    installs: 353,
  },
  {
    id: "cca01KXP1P1EN_VCVAD2CXGRK2WHZH",
    href: "/marketplace/a/cca01KXP1P1EN_VCVAD2CXGRK2WHZH",
    name: "AdPilot",
    icon: {
      kind: "mesh",
      emoji: "📈",
      base: "rgb(77, 175, 120)",
      blobs: [
        { top: "27.7178%", left: "46.9153%", size: "71.8235%", color: "rgb(46, 139, 87)" },
        { top: "39.4504%", left: "-0.141514%", size: "73.8627%", color: "rgb(60, 179, 113)" },
        { top: "-7.16828%", left: "13.2262%", size: "77.549%", color: "rgb(125, 206, 160)" },
      ],
      highlight: ["62.1202%", "71.8655%"],
    },
    author: { name: "Mariah Brunner" },
    description:
      "Connects to your Meta Ads account, monitors campaign performance daily, and reallocates budget toward the best-ROI campaigns and ad sets — within strict, user-set guardrails.",
    tags: { category: "Data & analytics", more: 1 },
    stars: 18,
    installs: 131,
  },
];

export const featuredSkills: SkillListing[] = [
  {
    id: "ccs01KXE6517H_XZ5CR1ZSYW20X9WQ",
    href: "/marketplace/s/ccs01KXE6517H_XZ5CR1ZSYW20X9WQ",
    name: "wiki-builder",
    cover: "/img/marketplace/wiki-builder.png",
    author: { name: "Elvis Saravia" },
    description:
      "Start, structure, grow, query, and maintain reusable research wikis. Configurable per-wiki structure for papers, topics, projects, products, people, organizations, or ongoing research areas. Each wiki is a standalone folder with its own sources, compiled pages, prompts, and local wiki.config.md.",
    tags: { category: "Research", more: 1 },
    stars: 18,
    installs: 149,
  },
  {
    id: "ccs01KVDKJSHG_WY8R9N89QBT5B7ZD",
    href: "/marketplace/s/ccs01KVDKJSHG_WY8R9N89QBT5B7ZD",
    name: "Swiss Grid Design",
    cover: "/img/marketplace/swiss-grid-design.png",
    author: alexMcDonnell,
    description:
      "Build editorial/magazine/report webpages on a Müller-Brockmann modular grid (International Typographic Style) — not a decorative one. Encodes the discipline (columns + modules + baseline, grotesque type, flush-left, restrained black/white/red palette) AND the hard-won front-end engineering to make the grid real, visible, and verified: one CSS-variable source of truth, an interactive grid-toggle overlay that lives in the SAME content box as the content, subgrid \"bands\" so every element snaps to a column line, an 8px baseline lock, and runtime OPTICAL ALIGNMENT that puts display type's ink (not its box) on the line. Ships with a scaffold generator and a Puppeteer verification harness that proves 0px adherence.",
    tags: { category: "Development & engineering", more: 1 },
    stars: 9,
    installs: 150,
  },
  {
    id: "ccs01KWCXR3W4_XRNS6AAXVZBT0617",
    href: "/marketplace/s/ccs01KWCXR3W4_XRNS6AAXVZBT0617",
    name: "Roast My Idea",
    cover: "/img/marketplace/roast-my-idea.png",
    author: { name: "Nate Herk" },
    description:
      "Convenes a council of five independent persona-agents — the Contrarian (red team), Expansionist (bull), Logician (first principles), Researcher (evidence), and Buyer (voice of customer) — who attack and defend an idea from every angle in parallel, then a Judge returns one decisive verdict: GO / RESHAPE / KILL, with the biggest risk, the money read, and the cheapest 48-hour test to de-risk it before building. A faithful port of the 'roast' skill, hardened with STORM's multi-lens parallel-agent discipline, real-source verification, and honest self-disclosure (the panel is simulated; convergence is a signal, not proof). Built to overcome AI sycophancy — no persona may hedge or flatter. Optional shareable 'Council Verdict' webpage.",
    tags: { category: "Research", more: 1 },
    stars: 31,
    installs: 491,
  },
  {
    id: "ccs01KXKBZ32S_Q8RP2Y40Y4MR7FTW",
    href: "/marketplace/s/ccs01KXKBZ32S_Q8RP2Y40Y4MR7FTW",
    name: "Design Shuffle",
    cover: "/img/marketplace/design-shuffle.jpg",
    author: alexMcDonnell,
    description:
      "Presses shuffle on art direction for any visually undecided project. It researches the current design moment, holds the project truth constant, and produces one comparison artifact with five maximally different directions so non-designers can react, combine, and choose without first knowing design vocabulary.",
    tags: { category: "Content creation", more: 1 },
    stars: 17,
    installs: 206,
  },
];

export const marketplaceCategories: MarketplaceCategory[] = [
  {
    slug: "sales-outreach",
    name: "Sales & outreach",
    icon: "megaphone",
    background: "rgb(49, 91, 44)",
    color: "rgb(231, 233, 192)",
    summary: "5 skills, 7 agents",
  },
  {
    slug: "research",
    name: "Research",
    icon: "microscope",
    background: "rgb(90, 39, 94)",
    color: "rgb(219, 237, 253)",
    summary: "7 skills, 3 agents",
  },
  {
    slug: "recruiting",
    name: "Recruiting",
    icon: "user-search",
    background: "rgb(41, 27, 37)",
    color: "rgb(237, 233, 250)",
    summary: "1 agent",
  },
  {
    slug: "investment-finance",
    name: "Investment & finance",
    icon: "trending-up",
    background: "rgb(63, 28, 27)",
    color: "rgb(255, 239, 236)",
    summary: "3 skills",
  },
  {
    slug: "development-engineering",
    name: "Development & engineering",
    icon: "code",
    background: "rgb(33, 32, 38)",
    color: "rgb(209, 247, 246)",
    summary: "5 skills",
  },
  {
    slug: "content-creation",
    name: "Content creation",
    icon: "pen-tool",
    background: "rgb(49, 43, 1)",
    color: "rgb(236, 255, 241)",
    summary: "18 skills, 5 agents",
  },
  {
    slug: "data-analytics",
    name: "Data & analytics",
    icon: "chart-column",
    background: "rgb(132, 64, 0)",
    color: "rgb(255, 241, 209)",
    summary: "6 skills, 4 agents",
  },
  {
    slug: "ops-workflow",
    name: "Ops & workflow",
    icon: "workflow",
    background: "rgb(44, 37, 18)",
    color: "rgb(254, 255, 248)",
    summary: "13 skills, 8 agents",
  },
];
