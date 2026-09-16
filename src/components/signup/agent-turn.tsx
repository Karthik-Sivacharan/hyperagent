"use client";

import type { JSX } from "react";
import Image from "next/image";
import { IconDownload, IconFileText, IconPencil, IconPlug, IconPuzzle, type TablerIcon } from "@tabler/icons-react";

import { integrationLogos } from "@/components/settings/integration-logos";
import { SkillQuestionCard } from "@/components/signup/skill-suggestions/question-card";
import { ROW_RUN_MS, type AgentStream, type ShownRow } from "@/components/signup/use-agent-stream";
import { ReasoningBlock } from "@/components/thread/reasoning-block";
import { StreamingMessage, streamLength, useTextStream } from "@/components/thread/streaming-message";
import { ToolCallCount, ToolCallRow } from "@/components/thread/tool-call-row";
import { UserMessage } from "@/components/thread/user-message";
import { answerText, type AgentScript, type SkillsAnswer, type StreamRowIcon } from "@/lib/mock/agent-stream";
import { TOOL_LOGOS } from "@/lib/mock/tool-logos";
import { cn } from "@/lib/utils";

// The agent's first turn, drawn: what use-agent-stream.ts says is on screen,
// in the product's own blocks (src/components/thread/), in the product's own
// order. Ground truth is docs/reference/overlays/thread-streaming-live.html.
//
// ONE TURN GROUP, `space-y-2`, exactly the product's: reasoning, then the
// stack of tool rows, then the prose, then the question. The rows sit in their
// own `space-y-2 pb-4` stack as they do in the dump, so the prose under the
// last row gets 24px rather than 8 — the gap where the turn changes from
// "what I did" to "what I have to say".
//
// NO SPINNER ANYWHERE, the finding the whole flow is built on: the reasoning
// label and each running row shimmer, and that is the only working signal in
// the column. The composer's Working strip is the one other place that says
// the turn is live, and it is the place the product puts its Stop.
//
// Every block that arrives enters on `animate-fade-in` (opacity plus a 4px
// rise over --duration-slow on --ease-out-expo, globals.css): an entrance is
// ease-out, and 4px is a hint of direction, not a slide. The prose does NOT
// fade: the product streams text with no per-token fade and no caret, and
// fading every chunk would make the words shimmer when the label above them
// has just stopped. Under reduced motion every entrance is dropped and the
// sequence keeps its timing.

const ICONS: Record<StreamRowIcon, TablerIcon> = {
  reading: IconFileText,
  pencil: IconPencil,
  puzzle: IconPuzzle,
  plug: IconPlug,
  download: IconDownload,
};

const ENTER = "motion-safe:animate-fade-in";

// One crossing of the label per running phase, the rule research-signals.tsx
// measured for its own rows: shimmer.ts's cycle holds two crossings of four
// element-widths, so four times the running time lands exactly one inside it.
const ROW_SHIMMER_CYCLE_MS = ROW_RUN_MS * 4;

const inlineLogos: Record<string, (() => JSX.Element) | undefined> = integrationLogos;

/**
 * The connectors receipt: the product's favicon stack from the live capture
 * (16px marks, `-space-x-1`, each on its own small ground with a hairline),
 * NOT the tile group the agent cards wear. That group is a framed object, and
 * a frame inside the row's own pill is a box in a box on a 28px line; the
 * product's stack has no frame of its own, only one ring per mark.
 *
 * Resolved the way tool-icon-row.tsx resolves a mark (the inline set from the
 * integrations page first, then the artwork manifest), and drawn at 12px on
 * the 16px ground so the ring never touches the logo. `aria-hidden`: the
 * row's own parameter already names every one of these in words.
 */
function LogoStack({ toolIds }: { toolIds: string[] }) {
  const known = toolIds.filter((id) => inlineLogos[id] ?? TOOL_LOGOS[id]);
  return (
    <span aria-hidden="true" className="inline-flex items-center -space-x-1">
      {known.map((id) => {
        const Inline = inlineLogos[id];
        const file = TOOL_LOGOS[id];
        return (
          <span
            key={id}
            className="flex size-4 items-center justify-center rounded-sm bg-background ring-1 ring-border-subtle [&>svg]:size-3"
          >
            {Inline ? (
              <Inline />
            ) : file ? (
              <Image src={file.src} alt="" width={24} height={24} className="size-3 object-contain" />
            ) : null}
          </span>
        );
      })}
    </span>
  );
}

function Row({ shown }: { shown: ShownRow }) {
  const { row, status } = shown;
  const receipt =
    row.receipt?.kind === "count" ? (
      <ToolCallCount>{row.receipt.text}</ToolCallCount>
    ) : row.receipt?.kind === "tools" ? (
      <LogoStack toolIds={row.receipt.toolIds} />
    ) : undefined;
  return (
    // A block wrapper per row, as in the dump: the row itself is an
    // inline-flex span that hugs its text, and a pill stretched to the column
    // would be a bar, not a chip.
    <div className={cn("min-w-0", ENTER)}>
      <ToolCallRow
        label={row.label}
        detail={row.detail}
        status={status}
        icon={ICONS[row.icon]}
        receipt={receipt}
        shimmerCycleMs={ROW_SHIMMER_CYCLE_MS}
      />
    </div>
  );
}

export function AgentTurn({
  script,
  stream,
  sentAtLabel,
  onAnswer,
  settled = false,
  className,
}: {
  script: AgentScript;
  stream: AgentStream;
  /** The clock time the answer was given, stamped under its bubble. */
  sentAtLabel: string;
  /** The question card was answered: send it, then hand focus back. */
  onAnswer: (answer: SkillsAnswer) => void;
  /**
   * Draw every word of the prose at once instead of streaming it: a still
   * picture of a finished turn (the landing page's app window). Opt-in, so
   * the signup flow streams exactly as before.
   */
  settled?: boolean;
  className?: string;
}) {
  const streamed = useTextStream(streamLength(script.prose), {
    active: stream.proseActive && !settled,
    onDone: stream.onProseDone,
  });
  const revealed = settled ? streamLength(script.prose) : streamed;
  const ackProse = stream.ack?.reply.prose ?? [];
  const ackStreamed = useTextStream(streamLength(ackProse), {
    active: (stream.ack?.proseActive ?? false) && !settled,
    onDone: stream.onAckProseDone,
  });
  const ackRevealed = settled ? streamLength(ackProse) : ackStreamed;

  const interruptedRow =
    stream.rows.some((r) => r.status === "interrupted") || stream.ack?.row?.status === "interrupted";

  return (
    <div
      data-agent-turn=""
      data-state={stream.state}
      aria-busy={stream.state === "working"}
      className={cn("space-y-2", className)}
    >
      {/* What the agent is doing, in words, for a screen reader: the shimmer
          is the only visible signal and it says nothing to anyone who cannot
          see it. Polite, one phrase at a time, the same device as the
          research slot's `role="status"`. */}
      <p className="sr-only" role="status" aria-live="polite">
        {stream.activity}
      </p>

      {stream.showReasoning && <ReasoningBlock className={ENTER} />}

      {stream.rows.length > 0 && (
        <div className="space-y-2 pb-4">
          {stream.rows.map((shown) => (
            <Row key={shown.row.id} shown={shown} />
          ))}
        </div>
      )}

      {stream.proseStarted && <StreamingMessage paragraphs={script.prose} revealed={revealed} />}

      {/* The question the turn has been leading up to, as the product asks
          one mid-turn: the block HANDOFF calls variant A, unwired in a6b87b6
          because it reserved 300px of a cell that had to fit the viewport.
          Here it arrives after send, in a thread that scrolls, so the reason
          it was taken out no longer applies. */}
      {stream.questionShown && (
        <div className={cn("pt-2", ENTER)}>
          <SkillQuestionCard
            question={script.question}
            onAnswer={onAnswer}
            answered={stream.answer !== null}
          />
        </div>
      )}

      {stream.answer && stream.ack && (
        <>
          <div className={ENTER}>
            <UserMessage id="signup-skills-answer" text={answerText(stream.answer)} sentAtLabel={sentAtLabel} />
          </div>
          {stream.ack.row && (
            <div className="space-y-2 pb-4">
              <Row shown={stream.ack.row} />
            </div>
          )}
          {stream.ack.proseStarted && <StreamingMessage paragraphs={ackProse} revealed={ackRevealed} />}
        </>
      )}

      {/* Stop with no row running (the reasoning pause, or mid-sentence) has
          no row to wear the product's "Interrupted", so the turn says it once,
          in the same words and the same quiet italic, where the next block
          would have been. */}
      {stream.state === "stopped" && !interruptedRow && (
        <p className={cn("text-xs text-foreground-low italic", ENTER)}>Interrupted</p>
      )}
    </div>
  );
}
