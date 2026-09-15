"use client";

import { MorphingAgentGlyph } from "../morphing-agent-glyph";
import { GLYPH_SETS } from "../registry";
import type { GlyphTone } from "../tones";
import { Section } from "./section";

/** The landing's use-case panel carries this many agents at once. */
const COUNT = 20;

export function Roster({ tone }: { tone: GlyphTone }) {
  const shapes = GLYPH_SETS.original.length > 1 ? GLYPH_SETS.original : GLYPH_SETS.study;
  if (shapes.length < 2) return null;
  return (
    <Section
      title="Roster"
      description="Twenty glyphs at 40 px on the quick pace, every one looping at once: the busiest a page gets. Each starts on a different shape and all of them change on the same beat."
    >
      <ul className="grid grid-cols-5 gap-3 rounded-xl bg-surface-secondary p-6 sm:grid-cols-10" aria-label="Roster">
        {Array.from({ length: COUNT }, (_, index) => {
          const offset = index % shapes.length;
          const sequence = [...shapes.slice(offset), ...shapes.slice(0, offset)];
          return (
            <li key={index} className="flex justify-center">
              <MorphingAgentGlyph size={40} tone={tone} sequence={sequence} />
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
