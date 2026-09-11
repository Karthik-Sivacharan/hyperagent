"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { Composer } from "@/components/composer/composer";
import { ComposerWorkingStatus } from "@/components/composer/composer-status";
import { AgentCard } from "@/components/signup/agent-card";
import { AgentTurn } from "@/components/signup/agent-turn";
import { CompanyChip, PersonChip, RoleChip } from "@/components/signup/identity-chips";
import { ResearchSlot, useResearchSequence } from "@/components/signup/research-signals";
import { FOOT_LINK } from "@/components/signup/signup-legal";
import { useAgentStream } from "@/components/signup/use-agent-stream";
import { SHIMMER, sweepStyle } from "@/components/thread/shimmer";
import { UserMessage } from "@/components/thread/user-message";
import { agentScriptFor, type SkillsAnswer } from "@/lib/mock/agent-stream";
import { SIGNUP_COMPANY, SIGNUP_PERSON } from "@/lib/mock/signup-identity";
import { SUGGESTED_AGENTS } from "@/lib/mock/suggested-agents";
import { cn } from "@/lib/utils";

// The fourth screen: the flow stops being a form and starts being a thread.
//
// It is a chat WINDOW, not the app: no sidebar, no thread header, no star or
// model chrome, because none of that exists for someone who signed up ninety
// seconds ago. What it borrows from src/components/thread/ is the shape of an
// assistant turn rather than the component — the real product's thread has no
// avatar gutter and no bubble on the assistant side, the text just flows at
// the column's full measure (measured on hyperagent.com, 2026-09-09) — and
// what it borrows outright is the composer, which is self-contained and needs
// no shell context. Mounting ThreadView instead would drag in a rounded page
// panel, a scroll area and a header tuned for the (app) pane's proportions.
//
// One turn, and it is the machine's. The sentence says what is happening and
// names the three things it read off the identity provider, each as a chip in
// its own hue (identity-chips.tsx). Under it the screen shows its working —
// one public source at a time, in the product's own tool-row idiom
// (research-signals.tsx) — and the four agents fill in behind it, one for each
// source that lands. Then a composer if the four are wrong, and a way out
// under that if the whole idea is. Nothing here is real: SUGGESTED_AGENTS is
// static, like every other mock in this repo.
//
// The column is wider than the three screens before it — 752px against 384 —
// because a 384px column would break the sentence across five lines and stack
// the agent cards one per row. signup-screen.tsx owns that widening; see the
// note on the stage there.
//
// BUT 752 IS A CEILING, NOT A MEASURE, and this screen is the only one of the
// four that ever sees anything else. Once the shell arrives the column is the
// viewport minus the sidebar and minus the agent panel, and neither of those
// holds still: the sidebar collapses to a rail, the panel is dragged and shut.
// So the screen is a CONTAINER (`@container/chat`) and every breakpoint inside
// it asks its own box how wide it is. A `sm:` here would be reading the WINDOW
// while the column it names had been squeezed to a fraction of it — which is
// precisely what the card grid did before this: `sm:grid-cols-2` kept the
// cards two-up at any viewport ≥640, including the one where the sidebar and
// the panel between them had left the column 96px. Every breakpoint inside a
// box whose width is "viewport minus two pieces of chrome" is measuring the
// wrong box. The repo already works this way in composer.tsx,
// memories-page.tsx, threads-page.tsx and settings/integrations-page.tsx;
// this is that same idiom, one screen later.
//
// Inline-size containment costs this screen nothing: the chat step is `w-full`
// inside the stage's `minmax(0, 1fr)` track, so its width never came from its
// own contents in the first place. It contains only the INLINE axis, so the
// shared cell is still as tall as its tallest screen, and the mark is parked
// against the stage rather than against this element, so the new containing
// block a container establishes is not one the mark ever asks about.
//
// NOTHING ON THIS SCREEN CHANGES HEIGHT while the research pass runs. The four
// screens share one grid cell and each centres inside it, so a height change
// re-centres the column and drags the heading and the flying mark down with
// it. The cards are full height from the first frame (agent-card.tsx) and the
// signal slot is a fixed 28px (research-signals.tsx). The one exception is
// deliberate and is not part of the animation: picking a card grows the
// composer from one row of text to two, which settles the column by half a
// line, once, in direct answer to a click.
//
// The container queries below cannot break that rule, and the reason is worth
// writing down rather than re-deriving. They fire on the column's WIDTH, and
// the width does not move while the pass runs — the shell has not arrived yet
// and nothing is being dragged. And both of them sit under the floor the shell
// holds the column to while it is docked (512): at every docked width this
// screen is permanently on the wide side of `@lg` and permanently on the wide
// side of `@max-sm`, so neither can fire mid-pass at all.

// ===== AFTER SEND ==========================================================
//
// Send is where this screen stops being a suggestion and becomes a thread,
// and it is the one moment the height rule above is let go of on purpose: the
// agent's answer is taller than any viewport, so nothing could keep it. What
// holds instead is that NOTHING MOVES ON THE SEND FRAME — signup-screen.tsx
// freezes the column's top and turns <main> into the thread's scroll
// container — and after it, everything grows downward from where it was.
//
// Two beats, the room and then the conversation (the plan with its numbers is
// docs/plans/2026-09-10-agent-stream.md):
//
//   BEAT 1, 0 to --duration-slide. The shell arrives (app-handoff.tsx). The
//   three cards you did not pick fade where they stand, keeping their boxes,
//   so the column does not shift under a gesture that is already moving
//   sideways. The composer glides to its dock at the bottom of the window,
//   still holding your brief: it is your message on its way.
//
//   BEAT 2, at --duration-slide. The unpicked cards leave the layout and the
//   picked one, if it was not first, glides into the first cell. The brief
//   leaves the composer and lands as your message; the composer grows its
//   Working strip; and the agent's turn begins under it (agent-turn.tsx).
//
// The picked card STAYS, as the record of the choice, which is the product's
// own treatment of a chosen option card in a thread. It stops being a control
// (the grid goes inert) but keeps its picked look, because "this is the one
// you chose" is exactly what it now says.

/**
 * How many characters the shimmer band has to cross on the heading. Counted
 * from the sentence itself rather than typed as a number, because the ratio is
 * per-character (see SPREAD_PER_CHAR_PX) and the sentence is built from a
 * record that can change under it.
 */
const HEADING_CHARS =
  "Researching agents for  to help with the  role at ".length +
  SIGNUP_PERSON.firstName.length +
  SIGNUP_PERSON.role.length +
  SIGNUP_COMPANY.name.length;

export function ChatStep({
  headingRef,
  active = false,
  onSend,
  handedOff = false,
  travelMs = 480,
  className,
}: {
  /** Focus lands here on arrival — see the note in signup-screen.tsx. */
  headingRef?: React.Ref<HTMLHeadingElement>;
  /** True once this is the live screen. Starts the research pass; see the
   *  note on `active` in useResearchSequence. */
  active?: boolean;
  /** Pressing send hands the flow over to the app shell (app-handoff.tsx). */
  onSend?: () => void;
  /** True once the shell has arrived, which retires the way out. */
  handedOff?: boolean;
  /**
   * --duration-slide as signup-screen.tsx read it, 0 under reduced motion: the
   * length of beat 1, which is the shell's own slide, so the conversation
   * lands the moment the room has finished arriving and not a frame before.
   */
  travelMs?: number;
  className?: string;
}) {
  const research = useResearchSequence(active);

  // The composer is controlled from here so a card can fill it. Every other
  // page in the repo leaves it uncontrolled; `value` / `onValueChange` are the
  // opt-in for exactly this.
  const [draft, setDraft] = useState("");
  const [pickedId, setPickedId] = useState<string | null>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  // Bumped on every pick, including a repeat pick of the same card, because
  // "put the brief back and let me edit it" has to work the second time too.
  const [pickCount, setPickCount] = useState(0);

  // Focus follows the pick into the composer, caret at the end, so the next
  // thing you do is edit or send rather than hunt for the box. The textarea is
  // found through the wrapper rather than through a ref: Composer exposes none,
  // and widening its props for one caller on a screen it does not know about is
  // not this branch's business (docs/brand/reskin-conventions.md: work around
  // the shell, do not patch it). `preventScroll` keeps the centred column still.
  useEffect(() => {
    if (pickCount === 0) return;
    const field = composerRef.current?.querySelector("textarea");
    if (!field) return;
    field.focus({ preventScroll: true });
    field.setSelectionRange(field.value.length, field.value.length);
  }, [pickCount]);

  // ----- after send ---------------------------------------------------------

  // What was sent, frozen at the press: the text as it stood (picked, edited
  // or typed from nothing) and the card it came from, if any.
  const [sent, setSent] = useState<{ text: string; agentId: string | null; at: string } | null>(null);
  // Beat 2: the conversation has landed and the agent may start.
  const [landed, setLanded] = useState(false);
  const [answerAt, setAnswerAt] = useState<string | null>(null);

  // Memoised on `sent` because the sequencer keys its timers on the script:
  // a fresh object every render would re-arm the current step forever and the
  // turn would never get past its lead.
  const script = useMemo(() => (sent ? agentScriptFor(sent.agentId, sent.text) : null), [sent]);
  const stream = useAgentStream(script, landed);
  const working = landed && stream.state === "working";

  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  // FIRST halves of the two FLIPs, read before the layout they measure away
  // from has been replaced.
  const composerFirst = useRef<DOMRect | null>(null);
  const cardFirst = useRef<DOMRect | null>(null);

  const handleSend = () => {
    if (sent) return;
    composerFirst.current = composerRef.current?.getBoundingClientRect() ?? null;
    setSent({ text: draft, agentId: pickedId, at: clockLabel() });
    onSend?.();
  };

  // BEAT 1: the composer glides to the dock. FLIP on the composer's own
  // wrapper, never on the stage or anything above it — the mark is parked
  // against the stage's box, and the dock is a descendant of the screen, not
  // an ancestor of the seat. Measured by BOTTOM edges because the dock is
  // pinned by its bottom: if the brief re-wraps as the shell narrows the
  // column mid-glide, the box grows upward and the glide still ends where the
  // composer rests. --ease-in-out on --duration-slide, the pairing everything
  // else in this beat rides (signup-screen.tsx has the measurement), so the
  // composer docks as the sidebar lands rather than before or after it.
  useBeforePaint(() => {
    if (!sent) return;
    const el = composerRef.current;
    const first = composerFirst.current;
    composerFirst.current = null;
    if (!el || !first || prefersReducedMotion()) return;
    const last = el.getBoundingClientRect();
    const dy = first.bottom - last.bottom;
    if (Math.abs(dy) < 0.5) return;
    el.animate([{ transform: `translateY(${dy}px)` }, { transform: "none" }], {
      duration: travelMs,
      easing: cssToken(el, "--ease-in-out", "cubic-bezier(0.4, 0, 0.2, 1)"),
    });
  }, [sent]);

  // BEAT 2, on a timer rather than on `transitionend`: the shell's slide is
  // not this component's to listen to, and under reduced motion there is no
  // transition to end. The picked card's FIRST is read here, while its three
  // neighbours still hold their boxes, and the draft goes in the same batch as
  // the landing so the brief leaves the composer on the frame it arrives in
  // the thread.
  useEffect(() => {
    if (!sent || landed) return;
    const id = window.setTimeout(() => {
      cardFirst.current = pickedCard(gridRef.current)?.getBoundingClientRect() ?? null;
      setDraft("");
      setLanded(true);
    }, travelMs);
    return () => window.clearTimeout(id);
  }, [sent, landed, travelMs]);

  // The picked card into the first cell, on --ease-in-out: it is an object
  // already on screen moving to a new rest, not an entrance. A card that was
  // already first measures a zero delta and does not animate at all.
  //
  // The duration follows the distance, in the brand's two steps for it. One
  // row up (148px at 1456) is a --duration-move (220ms, "layout / position
  // shifts"); crossing the column is not the same size of move — card four
  // travels ~390px diagonally, and at 220ms that measured as a card flung
  // rather than moved — so past 200px it takes --duration-slow (300ms), the
  // product UI ceiling.
  useBeforePaint(() => {
    if (!landed) return;
    const card = pickedCard(gridRef.current);
    const first = cardFirst.current;
    cardFirst.current = null;
    if (!card || !first || prefersReducedMotion()) return;
    const last = card.getBoundingClientRect();
    const dx = first.left - last.left;
    const dy = first.top - last.top;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
    const far = Math.hypot(dx, dy) > 200;
    card.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], {
      duration: far ? cssDuration(card, "--duration-slow", 300) : cssDuration(card, "--duration-move", 220),
      easing: cssToken(card, "--ease-in-out", "cubic-bezier(0.4, 0, 0.2, 1)"),
    });
  }, [landed]);

  // Focus into the composer once the brief has left it: the send button the
  // press left focus on is disabled by then (the box is empty), and a focused
  // disabled button drops focus to <body>. The product keeps its composer
  // focused after a send, for a follow-up.
  useEffect(() => {
    if (!landed) return;
    composerRef.current?.querySelector("textarea")?.focus({ preventScroll: true });
  }, [landed]);

  // Stick to the bottom while the agent writes, the product's own rule: a
  // reader within 40px of the end (ThreadView's SCROLL_END_THRESHOLD) is
  // following along and every new line scrolls into view; a reader who has
  // scrolled up is reading something and is left alone. Instant rather than
  // smooth, as the product does it, and inside the ResizeObserver callback so
  // the scroll lands before the frame paints and a new line is never drawn
  // under the composer first.
  useEffect(() => {
    if (!sent) return;
    const root = rootRef.current;
    const scroller = root?.closest("main");
    if (!root || !scroller) return;
    let following = true;
    const onScroll = () => {
      following = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 40;
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    const observer = new ResizeObserver(() => {
      if (following) scroller.scrollTop = scroller.scrollHeight;
    });
    observer.observe(root);
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [sent]);

  const answer = (next: SkillsAnswer) => {
    setAnswerAt(clockLabel());
    stream.respond(next);
    // The button that answered is inert now; same reason as the landing.
    composerRef.current?.querySelector("textarea")?.focus({ preventScroll: true });
  };

  return (
    // `min-h-full` after send: the screen stretches to its row (see
    // signup-screen.tsx), and filling it is what lets the dock's `mt-auto`
    // put the composer on the window's floor while the thread is short.
    <div ref={rootRef} className={cn("@container/chat flex w-full flex-col", sent && "min-h-full", className)}>
      {/* The mark's fourth and last seat, and the first one that is not
          centred. It has been the column's crown on three screens; here it
          moves to the head of the text as the thing that is talking, which is
          also why no message in this view carries an avatar. 44px, the size it
          has worn since the loading screen — see MARK_SMALL_PX. */}
      <div data-mark-slot="personalize" className="size-11" />

      {/* 20px, not the 24 the profile step's welcome wears: this is a sentence
          being said, not a page title, and text-xl's -0.02em is the last step
          of the scale that still tracks like prose. `font-normal` because
          every heading SIZE bakes --font-weight-heading (600) and a 600-weight
          running sentence reads as a shout. `leading-9` (36px against a 26px
          default) is bought for the chips: it is the line box they have to fit
          inside without making their own line taller than its neighbours.
          `text-pretty` because the sentence runs to two lines and the chips
          are wide: left to itself the break dropped "Trainwell" alone onto a
          line. It was `text-balance` first, which fixed that by evening the
          two lines out and left half the column empty; pretty only guards the
          last line, so the sentence fills the column's width, whatever it is.

          It shimmers while the research pass runs, and stops when it lands.
          The sentence is already in the present tense — "Researching agents
          for…" — so the product's own device costs no extra copy and no extra
          element: it says the sentence is live, in the place the eye already
          is. The band is applied to the HEADING, not to the three runs of
          plain words inside it, because three spans would each get their own
          band travelling at its own rate and read as three separate effects.
          Clipping the h1's background to its glyphs sweeps the whole sentence
          as one line of text, and the chips are untouched by it: each one sets
          its own colour and paints its own fill over the top, so the hue that
          says what KIND of thing it is never wavers.

          Below 384px of COLUMN — never the window; see the container note at
          the top of this file — it steps down to 18/32. At 20px the sentence
          reaches for a fourth line at 320 of column (measured: 3 lines at 336,
          4 at 320), and a fourth line is this screen's first impression
          turning into a paragraph. The step is at 384 rather than at the 336
          where the cliff actually is for two reasons: the sentence is built
          from a record that can change under it, which is the same argument
          HEADING_CHARS makes one screen up, so the threshold wants headroom
          rather than precision; and the line count does not jump at the
          boundary — 3 lines at 20px on the wide side, 3 lines at 18px on the
          narrow one — so what crosses it is a size, not a reflow. `leading-8`
          buys 18px the same air around the chips that `leading-9` bought 20,
          which is the measurement `leading-9` exists for. */}
      <h1
        ref={headingRef}
        tabIndex={-1}
        className={cn(
          "mt-6 text-xl leading-9 font-normal text-pretty text-foreground outline-none",
          "@max-sm/chat:text-lg @max-sm/chat:leading-8",
          active && !research.done && SHIMMER,
        )}
        style={
          active && !research.done
            ? sweepStyle(HEADING_CHARS, "var(--shimmer-sweep)", "var(--color-foreground)")
            : undefined
        }
      >
        Researching agents for <PersonChip /> to help with the <RoleChip /> role at{" "}
        <CompanyChip />
      </h1>

      {/* What it is reading, one public source at a time, then the receipt.

          The receipt's retry is handed a wrapped `restart` rather than the
          hook's own, because a replay is not only the pass's business: the
          cards it filled go back to skeletons, and a brief sitting in the
          composer under a card that has un-landed is a claim nothing on
          screen supports any more. Clearing both puts the screen back to the
          state the first pass started from, which is what "again" means.

          Deliberately NOT preserved: hand-typed text is dropped too. It is
          the same consent argument as picking a card — the gesture asks for
          the screen's suggestions to be redone, and a box that survives the
          reset would be the one thing on screen still answering the old
          reading. The escape hatch under the composer is the way out for
          someone who wants to keep what they wrote. */}
      <ResearchSlot
        state={{
          ...research,
          restart: () => {
            research.restart();
            setPickedId(null);
            setDraft("");
          },
        }}
        className={cn(
          "mt-4",
          // The retry retires with the send: re-reading the sources after the
          // four suggestions have become one sent brief would be answering a
          // question the thread has moved past. Reached into from here
          // because it is the slot's only button, and made `invisible` as
          // well as transparent so it leaves the tab order (visibility is
          // listed so it flips at the END of the fade, not the start). The
          // receipt itself stays: it is the history of what was read.
          sent && "[&_button]:invisible [&_button]:opacity-0 [&_button]:transition-[opacity,visibility]",
        )}
      />

      {/* Two columns when the COLUMN can hold two, one when it cannot. `@lg`
          is 512px of this screen's own box and has nothing to do with the
          window: the same 512 reads as two-up in a docked shell at 1280 and
          as one-up in a squeezed one at 1920, which is the whole point of
          measuring the box you are in.

          512 is measured, not chosen. Two-up at 512 leaves a 248px card, and
          a card's content has a hard floor of about 241 — see the note on
          `min-w-0` in agent-card.tsx, where that number comes from. The next
          step down, a 480 column, was already 8.6px of card content outside
          its own card. It is also, conveniently, exactly the floor the shell
          holds the column to while it is docked, so one named breakpoint does
          both jobs and there is no constant to keep in sync.

          gap-4 is the repo's card-grid gap everywhere else (marketplace, home,
          settings, skills) and the 16px measured on the reference tile row.

          The column's rhythm down from the mark is 24 / 16 / 24 / 24 / 12,
          not five equal gaps. The signal row belongs to the SENTENCE — it is
          that sentence still happening — so 16 binds it upwards, and the 24
          under it is where the screen changes subject from "what I am doing"
          to "what I found". The 12 at the bottom does the opposite: it ties
          the escape hatch to the composer it is an alternative to.

          `aria-busy` on the grid rather than on each card: it is the set that
          is still filling, and a card that has landed is not busy. */}
      <div
        ref={gridRef}
        aria-busy={!research.done}
        inert={sent !== null}
        className="mt-6 grid grid-cols-1 gap-4 @lg/chat:grid-cols-2"
      >
        {SUGGESTED_AGENTS.map((agent, i) => {
          // After send: every card but the picked one fades on beat 1 and
          // leaves the layout on beat 2. No card picked (a brief typed from
          // nothing) and all four go, which is the honest reading: none of
          // them is what was sent.
          const leaving = sent !== null && agent.id !== sent.agentId;
          return (
            <AgentCard
              key={agent.id}
              agent={agent}
              ready={i < research.resolved}
              selected={pickedId === agent.id}
              className={cn(leaving && "pointer-events-none opacity-0", leaving && landed && "hidden")}
              onPick={() => {
                // A click is the consent: it replaces whatever is in the box,
                // hand-typed or not. That is what every suggestion strip does
                // and what the gesture obviously asks for — and it is why
                // re-picking the card you are already on is not a toggle but a
                // reset, which is the only undo this screen has. Deselecting
                // instead would leave the composer holding a brief that no card
                // claims, or throw the text away to keep the two in step.
                setPickedId(agent.id);
                setDraft(agent.prompt);
                setPickCount((n) => n + 1);
              }}
            />
          );
        })}
      </div>

      {/* The conversation after send: your message, then the agent's turn.
          Mounted at beat 2, and in the layout from that frame: the message
          waits out --duration-move at zero opacity (`both` fill) so the
          picked card can finish settling into the space it lands under. */}
      {sent && landed && script && (
        <div>
          <div className="motion-safe:animate-fade-in motion-safe:[animation-delay:var(--duration-move)]">
            <UserMessage id="signup-brief" text={sent.text} sentAtLabel={sent.at} />
          </div>
          <AgentTurn script={script} stream={stream} sentAtLabel={answerAt ?? sent.at} onAnswer={answer} />
        </div>
      )}

      {/* The out. Four suggestions are a guess, and the composer is where you
          say so — its placeholder is the only other copy on the screen, which
          is the point: the sentence is the hero and everything else is a
          control. No agent picker and no integrations strip, both of which
          name things that do not exist yet for this account.

          Emptying the box by hand drops the selection, because at that point
          no card's brief is loaded and `aria-pressed` would be lying. Editing
          one does NOT: the pressed card then means "this is the brief you
          started from", which stays true through a rewrite and keeps the
          reset gesture on the card meaningful. */}
      {/* THE DOCK, after send. The same composer, the same DOM node, pinned to
          the bottom of the thread: `mt-auto` puts it on the window's floor
          while the thread is short, and `sticky bottom-0` keeps it there once
          the thread scrolls. `bottom-0`, not the `bottom-4` the product's 16px
          suggests: a sticky box's insets are measured inside its scroll
          container's PADDING, and <main> already pads 16px (`pb-4`), so
          `bottom-4` measured 32px off the floor (dock bottom at 836 of 868).
          `pt-6` is the 24px the column's rhythm puts above it, kept when the
          thread runs right up to it.

          The BAND is what stops the thread showing through when it scrolls
          down behind the dock: the composer is opaque, but its 32px corners
          and the 16px under it are not. The canvas behind the column is the
          glass gradient, a 135deg sweep across the whole window, so no flat
          token would match it — but the gradient itself, fixed to the
          viewport exactly as the canvas layer is (`bg-fixed`), lines up with
          the canvas pixel for pixel. A 24px fade at its top edge so the text
          dissolves into it rather than being cut. `-inset-x-5` is the
          column's 20px gutter either side, which reaches the sidebar's and the
          docked panel's edges and no further.

          It fades in on the canvas's own duration and curve, and exists at
          zero opacity before send for the reason a transition needs a
          before-state: mounted at full opacity it would be a glass patch on
          the pre-glass canvas for the half second the canvas takes to arrive.

          `z-10` so the dock paints over anything in the thread scrolled under
          it, whatever that thing's own positioning. The composer glides into
          the dock on beat 1 (the FLIP above) and is inert for that glide: it
          is carrying a message that has been sent. */}
      <div
        data-composer-dock=""
        className={cn(
          "relative",
          "before:pointer-events-none before:absolute before:-inset-x-5 before:top-0 before:-bottom-4 before:bg-glass-gradient before:bg-fixed before:[mask-image:linear-gradient(to_bottom,transparent,black_24px)]",
          "before:transition-opacity before:duration-(--duration-slide) before:ease-in-out motion-reduce:before:transition-none",
          sent ? "sticky bottom-0 z-10 mt-auto pt-6 before:opacity-100" : "mt-6 before:opacity-0",
        )}
      >
        <div ref={composerRef} className={cn("relative", sent && !landed && "pointer-events-none")}>
          <Composer
            showAgentPicker={false}
            showIntegrationsFooter={false}
            placeholder={sent ? "Add a follow-up…" : "Or tell me what you're working on…"}
            value={draft}
            onValueChange={(next) => {
              setDraft(next);
              if (next.trim() === "") setPickedId(null);
            }}
            // The first send is the only one this screen can answer. After it
            // the arrow is the inert prop it is on every cloned route: a
            // follow-up box that pretended to send would be the one lie this
            // flow has managed not to tell.
            onSend={sent ? undefined : handleSend}
            status={working ? <ComposerWorkingStatus onStop={stream.stop} /> : undefined}
          />
        </div>
      </div>

      {/* The way out for someone who wants none of this, at the end of the
          reading order, which is exactly where "none of these, just let me in"
          belongs. It says "Set up manually" — the same words as the profile
          step's second button one screen earlier, deliberately. An escape
          hatch that renames itself on every screen reads as a different door
          each time; the same words twice read as the same door, still open.
          What separates them is weight, not vocabulary: a full-width button
          there, the flow's own foot line here — the same 13px third tier and
          the same underlined link the terms and the provenance line wear.
          `/threads/new` is the app's real home; `/` only redirects there.

          Centred, and the only centred thing on a left-aligned screen. Left
          against the composer's edge it read as a caption on the box rather
          than an action of its own, and 12px of gap put it closer to the
          composer than the composer was to the cards. On the page's axis at
          24px it is a way out of the SCREEN, and it rhymes with the three
          screens before this one, all of which are centred columns. */}
      {/* Retired by the handoff. "Set up manually" is a way OUT of the flow,
          and once the sidebar is on screen the flow is over — the door it
          offers is the room you are already standing in.

          It used to fade and keep its box, because removing 44px under the
          composer would have settled the centred column mid-slide. Send no
          longer centres anything: the column's top is frozen and the composer
          is pinned to the window's floor, so the box would only hold the dock
          44px off the bottom. It leaves the layout on the send frame instead,
          under a composer that is already gliding down over the place it
          was. */}
      <p
        className={cn(
          "mt-6 text-center text-md leading-5 text-foreground-low",
          (handedOff || sent) && "hidden",
        )}
        inert={handedOff}
      >
        <Link href="/threads/new" className={FOOT_LINK}>
          Set up manually
        </Link>
      </p>
    </div>
  );
}

// ===== HELPERS =============================================================

// The FLIPs must read before the browser paints or the reader sees one frame
// of the new layout before the glide starts. Same device as signup-screen.tsx.
const useBeforePaint = typeof window === "undefined" ? useEffect : useLayoutEffect;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** A token read off a mounted element, so a retune in brand.css lands here. */
function cssToken(el: Element, name: string, fallback: string): string {
  return getComputedStyle(el).getPropertyValue(name).trim() || fallback;
}

function cssDuration(el: Element, name: string, fallback: number): number {
  const raw = cssToken(el, name, "");
  const value = Number.parseFloat(raw);
  if (Number.isNaN(value)) return fallback;
  return raw.endsWith("ms") ? value : value * 1000;
}

/** The one card still pressed, found by its state rather than by a ref per card. */
function pickedCard(grid: HTMLElement | null): HTMLElement | null {
  return grid?.querySelector<HTMLElement>('button[aria-pressed="true"]') ?? null;
}

/** "2:50 PM": the product stamps a message with the clock, not "just now". */
function clockLabel(): string {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
