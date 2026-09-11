import * as React from "react";
import {
  IconAnchor,
  IconAtom,
  IconBinoculars,
  IconChartLine,
  IconCompass,
  IconCreditCardRefund,
  IconCube,
  IconDiamond,
  IconEye,
  IconFeather,
  IconHeadphones,
  IconHexagon,
  IconLeaf,
  IconListSearch,
  IconMail,
  IconPlanet,
  IconPresentation,
  IconPrism,
  IconReportMoney,
  IconSpeakerphone,
  type TablerIcon,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { AgentGlyph, AgentState, FleetAgent } from "@/lib/mock/teams";

// An agent's avatar: a rounded square holding a soft three-orb field in the
// agent's hue with a Tabler glyph for its job on top. It is the orb tile
// Hyperagent already draws for agent templates (app/agent-orb.tsx: three
// blurred radial orbs and a specular highlight), moved onto the brand's
// neutral band. Agents are rounded squares and people are circles with
// initials (member-avatar.tsx), the GitHub convention for apps versus users,
// so at 20px an agent beside a person reads as a different kind of member
// three ways: shape, pictogram and colour.
//
// THE COLOUR. Only the hue is per agent; lightness and chroma are the
// brand's. The base takes its lightness from the ramp's 100 step (800 in
// dark), the orbs sit 0.08 below it in light and 0.09 above it in dark (the
// third a step further, its hue turned -35deg, the second turned +40deg), and
// the glyph is ink from the 700 step (the 200 step in dark), each set with
// CSS relative colour. Measured with culori over all 360 hues: the glyph
// clears 4.7:1 against the lightest and darkest point of any field in light
// and 4.57:1 in dark (shine included), and every colour stays inside sRGB.
// `AGENT_TINT_CLASS` plus `agentTintStyle(hue)` still expose the flat pair
// as `--agent-bg` and `--agent-fg`, for a surface that wants to wear the hue.
//
// THE FIELD is laid out from a hash of the id by a seeded generator, so the
// server and the client print the same gradients and every agent keeps its
// own. The specular shine and the hairline sit on a still layer above it.
//
// SIZES. xs 20, sm 24, md 32, lg 48. The glyph is 70% of the tile at 20px and
// 58% at 48px, on whole-pixel insets, and its stroke thins as it grows (1.17px
// of line at 20px up to 1.75px at 48px), so the smallest one stays legible and
// the largest does not go heavy beside a 600 heading.
//
// OPT-IN MARKS. `showState` adds a corner dot (working info, idle neutral,
// paused amber, error destructive) cut from `--avatar-cutout` (default: the
// canvas; a card sets `[--avatar-cutout:var(--card)]`). `live` lets a working
// agent's field turn once every 14s, transform only and motion-safe only.
// /teams passes neither. With `aria-hidden` set (the name already sits
// beside it) the avatar drops its image role and label.

export const AGENT_STATE_META: Record<AgentState, { label: string; dot: string }> = {
  working: { label: "Working", dot: "bg-info" },
  idle: { label: "Idle", dot: "bg-foreground-low" },
  paused: { label: "Paused", dot: "bg-warning" },
  error: { label: "Error", dot: "bg-destructive" },
};

/** Glyph key to Tabler component. The keys are `AgentGlyph` (lib/mock/teams.ts). */
export const AGENT_GLYPHS = {
  compass: IconCompass,
  eye: IconEye,
  binoculars: IconBinoculars,
  "chart-line": IconChartLine,
  speakerphone: IconSpeakerphone,
  "list-search": IconListSearch,
  mail: IconMail,
  feather: IconFeather,
  headphones: IconHeadphones,
  presentation: IconPresentation,
  "report-money": IconReportMoney,
  "credit-card-refund": IconCreditCardRefund,
  hexagon: IconHexagon,
  atom: IconAtom,
  planet: IconPlanet,
  anchor: IconAnchor,
  cube: IconCube,
  diamond: IconDiamond,
  leaf: IconLeaf,
  prism: IconPrism,
} satisfies Record<AgentGlyph, TablerIcon>;

/** Abstract marks for an agent nobody has picked a glyph for: no job, no UI meaning. */
const FALLBACK_GLYPHS: AgentGlyph[] = ["hexagon", "atom", "planet", "anchor", "cube", "diamond", "leaf", "prism"];

/** FNV-1a, 32-bit. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 0x01000193);
  return h >>> 0;
}

/** mulberry32: a seeded generator, so one id always yields one layout. */
function seeded(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pct = (n: number) => `${n.toFixed(1)}%`;

/** The glyph an agent wears (a key into `AGENT_GLYPHS`): its own pick, else a stable abstract mark from its id. */
export function agentGlyphKey(agent: Pick<FleetAgent, "id" | "glyph">): AgentGlyph {
  return agent.glyph ?? FALLBACK_GLYPHS[hash(agent.id) % FALLBACK_GLYPHS.length];
}

export const AGENT_TINT_CLASS =
  "[--agent-tint-from:var(--color-neutral-100)] [--agent-ink-from:var(--color-neutral-700)] [--agent-tint-c:0.022] dark:[--agent-tint-from:var(--color-neutral-800)] dark:[--agent-ink-from:var(--color-neutral-400)] dark:[--agent-tint-c:0.04]";

export function agentTintStyle(hue: number): React.CSSProperties {
  return {
    "--agent-hue": hue,
    "--agent-bg": "oklch(from var(--agent-tint-from) l var(--agent-tint-c) var(--agent-hue))",
    "--agent-fg": "oklch(from var(--agent-ink-from) l 0.09 var(--agent-hue))",
  } as React.CSSProperties;
}

// The orb and glyph offsets per theme, read by the relative colours below.
const ORB_CLASS = `${AGENT_TINT_CLASS} [--agent-orb-l:-0.08] [--agent-orb-l3:-0.11] [--agent-orb-c:0.06] [--agent-glyph-from:var(--color-neutral-700)] [--agent-glyph-l:-0.06] [--agent-glyph-c:0.072] dark:[--agent-orb-l:0.09] dark:[--agent-orb-l3:0.12] dark:[--agent-orb-c:0.07] dark:[--agent-glyph-from:var(--color-neutral-200)] dark:[--agent-glyph-l:0] dark:[--agent-glyph-c:0.042]`;

function agentOrbStyle({ id, hue }: Pick<FleetAgent, "id" | "hue">): React.CSSProperties {
  const next = seeded(hash(id));
  // The field is 150% of the tile so it can turn without showing a corner;
  // centres land 28-72% across it (17-83% of the tile), radii 24-36% (36-54%).
  const orbs = [1, 2, 3].map((n) => {
    const r = pct(24 + next() * 12);
    return `radial-gradient(ellipse ${r} ${r} at ${pct(28 + next() * 44)} ${pct(28 + next() * 44)}, var(--agent-orb-${n}), transparent)`;
  });
  return {
    ...agentTintStyle(hue),
    "--agent-orb-1": "oklch(from var(--agent-tint-from) calc(l + var(--agent-orb-l)) var(--agent-orb-c) var(--agent-hue))",
    "--agent-orb-2": "oklch(from var(--agent-tint-from) calc(l + var(--agent-orb-l)) var(--agent-orb-c) calc(var(--agent-hue) + 40))",
    "--agent-orb-3": "oklch(from var(--agent-tint-from) calc(l + var(--agent-orb-l3)) calc(var(--agent-orb-c) * 0.9) calc(var(--agent-hue) - 35))",
    "--agent-glyph": "oklch(from var(--agent-glyph-from) calc(l + var(--agent-glyph-l)) var(--agent-glyph-c) var(--agent-hue))",
    "--agent-field": orbs.join(", "),
    "--agent-shine": `radial-gradient(ellipse 60% 45% at ${pct(30 + next() * 40)} ${pct(6 + next() * 20)}, var(--highlight-soft), transparent)`,
  } as React.CSSProperties;
}

const SIZES = {
  xs: { box: "size-5 rounded-sm", glyph: "size-3.5", stroke: 2, dot: "size-1.5 ring-[1.5px]" },
  sm: { box: "size-6 rounded-md", glyph: "size-4", stroke: 2, dot: "size-2 ring-2" },
  md: { box: "size-8 rounded-lg", glyph: "size-5", stroke: 1.75, dot: "size-2.5 ring-2" },
  lg: { box: "size-12 rounded-xl", glyph: "size-7", stroke: 1.5, dot: "size-3 ring-[3px]" },
} as const;

/** The state dot alone, for a row or a header that shows state without an avatar. */
export function AgentStateDot({ state, className }: { state: AgentState; className?: string }) {
  return <span aria-hidden="true" className={cn("inline-flex size-2 shrink-0 rounded-full", AGENT_STATE_META[state].dot, className)} />;
}

export function AgentAvatar({
  agent,
  size = "sm",
  showState = false,
  live = false,
  className,
  style,
  ...props
}: {
  agent: FleetAgent;
  size?: keyof typeof SIZES;
  /** Adds the corner state dot. Off by default; /teams never sets it. */
  showState?: boolean;
  /** Lets a working agent's field turn slowly (motion-safe). Off by default. */
  live?: boolean;
} & Omit<React.ComponentProps<"span">, "children">) {
  const s = SIZES[size];
  const Glyph = AGENT_GLYPHS[agentGlyphKey(agent)];
  const turning = live && agent.state === "working";
  const hidden = props["aria-hidden"] === true || props["aria-hidden"] === "true";
  const label = `${agent.name}, ${agent.role}${showState ? `, ${AGENT_STATE_META[agent.state].label.toLowerCase()}` : ""}`;
  return (
    <span
      role={hidden ? undefined : "img"}
      aria-label={hidden ? undefined : label}
      data-state={agent.state}
      className={cn("relative inline-flex shrink-0 items-center justify-center select-none", ORB_CLASS, s.box, className)}
      style={{ ...agentOrbStyle(agent), ...style }}
      {...props}
    >
      <span aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-[inherit] bg-(--agent-bg)">
        <span
          className={cn("absolute -inset-1/4 [background:var(--agent-field)]", turning && "motion-safe:animate-spin")}
          style={turning ? { animationDuration: "14s" } : undefined}
        />
        <span className="absolute inset-0 rounded-[inherit] [background:var(--agent-shine)] shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--agent-glyph)_14%,transparent),inset_0_1px_1px_var(--highlight)]" />
      </span>
      <Glyph aria-hidden="true" stroke={s.stroke} className={cn("relative text-(--agent-glyph)", s.glyph)} />
      {showState ? (
        <AgentStateDot
          state={agent.state}
          className={cn("absolute -right-0.5 -bottom-0.5 ring-[color:var(--avatar-cutout,var(--background))]", s.dot)}
        />
      ) : null}
    </span>
  );
}
