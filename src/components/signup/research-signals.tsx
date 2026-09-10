"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { IconRefresh, IconSearch, type TablerIcon } from "@tabler/icons-react";

import { ToolTile, ToolTileGroup } from "@/components/signup/tool-icon-row";
import { ToolCallRow } from "@/components/thread/tool-call-row";
import { Button } from "@/components/ui/button";
import { SIGNUP_COMPANY, SIGNUP_PERSON } from "@/lib/mock/signup-identity";
import { TOOL_LOGOS } from "@/lib/mock/tool-logos";
import { cn } from "@/lib/utils";

// The working state of the chat step: what the screen is doing while the four
// agent cards are still blank.
//
// GROUND TRUTH is docs/reference/overlays/thread-streaming-turn.html, captured
// off hyperagent.com on 2026-09-09. The product's running turn has NO spinner
// anywhere — no ring, no border-spin, no loader glyph. A tool call is one 28px
// row: a 12px icon, a 12/16 label at weight 500, a middot, then a truncated
// parameter on a lower text tier. Running and complete are the SAME row: the
// label shimmers and the icon takes a tint while it runs, and both stop when
// it lands. The words never change to the past tense. Everything below keeps
// that, in the brand's materials instead of the site's greys.
//
// WHAT DEPARTS, and why. The product stacks its rows and keeps every resolved
// one; this screen shows ONE row at a time in a fixed 28px slot, and the
// finished stack is a single quiet line in the same slot. Two reasons, both
// binding here and neither true in a thread:
//
//   1. Every screen in this flow shares one grid cell and centres inside it,
//      so ANY height change re-centres the column and drags the heading and
//      the flying mark with it (signup-screen.tsx). A stack that grows by a
//      row three times and then collapses by three is four vertical drifts,
//      and drift under the mark is the one failure this branch cannot ship.
//      A slot that is 28px from the first frame to the last has none.
//   2. The end state is the four cards. Four resolved rows of 12px chrome
//      above them is not a receipt, it is a second column of text.
//
// Nothing is lost by it: each source is named while it is being read, and the
// summary line at the end carries all five marks at 16px in the tile group the
// agent cards already wear, which is where a logo is actually legible.
//
// HONESTY. At signup this account has connected nothing, so a row claiming to
// read a mailbox or a private repo would be a lie the screen cannot back up.
// All five sources below are public and reachable from an email domain alone:
// the company's own site, its app-store listing, its open roles, the open web,
// and a neutral index over that same web.
//
// The summary used to say "public sources" out loud and now just says
// "sources". The constraint has not moved an inch — every row above is still
// public and a private one still may not be added here — but the word was
// doing its work twice: the marks in that line ARE the receipt, and a viewer
// who can see the App Store and LinkedIn sitting there does not need to be
// told the reading was public. It was reassurance addressed to the builder
// rather than to the reader.

type ResearchSignal = {
  id: string;
  /** Present participle plus object, three words, sentence case, no period. */
  label: string;
  /** The one parameter after the middot, exactly as the product does it. */
  detail: string;
  /** The human name of the source, for the summary's label. */
  source: string;
  /** A real mark where the source is a product… */
  logoSrc?: string;
  /** …and a glyph where it is not. The open web has no logo. */
  icon?: TablerIcon;
};

const RESEARCH_SIGNALS: ResearchSignal[] = [
  {
    id: "site",
    label: "Fetching the site",
    detail: SIGNUP_COMPANY.domain,
    source: SIGNUP_COMPANY.name,
    logoSrc: SIGNUP_COMPANY.logoSrc,
  },
  {
    id: "listing",
    label: "Reading the listing",
    detail: `${SIGNUP_COMPANY.name}: Personal Training`,
    source: TOOL_LOGOS["app-store"].name,
    logoSrc: TOOL_LOGOS["app-store"].src,
  },
  {
    id: "roles",
    label: "Reading open roles",
    detail: `${SIGNUP_PERSON.role}, ${SIGNUP_COMPANY.name}`,
    source: TOOL_LOGOS.linkedin.name,
    logoSrc: TOOL_LOGOS.linkedin.src,
  },
  {
    // The product's own example row, glyph included: its "Searching the web"
    // call carries a search icon, not a logo, because the web is not a vendor.
    id: "web",
    label: "Searching the web",
    detail: `${SIGNUP_COMPANY.name} ${SIGNUP_COMPANY.tags[0].toLowerCase()} app`,
    source: "the web",
    icon: IconSearch,
  },
  {
    // Exa is a search index, so it sits next to the plain web search rather
    // than among the three first-party sources above — and it earns a separate
    // row instead of folding into that one because it answers a different
    // question. A keyword search finds the company; a neural index finds what
    // the company is LIKE, which is the only one of the five sources that can
    // say anything about a market rather than about a single record.
    //
    // Named by the action and not by the vendor, like every row above it: the
    // logo carries who, the label carries what. Still public, still reachable
    // from an email domain alone, so it keeps the honesty rule intact.
    id: "exa",
    label: "Finding similar companies",
    detail: `${SIGNUP_COMPANY.tags[0].toLowerCase()} apps like ${SIGNUP_COMPANY.name}`,
    source: TOOL_LOGOS.exa.name,
    logoSrc: TOOL_LOGOS.exa.src,
  },
];

// ===== TIMING ==============================================================
//
// One signal is 1800ms: 1400 working, 400 settled.
//
// It was 1100 first — loading-step.tsx's STEP_MS, so that the two waits in the
// flow would run at one tempo — and at four sources that put the whole pass at
// 4.7s, which read as too quick to be four pieces of work. The tempo argument
// was the wrong one anyway: the first wait is an OAuth round trip and this one
// is four network calls to four strangers' servers, and a viewer who has just
// been told that expects the second to cost more than the first.
//
// The split into a running phase and a settled phase is what makes completion
// READABLE. Without it the shimmer stops and the row leaves in the same frame,
// so "it finished" never happens on screen; with it, the label goes quiet, the
// card it paid for lands, and only then does the next source arrive. The
// settled half grew with the running half so the beat keeps its shape.
const SIGNAL_RUN_MS = 1400;
const SIGNAL_SETTLE_MS = 400;

// Dead air before the first row, held for exactly the screen's own crossfade
// (--duration-slow): the row should arrive on a screen that has finished
// arriving, not race it in. Same argument as LoadingStep's `leadMs`, one
// screen later.
const LEAD_MS = 300;

// Five signals at 1800 plus the 300ms lead is 9.3s of working state. That is
// long for a screen with one line of text on it, and it is the point: the
// claim is that something went and read five places, and five places do not
// take a second and a half. The four cards filling in behind it are what makes
// the time legible rather than dead — at no moment is the screen only waiting.
//
// It was 7.5s at four sources. Adding Exa bought a fifth row at full price
// rather than squeezing the other four, because the row IS the evidence: five
// sources read in the time four used to take would quietly say that none of
// them cost anything. If the pass ever has to fit a budget, cut a source, not
// the milliseconds.
//
// Four cards against five signals, so ONE source has to pay for nothing, and
// it has to be the first rather than the last. Fetching the company's own site
// is the row that buys the ground everything else stands on and produces no
// suggestion by itself; the four after it each land a card, which keeps a card
// arriving on the FINAL row. The other way round — cards on the first four —
// leaves the last 1.8s with a shimmering label and a screen that is already
// finished behind it, which is the one thing this timing exists to avoid.

/** The last step index: two per signal, running then settled. */
const LAST_STEP = RESEARCH_SIGNALS.length * 2;

/** Cards on screen. Five signals pay for four of them; see the timing note. */
const CARD_COUNT = 4;

export type ResearchState = {
  /** Which signal the slot is showing. */
  index: number;
  /** …and whether it is still working, which is the shimmer's only input. */
  running: boolean;
  /** False until the lead has elapsed; the slot is empty before that. */
  started: boolean;
  /** How many cards have been paid for. */
  resolved: number;
  done: boolean;
  /** Run the whole pass again from the lead. See `SignalSummary`'s button. */
  restart: () => void;
};

/**
 * The sequencer. One timeout per step rather than an interval, so the last
 * step simply schedules nothing and the sequence stops on its own — the same
 * shape loading-step.tsx uses, and the same reason.
 *
 * `active` exists because ChatStep is mounted for the whole flow (it is one of
 * four screens sharing a grid cell, painted at zero opacity until its turn).
 * A sequence started at page load would have run itself out behind the sign-in
 * screen and the fourth screen would fade in already finished. LoadingStep
 * dodges this by being conditionally mounted; this screen cannot, because
 * mounting it late would change the shared cell's height mid-crossfade.
 *
 * Deliberately NOT gated on `prefers-reduced-motion`: under reduce the timing
 * stays exactly as it is and only the transitions go. The sequence is
 * information — which sources were read, in what order — and information is
 * not motion. The loading screen's status line already set that precedent.
 */
export function useResearchSequence(active: boolean): ResearchState {
  // -1 is the lead. 0..LAST_STEP-1 are the signals, even running, odd settled.
  const [step, setStep] = useState(-1);

  useEffect(() => {
    if (!active || step >= LAST_STEP) return;
    const ms = step < 0 ? LEAD_MS : step % 2 === 0 ? SIGNAL_RUN_MS : SIGNAL_SETTLE_MS;
    const id = window.setTimeout(() => setStep((s) => s + 1), ms);
    return () => window.clearTimeout(id);
  }, [active, step]);

  const done = step >= LAST_STEP;
  return {
    index: Math.min(Math.max(Math.floor(step / 2), 0), RESEARCH_SIGNALS.length - 1),
    running: step >= 0 && !done && step % 2 === 0,
    started: step >= 0,
    // A card is paid for by the row that just went quiet, so the count steps on
    // the ODD half of each pair — and one row behind, because the first source
    // buys none: 0, 0, 0, 1, 1, 2, 2, 3, 3, 4.
    resolved: Math.min(Math.max(Math.floor((step + 1) / 2) - 1, 0), CARD_COUNT),
    done,
    // Back to the lead, not to the first row: the replay should open with the
    // same beat of dead air the first run did, or the rows arrive on a screen
    // that is still clearing the old ones. Setting the step is enough to drive
    // it — the effect above is keyed on `step`, so it re-arms itself.
    restart: () => setStep(-1),
  };
}

// ===== THE SHIMMER =========================================================
//
// The device itself (the two-layer background clipped to the glyphs, and why
// every part of it sits behind `motion-safe:`) lives in
// src/components/thread/shimmer.ts now, because the streaming turn after send
// runs on it too and a thread component may not reach into the signup flow.
// Re-exported here so the heading in chat-step.tsx keeps its import.
//
// This screen's tempo is derived here and handed to the row: the band covers
// four element-widths per cycle, so it clears one width in a quarter of it,
// and a cycle of 4 × SIGNAL_RUN_MS puts exactly one whole crossing of the
// label inside the row's working phase. A sweep that never finishes inside the
// life of the row reads as a stall rather than as work, and one that finishes
// several times over reads as a barber's pole. At today's 1400ms run that is
// 5.6s, close to the product's own 3s pass now that the rows last long enough
// to afford it.
export { SHIMMER, sweepStyle } from "@/components/thread/shimmer";

const SHIMMER_CYCLE_MS = SIGNAL_RUN_MS * 4;

// ===== THE ROW =============================================================
//
// One source is one ToolCallRow (src/components/thread/tool-call-row.tsx):
// the product's tool-call idiom, extracted from this file so the streaming
// turn after send wears the same row. Running and settled are its "running"
// and "done", and neither carries a receipt here — the receipt for the whole
// pass is the summary line below.

function SignalRow({ signal, running }: { signal: ResearchSignal; running: boolean }) {
  return (
    <ToolCallRow
      label={signal.label}
      detail={signal.detail}
      status={running ? "running" : "done"}
      icon={signal.icon}
      logoSrc={signal.logoSrc}
      shimmerCycleMs={SHIMMER_CYCLE_MS}
    />
  );
}

/** "Trainwell, the App Store, LinkedIn and the web". */
function describeSources(): string {
  const names = RESEARCH_SIGNALS.map((signal) => signal.source);
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function SignalSummary({ onRestart }: { onRestart: () => void }) {
  return (
    // Not a pill. The rows are pills because they are live; this is the
    // receipt, so it drops the frame and keeps only the marks — the tile group
    // the agent cards already carry, at the 16px where a logo is legible,
    // with the count beside it.
    //
    // `w-full` so the retry can reach the right edge; the live rows above stay
    // `justify-self-start` and keep hugging their own text, because a pill
    // stretched to the column would be a bar, not a chip.
    //
    // NOTHING IN THIS SLOT TAKES A CONTAINER QUERY, and that is a measurement
    // rather than an oversight — the column is a container now (see the note
    // at the top of chat-step.tsx) and every part of this screen was checked
    // against it. Everything here is sized by its own contents and gives way
    // on its own: a live row hugs its text under a `max-w-full` cap with the
    // parameter after the middot on `truncate`, and the receipt is five 24px
    // tiles, a 12px count and a 24px control. Measured, the receipt wants
    // 245px and this slot only starts to overflow below 248px of column —
    // narrower than the column the shell can produce on a 320px phone, which
    // is 280 once the gutters are paid. There is no width a rule here could
    // usefully fire at. If the column is ever allowed below 248, the thing to
    // give way is the words "Read 5 sources": the marks ARE the receipt and
    // the retry is the only control in the slot.
    <span className="flex w-full items-center gap-2">
      <ToolTileGroup label={describeSources()}>
        {RESEARCH_SIGNALS.map((signal) => (
          <ToolTile key={signal.id}>
            {signal.logoSrc ? (
              <Image
                src={signal.logoSrc}
                alt=""
                width={32}
                height={32}
                className="size-4 object-contain"
              />
            ) : (
              signal.icon && <signal.icon className="text-muted-foreground" aria-hidden="true" />
            )}
          </ToolTile>
        ))}
      </ToolTileGroup>
      <span className="text-xs text-foreground-low">Read {RESEARCH_SIGNALS.length} sources</span>

      {/* The one way to disagree with the four cards without typing. It lives
          at the far edge of the receipt because that is what it acts on — the
          reading produced these four, so "read again" belongs on the reading's
          own line, not floating over the grid.

          IconRefresh, not IconSparkles or IconArrowsShuffle: sparkles would
          promise a different KIND of answer (a model thinking harder) when
          this is the same pass run twice, and shuffle would promise the same
          four in a new order. Refresh is the only one of the three that
          describes what actually happens.

          Ghost and 24px: it sits inside a 28px slot that must not grow, and
          the screen's one solid accent is already spent on the composer's
          send (brand rule 3). Quiet at rest on `foreground-low`, up one tier
          on hover — the same two-tier move the rows' own glyphs make. */}
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onRestart}
        aria-label="Read the sources again for new suggestions"
        className="ml-auto shrink-0 text-foreground-low hover:text-foreground"
      >
        <IconRefresh className="size-3.5" aria-hidden="true" />
      </Button>
    </span>
  );
}

// One 28px slot, one grid cell, everything stacked in it: the four rows and
// the summary. The cell is as tall as its tallest member and every member is
// 28px or less, so the slot is 28px for the life of the screen and nothing
// above or below it ever moves. Same device as the loading screen's status
// lines, for the same reason.
//
// The swap is sequential rather than a crossfade: the outgoing row fades over
// --duration-fast and the incoming one waits that long before starting. Two
// pills of different widths dissolving through each other is a mush at the
// right edge; one leaving and then one arriving is a swap, which is what it
// is. The two halves add up to 300ms, exactly the settled phase they sit in.
const SLOT_ITEM =
  "col-start-1 row-start-1 justify-self-start transition-opacity duration-(--duration-fast) ease-out motion-reduce:transition-none";
const SLOT_SHOWN = "opacity-100 delay-(--duration-fast) motion-reduce:delay-0";
const SLOT_HIDDEN = "pointer-events-none opacity-0";

export function ResearchSlot({ state, className }: { state: ResearchState; className?: string }) {
  const { index, running, started, done, restart } = state;

  return (
    // `aria-live="polite"` so each source is announced as it is read, and only
    // the live child is in the tree — the others are painted at zero opacity
    // and would otherwise all be read out at once. Same handling as the
    // loading screen's three lines.
    <div role="status" aria-live="polite" className={cn("grid h-7 w-full items-center", className)}>
      {RESEARCH_SIGNALS.map((signal, i) => {
        const live = started && !done && i === index;
        return (
          <span
            key={signal.id}
            className={cn(SLOT_ITEM, live ? SLOT_SHOWN : SLOT_HIDDEN)}
            aria-hidden={live ? undefined : true}
          >
            <SignalRow signal={signal} running={running && live} />
          </span>
        );
      })}
      {/* `justify-self-stretch` overrides the slot's `justify-self-start` for
          this member alone, so the receipt spans the column and its retry can
          sit at the far edge while the live rows keep hugging their text.

          `inert` as well as `aria-hidden`, which the rows above do not need:
          this is the only slot member holding a CONTROL, and an aria-hidden
          button is still in the tab order. Without it, tabbing during the pass
          lands on an invisible retry. */}
      <span
        className={cn(SLOT_ITEM, "w-full justify-self-stretch", done ? SLOT_SHOWN : SLOT_HIDDEN)}
        aria-hidden={done ? undefined : true}
        inert={!done}
      >
        <SignalSummary onRestart={restart} />
      </span>
    </div>
  );
}
