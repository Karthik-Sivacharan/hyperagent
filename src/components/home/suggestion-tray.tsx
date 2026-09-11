"use client";

import { useId, useMemo, useRef, useState } from "react";
import {
  IconArrowUpLeft,
  IconBell,
  IconMessageCircle,
  IconRefresh,
  IconSettings,
  IconWorldSearch,
  IconX,
  type TablerIcon,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Overline } from "@/components/ui/overline";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ToolMark } from "@/components/signup/tool-icon-row";
import {
  HOME_SUGGESTIONS,
  SUGGESTION_SOURCES,
  SUGGESTION_TOPICS,
  type HomeSuggestion,
  type SuggestionGlyph,
  type SuggestionSource,
  type SuggestionTopic,
} from "@/lib/mock/home-suggestions";
import { cn } from "@/lib/utils";

// "Suggested for you": the tray under the home composer. The reference is the
// one under Manus's composer (manus.im/app, measured live 2026-09-11): a
// 32px header row with the label at its start and icon buttons at its end,
// then three cards of a tool row over the task at 13/18. Its two actions,
// refresh and dismiss, are here as they are there. The third is ours: TUNE,
// because a list that calls itself "for you" and cannot be told what you
// want is a list you can only dismiss.
//
// Tune is a gear, not the composer's sliders: the thread-settings pill a
// few pixels above already draws IconAdjustmentsHorizontal, and one glyph
// meaning two different settings panels in the same eyeful is worse than a
// plainer glyph. No sparkles, on request, and for the reason the signup
// retry gives: they promise a different KIND of answer, and this is the same
// list with a filter on it.
//
// Inside the panel, topics follow Spotify's home filter chips: "All" is on
// until you pick a topic, picking narrows, and emptying the picks is "All"
// again, so the panel can never be tuned into an empty topic set by accident.
// The sources are plain switches because they are independent facts about
// where a suggestion came from (your role, your company, your tools), not a
// choice between them. Every control re-filters the live list behind the
// panel; nothing here is decoration.

/** Cards per batch, and so per refresh. The reference shows three. */
const PER_BATCH = 3;

const GLYPHS: Record<SuggestionGlyph, TablerIcon> = {
  search: IconWorldSearch,
  bell: IconBell,
  message: IconMessageCircle,
};

type Tuning = { topics: SuggestionTopic[]; sources: SuggestionSource[] };

const ALL_SOURCES = SUGGESTION_SOURCES.map((source) => source.id);
const DEFAULT_TUNING: Tuning = { topics: [], sources: ALL_SOURCES };

function isDefaultTuning(tuning: Tuning) {
  return tuning.topics.length === 0 && tuning.sources.length === ALL_SOURCES.length;
}

function matches(suggestion: HomeSuggestion, tuning: Tuning) {
  const topicOk = tuning.topics.length === 0 || tuning.topics.includes(suggestion.topic);
  return topicOk && tuning.sources.includes(suggestion.source);
}

export function SuggestionTray({
  onPick,
  onDismiss,
}: {
  /** A card was chosen: put its prompt in the composer. */
  onPick: (prompt: string) => void;
  onDismiss: () => void;
}) {
  const headingId = useId();
  const [tuning, setTuning] = useState<Tuning>(DEFAULT_TUNING);
  const [batch, setBatch] = useState(0);
  // Half-turns of the refresh glyph. IconRefresh is point-symmetric, so each
  // press turns it 180deg and it lands on itself.
  const [turns, setTurns] = useState(0);
  // Bumped whenever the cards change because of something the reader did.
  // It keys the card row, so the entrance replays on refresh and on tune but
  // not on first paint, where the mark's own entrance is already playing.
  const [generation, setGeneration] = useState(0);

  const rowRef = useRef<HTMLDivElement>(null);

  const pool = useMemo(() => HOME_SUGGESTIONS.filter((s) => matches(s, tuning)), [tuning]);
  const batches = Math.ceil(pool.length / PER_BATCH);
  const start = batch * PER_BATCH;
  const shown = pool.slice(start, start + PER_BATCH);
  const canRefresh = batches > 1;

  function refresh() {
    setBatch((b) => (b + 1) % batches);
    setTurns((t) => t + 1);
    setGeneration((g) => g + 1);
  }

  function tune(next: Tuning) {
    setTuning(next);
    setBatch(0);
    setGeneration((g) => g + 1);
  }

  const status =
    pool.length === 0
      ? "No suggestions match these settings."
      : `Suggestions ${start + 1} to ${start + shown.length} of ${pool.length}.`;

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-1.5 px-3 pt-2 pb-3">
      {/* ps-4: the label starts where the card copy does (the tray's 12px
          plus a card's 16px). The reference sits it 4px short of that. */}
      <div className="flex h-8 items-center justify-between gap-4 ps-4">
        <h2 id={headingId} className="text-sm font-medium text-foreground">
          Suggested for you
        </h2>
        <div className="flex items-center gap-1">
          <TunePanel tuning={tuning} onTune={tune} />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Refresh suggestions"
                disabled={!canRefresh}
                onClick={refresh}
                className="text-muted-foreground hover:text-foreground"
              >
                <IconRefresh
                  className="size-4 motion-safe:transition-[rotate] motion-safe:duration-(--duration-slide) motion-safe:ease-in-out"
                  style={{ rotate: `${turns * 180}deg` }}
                  aria-hidden="true"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Dismiss suggestions"
                onClick={onDismiss}
                className="text-muted-foreground hover:text-foreground"
              >
                <IconX className="size-4" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Dismiss</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {pool.length === 0 ? (
        <div className="flex min-h-26 flex-col items-center justify-center gap-2 rounded-2xl bg-tint-5 px-4 text-center">
          <p className="text-md text-muted-foreground">No suggestions match these settings.</p>
          <Button
            variant="tint"
            size="xs"
            onClick={() => {
              tune(DEFAULT_TUNING);
              // This button leaves with the empty state, and a focused node
              // that unmounts drops focus to <body>; hand it to the first card.
              requestAnimationFrame(() => rowRef.current?.querySelector("button")?.focus());
            }}
          >
            Reset
          </Button>
        </div>
      ) : (
        // A snap row you swipe at phone width, where three 13px cards side by
        // side would be one word wide; the reference's three columns from sm.
        <div
          key={generation}
          ref={rowRef}
          className="-mx-3 flex snap-x snap-mandatory scroll-px-3 gap-3 overflow-x-auto px-3 scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0"
        >
          {shown.map((suggestion, index) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onPick={onPick}
              enterIndex={generation > 0 ? index : null}
            />
          ))}
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {status}
      </p>
    </section>
  );
}

// The entrance's timing is inline rather than `duration-*` / `ease-*`
// utilities: tw-animate-css reads the same --tw-duration and --tw-ease those
// set, so a class here would also slow the card's hover fill to the
// entrance's pace. Inline longhands beat the shorthand `animate-in` writes.
const enterTiming = (index: number) => ({
  animationDuration: "var(--duration-slow)",
  animationTimingFunction: "var(--ease-out-quart)",
  animationDelay: `calc(var(--duration-stagger) * ${index})`,
});

function SuggestionCard({
  suggestion,
  onPick,
  enterIndex,
}: {
  suggestion: HomeSuggestion;
  onPick: (prompt: string) => void;
  /** Position in the stagger, or null for no entrance (first paint). */
  enterIndex: number | null;
}) {
  const Glyph = suggestion.glyph ? GLYPHS[suggestion.glyph] : null;
  return (
    // The signup agent cards' fills (tint 7 at rest, 10 on hover), so the two
    // places this app offers you a starting point read as one family; the
    // reference's 16px inset and 13/18 copy; 18px corners inside the tray's
    // 12px of padding, which keeps them concentric with its 32.
    <Card
      asChild
      size="none"
      className={cn(
        "w-[78%] shrink-0 snap-start gap-2 rounded-2xl bg-tint-7 p-4 text-left shadow-none sm:w-auto",
        "outline-none transition-[background-color] duration-(--duration-fast) ease-out hover:bg-tint-10 focus-visible:ring-2 focus-visible:ring-ring",
        enterIndex !== null &&
          "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:fill-mode-both",
      )}
      style={enterIndex !== null ? enterTiming(enterIndex) : undefined}
    >
      <button type="button" onClick={() => onPick(suggestion.prompt)}>
        <span className="flex h-5 items-center justify-between gap-2">
          <span aria-hidden="true" className="flex items-center gap-1.5 [&_img]:size-5 [&_svg]:size-5">
            {Glyph ? (
              <Glyph className="text-muted-foreground" stroke={1.75} />
            ) : (
              suggestion.tools?.map((tool) => <ToolMark key={tool} id={tool} />)
            )}
          </span>
          <IconArrowUpLeft
            className="size-4 shrink-0 text-foreground-low transition-colors duration-(--duration-fast) group-hover/card:text-foreground"
            aria-hidden="true"
          />
        </span>
        <span className="line-clamp-3 text-md text-foreground">{suggestion.title}</span>
      </button>
    </Card>
  );
}

// The chip variant's resting fill is `chip`, which in dark is the popover's
// own surface, so an unpicked topic read as bare text beside the ink of a
// picked one. A tint keeps every option a visible pill, as Spotify's are;
// picked stays the variant's ink.
const TOPIC_CHIP = "bg-tint-10 hover:bg-tint-15";

function TunePanel({ tuning, onTune }: { tuning: Tuning; onTune: (next: Tuning) => void }) {
  const idBase = useId();
  const tuned = !isDefaultTuning(tuning);
  // Radix returns focus to the trigger on close, and the trigger is also a
  // tooltip trigger, so a mouse close would leave the tooltip standing open
  // on a button nobody is pointing at — the stuck tooltip dropdown-menu.tsx
  // fixed for the composer pills. A keyboard close keeps the return, which
  // is where a keyboard user needs to land.
  const closedByPointer = useRef(false);
  // Reset disables itself (nothing left to reset), and a focused button that
  // becomes disabled drops focus to <body>: the send arrow's trap, recorded
  // in HANDOFF. Focus lands on "All", the state Reset just restored.
  const allRef = useRef<HTMLButtonElement>(null);

  function toggleTopic(topic: SuggestionTopic) {
    const topics = tuning.topics.includes(topic)
      ? tuning.topics.filter((t) => t !== topic)
      : [...tuning.topics, topic];
    onTune({ ...tuning, topics });
  }

  function setSource(source: SuggestionSource, on: boolean) {
    const sources = on
      ? ALL_SOURCES.filter((s) => s === source || tuning.sources.includes(s))
      : tuning.sources.filter((s) => s !== source);
    onTune({ ...tuning, sources });
  }

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Tune suggestions"
              // Tuned reads one tier up, so a filtered list is never
              // mistaken for the whole one.
              className={cn("hover:text-foreground", tuned ? "text-foreground" : "text-muted-foreground")}
            >
              <IconSettings className="size-4" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Tune suggestions</TooltipContent>
      </Tooltip>
      <PopoverContent
        align="end"
        className="w-76 p-3"
        onPointerDownOutside={() => {
          closedByPointer.current = true;
        }}
        onEscapeKeyDown={() => {
          closedByPointer.current = false;
        }}
        onCloseAutoFocus={(event) => {
          if (closedByPointer.current) event.preventDefault();
          closedByPointer.current = false;
        }}
      >
        <div className="flex h-7 items-center justify-between gap-3 ps-1">
          <p className="text-sm font-medium text-foreground">Tune suggestions</p>
          <Button
            variant="ghost"
            size="xs"
            disabled={!tuned}
            onClick={() => {
              onTune(DEFAULT_TUNING);
              allRef.current?.focus();
            }}
          >
            Reset
          </Button>
        </div>

        <Overline className="mt-3 ps-1">Topics</Overline>
        <div role="group" aria-label="Topics" className="mt-2 flex flex-wrap gap-1.5">
          <Button
            ref={allRef}
            variant="chip"
            size="xs"
            aria-pressed={tuning.topics.length === 0}
            onClick={() => onTune({ ...tuning, topics: [] })}
            className={TOPIC_CHIP}
          >
            All
          </Button>
          {SUGGESTION_TOPICS.map((topic) => (
            <Button
              key={topic.id}
              variant="chip"
              size="xs"
              aria-pressed={tuning.topics.includes(topic.id)}
              onClick={() => toggleTopic(topic.id)}
              className={TOPIC_CHIP}
            >
              {topic.label}
            </Button>
          ))}
        </div>

        <Overline className="mt-4 ps-1">Based on</Overline>
        <div className="mt-1 flex flex-col">
          {SUGGESTION_SOURCES.map((source) => {
            const id = `${idBase}-${source.id}`;
            return (
              <div key={source.id} className="flex items-center justify-between gap-3 rounded-md py-1.5 ps-1">
                <Label htmlFor={id} className="flex min-w-0 flex-col items-start gap-0 font-normal">
                  <span className="text-sm text-foreground">{source.label}</span>
                  <span className="max-w-full truncate text-xs text-muted-foreground">{source.detail}</span>
                </Label>
                <Switch
                  id={id}
                  size="sm"
                  checked={tuning.sources.includes(source.id)}
                  onCheckedChange={(on) => setSource(source.id, on)}
                />
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
