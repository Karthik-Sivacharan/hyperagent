"use client";

import { useEffect, useState } from "react";
import { IconPencil, IconPlayerPlay, IconPlug, IconPuzzle, IconSearch } from "@tabler/icons-react";

import { Composer } from "@/components/composer/composer";
import { ComposerWorkingStatus } from "@/components/composer/composer-status";
import { ToolIconRow } from "@/components/signup/tool-icon-row";
import { ReasoningBlock } from "@/components/thread/reasoning-block";
import {
  StreamingMessage,
  streamLength,
  useTextStream,
  type StreamParagraph,
} from "@/components/thread/streaming-message";
import { ToolCallCount, ToolCallRow, type ToolCallStatus } from "@/components/thread/tool-call-row";
import { Button } from "@/components/ui/button";
import { Overline } from "@/components/ui/overline";
import { TOOL_LOGOS } from "@/lib/mock/tool-logos";

// Every block a running turn is made of, each the real component in every
// state it has, the way /design/skill-suggestions lays out its three variants.
// The signup flow composes these into the turn after send; this page is where
// they can be judged one at a time, and replayed.
//
// Two measures, not one. 752px is the thread column before the shell arrives,
// and 512px is the floor the shell holds the column to while the agent panel
// is docked (use-shell-fit.ts), which is where a row's parameter has to start
// truncating and a message wraps hardest. Anything that only works at 752 is
// not finished.

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
          {/* Scaffolding, as on the skill-suggestions page: the hairline makes
              the measure readable against the page. The thread has no frame. */}
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

// ===== TOOL CALLS ==========================================================

function ToolCallStates() {
  return (
    // The product stacks a turn's rows 8px apart and lets each hug its own
    // text, so the stack is a column of different widths, never a table.
    <div className="flex flex-col items-start gap-2">
      <ToolCallRow status="running" icon={IconPencil} label="Writing instructions" detail="Design system drift" />
      <ToolCallRow status="running" logoSrc={TOOL_LOGOS.figma.src} label="Reading the library" detail="Trainwell Design System" />
      <ToolCallRow
        status="done"
        icon={IconPuzzle}
        label="Searching skills"
        detail="design systems, Figma, iOS"
        receipt={<ToolCallCount>6 found</ToolCallCount>}
      />
      <ToolCallRow
        status="done"
        icon={IconPlug}
        label="Checking connectors"
        detail="Figma, GitHub, Linear"
        receipt={<ToolIconRow toolIds={["figma", "github", "linear"]} />}
      />
      <ToolCallRow
        status="interrupted"
        icon={IconSearch}
        label="Searching the web"
        detail="design system drift detection in CI"
      />
      <ToolCallRow status="failed" logoSrc={TOOL_LOGOS["app-store"].src} label="Reading the listing" detail="Trainwell: Personal Training" />
      <ToolCallRow
        status="done"
        icon={IconSearch}
        label="Searching the web"
        detail="how consumer fitness apps keep a Figma library and a React Native codebase in step"
        receipt={<ToolCallCount>+4 more</ToolCallCount>}
      />
    </div>
  );
}

// ===== THE MESSAGE =========================================================

const SAMPLE: StreamParagraph[] = [
  [
    { text: "Design system drift", strong: true },
    {
      text: " is set up. After each merge to main it compares the front-end changes against your Figma library and opens a Linear issue for every component that drifted, with the Figma node and the PR line side by side.",
    },
  ],
  [
    {
      text: "It reads from Figma and GitHub and files to Linear; you can review all three under Connectors in the panel. One thing before its first run:",
    },
  ],
];
const SAMPLE_LENGTH = streamLength(SAMPLE);

function StreamingDemo() {
  const [done, setDone] = useState(false);
  const revealed = useTextStream(SAMPLE_LENGTH, { active: true, onDone: () => setDone(true) });
  return (
    <div className="flex flex-col gap-2">
      <StreamingMessage paragraphs={SAMPLE} revealed={revealed} />
      <p className="text-xs text-foreground-low tabular-nums">
        {revealed} of {SAMPLE_LENGTH} characters{done ? " · done" : ""}
      </p>
    </div>
  );
}

function Replayable({ children }: { children: (run: number) => React.ReactNode }) {
  const [run, setRun] = useState(0);
  return (
    <div className="flex flex-col items-start gap-3">
      <Button type="button" variant="outline" size="sm" onClick={() => setRun((n) => n + 1)}>
        <IconPlayerPlay className="size-3.5" aria-hidden="true" />
        Replay
      </Button>
      <div className="w-full">{children(run)}</div>
    </div>
  );
}

// ===== THE COMPOSER ========================================================

function WorkingComposer() {
  const [working, setWorking] = useState(true);
  return (
    <div className="flex flex-col items-start gap-3">
      <Composer
        showAgentPicker={false}
        showIntegrationsFooter={false}
        placeholder="Add a follow-up…"
        status={working ? <ComposerWorkingStatus onStop={() => setWorking(false)} /> : undefined}
      />
      {!working && (
        <Button type="button" variant="outline" size="sm" onClick={() => setWorking(true)}>
          Start working again
        </Button>
      )}
    </div>
  );
}

// ===== IN ORDER ============================================================
//
// The blocks in the sequence the flow runs them, at the plan's timings
// (docs/plans/2026-09-10-agent-stream.md): reasoning for 1200ms, then each row
// 1100 running and 300 settled, stacked, then the message. This is a preview
// of the rhythm, not the flow; the flow's own sequencer lives with the flow.

const REASONING_MS = 1200;
const ROW_RUN_MS = 1100;
const ROW_SETTLE_MS = 300;

const ROWS: { label: string; detail: string; icon: typeof IconPencil; receipt?: React.ReactNode }[] = [
  { label: "Writing instructions", detail: "Design system drift", icon: IconPencil },
  {
    label: "Searching skills",
    detail: "design systems, Figma, iOS",
    icon: IconPuzzle,
    receipt: <ToolCallCount>6 found</ToolCallCount>,
  },
  {
    label: "Checking connectors",
    detail: "Figma, GitHub, Linear",
    icon: IconPlug,
    receipt: <ToolIconRow toolIds={["figma", "github", "linear"]} />,
  },
];

// Step 0 is reasoning; 1..2n are the rows, odd running and even settled; 2n+1
// is the message.
const MESSAGE_STEP = ROWS.length * 2 + 1;

function TurnPreview() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (step >= MESSAGE_STEP) return;
    const ms = step === 0 ? REASONING_MS : step % 2 === 1 ? ROW_RUN_MS : ROW_SETTLE_MS;
    const id = window.setTimeout(() => setStep((s) => s + 1), ms);
    return () => window.clearTimeout(id);
  }, [step]);
  const revealed = useTextStream(SAMPLE_LENGTH, { active: step >= MESSAGE_STEP });

  const rowsOut = step === 0 ? 0 : Math.min(Math.ceil(step / 2), ROWS.length);
  return (
    <div className="flex flex-col gap-2">
      {step === 0 && <ReasoningBlock />}
      {rowsOut > 0 && (
        <div className="flex flex-col items-start gap-2">
          {ROWS.slice(0, rowsOut).map((row, i) => {
            const status: ToolCallStatus = step === i * 2 + 1 ? "running" : "done";
            return (
              <ToolCallRow
                key={row.label}
                status={status}
                icon={row.icon}
                label={row.label}
                detail={row.detail}
                receipt={row.receipt}
                shimmerCycleMs={ROW_RUN_MS * 4}
              />
            );
          })}
        </div>
      )}
      {step >= MESSAGE_STEP && <StreamingMessage paragraphs={SAMPLE} revealed={revealed} />}
    </div>
  );
}

export default function AgentStreamPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-8 py-12">
        <header className="flex flex-col gap-2">
          <Overline>Thread · the streaming turn</Overline>
          <h1 className="font-heading text-2xl">The agent, working</h1>
          <p className="max-w-content text-sm text-muted-foreground">
            Each block below is the live component. Ground truth is a run captured off hyperagent.com on
            2026-09-10: no spinner anywhere, a label that shimmers while its work runs, and prose that
            simply arrives.
          </p>
        </header>

        <Section
          label="Tool calls"
          blurb="Running, done with a count, done with the tools it touched, interrupted by Stop, and failed. Running and done are one row: the label stops shimmering and the receipt lands."
        >
          <Measures>
            <ToolCallStates />
          </Measures>
        </Section>

        <Section
          label="Reasoning"
          blurb="The first thing a turn shows, until its first tool call replaces it. Nothing to read yet, so two bars hold the place."
        >
          <Measures>
            <ReasoningBlock />
          </Measures>
        </Section>

        <Section
          label="The message, arriving"
          blurb="Whole words at about 110 characters a second on a seeded rhythm, so a replay stutters in the same places. No caret and no fade."
        >
          <Measures>
            <Replayable>{(run) => <StreamingDemo key={run} />}</Replayable>
          </Measures>
        </Section>

        <Section
          label="The composer, while it works"
          blurb="The strip the composer grows while a turn runs. Stop takes it away; the box is simply one row shorter again."
        >
          <Measures>
            <WorkingComposer />
          </Measures>
        </Section>

        <Section
          label="In order"
          blurb="Reasoning, three tool calls stacked, then the message, at the timings the signup flow uses."
        >
          <Measures>
            <Replayable>{(run) => <TurnPreview key={run} />}</Replayable>
          </Measures>
        </Section>
      </div>
    </div>
  );
}
