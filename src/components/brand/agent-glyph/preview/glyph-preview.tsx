"use client";

import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { useState, useSyncExternalStore } from "react";

import { Overline } from "@/components/ui/overline";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import type { Choreography } from "../choreography";
import { GLYPH_TONES, type GlyphTone } from "../tones";
import { MorphPlayground } from "./morph-playground";
import { Roster } from "./roster";
import { SizeSheet } from "./size-sheet";
import { StageLoop } from "./stage-loop";

export type GlyphPreviewProps = {
  /** From the query string: `?from=&to=&t=&choreo=&tone=`. `t` freezes the
      playground on that linear time, for screenshots. */
  from?: string;
  to?: string;
  t?: number;
  choreography?: Choreography;
  tone?: GlyphTone;
};

// The four `avatar*` names carry their family in the label, because they are
// the only tones that answer to the theme switch above: flip it and they move
// while the other seven hold their face (tones.ts).
const TONE_LABEL: Record<GlyphTone, string> = {
  sand: "Sand",
  ink: "Ink",
  tangerine: "Tangerine",
  accent: "Accent",
  success: "Success",
  warning: "Warning",
  danger: "Danger",
  avatar: "Avatar",
  "avatar-success": "Avatar · success",
  "avatar-warning": "Avatar · warning",
  "avatar-danger": "Avatar · danger",
};

const subscribeNever = () => () => {};

// The app theme (next-themes on <html>), so the glyphs are judged on the
// canvas they ship on.
function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  return (
    <ToggleGroup
      type="single"
      spacing={0}
      aria-label="Theme"
      value={mounted ? (resolvedTheme ?? "") : ""}
      onValueChange={(value) => value && setTheme(value)}
    >
      <ToggleGroupItem value="light" className="gap-1.5">
        <IconSun aria-hidden="true" />
        Light
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" className="gap-1.5">
        <IconMoon aria-hidden="true" />
        Dark
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

export function GlyphPreview({
  from,
  to,
  t,
  choreography,
  tone: initialTone,
}: GlyphPreviewProps) {
  const [tone, setTone] = useState<GlyphTone>(initialTone ?? "sand");

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-12 sm:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Overline>Brand · agent glyphs</Overline>
            <h1 className="font-heading text-2xl">Agent glyphs</h1>
            <p className="max-w-content text-sm text-muted-foreground">
              Solid silhouettes with two eyes, one per agent. Every glyph morphs
              into every other: the stage loops a set, the playground scrubs any
              pair frame by frame, and the sheet checks each drawing from
              favicon to hero size against the shape contract.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ToggleGroup
              type="single"
              spacing={0}
              aria-label="Tone"
              value={tone}
              onValueChange={(value) => value && setTone(value as GlyphTone)}
            >
              {GLYPH_TONES.map((value) => (
                <ToggleGroupItem key={value} value={value}>
                  {TONE_LABEL[value]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <ThemeSwitch />
          </div>
        </header>

        <StageLoop tone={tone} />
        <MorphPlayground
          tone={tone}
          from={from}
          to={to}
          t={t}
          choreography={choreography}
        />
        <Roster tone={tone} />
        <SizeSheet tone={tone} />
      </div>
    </div>
  );
}
