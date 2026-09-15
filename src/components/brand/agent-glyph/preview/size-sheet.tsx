"use client";

import { Overline } from "@/components/ui/overline";

import { AgentGlyph } from "../agent-glyph";
import { GLYPH_SETS } from "../registry";
import type { GlyphTone } from "../tones";
import type { GlyphSet, GlyphShape } from "../types";
import { glyphIssues } from "../validate";
import { Section } from "./section";

/** The sizes every glyph has to survive: favicon, inline, avatar, card, hero. */
const SMALL_SIZES = [96, 40, 24, 16] as const;
const HERO_SIZE = 240;

const SET_COPY: Record<GlyphSet, { title: string; note: string }> = {
  study: { title: "Study", note: "Rebuilds of the reference drawings, kept to learn the grammar." },
  original: { title: "Original", note: "The family the product ships." },
};

function Specimen({ shape, tone }: { shape: GlyphShape; tone: GlyphTone }) {
  const issues = glyphIssues(shape);
  return (
    <li className="flex flex-col gap-4 rounded-xl bg-surface-secondary p-4">
      <div className="flex justify-center">
        <AgentGlyph shape={shape} size={HERO_SIZE} tone={tone} />
      </div>
      <div className="flex items-end justify-between gap-2">
        {SMALL_SIZES.map((size) => (
          <span key={size} className="flex flex-col items-center gap-1.5">
            <AgentGlyph shape={shape} size={size} tone={tone} />
            <span className="text-label-12-mono text-foreground-low">{size}</span>
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        <p className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-medium text-foreground">{shape.name}</span>
          <span className="text-label-12-mono text-foreground-low">{shape.id}</span>
        </p>
        {shape.archetype ? <p className="text-md text-muted-foreground">{shape.archetype}</p> : null}
        {issues.length > 0 ? (
          <ul className="mt-1 flex flex-col gap-0.5 text-md text-destructive" aria-label="Contract issues">
            {issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
}

export function SizeSheet({ tone }: { tone: GlyphTone }) {
  return (
    <Section
      title="Sizes"
      description="Every registered shape at 240, 96, 40, 24 and 16 px in the chosen tone. A shape that breaks the contract lists why under its name."
    >
      {(["study", "original"] as const).map((set) => (
        <div key={set} className="flex flex-col gap-3">
          <div className="flex items-baseline gap-3">
            <Overline>{SET_COPY[set].title}</Overline>
            <span className="text-md text-foreground-low">{SET_COPY[set].note}</span>
          </div>
          {GLYPH_SETS[set].length === 0 ? (
            <p className="rounded-xl bg-surface-secondary px-6 py-10 text-center text-sm text-muted-foreground">
              No shapes in this set yet.
            </p>
          ) : (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(272px,1fr))] gap-4">
              {GLYPH_SETS[set].map((shape) => (
                <Specimen key={shape.id} shape={shape} tone={tone} />
              ))}
            </ul>
          )}
        </div>
      ))}
    </Section>
  );
}
