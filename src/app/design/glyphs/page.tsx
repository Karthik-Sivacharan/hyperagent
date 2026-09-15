import type { Metadata } from "next";

import { CHOREOGRAPHIES, GLYPH_TONES, type Choreography, type GlyphTone } from "@/components/brand/agent-glyph";
import { GlyphPreview } from "@/components/brand/agent-glyph/preview/glyph-preview";

export const metadata: Metadata = {
  title: "Agent glyphs · Brand",
  description: "The agent glyph sets: the stage loop, a morph playground and every shape at every size.",
};

const one = (value: string | string[] | undefined) => (typeof value === "string" ? value : undefined);

// The working page for the agent glyphs. The query string presets the
// playground so a transition can be linked or screenshotted frozen:
// /design/glyphs?from=<id>&to=<id>&t=0.25&choreo=morph|cut&tone=sand|ink|tangerine
export default async function AgentGlyphsPage({ searchParams }: PageProps<"/design/glyphs">) {
  const params = await searchParams;
  const t = Number(one(params.t));
  const choreography = one(params.choreo);
  const tone = one(params.tone);

  return (
    <GlyphPreview
      from={one(params.from)}
      to={one(params.to)}
      t={Number.isFinite(t) ? Math.min(1, Math.max(0, t)) : undefined}
      choreography={CHOREOGRAPHIES.includes(choreography as Choreography) ? (choreography as Choreography) : undefined}
      tone={GLYPH_TONES.includes(tone as GlyphTone) ? (tone as GlyphTone) : undefined}
    />
  );
}
