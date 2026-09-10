"use client";

import { IconRefresh } from "@tabler/icons-react";
import { useState } from "react";
import { ApertureMark } from "@/components/brand/logo-motion/aperture-mark";
import { MaterialMark } from "@/components/brand/logo-motion/material-mark";
import { OrbitMark } from "@/components/brand/logo-motion/orbit-mark";
import { SettleMark } from "@/components/brand/logo-motion/settle-mark";
import type { MarkMotionProps } from "@/components/brand/logo-motion/types";
import { Button } from "@/components/ui/button";

type Variant = {
  id: string;
  name: string;
  note: string;
  Mark: (props: MarkMotionProps) => React.ReactElement;
};

const VARIANTS: Variant[] = [
  {
    id: "orbit",
    name: "A · Orbit",
    note: "The S turns a quarter into place; the two corner discs are already there to catch it.",
    Mark: OrbitMark,
  },
  {
    id: "aperture",
    name: "B · Aperture",
    note: "The four lobes open from the centre, then a single light pass crosses the matte face.",
    Mark: ApertureMark,
  },
  {
    id: "settle",
    name: "C · Settle",
    note: "Each lobe drops in on its own beat and comes to rest; hover re-seats them.",
    Mark: SettleMark,
  },
  {
    id: "material",
    name: "D · Material",
    note: "The S floats above the two discs on a real drop shadow, lit from the top edge. Each hover spins it once and latches the fill between white and orange.",
    Mark: MaterialMark,
  },
];

/** The three studies side by side, each in the signup page's context. */
export function LogoGallery() {
  // Bumping a variant's counter remounts it, which replays its entrance.
  const [runs, setRuns] = useState<Record<string, number>>({});
  const replay = (id: string) =>
    setRuns((r) => ({ ...r, [id]: (r[id] ?? 0) + 1 }));
  const replayAll = () =>
    setRuns((r) =>
      Object.fromEntries(VARIANTS.map((v) => [v.id, (r[v.id] ?? 0) + 1])),
    );

  return (
    <main className="mx-auto flex max-w-[1200px] flex-col gap-10 px-6 py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-strong">Logo motion</h1>
          <p className="max-w-[62ch] text-sm text-foreground-low">
            Three entrances for the mark that sits above the title on the signup
            page. Each plays once on mount and replays a quieter version on
            hover or keyboard focus. Dark is forced here because the signup page
            is dark only. Reduce-motion is respected: every variant renders
            straight to its rest state.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={replayAll}>
          <IconRefresh stroke={2} aria-hidden="true" />
          Replay all
        </Button>
      </header>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {VARIANTS.map(({ id, name, note, Mark }) => (
          <article
            key={id}
            className="flex flex-col gap-4 rounded-(--radius-xl) border border-border bg-card p-6 shadow-card"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-strong">{name}</h2>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => replay(id)}
                aria-label={`Replay ${name}`}
              >
                <IconRefresh stroke={2} aria-hidden="true" />
              </Button>
            </div>

            {/* The signup composition: mark above the title. */}
            <div className="flex min-h-[240px] flex-col items-center justify-center gap-5 rounded-(--radius-lg) bg-background px-6 py-10 text-center">
              <Mark key={runs[id] ?? 0} size={64} />
              <div className="flex flex-col gap-1.5">
                <p className="text-xl font-strong tracking-tight">
                  Create your account
                </p>
                <p className="text-sm text-foreground-low">
                  Start delegating work in under a minute.
                </p>
              </div>
            </div>

            <p className="text-xs text-foreground-low">{note}</p>

            {/* Size check: the mark also has to read at nav and favicon scale. */}
            <div className="flex items-end gap-5 border-t border-border pt-4">
              {[20, 32, 48].map((size) => (
                <span
                  key={size}
                  className="flex flex-col items-center gap-1.5 text-foreground-low"
                >
                  <Mark key={`${runs[id] ?? 0}-${size}`} size={size} />
                  <span className="text-[10px] tabular-nums">{size}</span>
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
