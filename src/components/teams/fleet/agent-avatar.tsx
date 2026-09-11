import * as React from "react";
import { cn } from "@/lib/utils";
import type { AgentState, FleetAgent } from "@/lib/mock/teams";

// An agent's monogram: the first letter of its name on a tint of its own hue,
// with an optional state dot in the corner. Agents are rounded squares and
// people are circles (member-avatar.tsx), the GitHub convention for apps
// versus users, so an owner with a delegated agent beside them (Linear's
// pattern) reads as two kinds of member at a glance.
//
// THE TINT. Only the hue is per agent; lightness and chroma are the brand's.
// The fill takes its lightness from the shared ramp's 100 step (800 in dark)
// and the letter from the 700 step (400 in dark), each hue-rotated with CSS
// relative colour at a low chroma (0.04 fill, 0.09 ink), so every agent sits
// in the same tonal band as the sand neutrals. Measured with culori over all
// 360 hues: the letter clears 5.09:1 on its fill in light and 5.32:1 in dark,
// and both colours stay inside sRGB in dark. `AGENT_TINT_CLASS` plus
// `agentTintStyle(hue)` on any element exposes the pair as `--agent-bg` and
// `--agent-fg` to it and its children (`bg-(--agent-bg)`, `text-(--agent-fg)`,
// `border-(--agent-fg)/20`), so a card or an org node can wear the same hue.
//
// THE DOT. Working is info and pulses (a ping halo, motion-safe only, slowed
// to a 2s breath so a board full of busy agents does not flicker); idle is
// neutral; paused is amber, the universal "on hold"; error is destructive.
// The dot's cutout ring reads `--avatar-cutout` (default: the canvas), so an
// avatar on a card sets `[--avatar-cutout:var(--card)]` on the card.

export const AGENT_STATE_META: Record<AgentState, { label: string; dot: string }> = {
  working: { label: "Working", dot: "bg-info" },
  idle: { label: "Idle", dot: "bg-foreground-low" },
  paused: { label: "Paused", dot: "bg-warning" },
  error: { label: "Error", dot: "bg-destructive" },
};

export const AGENT_TINT_CLASS =
  "[--agent-tint-from:var(--color-neutral-100)] [--agent-ink-from:var(--color-neutral-700)] dark:[--agent-tint-from:var(--color-neutral-800)] dark:[--agent-ink-from:var(--color-neutral-400)]";

export function agentTintStyle(hue: number): React.CSSProperties {
  return {
    "--agent-hue": hue,
    "--agent-bg": "oklch(from var(--agent-tint-from) l 0.04 var(--agent-hue))",
    "--agent-fg": "oklch(from var(--agent-ink-from) l 0.09 var(--agent-hue))",
  } as React.CSSProperties;
}

const SIZES = {
  xs: { box: "size-5 rounded-sm text-[0.6875rem]", dot: "size-1.5 ring-[1.5px]" },
  sm: { box: "size-6 rounded-md text-xs", dot: "size-2 ring-2" },
  md: { box: "size-8 rounded-lg text-sm", dot: "size-2.5 ring-2" },
  lg: { box: "size-12 rounded-xl text-xl", dot: "size-3 ring-[3px]" },
} as const;

/** The state dot alone, for a row or a header that shows state without a monogram. */
export function AgentStateDot({
  state,
  className,
}: {
  state: AgentState;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-flex size-2 shrink-0 rounded-full", AGENT_STATE_META[state].dot, className)} aria-hidden="true">
      {state === "working" ? (
        <span className="absolute inset-0 rounded-full bg-info motion-safe:animate-ping" style={{ animationDuration: "2s" }} />
      ) : null}
    </span>
  );
}

export function AgentAvatar({
  agent,
  size = "sm",
  showState = false,
  className,
  style,
  ...props
}: {
  agent: FleetAgent;
  size?: "xs" | "sm" | "md" | "lg";
  showState?: boolean;
} & Omit<React.ComponentProps<"span">, "children">) {
  const state = AGENT_STATE_META[agent.state];
  return (
    <span
      role="img"
      aria-label={showState ? `${agent.name}, ${state.label.toLowerCase()}` : agent.name}
      data-state={agent.state}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center bg-(--agent-bg) font-semibold leading-none text-(--agent-fg) ring-1 ring-(--agent-fg)/15 ring-inset select-none",
        AGENT_TINT_CLASS,
        SIZES[size].box,
        className,
      )}
      style={{ ...agentTintStyle(agent.hue), ...style }}
      {...props}
    >
      {agent.name.charAt(0)}
      {showState ? (
        <AgentStateDot
          state={agent.state}
          className={cn("absolute -right-0.5 -bottom-0.5 ring-[color:var(--avatar-cutout,var(--background))]", SIZES[size].dot)}
        />
      ) : null}
    </span>
  );
}
