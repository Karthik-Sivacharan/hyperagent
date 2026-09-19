"use client";

import { useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { IconMoon, IconSun } from "@tabler/icons-react";

import { BorderBeam, type BorderBeamProps } from "@/components/ui/border-beam";
import { Label } from "@/components/ui/label";
import { Overline } from "@/components/ui/overline";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { WikiAsk } from "@/components/wiki/wiki-ask";

// The border-beam primitive (src/components/ui/border-beam.tsx) where it is
// headed first: WikiAsk, the wiki's ask box (src/components/wiki/wiki-ask.tsx),
// at the two widths the wiki gives it (the 640 article column and the 400 chat
// column), with the beam's palette, type, strength and Wiki Agent's working
// state on the controls above. Below it, every palette against every type on
// a plain card, so the choice can be made side by side in both themes.

type Palette = NonNullable<BorderBeamProps["colorVariant"]>;
type Kind = NonNullable<BorderBeamProps["size"]>;

const PALETTES: { value: Palette; label: string }[] = [
  { value: "mono", label: "Mono" },
  { value: "colorful", label: "Colorful" },
  { value: "ocean", label: "Ocean" },
  { value: "sunset", label: "Sunset" },
];

// `sm` is left out: it is tuned for a 70×36 pill, not a box.
const KINDS: { value: Kind; label: string; note: string }[] = [
  { value: "md", label: "Rotate", note: "A light that travels the whole edge" },
  { value: "line", label: "Line", note: "A light along the bottom edge" },
  { value: "pulse-inner", label: "Pulse in", note: "The edge breathes, inside the box" },
  { value: "pulse-outside", label: "Pulse out", note: "A halo breathes outside the box" },
];

const subscribeNever = () => () => {};

// The app theme (next-themes on <html>), the same switch /design/flow has, so
// the beam is judged on the tuning it will ship with.
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

function Controls({
  palette,
  onPalette,
  kind,
  onKind,
  strength,
  onStrength,
  running,
  onRunning,
}: {
  palette: Palette;
  onPalette: (value: Palette) => void;
  kind: Kind;
  onKind: (value: Kind) => void;
  strength: number;
  onStrength: (value: number) => void;
  running: boolean;
  onRunning: (value: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <ToggleGroup
        type="single"
        spacing={0}
        aria-label="Palette"
        value={palette}
        onValueChange={(value) => value && onPalette(value as Palette)}
      >
        {PALETTES.map((p) => (
          <ToggleGroupItem key={p.value} value={p.value}>
            {p.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <ToggleGroup
        type="single"
        spacing={0}
        aria-label="Type"
        value={kind}
        onValueChange={(value) => value && onKind(value as Kind)}
      >
        {KINDS.map((k) => (
          <ToggleGroupItem key={k.value} value={k.value}>
            {k.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div className="flex items-center gap-3">
        <span className="text-muted-foreground text-sm" aria-hidden="true">
          Strength
        </span>
        <Slider
          aria-label="Strength"
          className="w-32"
          min={0}
          max={100}
          step={5}
          value={[strength]}
          onValueChange={([value]) => onStrength(value)}
        />
        <span className="w-9 text-muted-foreground text-xs tabular-nums">{strength}%</span>
      </div>

      <div className="flex items-center gap-2">
        <Switch id="beam-running" checked={running} onCheckedChange={onRunning} />
        <Label htmlFor="beam-running" className="cursor-pointer text-muted-foreground">
          Agent working
        </Label>
      </div>
    </div>
  );
}

export default function BeamDesignPage() {
  const [palette, setPalette] = useState<Palette>("mono");
  const [kind, setKind] = useState<Kind>("md");
  const [strength, setStrength] = useState(100);
  const [running, setRunning] = useState(true);
  const beam = { colorVariant: palette, size: kind, strength: strength / 100 };
  const task = running ? "Reading 3 pages…" : undefined;
  const stop = () => setRunning(false);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-8 py-12">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Overline>Primitives · border-beam</Overline>
            <h1 className="font-heading text-2xl">Border beam</h1>
            <p className="max-w-content text-muted-foreground text-sm">
              A light that travels the edge of whatever it wraps, drawn by the MIT border-beam package
              and tuned to the app theme. It stays off until the page has mounted, then fades in, and
              it holds still for anyone who asks for reduced motion. Here it is on Wiki Agent&apos;s ask
              box, then every palette against every type.
            </p>
          </div>
          <ThemeSwitch />
        </header>

        <section className="flex flex-col gap-6" aria-labelledby="beam-composer">
          <div className="flex flex-col gap-1">
            <h2 id="beam-composer" className="font-heading text-lg">
              On the ask box
            </h2>
            <p className="text-muted-foreground text-sm">
              WikiAsk: the app&apos;s composer addressed to Wiki Agent, without the agent picker and the
              integrations strip. &ldquo;Agent working&rdquo; turns the beam and the Working row on
              together, so the light means the agent is busy; Stop turns both off.
            </p>
          </div>

          <Controls
            palette={palette}
            onPalette={setPalette}
            kind={kind}
            onKind={setKind}
            strength={strength}
            onStrength={setStrength}
            running={running}
            onRunning={setRunning}
          />

          <div className="flex flex-col gap-3">
            <Overline>In the article column, 640</Overline>
            <WikiAsk className="w-full max-w-160" beam={beam} task={task} onStop={stop} />
          </div>

          <div className="flex flex-col gap-3">
            <Overline>In the chat column, 400</Overline>
            <WikiAsk className="w-full max-w-100" beam={beam} task={task} onStop={stop} />
          </div>
        </section>

        <section className="flex flex-col gap-6" aria-labelledby="beam-matrix">
          <div className="flex flex-col gap-1">
            <h2 id="beam-matrix" className="font-heading text-lg">
              Every palette, every type
            </h2>
            <p className="text-muted-foreground text-sm">
              On a plain card at full strength. Every palette but Mono also shifts its hue as it goes.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-x-8 gap-y-10">
            {KINDS.map((k) =>
              PALETTES.map((p) => (
                <BorderBeam key={`${k.value}-${p.value}`} size={k.value} colorVariant={p.value}>
                  <div className="flex h-24 flex-col justify-end gap-0.5 rounded-2xl bg-card p-3 shadow-card ring-1 ring-border-subtle">
                    <span className="font-medium text-sm">
                      {k.label} · {p.label}
                    </span>
                    <span className="text-muted-foreground text-xs">{k.note}</span>
                  </div>
                </BorderBeam>
              )),
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
