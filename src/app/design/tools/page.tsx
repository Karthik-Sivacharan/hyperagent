"use client";

import * as React from "react";
import { IconBlocks, IconChevronDown } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Overline } from "@/components/ui/overline";
import { TOOLS_VARIANTS, useTools, type ToolsVariant } from "@/components/composer/tools-menu";
import { cn } from "@/lib/utils";

// Compare the three Tools panels side by side. Each column is a real menu, so
// the keyboard path is the shipped one: focus the pill, Enter to open, arrow
// keys walk every tool, Space toggles it, Escape closes.

const NOTES: Record<ToolsVariant, { blurb: string; strength: string; cost: string }> = {
  roster: {
    blurb: "One row per tool with its description and a switch.",
    strength: "Teaches the tools. Nothing hides behind a hover. Easiest to scan when you do not know what Exa Websets is.",
    cost: "Tallest of the three. Eighteen rows means scrolling on a short window.",
  },
  chips: {
    blurb: "Today's wrapped grid, with the colour coding removed.",
    strength: "Smallest change from what ships now. Densest, and the whole set stays in view at once.",
    cost: "Names have to carry the meaning on their own; the description is only a title attribute.",
  },
  presets: {
    blurb: "Modes on top, the grid below for overrides.",
    strength: "Matches the real job. Seventeen of eighteen on says people want a mode, not eighteen decisions.",
    cost: "Two mental models in one panel. The preset row is dead weight for anyone who only ever runs Everything.",
  },
};

function VariantColumn({ variant }: { variant: ToolsVariant }) {
  const state = useTools();
  const [open, setOpen] = React.useState(true);
  const { label, panel: Panel, width } = TOOLS_VARIANTS[variant];
  const note = NOTES[variant];

  return (
    <section className="flex min-w-0 flex-1 flex-col gap-3">
      <header className="flex flex-col gap-1">
        <Overline>{label}</Overline>
        <p className="text-foreground text-sm">{note.blurb}</p>
      </header>

      {/* The notes sit above the trigger: the panel is portaled and floats over
          whatever follows it, so nothing readable goes below. */}
      <dl className="flex flex-col gap-2 text-sm">
        <div>
          <dt className="text-foreground-low text-xs">Buys you</dt>
          <dd className="text-muted-foreground">{note.strength}</dd>
        </div>
        <div>
          <dt className="text-foreground-low text-xs">Costs you</dt>
          <dd className="text-muted-foreground">{note.cost}</dd>
        </div>
      </dl>

      <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="pill" className="w-fit">
            <IconBlocks className="size-4" aria-hidden="true" />
            Tools
            <span className="text-muted-foreground tabular-nums">{state.count}</span>
            <IconChevronDown className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className={cn(width, "p-1.5")}>
          <Panel state={state} />
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="h-[34rem]" aria-hidden="true" />
    </section>
  );
}

export default function ToolsDesignPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 p-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl">Tools panel</h1>
        <p className="max-w-content text-muted-foreground text-sm">
          Three answers to the same brief. All three drop the per-tool colour, carry the on-state in fill, text tier and a
          check together, make every tool a <code className="font-mono text-xs">menuitemcheckbox</code> in the menu&apos;s roving
          focus, and put the group headers in a real menu group. Open one and walk it with the arrow keys.
        </p>
      </header>

      <div className="flex flex-col gap-10 lg:flex-row lg:gap-6">
        {(Object.keys(TOOLS_VARIANTS) as ToolsVariant[]).map((v) => (
          <VariantColumn key={v} variant={v} />
        ))}
      </div>
    </main>
  );
}
