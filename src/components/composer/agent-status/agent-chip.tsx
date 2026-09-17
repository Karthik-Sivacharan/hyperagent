import type { CSSProperties } from "react";

import { AgentGlyph, MorphingAgentGlyph } from "@/components/brand/agent-glyph";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { RUN_STATES } from "./run-state";
import type { AgentRun } from "./types";

// One agent in the composer's stack: its own glyph on a paper disc, wearing
// its state. The avatar-lifecycle pattern — the presence signal lives ON the
// figure rather than in a layer beside it — so there is no dot, no badge and
// no spinner hung off the circle; the body takes the hue and the ring repeats
// it, which is the whole readout.
//
// THE SHAPE NEVER CHANGES. A glyph is an agent's identity, so `running` holds
// `shape={run.glyph}` and animates only what a face can move without becoming
// somebody else: the eyes. `MorphingAgentGlyph` with a controlled `shape` and
// no `sequence` leaves the controller on its lone-glyph idle loop, which at
// `pace="quick"` is one blink every 4-9s — the avatar pace, tuned so a row of
// them does not twitch. `glance` stays off: it moves the eyes 3 of 140 units,
// which at an 18px glyph is under half a pixel of travel for a whole tween.
// The other three states are terminal, so they are the static `AgentGlyph` —
// no controller, no clock, no client code. `prefers-reduced-motion` needs no
// handling here: the controller drops its idle loop under it.
//
// THE RINGS. Two bands at the same 2px, the outer painted first: the root's
// opaque `surface-elevated` (what the composer card is made of, so a chip in
// front cuts a clean bite out of the one behind) and, over it, the state's
// translucent ring from RUN_STATES. `running` rings transparent, so a working
// agent is the bare separator — it spends no hue at all, and the eyes carry it.
//
// A 28px disc is well under the 44px a thumb wants, so the control grows an
// invisible halo out to 44 with a pseudo-element rather than a bigger circle;
// `--chip-halo` sizes it from `size`, and a chip already at 44 gets none.
// Without `onSelect` the chip is not a control at all: no halo, no focus ring,
// and the figure takes `role="img"` with the name a button would have carried,
// because a tooltip a keyboard cannot reach is not a text alternative.
//
// The state rides on `data-run-state`, not `data-state`: a tooltip trigger is
// already wearing one of those, and `Slot` lets the child's win, so the plain
// name here would quietly overwrite the tooltip's own open/closed flag.

/**
 * The glyph's edge as a fraction of the disc. A blocky silhouette fills its
 * 140-unit box to within one corner radius, putting its far corner at 0.695
 * of the edge from the centre; 0.64 lands that ~1.5px inside a 28px disc's
 * rim, about the air the tile would have given it.
 */
const GLYPH_RATIO = 0.64;

/** The comfortable touch target the halo reaches for. */
const HIT_TARGET_PX = 44;

export function AgentChip({
  run,
  size = 28,
  active = false,
  onSelect,
  className,
}: {
  run: AgentRun;
  /** Rendered diameter in px. Defaults to 28. */
  size?: number;
  /** This chip's detail is the one open in the bar. */
  active?: boolean;
  /** Omit and the chip is not a control — just the figure and its tooltip. */
  onSelect?: (run: AgentRun) => void;
  className?: string;
}) {
  const state = RUN_STATES[run.state];
  const glyphSize = Math.round(size * GLYPH_RATIO);
  const task = run.detail ? `${run.task} · ${run.detail}` : run.task;
  // Name, state, task: what the tooltip shows, in the order it shows it.
  const name = `${run.name}, ${state.label.toLowerCase()}, ${task}`;

  const style = {
    width: size,
    height: size,
    "--chip-glyph": `${glyphSize}px`,
    "--chip-halo": `${Math.min(0, (size - HIT_TARGET_PX) / 2)}px`,
  } as CSSProperties;

  // `ring-4` on the active chip reads as one step out of the stack rather than
  // a new colour — the collar widens, the hue band over it does not move.
  const disc = cn(
    "relative shrink-0 rounded-full bg-neutral-100 ring-2 ring-surface-elevated",
    active && "z-10 ring-4",
    className,
  );

  const figure = (
    <>
      {/* The `size-…` class is not decoration: `Button` sizes any svg child
          that has none, and would pull an 18px glyph back to 16. */}
      {run.state === "running" ? (
        <MorphingAgentGlyph
          shape={run.glyph}
          tone={state.tone}
          tile={false}
          size={glyphSize}
          pace="quick"
          blink
          glance={false}
          className="size-(--chip-glyph)"
        />
      ) : (
        <AgentGlyph shape={run.glyph} tone={state.tone} tile={false} size={glyphSize} className="size-(--chip-glyph)" />
      )}
      {/* The state's hue, over the separator and over the glyph's own edge. */}
      <span aria-hidden="true" className={cn("pointer-events-none absolute inset-0 rounded-full ring-2", state.ring)} />
    </>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {onSelect ? (
          <Button
            type="button"
            variant="ghost"
            size="none"
            aria-label={name}
            aria-current={active ? "true" : undefined}
            data-run-state={run.state}
            data-active={active}
            onClick={() => onSelect(run)}
            style={style}
            className={cn(
              disc,
              // The paper does not take the ghost tint on hover: the eyes are
              // painted in it, and they would stop reading as holes.
              "touch-manipulation hover:bg-neutral-100 focus-visible:z-10 focus-visible:ring-offset-surface-elevated",
              // The halo: invisible, out to 44px, and no effect on layout.
              "before:absolute before:inset-(--chip-halo) before:rounded-full before:content-['']",
            )}
          >
            {figure}
          </Button>
        ) : (
          <span
            role="img"
            aria-label={name}
            data-run-state={run.state}
            data-active={active}
            style={style}
            className={cn(disc, "inline-flex select-none items-center justify-center")}
          >
            {figure}
          </span>
        )}
      </TooltipTrigger>
      <TooltipContent>
        <span className="block font-medium">
          {run.name} · {state.label}
        </span>
        <span className="block text-muted-foreground">{task}</span>
      </TooltipContent>
    </Tooltip>
  );
}
