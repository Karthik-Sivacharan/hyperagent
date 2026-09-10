"use client";

import { useCallback, useEffect, useState } from "react";

import { ackFor, type AgentAck, type AgentScript, type SkillsAnswer, type StreamRow } from "@/lib/mock/agent-stream";

// The sequencer for the agent's first turn: what is on screen at each moment
// after send, and nothing about how it is drawn (agent-turn.tsx does that).
//
// It is useResearchSequence's shape one screen later, for the same reasons:
// one timeout per step rather than an interval, so the last step schedules
// nothing and the sequence stops on its own; `active` rather than a mount,
// because the turn has to be in the DOM (the probe reads its state) from the
// frame the conversation lands; and NOT gated on `prefers-reduced-motion`,
// because the order and pace of what the agent did is information, not motion.
// Under reduce only the entrances go.
//
// The prose is the one step with no fixed length: it takes as long as the text
// takes to stream (thread/streaming-message.tsx's useTextStream), so the turn
// hands that step to its renderer and waits for `onProseDone`.

// ===== TIMING ==============================================================
//
// Measured against the live product (2026-09-10) and then compressed, because
// a demo is not a real run. The product took ~5s of reasoning, ~6s per tool
// call and ~13s of prose for a two-sentence question with one web search; a
// signup screen that made someone watch 30 seconds after a 9.3s research pass
// would be asking for patience it has not earned. What survives the
// compression is the SHAPE: a pause that is visibly thinking, then work in
// named steps, then words.

/** From the conversation landing to the first block of the turn. The user's
 *  message enters at --duration-move (220ms, once the picked card has
 *  settled), and the turn starts 160ms behind it, so the two arrive as a
 *  message and a reply rather than as one block fading in together. */
const LEAD_MS = 380;

/** "Reasoning…" with no text under it. Long enough to read as a pause before
 *  work, short enough that it is never the longest thing on screen. */
const REASONING_MS = 1200;

// One tool row: working, then settled. 1100 is loading-step.tsx's STEP_MS, the
// flow's own tempo for "one thing being done"; the research pass stretched it
// to 1400 because those rows stood for network calls to strangers' servers,
// and these stand for the agent's own bookkeeping, which is quicker. The
// settled beat is what makes completion READABLE (research-signals.tsx has the
// full argument): without it the shimmer stops and the next row arrives in the
// same frame, and "it finished" never happens on screen.
export const ROW_RUN_MS = 1100;
const ROW_SETTLE_MS = 300;

/** Between the prose finishing and the question arriving: the sentence that
 *  leads into it ends on a colon, and the card should land as its answer. */
const QUESTION_LEAD_MS = 300;

export type TurnState = "working" | "waiting" | "done" | "stopped";

/** Structurally thread/tool-call-row.tsx's ToolCallStatus, minus "failed",
 *  which nothing in this script produces. */
export type RowStatus = "running" | "done" | "interrupted";

export type ShownRow = { row: StreamRow; status: RowStatus };

export type AgentStream = {
  state: TurnState;
  /** The reasoning block, which gives way to the first row rather than
   *  collapsing into a "Reasoned" line: with no text to show there is nothing
   *  to collapse, and the live product simply replaces it. */
  showReasoning: boolean;
  rows: ShownRow[];
  /** The prose has begun (render it) … */
  proseStarted: boolean;
  /** … and is still streaming (keep revealing it). */
  proseActive: boolean;
  questionShown: boolean;
  answer: SkillsAnswer | null;
  ack: {
    reply: AgentAck;
    row: ShownRow | null;
    proseStarted: boolean;
    proseActive: boolean;
  } | null;
  /** One short phrase for the polite live region: what the agent is doing. */
  activity: string;
  onProseDone: () => void;
  onAckProseDone: () => void;
  respond: (answer: SkillsAnswer) => void;
  stop: () => void;
};

export function useAgentStream(script: AgentScript | null, active: boolean): AgentStream {
  const rowCount = script?.rows.length ?? 0;
  // -1 lead · 0 reasoning · 1..2R rows (odd running, even settled) ·
  // 2R+1 prose · 2R+2 question lead · 2R+3 question (terminal until answered).
  const PROSE = rowCount * 2 + 1;
  const QUESTION_LEAD = PROSE + 1;
  const QUESTION = PROSE + 2;
  const [step, setStep] = useState(-1);

  // The reply to the answer: -1 none · 0 lead · 1 row running · 2 row settled
  // · 3 prose · 4 done. A skip has no row and goes from the lead to prose.
  const [answer, setAnswer] = useState<SkillsAnswer | null>(null);
  const [ackStep, setAckStep] = useState(-1);
  const [stopped, setStopped] = useState(false);

  const reply = answer && script ? ackFor(answer, script.agentName) : null;
  const ackHasRow = Boolean(reply?.row);

  useEffect(() => {
    if (!active || !script || stopped) return;
    if (step >= PROSE && step !== QUESTION_LEAD) return; // prose waits on its renderer; the question waits on the reader
    const ms =
      step < 0
        ? LEAD_MS
        : step === 0
          ? REASONING_MS
          : step === QUESTION_LEAD
            ? QUESTION_LEAD_MS
            : (step - 1) % 2 === 0
              ? ROW_RUN_MS
              : ROW_SETTLE_MS;
    const id = window.setTimeout(() => setStep((s) => s + 1), ms);
    return () => window.clearTimeout(id);
  }, [active, script, stopped, step, PROSE, QUESTION_LEAD]);

  useEffect(() => {
    if (ackStep < 0 || stopped || ackStep >= 3) return;
    const ms = ackStep === 0 ? LEAD_MS : ackStep === 1 ? ROW_RUN_MS : ROW_SETTLE_MS;
    const next = ackStep === 0 && !ackHasRow ? 3 : ackStep + 1;
    const id = window.setTimeout(() => setAckStep(next), ms);
    return () => window.clearTimeout(id);
  }, [ackStep, stopped, ackHasRow]);

  const onProseDone = useCallback(() => {
    setStep((s) => (s === PROSE ? QUESTION_LEAD : s));
  }, [PROSE, QUESTION_LEAD]);

  const onAckProseDone = useCallback(() => {
    setAckStep((s) => (s === 3 ? 4 : s));
  }, []);

  const respond = useCallback(
    (next: SkillsAnswer) => {
      if (answer || stopped) return;
      setAnswer(next);
      setAckStep(0);
    },
    [answer, stopped],
  );

  const stop = useCallback(() => setStopped(true), []);

  // ----- what is on screen, derived ------------------------------------------
  const rows: ShownRow[] = [];
  if (script) {
    const reached = Math.min(Math.max(Math.ceil(step / 2), 0), rowCount);
    for (let i = 0; i < reached; i++) {
      const running = step === i * 2 + 1;
      rows.push({ row: script.rows[i], status: running ? (stopped ? "interrupted" : "running") : "done" });
    }
  }

  // Not `&& !stopped`: the step cannot reach the question after a stop (the
  // sequencer bails), and a card that was already answered has to survive a
  // stop pressed during the reply to it.
  const questionShown = step >= QUESTION;
  const ackRowStatus: RowStatus | null =
    reply?.row && ackStep >= 1 ? (ackStep === 1 ? (stopped ? "interrupted" : "running") : "done") : null;

  const ack =
    reply && ackStep >= 0
      ? {
          reply,
          row: reply.row && ackRowStatus ? { row: reply.row, status: ackRowStatus } : null,
          proseStarted: ackStep >= 3,
          proseActive: ackStep === 3 && !stopped,
        }
      : null;

  const state: TurnState = stopped
    ? "stopped"
    : ackStep >= 4
      ? "done"
      : answer
        ? "working"
        : questionShown
          ? "waiting"
          : "working";

  const runningRow = ack?.row?.status === "running" ? ack.row : rows.find((r) => r.status === "running");
  const activity =
    state === "stopped"
      ? "Stopped"
      : state === "waiting"
        ? "Waiting for your input"
        : state === "done"
          ? "Done"
          : step === 0
            ? "Reasoning"
            : runningRow
              ? runningRow.row.label
              : "Writing";

  return {
    state,
    showReasoning: step === 0 && !stopped,
    rows,
    proseStarted: step >= PROSE,
    proseActive: step === PROSE && !stopped,
    questionShown,
    answer,
    ack,
    activity,
    onProseDone,
    onAckProseDone,
    respond,
    stop,
  };
}
