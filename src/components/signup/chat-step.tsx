"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { Composer } from "@/components/composer/composer";
import { AgentCard } from "@/components/signup/agent-card";
import { CompanyChip, PersonChip, RoleChip } from "@/components/signup/identity-chips";
import { ResearchSlot, SHIMMER, sweepStyle, useResearchSequence } from "@/components/signup/research-signals";
import { FOOT_LINK } from "@/components/signup/signup-legal";
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
// NOTHING ON THIS SCREEN CHANGES HEIGHT while the research pass runs. The four
// screens share one grid cell and each centres inside it, so a height change
// re-centres the column and drags the heading and the flying mark down with
// it. The cards are full height from the first frame (agent-card.tsx) and the
// signal slot is a fixed 28px (research-signals.tsx). The one exception is
// deliberate and is not part of the animation: picking a card grows the
// composer from one row of text to two, which settles the column by half a
// line, once, in direct answer to a click.

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

  return (
    <div className={cn("flex w-full flex-col", className)}>
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
          `text-balance` because the sentence runs to two lines and the chips
          are wide: left to itself the break dropped "Trainwell" alone onto a
          line with half of the first one empty.

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
          says what KIND of thing it is never wavers. */}
      <h1
        ref={headingRef}
        tabIndex={-1}
        className={cn(
          "mt-6 text-xl leading-9 font-normal text-balance text-foreground outline-none",
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
        className="mt-4"
      />

      {/* Two columns at this measure, one when the viewport cannot hold two.
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
        aria-busy={!research.done}
        className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {SUGGESTED_AGENTS.map((agent, i) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            ready={i < research.resolved}
            selected={pickedId === agent.id}
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
        ))}
      </div>

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
      <div ref={composerRef} className="mt-6">
        <Composer
          showAgentPicker={false}
          showIntegrationsFooter={false}
          placeholder="Or tell me what you're working on…"
          value={draft}
          onValueChange={(next) => {
            setDraft(next);
            if (next.trim() === "") setPickedId(null);
          }}
          onSend={onSend}
        />
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
          offers is the room you are already standing in. It fades rather than
          unmounting, and the <p> keeps its box, because this sits directly
          under the composer and removing 44px of it would settle the whole
          centred column at the exact moment the shell is sliding in. */}
      <p
        className={cn(
          "mt-6 text-center text-md leading-5 text-foreground-low transition-opacity duration-(--duration-slide) ease-in-out motion-reduce:transition-none",
          handedOff && "pointer-events-none opacity-0",
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
