# The agent streams (2026-09-10)

Branch `feat/agent-stream`, worktree `.claude/worktrees/agent-stream`, dev server
on port 3100. Closes HANDOFF's first known gap ("There is no streaming assistant
turn") and re-wires the skills question that `a6b87b6` unwired.

## What send does today, and what it should do

Today: send brings the shell in around the conversation and then nothing
happens. All four cards stay, the brief sits in the composer, no agent runs.

After this branch: send is the moment the flow becomes a thread.

1. The three cards you did not pick leave. The one you picked stays, as the
   record of the choice (no card picked: all four leave).
2. Your brief leaves the composer and lands in the thread as your message.
3. The agent answers in the product's own streaming idiom: reasoning, then
   tool calls one after another, then prose, ending on a question: which
   skills should this agent start with (variant A, `SkillQuestionCard`, the
   block that was unwired for not fitting the pre-send cell).
4. Answering the question sends it, and the agent acknowledges in one short
   tool call and one sentence. Stop, at any point while it works, interrupts.
5. All of this while the sidebar and the agent panel arrive and the column
   narrows: the existing handoff, untouched.

## Ground truth: the live stream (read off the reference site, 2026-09-10)

Captured by sending a prompt on the reference site's `/threads/new` with a frame
recorder installed before the click. The DOM at each checkpoint is saved in
`docs/reference/overlays/thread-streaming-live.html`. What it showed, in order:

| t (ms) | what is on screen |
|---|---|
| 0 | send pressed; the send button becomes a spinner while the thread is created (the only spinner in the whole run) |
| ~1960 | route changes to /thread/<id>: empty thread, header "New Thread" |
| ~2950 | user bubble (right, `max-w-[85%]`) + time; assistant "Reasoning…" label shimmering over two skeleton bars (`h-2.5 w-1/2`, `h-2.5 w-1/3`, `mt-2 space-y-1.5 opacity-50`); composer grows a strip on top: three dots + "Working…" + a ghost "Stop" |
| ~3960 | "7 knowledge hints ·" joins the time under the bubble |
| ~7980 | the reasoning block is REPLACED by a tool row: 28px, `rounded-sm border bg-muted/50 px-2 text-xs`, 12px glyph, label `font-medium`, middot, truncated detail. Header auto-titles the thread |
| ~13960 | the row resolves: a stack of 16px favicons (`-space-x-1`, `rounded-sm ring-1 ring-border`) and "+1 more" land after the detail; label stops shimmering |
| ~15980 | prose starts streaming under the row, plain markdown in word chunks; no caret, no per-token fade |
| ~28760 | "Working…" strip leaves the composer; the rest of the answer (a bulleted list) streams in ~3s |

No "Reasoned" collapsible was left behind when reasoning had no text: the block
simply gave way to the first tool row. Rows stack and stay. The conversation is
bottom-anchored in a scroll area and content pushes up.

The 2026-09-09 capture (`thread-streaming-turn.html`) reconstructed the running
state from shipped JS; this one confirms it and adds three things it lacked: the
composer's Working strip, the favicon receipt on a resolved row, and timings.

## The one architectural decision: the thread gets a scroller

A streaming turn grows, and nothing before send may change height (four screens
share one centred cell; growth re-centres the column and drags the mark). After
send that rule cannot hold: the answer is taller than any viewport. So send
changes what scrolls, without moving anything on the frame it happens:

- `<main>` becomes the thread's scroll container: `h-svh overflow-y-auto
  overflow-x-hidden justify-start pb-4`, with `padding-top` frozen at the
  stage's measured top at the moment of send. Nothing moves on that frame.
  The PAGE (html/body/window) still never scrolls.
- Why `<main>` and not a scroller inside the chat screen: the mark is
  absolutely positioned in the stage and must scroll natively with the text it
  heads. Anything that scrolls must contain the whole stage. Scrolling is not a
  transform, so the rule "never transform the stage or an ancestor" holds.
- `<main>`'s transition list becomes `transition-[padding-left,padding-right]`:
  the handoff only ever moved those two, and the frozen `padding-top` must NOT
  animate from `py-12`'s 48px.
- The stage takes `flex-1`, the chat screen `self-stretch` (instead of
  `self-center`), and the three finished screens `hidden`. The composer's
  wrapper becomes the DOCK: `mt-auto sticky bottom-4`, so it sits at the
  bottom of the viewport whether the thread is short or long. Same composer DOM
  node before and after.
- The thread bar moves to its own fixed layer ABOVE the column (z-20 inside
  `<main>`'s context), so text scrolling up passes under its opaque
  `bg-background` instead of painting over it. The floating panel is also z-20
  but inset 48px below the bar; they never overlap.
- Text scrolling down behind the docked composer is hidden by the dock's band:
  a `before:` layer from 24px above the composer to the viewport bottom,
  `bg-glass-gradient bg-fixed` (the same fixed gradient the canvas paints, so
  it lines up exactly) with a 24px top fade mask. It fades in with the canvas
  (same `--duration-slide` / `--ease-in-out`), or it would be a glass patch on
  the pre-glass canvas for half a second.
- Stick to bottom: while the reader is within 40px of the end, growth scrolls
  `<main>` to the end (instant, as the product does). Scrolled up, it leaves
  them alone.

## Choreography (t = 0 is the send press)

Two beats. Beat 1 is the room; beat 2 is the conversation.

| t | what moves | how |
|---|---|---|
| 0 | shell arrives (existing) | `--duration-slide` 480, `--ease-in-out` |
| 0 | three unpicked cards fade, keeping their boxes; the receipt's retry and "Set up manually" retire | opacity, `--duration-normal`, ease-out; `inert` |
| 0 | composer glides to the dock, still holding the brief, read-only | FLIP on the dock (bottom edges), `--duration-slide`, `--ease-in-out` |
| 480 | unpicked cards leave the layout; the picked card, if it was not first, glides to the first cell | `hidden`; FLIP, `--duration-move` 220, `--ease-in-out` |
| 480 | the brief leaves the composer; the Working strip arrives | text cleared; strip mounts |
| 700 | your message enters | `motion-safe:animate-fade-in` |
| ~860 | the agent turn starts: reasoning | same entrance |
| +1200 | reasoning gives way to tool row 1 (running) | replaced, no collapsible |
| rows | each row 1100 running + 300 settled, stacked | label shimmer only; no spinner |
| then | prose streams in word chunks, ~110 chars/s | no caret, no fade |
| then | the question card enters; the Working strip leaves | fade-in; state `waiting` |

Reduced motion: every transition and FLIP collapses to none; the SEQUENCE keeps
its timing (it is information, as research-signals.tsx argues), and text still
arrives in chunks (that is content arriving, not motion).

The mark does not move and does not spin after send. The product's finding was
"a running turn has NO spinner anywhere", and a turning mark is a spinner.

## Component contracts (build to these; do not rename)

### Shared, in `src/components/thread/` (no signup imports allowed here)

```ts
// shimmer.ts: SHIMMER and sweepStyle move here from research-signals.tsx.
export const SHIMMER: string;                       // identical string
export function sweepStyle(
  chars: number, sweep: string, base: string,
  opts?: { cycleMs?: number; spreadPerChar?: number }, // defaults 5600 and 2: research-signals unchanged
): React.CSSProperties;

// tool-call-row.tsx: SignalRow's row, extracted. research-signals renders it.
export type ToolCallStatus = "running" | "done" | "interrupted" | "failed";
export function ToolCallRow(props: {
  label: string;
  detail?: string;
  status: ToolCallStatus;
  icon?: TablerIcon;          // a glyph (tinted up one tier while running) …
  logoSrc?: string;           // … or a 12px logo
  receipt?: React.ReactNode;  // rendered after the detail only when status === "done"
  className?: string;
}): JSX.Element;
export function ToolCallCount(props: { children: React.ReactNode }): JSX.Element; // "+1 more", "6 found": 12px, third tier

// reasoning-block.tsx
export function ReasoningBlock(props: { className?: string }): JSX.Element;
// "Reasoning…" (text-xs, shimmer swept by foreground over muted-foreground,
// 4px of band per character, 1.5s cycle) over two <Skeleton> bars
// h-2.5 w-1/2 and h-2.5 w-1/3, mt-2 space-y-1.5 opacity-50, aria-hidden.

// streaming-message.tsx
export type StreamSegment = { text: string; strong?: boolean };
export type StreamParagraph = StreamSegment[];
export function streamLength(paragraphs: StreamParagraph[]): number;
export function StreamingMessage(props: {
  paragraphs: StreamParagraph[];
  revealed: number;           // characters shown, across paragraphs in order
  className?: string;
}): JSX.Element;              // AssistantMessage's prose (export PROSE from assistant-message.tsx), data-role="assistant", no hover actions
export function useTextStream(total: number, opts: {
  active: boolean;
  charsPerSecond?: number;    // default 110
  onDone?: () => void;
}): number;                   // revealed count; word-sized chunks on a seeded jitter so runs are reproducible
```

### Composer (opt-in, every cloned route unchanged)

```ts
// composer.tsx: new optional prop
status?: React.ReactNode;     // a strip INSIDE the composer card, above the textarea
// composer-status.tsx
export function ComposerWorkingStatus(props: { label?: string; onStop?: () => void }): JSX.Element;
// h-9 px-4, hairline bottom (border-border-subtle), brand typing dots
// (animate-typing-dot, staggered), "Working…" text-xs text-muted-foreground,
// ghost xs "Stop" with IconPlayerStopFilled size-3.5.
```

### Skills question (opt-in, the design page's three variants unchanged)

```ts
SkillQuestionCard({
  className?,
  question?: string,                 // default "Which skills should I install?"
  onAnswer?: (answer: { kind: "install"; ids: string[] } | { kind: "skip" }) => void,
  answered?: boolean,                // rows and footer go inert; the footer reports the outcome
})
```

Preselection stays `PRESELECTED_SKILL_IDS`: it is exactly the three skills the
agent panel already lists for Design system drift, and the two must not
disagree.

### The flow's DOM contract (the probe reads these)

- `<main data-thread>` once send has been pressed; it is the scroll container.
- The turn root: `[data-agent-turn][data-state="working"|"waiting"|"done"|"stopped"]`.
- The dock: `[data-composer-dock]`.
- The picked card keeps `aria-pressed="true"`; unpicked cards are `hidden`.

## The script (static, like every mock here)

`src/lib/mock/agent-stream.ts`, keyed by `SuggestedAgent.id`, plus a fallback for
a hand-typed brief. Honest rows only: nothing is connected at signup, so no row
may claim to read a mailbox, a repo or a Figma file. Design system drift:

1. `Writing instructions · Design system drift` (IconPencil). The panel's
   Instructions field is the thing this row wrote.
2. `Searching skills · design systems, Figma, iOS` (IconPuzzle, the panel's own
   skills glyph). Receipt: `6 found`.
3. `Checking connectors · Figma, GitHub, Linear` (IconPlug). Receipt: the three
   logos in the tool tile group the cards already wear.

Then two short paragraphs naming what the agent will do and where its
connectors live, then the question: "Which skills should it start with?"
Answer: a user bubble ("Install emil-design-eng, apple-design and
extract-design-system" / "Skip skills for now"), one row
(`Installing skills · 3 skills`), one sentence. No em dashes in any copy.

## Gates

`npx tsc --noEmit`, `npm run lint`, `npm run brand:lint-tokens`, `npm test`,
`npm run build`, and `npm run probe:signup` in dark, light, `--panel-closed`
and `--sidebar-collapsed`, updated for thread mode:

1. column ≥ 512 while docked (unchanged);
2. the PAGE never scrolls under a real wheel over the conversation (html,
   body, window); `<main>` may, and its figures are reported;
3. nothing escapes its box, the stream and the question card included;
4. new: the composer is docked, fully inside the viewport, bottom within 32px
   of the bottom edge;
5. new: the probe waits for `[data-agent-turn][data-state="waiting"]` before
   it sweeps, so it measures the finished turn, not a frame of it.

Then screenshots in both themes at 1456×868, 1280×800 and 1920×1080, opened and
looked at (the panel's clipping was caught only that way), and the 17 cloned
routes unchanged (the composer's new prop is opt-in).
