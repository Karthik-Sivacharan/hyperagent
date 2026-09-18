"use client";

import { useState, type CSSProperties } from "react";

import type { GlyphIdle } from "@/components/brand/agent-glyph";
import { AgentChip } from "@/components/composer/agent-status/agent-chip";
import { AgentDetail } from "@/components/composer/agent-status/agent-detail";
import { AgentStack } from "@/components/composer/agent-status/agent-stack";
import { RUN_STATES, type ChipTreatment } from "@/components/composer/agent-status/run-state";
import type { AgentRun } from "@/components/composer/agent-status/types";
import { Composer } from "@/components/composer/composer";
import {
  AGENT_BAR_DETAIL,
  AGENT_BAR_ROW,
  AGENT_BAR_ROW_TALL,
  ComposerAgentStatus,
} from "@/components/composer/composer-agent-status";
import { Button } from "@/components/ui/button";
import { Overline } from "@/components/ui/overline";
import {
  AGENT_RUNS,
  CROWDED_FLEET,
  ONE_AGENT_MANY_TASKS,
  ONE_PER_STATE,
  THREE_RUNNING_OF_FOUR,
} from "@/lib/mock/agent-status";

// The composer's agent bar, block by block, the way /design/agent-stream lays
// out the streaming turn: every specimen below is the live component on the
// live mock fleet, never a picture of one.
//
// Two measures again, and for a sharper reason here than on the stream page.
// 752px is the thread column before the shell arrives; 512px is the floor the
// shell holds it to while the agent panel is docked (use-shell-fit.ts). The
// fleet is right-aligned and the count sits opposite it, so at 752 the two
// ends have the whole row between them and nothing is under pressure; 512 is
// where the expanded row's parameter starts to truncate, where the count
// label meets the chips, and where the overflow count has to earn its place. A
// bar that only works at 752 is not finished.
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

// ===== STILL BEING CHOSEN ==================================================
//
// Two questions are open, and both of them are the kind that a person settles
// by looking rather than by reading a number, so both candidates are on the
// page at real size on the real surface, with the live one marked. When one
// wins, the loser and the prop that selects it come out together: `treatment`
// and `idle` on AgentChip, `paperTone` in RUN_STATES, `restless` in
// IDLE_TIMING.
//
// Every specimen is the shipping AgentChip with one prop moved. Nothing here
// is a mock-up of a chip, because a mock-up would be the one thing on this
// page that could disagree with the bar and not be caught.

/** A pill for the candidate the bar actually renders. The brand's 12px caps
    role rather than a one-off size, so it sits at the same weight as the
    Overline above it without being one. */
function LiveTag() {
  return (
    <span className="rounded-full bg-tint-15 px-1.5 py-0.5 text-label-12-caps text-muted-foreground">Live</span>
  );
}

function Candidate({ title, live, note, children }: { title: string; live?: boolean; note: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-2 text-xs text-foreground-low">
        {title}
        {live && <LiveTag />}
      </p>
      {/* The composer's own card, because a disc is ringed in `surface-elevated`
          so that it bites the disc behind it: judged on any other colour that
          ring reads as a halo the bar never has. */}
      <div className="w-fit max-w-full rounded-3xl bg-surface-elevated px-6 py-5 ring-1 ring-input">{children}</div>
      <p className="max-w-content text-xs text-foreground-low">{note}</p>
    </div>
  );
}

const DISC_CANDIDATES: readonly { treatment: ChipTreatment; title: string; live?: boolean; note: string }[] = [
  {
    treatment: "surface",
    title: "Themed disc · avatar tones",
    live: true,
    note: "The tile, the eyes and the three state hues are variables brand.css re-maps under `.dark`, so the chip knows nothing about the theme and the first paint is already right. Dark is a neutral-800 tile with the figures lifted two ramp steps to the 400s, the same lift --brand-accent takes; light is the paper measurement unchanged. Figure against its own tile: 9.88 / 5.70 / 5.31 / 5.15 dark, 14.5 / 4.95 / 4.26 / 4.51 light, against a 3:1 floor for a graphic.",
  },
  {
    treatment: "paper",
    title: "Paper disc · the first version",
    note: "A fixed neutral-100 tile in both themes. In the light theme this is the themed disc, to the pixel — which is the cheapest proof that nothing about the light composer moved. In the dark it is the row of near-white coins that started this: three 28px discs brighter than any type in the composer, and the eyes, which are painted in the tile colour, glowing with them.",
  },
];

function DiscCandidates() {
  return (
    <div className="flex flex-col gap-6">
      {DISC_CANDIDATES.map((candidate) => (
        <Candidate key={candidate.treatment} title={candidate.title} live={candidate.live} note={candidate.note}>
          <div className="flex flex-wrap items-start gap-10">
            {ONE_PER_STATE.map((run) => (
              <div key={run.id} className="flex flex-col items-center gap-2.5">
                <AgentChip run={run} treatment={candidate.treatment} />
                <p className="text-xs text-foreground-low">{RUN_STATES[run.state].label}</p>
              </div>
            ))}
          </div>
        </Candidate>
      ))}
    </div>
  );
}

/**
 * The one dial the dark disc leaves open, and it is one variable, so it can be
 * turned on this page without inventing a tone: an inline
 * `--glyph-avatar-figure` shadows the sheet's value for that subtree and the
 * chip is otherwise untouched.
 *
 * `running` spends no hue, so its figure is whatever the theme calls
 * foreground — and in the dark that is neutral-100, the brightest thing the
 * palette has. It is the faithful inverse of light's ink on paper, and it is
 * also the reason a working chip out-weighs the three states that are
 * actually news. The two steps under it put the figure in the same lightness
 * band as the hues (which all sit at the 400s), so all four figures would
 * differ by chroma alone and the hueless one would stop leading the row. Each
 * row pairs Working with Done, because the question is not how bright the
 * figure is on its own, it is whether it out-shouts a state that wants
 * reading.
 */
const FIGURE_STEPS: readonly { token: string; label: string; live?: boolean }[] = [
  { token: "var(--color-neutral-100)", label: "neutral-100 · 9.88:1 · the theme's own foreground", live: true },
  { token: "var(--color-neutral-300)", label: "neutral-300 · 8.06:1" },
  { token: "var(--color-neutral-400)", label: "neutral-400 · 5.41:1 · the hues' own lightness step" },
];

/** The two runs this block compares: the hueless one, and the quietest of the
    three that carry a colour. */
const FIGURE_PAIR = ONE_PER_STATE.filter((run) => run.state === "running" || run.state === "done");

function FigureSteps() {
  return (
    <div className="w-fit max-w-full rounded-3xl bg-surface-elevated px-6 py-5 ring-1 ring-input">
      <div className="flex flex-col gap-4">
        {FIGURE_STEPS.map((step) => (
          <div
            key={step.token}
            style={{ "--glyph-avatar-figure": step.token } as CSSProperties}
            className="flex items-center gap-3"
          >
            {FIGURE_PAIR.map((run) => (
              <AgentChip key={run.id} run={run} />
            ))}
            <p className="flex items-center gap-2 text-xs text-foreground-low">
              {step.label}
              {step.live && <LiveTag />}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Both working agents from the fleet, so the desynchronisation is visible:
    nothing here shares a clock, and two chips that mounted in the same frame
    should never be caught on the same beat. */
const RUNNING_RUNS = AGENT_RUNS.filter((run) => run.state === "running");

/** The loupe. Big enough to watch an eye, and honestly labelled: a glance is
    scaled to the rendered size, so this is the candidate's RHYTHM at a size
    the bar never uses, not its exact travel. */
const LOUPE_PX = 56;

const MOTION_CANDIDATES: readonly { idle: GlyphIdle; title: string; live?: boolean; note: string }[] = [
  {
    idle: "calm",
    title: "Calm · what it was",
    note: "The `quick` pace's own resting rate: one blink somewhere in four to nine seconds, and nothing else — glancing was off, because 3 units of a 140-unit box is under half a pixel at 18px. Watch it for five seconds and you will most likely see nothing at all, which is the complaint.",
  },
  {
    idle: "busy",
    title: "Busy · a working agent",
    live: true,
    note: "A beat about every second and a half, rather more of them a look than a blink. Looking is what carries it: eyes that MOVE read as thought where eyes that only blink read as awake. The travel is now sized from the rendered px and capped at the clearance every eye is guaranteed, so at 18px a look is about two thirds of an eye's width instead of a third of a pixel. The outline never changes — a shape is the agent's identity.",
  },
  {
    idle: "restless",
    title: "Restless · the same, wound tighter",
    note: "Roughly twice the rate, with shorter holds. It is here to answer the question `busy` cannot answer on its own — whether the shipping one is too slow — and watching both for ten seconds is the whole test. Past about a beat a second a row of discs starts to read as agitated rather than occupied.",
  },
];

function MotionCandidates() {
  return (
    <div className="flex flex-col gap-6">
      {MOTION_CANDIDATES.map((candidate) => (
        <Candidate key={candidate.idle} title={candidate.title} live={candidate.live} note={candidate.note}>
          <div className="flex items-center gap-10">
            <div className="flex flex-col items-center gap-2.5">
              <div className="flex items-center gap-3">
                {RUNNING_RUNS.map((run) => (
                  <AgentChip key={run.id} run={run} idle={candidate.idle} />
                ))}
              </div>
              <p className="text-xs text-foreground-low tabular-nums">28px · the bar</p>
            </div>
            <div className="flex flex-col items-center gap-2.5">
              <AgentChip run={RUNNING_RUNS[0]} size={LOUPE_PX} idle={candidate.idle} />
              <p className="text-xs text-foreground-low tabular-nums">56px · the rhythm, magnified</p>
            </div>
          </div>
        </Candidate>
      ))}
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
//
// `onOpenTask` is handed over for the same reason the stacked specimen below
// hands it over: a room gives every live run a card, so the last slot on a
// single row is the arrow out to it, and a page that left it off would be
// showing the one shape the product does not draw.

function DetailSpecimen({ run }: { run: AgentRun }) {
  const [shown, setShown] = useState(true);
  return (
    <div className="flex w-[512px] max-w-full flex-col items-start gap-2">
      <p className="text-xs text-foreground-low">{RUN_STATES[run.state].label}</p>
      {shown ? (
        <div className="w-full">
          <BarFrame>
            <div className={AGENT_BAR_ROW}>
              <AgentDetail
                runs={[run]}
                onBack={() => setShown(false)}
                onOpenTask={() => () => {}}
                onEndRun={() => {}}
                className={AGENT_BAR_DETAIL}
              />
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

// The stacked detail, already open. Every other specimen of the expanded row
// is reached by clicking a chip, which is right for showing the swap and wrong
// for showing what the row LOOKS like: a reader comparing three Stops down one
// edge should not have to find the chip that opens them first. So this one
// renders AgentDetail straight into the bar's tall row — the same two exported
// class strings the bar itself uses (AGENT_BAR_ROW_TALL, AGENT_BAR_DETAIL), so
// no metric is copied here to go stale — and Back takes it away the way the
// other specimens do, because a Back that goes nowhere is not the control
// being shown.
function StackedDetailSpecimen({ runs }: { runs: readonly AgentRun[] }) {
  const [shown, setShown] = useState(true);
  if (!shown) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setShown(true)}>
        Open {runs[0]?.name} again
      </Button>
    );
  }
  return (
    <BarFrame>
      <div className={AGENT_BAR_ROW_TALL}>
        <AgentDetail
          runs={runs}
          onBack={() => setShown(false)}
          onOpenTask={() => () => {}}
          onEndRun={() => {}}
          className={AGENT_BAR_DETAIL}
        />
      </div>
    </BarFrame>
  );
}

export default function AgentStatusPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-8 py-12">
        <header className="flex flex-col gap-2">
          <Overline>Composer · the agent bar</Overline>
          <h1 className="font-heading text-2xl">The agents, in one row</h1>
          <p className="max-w-content text-sm text-muted-foreground">
            The variant of the working strip for a composer with more than one agent out. The left
            counts them and the right carries them, one glyph per agent wearing its own state; a
            click opens any of them out into the same 40px row, and Back or Escape puts them away.
            The pattern is the one the 2026-09-17 desk research keeps turning up: the signal lives
            on the figure rather than in a layer beside it, and motion carries the reassurance a
            word would otherwise have to.
          </p>
        </header>

        <Section
          label="Still being chosen · the disc"
          blurb="The disc used to be the glyph's paper tile in both themes, which in a dark composer is three near-white coins sitting above the field, brighter than anything else in the card. Both candidates are below, on the composer's own surface at the size the bar draws them. The eyes are the reason this is not simply a background: they are painted in the tile colour so they read as holes punched through to it, so inverting the tile inverts the eyes and every hued figure has to be re-measured against the new ground."
        >
          <DiscCandidates />
          <div className="flex flex-col gap-2">
            <p className="text-xs text-foreground-low">The working figure, three steps down the ramp</p>
            <FigureSteps />
            <p className="max-w-content text-xs text-foreground-low">
              Only `running` is affected: the other three read their own hue. The live step is the
              faithful inverse of the light theme, ink on paper becoming paper on ink, and it is also
              the one that leaves a working agent brighter than an agent that finished. Overriding the
              figure needs no new tone — it is one variable, shadowed on a wrapper.
            </p>
          </div>
        </Section>

        <Section
          label="Still being chosen · how a working agent moves"
          blurb="Three rhythms for the one state that is still going. The shape is fixed in all of them — a running glyph that morphed into another glyph would be saying something false about who it is — so the whole signal is the eyes: blinks, and looks about. Two chips per candidate, because nothing here shares a clock and the thing to check is that a row never falls into step. None of it runs under prefers-reduced-motion: the idle loop is skipped outright, and all three candidates go still."
        >
          <MotionCandidates />
        </Section>

        <Section
          label="The four states"
          blurb="One run each, drawn by the stack itself rather than by a swatch, so the tones and the working motion are the ones the bar ships. Working carries no hue at all: its eyes are the signal. The three that do carry one have all stopped, and only amber is asking for anything."
        >
          <StateSpecimens />
        </Section>

        <Section
          label="The stack"
          blurb="Seven agents, three chips and a count for the rest. The three are a sample, not a queue: one per state before any state gets two, a different agent in each where the fleet has one, in seat order — working, done, stuck, then the two that are about a person. The count holds the rest in reading order, whoever wants something first, and pressing it unfolds them in place. Opposite them, the one thing a row of overlapping discs cannot say: how many there are, and whether any is still going — it shimmers on the product's running-label device while something is out, and changes tense when the last one lands. At 512 it is the same bar, because the readout was never the part under pressure. Below it, the same fleet with the overflow count set earlier and later."
        >
          <Measures>
            <BarFrame>
              <ComposerAgentStatus runs={AGENT_RUNS} />
            </BarFrame>
          </Measures>
          <MaxVariants />
        </Section>

        <Section
          label="Unfolded"
          blurb="The count pressed: every run in the row, the three seated discs where they were and the rest after them in reading order, held at the spacing the hover opens to, with a chevron at the right edge that folds them back. Fifteen runs, which fit at 752 and do not at 512 — there the row scrolls sideways inside the same 40px rather than growing a line, the edge with more behind it fades, and the chevron stays pinned outside the scroll so the way back is never scrolled away."
        >
          <Measures>
            <BarFrame>
              <ComposerAgentStatus runs={CROWDED_FLEET} defaultExpanded onOpenTask={() => {}} onEndRun={() => {}} />
            </BarFrame>
          </Measures>
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
          blurb="One agent, opened out in the row the stack was just in: same height, same hairline, same sides, so the only thing that changed hands is the contents. Three states at the tight measure, where the dial, the hue, the truncation and the arrow out to the card all have to hold at once. That arrow is the same 24px square in all three and takes none of their hues: it is a way out rather than a status, and the colour stays on the dial and the figure, which is where it means something. A run the board has no card for keeps the state as a word in its tint instead — the same slot, saying the only thing left to say."
        >
          <div className="flex flex-col gap-6">
            {EXPANDED.map((run) => (
              <DetailSpecimen key={run.id} run={run} />
            ))}
          </div>
        </Section>

        <Section
          label="Three running of four"
          blurb="The Stop, in the number a real row produces. It is the one control here that is not on every line: three of EvalBot's four tasks are still going and each of those carries it, while the fourth has already stopped and is waiting on a person, so it carries none — the gap at the bottom of the column is as much the specimen as the three above it. Stop sits before the arrow because the two are not peers: stopping is the destructive one, so a reader who overshoots the end of a line lands on the harmless one. Both are the same 24px square and both are as neutral as each other; a red Stop would put the loudest colour in the bar on the one state that deliberately spends none, and it would read as the state rather than as the action. It is also the reason the row's own target is the line rather than a button around it: a button inside a button is invalid, so the arrow stays the control and a press anywhere else on the line opens the task, while Stop keeps its own clicks and its place in the tab order."
        >
          <Measures>
            <StackedDetailSpecimen runs={THREE_RUNNING_OF_FOUR} />
          </Measures>
        </Section>

        <Section
          label="Expanded, stacked"
          blurb="The same row for an agent that is doing four things at once, which the board makes routine: one figure, one name, a count where a single row ends, and a line each for the work — dial, task, parameter, and the same neutral arrow out to its card. Four of them down the right edge is exactly why that arrow carries no hue: tinted, a column of them would read as four more state marks beside the four dials that already are. This list is a chooser, so the chip that opened it went nowhere — with four tasks behind one figure, a click that also jumped would have picked for the reader — and picking a line is what travels. That makes the whole line the target: hover anywhere on one and it lifts, while the arrow at its end stays the control, the tab stop and the name. This is the one thing that changes the bar's height, and it earns it. A readout that folded these four into one state could not say Media Lab Director is stuck on the second render and fine on the trace, and that sentence is the reason the board is per task rather than per agent. The box grows upward, into the thread; the field below it does not move."
        >
          <Measures>
            <BarFrame>
              <ComposerAgentStatus runs={ONE_AGENT_MANY_TASKS} onOpenTask={() => {}} onEndRun={() => {}} />
            </BarFrame>
          </Measures>
        </Section>
      </div>
    </div>
  );
}
