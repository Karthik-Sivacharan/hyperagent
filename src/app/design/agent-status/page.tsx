"use client";

import { useState } from "react";

import { AgentDetail } from "@/components/composer/agent-status/agent-detail";
import { AgentStack } from "@/components/composer/agent-status/agent-stack";
import { RUN_STATES } from "@/components/composer/agent-status/run-state";
import type { AgentRun } from "@/components/composer/agent-status/types";
import { Composer } from "@/components/composer/composer";
import { AGENT_BAR_DETAIL, AGENT_BAR_ROW, ComposerAgentStatus } from "@/components/composer/composer-agent-status";
import { Button } from "@/components/ui/button";
import { Overline } from "@/components/ui/overline";
import { AGENT_RUNS, ONE_PER_STATE } from "@/lib/mock/agent-status";

// The composer's agent bar, block by block, the way /design/agent-stream lays
// out the streaming turn: every specimen below is the live component on the
// live mock fleet, never a picture of one.
//
// Two measures again, and for a sharper reason here than on the stream page.
// 752px is the thread column before the shell arrives; 512px is the floor the
// shell holds it to while the agent panel is docked (use-shell-fit.ts). The
// bar is right-aligned, so at 752 it is mostly the empty left it is named for
// and nothing is under pressure; 512 is where the expanded row's parameter
// starts to truncate and where the count has to earn its place. A bar that
// only works at 752 is not finished.
//
// Every specimen sits on `surface-elevated` rather than on the page, because a
// chip is ringed in the composer's own surface so that it bites a clean edge
// out of the chip behind it. On any other colour that ring reads as a halo the
// bar never has, which would make this page a worse witness than no page.

const MEASURES = [
  { label: "752px · the column before the shell arrives", className: "w-[752px]" },
  { label: "512px · the docked floor", className: "w-[512px]" },
] as const;

function Measures({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      {MEASURES.map((measure) => (
        <div key={measure.label} className="flex flex-col gap-2">
          <p className="text-xs text-foreground-low">{measure.label}</p>
          {/* Scaffolding, as on the stream page: the dashed hairline makes the
              measure readable. The composer has no such frame. */}
          <div className="w-fit max-w-full rounded-3xl border border-dashed border-border-subtle p-4">
            <div className={`${measure.className} max-w-full`}>{children}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Section({ label, blurb, children }: { label: string; blurb: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <Overline>{label}</Overline>
        <p className="max-w-content text-sm text-muted-foreground">{blurb}</p>
      </header>
      {children}
    </section>
  );
}

/**
 * The composer's shell without the composer in it: the 32px elevated card the
 * bar ships on, and 44px of nothing under the bar where the field would be, so
 * the hairline has something to divide instead of hanging off the bottom of a
 * box.
 */
function BarFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-5xl bg-surface-elevated shadow-lg ring-1 ring-input">
      {children}
      <div className="h-11" />
    </div>
  );
}

// ===== THE STATES ==========================================================

function StateSpecimens() {
  return (
    <div className="w-fit max-w-full rounded-3xl bg-surface-elevated px-8 py-6 ring-1 ring-input">
      <div className="flex flex-wrap items-start gap-10">
        {ONE_PER_STATE.map((run) => (
          <div key={run.id} className="flex flex-col items-center gap-2.5">
            <AgentStack runs={[run]} />
            <p className="text-xs text-foreground-low">{RUN_STATES[run.state].label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== THE STACK ===========================================================

/** The one knob the bar takes, at the measure where it costs something. */
const MAX_VARIANTS = [2, 5] as const;

function MaxVariants() {
  return (
    <div className="flex flex-col gap-4">
      {MAX_VARIANTS.map((max) => (
        <div key={max} className="flex flex-col gap-2">
          <p className="text-xs text-foreground-low tabular-nums">max {max}</p>
          <div className="w-[512px] max-w-full">
            <BarFrame>
              <ComposerAgentStatus runs={AGENT_RUNS} max={max} />
            </BarFrame>
          </div>
        </div>
      ))}
    </div>
  );
}

// ===== EXPANDED ============================================================
//
// The detail has to be reachable here without clicking a chip first, so each
// specimen puts one into the bar's own row wearing exactly what the bar makes
// it wear (AGENT_BAR_ROW and AGENT_BAR_DETAIL, so no metric is copied here to
// go stale). Back is wired the way the stream page wires Stop: it takes the
// row away and a control brings it back, because a back control that goes
// nowhere is not the control being shown.

function DetailSpecimen({ run }: { run: AgentRun }) {
  const [shown, setShown] = useState(true);
  return (
    <div className="flex w-[512px] max-w-full flex-col items-start gap-2">
      <p className="text-xs text-foreground-low">{RUN_STATES[run.state].label}</p>
      {shown ? (
        <div className="w-full">
          <BarFrame>
            <div className={AGENT_BAR_ROW}>
              <AgentDetail run={run} onBack={() => setShown(false)} className={AGENT_BAR_DETAIL} />
            </div>
          </BarFrame>
        </div>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={() => setShown(true)}>
          Open {run.name} again
        </Button>
      )}
    </div>
  );
}

/** Three of the four: `done` is the state with nothing left to ask for. */
const EXPANDED = ONE_PER_STATE.filter((run) => run.state !== "done");

export default function AgentStatusPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-8 py-12">
        <header className="flex flex-col gap-2">
          <Overline>Composer · the agent bar</Overline>
          <h1 className="font-heading text-2xl">The agents, in one row</h1>
          <p className="max-w-content text-sm text-muted-foreground">
            The variant of the working strip for a composer with more than one agent out. The left
            goes empty and the right carries the fleet, one glyph per agent wearing its own state; a
            click opens any of them out into the same 40px row, and Back or Escape puts them away.
            The pattern is the one the 2026-09-17 desk research keeps turning up: the signal lives
            on the figure rather than in a layer beside it, and motion carries the reassurance a
            word would otherwise have to.
          </p>
        </header>

        <Section
          label="The four states"
          blurb="One run each, drawn by the stack itself rather than by a swatch, so the tones and the working motion are the ones the bar ships. Working carries no hue at all: its eyes are the signal. The three that do carry one have all stopped, and only amber is asking for anything."
        >
          <StateSpecimens />
        </Section>

        <Section
          label="The stack"
          blurb="Six agents, three chips and a count for the rest, in the order the bar sorts them: whoever wants something, then trouble, then the ones still going, then the ones already finished. At 752 the bar is mostly the empty left it is named for; at 512 it is the same bar, because the readout was never the part under pressure. Below it, the same fleet with the count set earlier and later."
        >
          <Measures>
            <BarFrame>
              <ComposerAgentStatus runs={AGENT_RUNS} />
            </BarFrame>
          </Measures>
          <MaxVariants />
        </Section>

        <Section
          label="In the composer"
          blurb="The real composer, with the bar in the same status slot the working strip uses: part of the box rather than a banner over it, and the rightmost chip on the same right edge as the send arrow two rows below. Click a chip and the bar changes hands without changing height."
        >
          <Measures>
            <Composer
              showAgentPicker={false}
              showIntegrationsFooter={false}
              placeholder="Add a follow-up…"
              status={<ComposerAgentStatus runs={AGENT_RUNS} />}
            />
          </Measures>
        </Section>

        <Section
          label="Expanded"
          blurb="One agent, opened out in the row the stack was just in: same height, same hairline, same sides, so the only thing that changed hands is the contents. Three states at the tight measure, where the dial, the hue, the state word and the truncation all have to hold at once."
        >
          <div className="flex flex-col gap-6">
            {EXPANDED.map((run) => (
              <DetailSpecimen key={run.id} run={run} />
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
