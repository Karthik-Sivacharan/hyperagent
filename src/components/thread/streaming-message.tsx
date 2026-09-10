"use client";

import { Fragment, useEffect, useRef, useState } from "react";

import { PROSE } from "@/components/thread/assistant-message";
import { cn } from "@/lib/utils";

// An assistant message that is still arriving.
//
// GROUND TRUTH is the live run in docs/reference/overlays/
// thread-streaming-live.html (2026-09-10). The product streams its answer as
// plain markdown into the same prose block a finished message uses: words
// appear in bursts at the end of the text, and that is all. No caret, no
// per-word fade, no cursor block, nothing that animates. The only difference
// between a message arriving and a message that has arrived is that the first
// is shorter and has no hover actions yet.
//
// So this is AssistantMessage's markup with the actions left off, rendering
// a prefix of its text. The text is data (paragraphs of segments, some of them
// strong), not markdown: the mock copy only ever needs bold, which is the same
// call rich-text.tsx made for the finished messages.
//
// WHOLE WORDS ONLY. The pace comes from `useTextStream`, which knows a
// character count and nothing else, so the renderer snaps each cut back to
// the last word boundary before it paints. Half a word at the end of a line is
// the one streaming artefact that reads as broken rather than live — "Figma
// libr" — and it also reflows: the fragment fits on the line, the finished
// word does not, and it jumps down a line a moment later. Snapping costs a
// word of latency and removes both.

export type StreamSegment = { text: string; strong?: boolean };
export type StreamParagraph = StreamSegment[];

/** Characters in the whole message, paragraphs end to end, no separators. */
export function streamLength(paragraphs: StreamParagraph[]): number {
  let total = 0;
  for (const paragraph of paragraphs) for (const segment of paragraph) total += segment.text.length;
  return total;
}

/**
 * The furthest point at or before `revealed` where a word has just finished:
 * after whitespace, or at the end of a paragraph (a paragraph break is a word
 * break even though no space is stored for it). Past the end is the end.
 */
function snapToWord(paragraphs: StreamParagraph[], revealed: number): number {
  let offset = 0;
  let best = 0;
  for (const paragraph of paragraphs) {
    for (const segment of paragraph) {
      for (let i = 0; i < segment.text.length; i++) {
        if (offset + i + 1 > revealed) return best;
        if (/\s/.test(segment.text[i])) best = offset + i + 1;
      }
      offset += segment.text.length;
    }
    // Every character of this paragraph is out, so its end is a boundary.
    best = offset;
  }
  return best;
}

export function StreamingMessage({
  paragraphs,
  revealed,
  className,
}: {
  paragraphs: StreamParagraph[];
  /** Characters shown, across paragraphs in order. Snapped to whole words. */
  revealed: number;
  className?: string;
}) {
  const total = streamLength(paragraphs);
  const cut = revealed >= total ? total : snapToWord(paragraphs, revealed);

  // A paragraph is not rendered until its first word is, so an arriving
  // message never carries an empty `my-2` box that would open a gap the text
  // has not earned yet.
  const shown: React.ReactNode[] = [];
  let left = cut;
  paragraphs.forEach((paragraph, p) => {
    if (left <= 0) return;
    const parts: React.ReactNode[] = [];
    paragraph.forEach((segment, s) => {
      if (left <= 0) return;
      const text = segment.text.slice(0, left);
      left -= text.length;
      // A strong run cut in half is still strong: the weight belongs to the
      // words, not to the run being complete.
      parts.push(segment.strong ? <strong key={s}>{text}</strong> : <Fragment key={s}>{text}</Fragment>);
    });
    shown.push(
      <div key={p} className="my-2">
        {parts}
      </div>,
    );
  });

  return (
    // AssistantMessage's classes, from docs/reference/pages/thread-detail.html,
    // with MessageActions left off: copy and the rest arrive with the finished
    // message, not with the first word of it. `aria-busy` until the last word
    // lands, so a screen reader that is reading the turn does not announce a
    // sentence it will have to announce again.
    <div
      className={cn("group relative flex min-w-0 gap-3 flex-row", className)}
      data-role="assistant"
      aria-busy={cut < total || undefined}
    >
      <div className="flex min-w-0 flex-col gap-1 w-full items-start">
        <div className="w-full max-w-full overflow-hidden break-words px-4 rounded-none py-1 pr-8 pl-0">
          <div>
            <div className={PROSE}>{shown}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== THE PACE ============================================================
//
// 110 characters a second, about twenty words: fast enough to feel like a
// model rather than a typist, slow enough that the eye can ride the end of the
// text instead of waiting for it to stop. The product's own run delivered its
// answer in network bursts of 50-70 characters roughly a second apart; that
// cadence is the transport showing through, not a choice, and a demo with no
// transport can afford the steadier version.
const DEFAULT_CHARS_PER_SECOND = 110;

// Each tick reveals 3-8 characters, one short word or most of a long one, and
// waits for that many characters' worth of time scaled by 0.55-1.45: an even
// spread either side of the stated pace, so the average holds and the rhythm
// does not. A metronome at exactly one word per tick reads as a typewriter.
const MIN_CHUNK = 3;
const MAX_CHUNK = 8;
const MIN_JITTER = 0.55;
const MAX_JITTER = 1.45;

/** mulberry32: a tiny seeded PRNG, so a replay of the same message has the same rhythm. */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * How many characters of a `total`-character message are out, advancing while
 * `active`. Pausing (`active` false) freezes it where it is, which is what
 * Stop means; a new `total` starts over from zero. `onDone` fires once, the
 * moment the last character is out.
 *
 * Deliberately NOT gated on `prefers-reduced-motion`. Text arriving is content,
 * not motion — nothing here transitions or animates, it only appends — and the
 * research pass set the precedent that a sequence carrying information keeps
 * its timing under reduce (research-signals.tsx).
 *
 * The rhythm is seeded from the length, so every run of a given message
 * stutters in the same places: a probe or a screenshot taken twice sees the
 * same frame, and a replay on /design/agent-stream is a real replay.
 */
export function useTextStream(
  total: number,
  {
    active,
    charsPerSecond = DEFAULT_CHARS_PER_SECOND,
    onDone,
  }: { active: boolean; charsPerSecond?: number; onDone?: () => void },
): number {
  const [revealed, setRevealed] = useState(0);

  // A different message is a fresh stream. Adjusted during render against the
  // length it was counting for, React's "adjusting state when a prop changes"
  // pattern, so there is no frame showing the old count against the new text.
  const [countingFor, setCountingFor] = useState(total);
  if (countingFor !== total) {
    setCountingFor(total);
    setRevealed(0);
  }

  const random = useRef<{ total: number; next: () => number } | null>(null);
  const doneFor = useRef<number | null>(null);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    if (!active || revealed >= total) return;
    if (!random.current || random.current.total !== total) random.current = { total, next: seeded(total * 2654435761) };
    const next = random.current.next;
    const chunk = MIN_CHUNK + Math.floor(next() * (MAX_CHUNK - MIN_CHUNK + 1));
    const jitter = MIN_JITTER + next() * (MAX_JITTER - MIN_JITTER);
    const wait = (chunk / charsPerSecond) * 1000 * jitter;
    const id = window.setTimeout(() => setRevealed((n) => Math.min(total, n + chunk)), wait);
    return () => window.clearTimeout(id);
  }, [active, revealed, total, charsPerSecond]);

  useEffect(() => {
    if (total > 0 && revealed >= total && doneFor.current !== total) {
      doneFor.current = total;
      onDoneRef.current?.();
    }
  }, [revealed, total]);

  return Math.min(revealed, total);
}
