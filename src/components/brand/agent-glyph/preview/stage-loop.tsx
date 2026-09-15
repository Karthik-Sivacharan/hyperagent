"use client";

import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

import { AgentGlyph } from "../agent-glyph";
import type { Choreography, GlyphPace } from "../choreography";
import { GlyphStage } from "../glyph-stage";
import { GLYPH_SETS } from "../registry";
import type { GlyphTone } from "../tones";
import type { GlyphSet } from "../types";
import { Section } from "./section";

const SET_LABEL: Record<GlyphSet, string> = { study: "Study", original: "Original" };

export function ChoreographyToggle({
  value,
  onChange,
}: {
  value: Choreography;
  onChange: (value: Choreography) => void;
}) {
  return (
    <ToggleGroup
      type="single"
      spacing={0}
      aria-label="Choreography"
      value={value}
      onValueChange={(next) => next && onChange(next as Choreography)}
    >
      <ToggleGroupItem value="morph">Morph</ToggleGroupItem>
      <ToggleGroupItem value="cut">Cut</ToggleGroupItem>
    </ToggleGroup>
  );
}

export function PaceToggle({ value, onChange }: { value: GlyphPace; onChange: (value: GlyphPace) => void }) {
  return (
    <ToggleGroup
      type="single"
      spacing={0}
      aria-label="Pace"
      value={value}
      onValueChange={(next) => next && onChange(next as GlyphPace)}
    >
      <ToggleGroupItem value="expressive">Expressive</ToggleGroupItem>
      <ToggleGroupItem value="quick">Quick</ToggleGroupItem>
    </ToggleGroup>
  );
}

export function StageLoop({ tone }: { tone: GlyphTone }) {
  const [set, setSet] = useState<GlyphSet>(GLYPH_SETS.original.length > 0 ? "original" : "study");
  const [choreography, setChoreography] = useState<Choreography>("morph");
  const [glance, setGlance] = useState(false);
  const [paused, setPaused] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);

  const shapes = GLYPH_SETS[set];

  return (
    <Section
      title="Stage"
      description="The landing presentation, on the expressive pace. The set loops with a hold on each shape, a blink now and then, and the corner squares easing to each body's bounding box. Under reduced motion it holds its first shape."
      controls={
        <>
          <ToggleGroup
            type="single"
            spacing={0}
            aria-label="Set"
            value={set}
            onValueChange={(next) => next && setSet(next as GlyphSet)}
          >
            {(["study", "original"] as const).map((value) => (
              <ToggleGroupItem key={value} value={value} disabled={GLYPH_SETS[value].length === 0}>
                {SET_LABEL[value]} <span className="tabular-nums text-foreground-low">{GLYPH_SETS[value].length}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <ChoreographyToggle value={choreography} onChange={setChoreography} />
          <div className="flex items-center gap-2">
            <Switch id="glyph-stage-glance" checked={glance} onCheckedChange={setGlance} />
            <Label htmlFor="glyph-stage-glance" className="text-muted-foreground">
              Glances
            </Label>
          </div>
          <Button variant="tint" size="sm" onClick={() => setPaused((value) => !value)} aria-pressed={paused}>
            {paused ? <IconPlayerPlay aria-hidden="true" /> : <IconPlayerPause aria-hidden="true" />}
            {paused ? "Play" : "Pause"}
          </Button>
        </>
      }
    >
      {shapes.length === 0 ? (
        <p className="rounded-xl bg-surface-secondary px-6 py-16 text-center text-sm text-muted-foreground">
          No shapes are registered yet. They appear here as soon as a set lists them.
        </p>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,640px)_1fr]">
          <GlyphStage
            // A new set restarts the loop from its first shape.
            key={set}
            sequence={shapes}
            choreography={choreography}
            glance={glance}
            paused={paused}
            tone={tone}
            onSettle={(shape) => setCurrent(shape.id)}
            className="rounded-xl shadow-card"
          />
          <ol className="grid grid-cols-4 gap-3" aria-label="Loop order">
            {shapes.map((shape, index) => (
              <li
                key={shape.id}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg p-2 transition-[background-color] duration-(--duration-normal) ease-out",
                  current === shape.id && "bg-tint-10",
                )}
                aria-current={current === shape.id ? "step" : undefined}
              >
                <AgentGlyph shape={shape} size={56} tone={tone} />
                <span className="text-center text-xs text-muted-foreground">
                  <span className="tabular-nums text-foreground-low">{index + 1}</span> {shape.name}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </Section>
  );
}
