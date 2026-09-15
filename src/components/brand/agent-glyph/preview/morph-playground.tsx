"use client";

import { IconArrowsLeftRight, IconPlayerPlay } from "@tabler/icons-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { frameAt, planTransition, restSnapshot, TRANSITION_MS, type Choreography } from "../choreography";
import { GlyphStage } from "../glyph-stage";
import { GlyphSvg } from "../glyph-svg";
import { MorphingAgentGlyph } from "../morphing-agent-glyph";
import { ALL_GLYPHS, findGlyph, GLYPH_SETS } from "../registry";
import type { GlyphTone } from "../tones";
import type { GlyphShape } from "../types";
import { ProgressScrubber } from "./progress-scrubber";
import { Section } from "./section";
import { ChoreographyToggle } from "./stage-loop";

/** One filmstrip frame per 40ms: a 25fps camera on the transition. */
const FRAME_STEP_MS = 40;
const FRAME_TIMES = Array.from({ length: TRANSITION_MS / FRAME_STEP_MS + 1 }, (_, i) => i * FRAME_STEP_MS);

function ShapePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: GlyphShape;
  onChange: (shape: GlyphShape) => void;
}) {
  return (
    <Select value={value.id} onValueChange={(id) => onChange(findGlyph(id) ?? value)}>
      <SelectTrigger aria-label={label} className="min-w-44">
        <span className="text-foreground-low">{label}</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(["study", "original"] as const)
          .filter((set) => GLYPH_SETS[set].length > 0)
          .map((set) => (
            <SelectGroup key={set}>
              <SelectLabel className="text-label-12-caps text-foreground-low">{set}</SelectLabel>
              {GLYPH_SETS[set].map((shape) => (
                <SelectItem key={shape.id} value={shape.id}>
                  {shape.name}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
      </SelectContent>
    </Select>
  );
}

export function MorphPlayground({
  tone,
  from: fromId,
  to: toId,
  t,
  choreography: initialChoreography,
}: {
  tone: GlyphTone;
  from?: string;
  to?: string;
  t?: number;
  choreography?: Choreography;
}) {
  if (ALL_GLYPHS.length < 2) {
    return (
      <Section title="Playground" description="Pick any two shapes and scrub the transition between them.">
        <p className="rounded-xl bg-surface-secondary px-6 py-16 text-center text-sm text-muted-foreground">
          The playground needs two registered shapes.
        </p>
      </Section>
    );
  }
  return (
    <Playground
      tone={tone}
      initialFrom={(fromId && findGlyph(fromId)) || ALL_GLYPHS[0]}
      initialTo={(toId && findGlyph(toId)) || ALL_GLYPHS[Math.min(ALL_GLYPHS.length - 1, 5)]}
      initialProgress={t}
      initialChoreography={initialChoreography ?? "morph"}
    />
  );
}

function Playground({
  tone,
  initialFrom,
  initialTo,
  initialProgress,
  initialChoreography,
}: {
  tone: GlyphTone;
  initialFrom: GlyphShape;
  initialTo: GlyphShape;
  initialProgress?: number;
  initialChoreography: Choreography;
}) {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [choreography, setChoreography] = useState(initialChoreography);
  /** `null` while playing live; a number freezes every view on that time. */
  const [progress, setProgress] = useState<number | null>(initialProgress ?? 1);
  /** Bumped by Play: remounts the live views at `from`, then targets `to`. */
  const [run, setRun] = useState(0);
  const [armed, setArmed] = useState(true);

  const plan = useMemo(() => planTransition(restSnapshot(from), to, choreography), [from, to, choreography]);
  const frames = useMemo(() => FRAME_TIMES.map((ms) => ({ ms, frame: frameAt(plan, ms / TRANSITION_MS) })), [plan]);

  const play = () => {
    setProgress(null);
    setArmed(false);
    setRun((value) => value + 1);
    // Two frames: one to mount at `from`, one to hand the glyph its target.
    requestAnimationFrame(() => requestAnimationFrame(() => setArmed(true)));
  };

  const live = progress === null;
  const motion = {
    shape: live && !armed ? from : to,
    from,
    progress: progress ?? undefined,
    choreography,
    blink: false,
  };
  const ms = Math.round((progress ?? 1) * TRANSITION_MS);
  const activeFrame = live ? -1 : Math.round(ms / FRAME_STEP_MS);

  return (
    <Section
      title="Playground"
      description="Pick any two shapes, then play the transition or scrub it. The filmstrip is the same transition sampled every 40ms; pick a frame to freeze on it."
      controls={
        <>
          <ShapePicker label="From" value={from} onChange={setFrom} />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Swap from and to"
            onClick={() => {
              setFrom(to);
              setTo(from);
            }}
          >
            <IconArrowsLeftRight aria-hidden="true" />
          </Button>
          <ShapePicker label="To" value={to} onChange={setTo} />
          <ChoreographyToggle value={choreography} onChange={setChoreography} />
        </>
      }
    >
      <div className="grid items-stretch gap-4 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
        <div className="flex items-center justify-center rounded-xl bg-surface-secondary p-6">
          <MorphingAgentGlyph key={`glyph-${run}`} size={240} tone={tone} {...motion} />
        </div>
        <GlyphStage
          key={`stage-${run}`}
          tone={tone}
          {...motion}
          className="mx-auto max-w-[560px] self-center rounded-xl shadow-card"
        />
        {/* The same transition where it will mostly be seen: card, avatar
            and inline sizes. */}
        <div className="flex items-center justify-center gap-5 rounded-xl bg-surface-secondary px-6 py-6 lg:flex-col">
          {[96, 40, 24].map((size) => (
            <span key={size} className="flex flex-col items-center gap-1.5">
              <MorphingAgentGlyph key={`glyph-${size}-${run}`} size={size} tone={tone} {...motion} />
              <span className="text-label-12-mono text-foreground-low">{size}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="default" size="sm" onClick={play}>
          <IconPlayerPlay aria-hidden="true" />
          Play
        </Button>
        <ProgressScrubber
          className="flex-1"
          label="Transition time"
          value={progress ?? 1}
          step={FRAME_STEP_MS / TRANSITION_MS / 4}
          valueText={`${ms} of ${TRANSITION_MS} milliseconds`}
          onChange={(value) => setProgress(value)}
        />
        <span className="w-24 text-right text-label-12-mono text-muted-foreground">
          {live ? "live" : `${ms} / ${TRANSITION_MS}ms`}
        </span>
      </div>

      <ol className="grid grid-cols-7 gap-2 md:grid-cols-13" aria-label="Filmstrip">
        {frames.map(({ ms: at, frame }, index) => (
          <li key={at}>
            <Button
              variant="ghost"
              size="none"
              aria-label={`Freeze at ${at}ms`}
              aria-pressed={activeFrame === index}
              onClick={() => setProgress(at / TRANSITION_MS)}
              className="flex w-full flex-col gap-1.5 rounded-lg p-1.5 aria-pressed:bg-tint-15"
            >
              <GlyphSvg
                body={frame.d}
                bodyTransform={frame.transform}
                eyes={frame.eyes}
                tone={tone}
                tile
                size={72}
                // `size-full` also opts out of the button's 16px icon sizing.
                className="size-full"
              />
              <span className="text-label-12-mono text-foreground-low">{at}</span>
            </Button>
          </li>
        ))}
      </ol>
    </Section>
  );
}
