"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { IconSearch, type TablerIcon } from "@tabler/icons-react";

import { ToolTile, ToolTileGroup } from "@/components/signup/tool-icon-row";
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
// summary line at the end carries all four marks at 16px in the tile group the
// agent cards already wear, which is where a logo is actually legible.
//
// HONESTY. At signup this account has connected nothing, so a row claiming to
// read a mailbox or a private repo would be a lie the screen cannot back up.
// All four sources below are public and reachable from an email domain alone:
// the company's own site, its app-store listing, its open roles, the open web.
// That is also why the summary says "public sources" out loud.

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
];

// ===== TIMING ==============================================================
//
// One signal is 1100ms, which is not a new number: it is loading-step.tsx's
// STEP_MS, the beat this branch already measured for "a short line read,
// understood and gone with room to spare". The two waits in the flow now run
// at the same tempo, which is the point — the second one should feel like the
// first one continuing, not a different machine.
//
// The 1100 splits into a running phase and a settled phase, and the settled
// phase is what makes completion READABLE. Without it the shimmer stops and
// the row leaves in the same frame, so "it finished" never happens on screen;
// with it, the label goes quiet, the card it paid for lands, and only then
// does the next source arrive. 300ms is --duration-slow, the product-UI
// ceiling in this system: long enough to register as an event, short enough
// that nobody waits through it.
const SIGNAL_RUN_MS = 800;
const SIGNAL_SETTLE_MS = 300;

// Dead air before the first row, held for exactly the screen's own crossfade
// (--duration-slow): the row should arrive on a screen that has finished
// arriving, not race it in. Same argument as LoadingStep's `leadMs`, one
// screen later.
const LEAD_MS = 300;

// Four signals at 1100 plus the 300ms lead is 4.7s of working state, which is
// the number the whole design is aimed at: long enough that four sources look
// like four pieces of work, short enough that nobody sits through it.

/** The last step index: two per signal, running then settled. */
const LAST_STEP = RESEARCH_SIGNALS.length * 2;

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
    // A card is paid for by the row that just went quiet, so the count steps
    // on the ODD half of each pair: 0, 1, 1, 2, 2, 3, 3, 4.
    resolved: step < 0 ? 0 : Math.floor((step + 1) / 2),
    done,
  };
}

// ===== THE SHIMMER =========================================================
//
// The product's running label is NOT a keyframe on a solid element. It is a
// two-layer background clipped to the glyphs: a flat base in the label's own
// colour, and above it a soft band that travels. Reproduced here on this
// repo's own `@keyframes shimmer` (src/app/globals.css), which moves
// `background-position` from -200% to 200%.
//
// Those keyframes want a 200% tile and the default `repeat`, and then the
// arithmetic comes out exact: 400% of position travel across a 200%-wide tile
// is four element-widths, which is two whole tiles, so the loop closes on
// itself with no seam and the band crosses the text exactly twice a cycle.
// `reverse` in the shorthand is what turns the sweep left-to-right, with the
// reading, instead of against it.
//
// The band colour is always one tier away from the base, in whichever
// direction there is room: a muted label brightens towards `foreground`, and a
// `foreground` heading is swept by --shimmer-sweep (the repo's own token, a
// 40% neutral) which dims it. Using --shimmer-sweep on the muted label as well
// would have been the literal reuse, and it measured worse: a 40% neutral over
// a muted grey is a smaller step than the antialiasing, so the band vanished.
//
// EVERY part of this is behind `motion-safe:`, including `bg-clip-text` and
// `text-transparent` — under reduce the treatment is not applied at all, which
// is the only safe way to do it: a transparent label with no background
// painted behind it is an invisible label. That is also why the gradient
// arrives as a custom property rather than an inline `background-image`: an
// inline style outranks every class, so a `motion-reduce:` override could
// never take it back off.
export const SHIMMER =
  "motion-safe:bg-clip-text motion-safe:text-transparent motion-safe:[background-image:var(--sweep-image)] motion-safe:[background-size:200%_100%] motion-safe:animate-[shimmer_var(--sweep-cycle)_linear_infinite_reverse]";

// 3.2s a cycle is two passes at 1.6s each, and 1.6s is the pass length that
// puts one whole crossing of the label inside an 800ms running phase (the band
// covers four element-widths per cycle, so it clears one width in a quarter of
// it). The product runs its own tool labels at a 3s pass, twice as slow —
// which it can afford, because a real tool call lasts seconds; a sweep that
// never finishes inside the life of the row reads as a stall rather than work.
const SHIMMER_CYCLE_MS = 3200;

// 2px of band per character, the ratio measured off the dump: `--spread: 34px`
// on "Searching the web", which is 17 characters. It is a ratio rather than a
// constant because the tile scales with the element — a fixed spread would be
// a hard-edged flick on a short label and an almost-flat wash on a long one.
const SPREAD_PER_CHAR_PX = 2;

/**
 * The custom properties the class above reads. `chars` is the length of the
 * text being swept, `sweep` the band colour and `base` the label's resting
 * colour — both as `var(--color-…)` strings, never literals, so the pair
 * follows the theme.
 */
export function sweepStyle(chars: number, sweep: string, base: string): React.CSSProperties {
  const spread = `${chars * SPREAD_PER_CHAR_PX}px`;
  return {
    "--sweep-cycle": `${SHIMMER_CYCLE_MS}ms`,
    "--sweep-image": `linear-gradient(90deg, transparent calc(50% - ${spread}), ${sweep} 50%, transparent calc(50% + ${spread})), linear-gradient(${base}, ${base})`,
  } as React.CSSProperties;
}

// ===== THE ROW =============================================================

/** 12px, whichever source it came from. */
function SignalMark({ signal, running }: { signal: ResearchSignal; running: boolean }) {
  if (signal.logoSrc) {
    // A logo cannot take a tint, so on these three rows the shimmer is the
    // whole running signal. 24 is the 2x of a 12px mark.
    return (
      <Image
        src={signal.logoSrc}
        alt=""
        width={24}
        height={24}
        className="mr-1 size-3 shrink-0 object-contain"
      />
    );
  }
  const Icon = signal.icon;
  if (!Icon) return null;
  // The product tints its running glyph and drops the tint on completion. Ink
  // rather than the accent: brand rule 3 spends this screen's one tangerine on
  // the composer's send arrow, and a working indicator is not an action.
  return (
    <Icon
      className={cn(
        "mr-1 size-3 shrink-0 transition-colors duration-(--duration-normal) ease-out motion-reduce:transition-none",
        running ? "text-foreground" : "text-foreground-low",
      )}
      aria-hidden="true"
    />
  );
}

function SignalRow({ signal, running }: { signal: ResearchSignal; running: boolean }) {
  return (
    // The product's row, measured: 28px tall, 8px of side padding, a 10px
    // radius, one hairline edge, a fill one step off the canvas. Its greys
    // become this system's materials — `bg-tint-10` and `shadow-edge`, the
    // same pair the tool tile group on the cards below wears, and `rounded-lg`
    // because brand.css names 10px "inline reference chips" and that is
    // precisely what this is.
    <span className="inline-flex h-7 min-w-0 max-w-full items-center rounded-lg bg-tint-10 px-2 text-xs text-muted-foreground shadow-edge">
      <SignalMark signal={signal} running={running} />
      <span
        className={cn("shrink-0 font-medium", running && SHIMMER)}
        style={
          running
            ? sweepStyle(signal.label.length, "var(--color-foreground)", "var(--color-muted-foreground)")
            : undefined
        }
      >
        {signal.label}
      </span>
      <span className="mx-1.5 shrink-0 text-foreground-low" aria-hidden="true">
        ·
      </span>
      <span className="truncate text-foreground-low">{signal.detail}</span>
    </span>
  );
}

/** "Trainwell, the App Store, LinkedIn and the web". */
function describeSources(): string {
  const names = RESEARCH_SIGNALS.map((signal) => signal.source);
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function SignalSummary() {
  return (
    // Not a pill. The rows are pills because they are live; this is the
    // receipt, so it drops the frame and keeps only the marks — the tile group
    // the agent cards already carry, at the 16px where a logo is legible,
    // with the count beside it. "Public" is doing honest work: nothing is
    // connected yet, and this line is the screen saying so.
    <span className="flex items-center gap-2">
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
      <span className="text-xs text-foreground-low">
        Read {RESEARCH_SIGNALS.length} public sources
      </span>
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
  const { index, running, started, done } = state;

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
      <span className={cn(SLOT_ITEM, done ? SLOT_SHOWN : SLOT_HIDDEN)} aria-hidden={done ? undefined : true}>
        <SignalSummary />
      </span>
    </div>
  );
}
