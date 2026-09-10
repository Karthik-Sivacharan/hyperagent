"use client";

import { Fragment, useEffect, useState } from "react";
import { IconCheck, IconPlus } from "@tabler/icons-react";

import { SHIMMER, sweepStyle } from "@/components/thread/shimmer";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PRESELECTED_SKILL_IDS, SUGGESTED_SKILLS, type SuggestedSkill } from "@/lib/mock/suggested-skills";
import { cn } from "@/lib/utils";

// Variant C of the skill suggestion: no card, no shelf. The skills are named
// inside the sentence the agent is saying, and each name is its own switch.
//
// THE ARGUMENT. The other two variants put a frame around six things and ask
// you to read the frame before you read the offer. This screen does not need
// one: the agent is already talking here, the h1 above it is a sentence rather
// than a title, and a suggestion that arrives inside the sentence making it
// costs exactly one new object — a pill you can press. Everything a card would
// have added (a heading that restates the sentence, a border, a footer with a
// button) is chrome around an idea the sentence already carried.
//
// The family resemblance is deliberate and so is the one difference.
// identity-chips.tsx puts chips in the h1 above; those are `rounded-lg` and
// hue-coded because they are NOT controls, they are category labels. These are
// `rounded-full` (brand rule 6: pills on chips) and spend no hue at all,
// because they ARE controls and their two states are the only thing the colour
// has to say. Shape tells you which of the two kinds of chip you are looking
// at before you reach the words.

// ===== THE SENTENCE ========================================================
//
// Six names in one sentence is the hard part of this variant, and the answer
// is that they are not six things: they are three pairs, and each pair has one
// clause that is true of both members. `emil-design-eng` and `apple-design`
// are both about the feel of a thing in the hand; `design-mobile-apps` and
// `frontend-design` are both about the screens; `extract-design-system` and
// `web-design-guidelines` both keep a system honest, one by building the
// tokens and one by auditing against them. Three clauses is prose. Six would
// be a list with commas, which is a shelf that forgot to draw its own edges.
//
// The alternative — name two or three in the sentence and hide the rest behind
// "and 3 more" — was rejected on the height rule below rather than on taste:
// revealing the rest re-wraps the sentence and grows the block, which is the
// one thing this screen cannot do. A variant whose whole claim is restraint
// cannot afford an expander.
//
// The pairs REORDER the mock's own list, which is ordered by relevance and
// deliberately not by installs (see the note in suggested-skills.ts). That is
// safe here because a pair is a subject, not a tier: nothing in the sentence
// says the first pair beats the third, where three relevance-ordered clauses
// would have had to invent three different reasons and would have read as a
// ranking by accident.
//
// The tail is in the past tense on purpose. "I've turned on the three I'd
// start with" is a statement about what the agent did and what it thinks,
// which stays true after you turn one off; "three are on" would be a live
// claim the sentence has no way to keep. The live count belongs to the confirm
// line, which is built to carry a number that moves.
const LEAD = "Skills next. ";
const TAIL = "I've turned on the three I'd start with.";

const PAIRS: { ids: readonly [string, string]; clause: string }[] = [
  { ids: ["emil-design-eng", "apple-design"], clause: " for how it feels," },
  { ids: ["design-mobile-apps", "frontend-design"], clause: " for the screens," },
  { ids: ["extract-design-system", "web-design-guidelines"], clause: " to keep the system honest." },
];

const BY_ID = new Map(SUGGESTED_SKILLS.map((skill) => [skill.id, skill]));

/** The pairs resolved against the mock. A name the data drops drops here too. */
const CLAUSES = PAIRS.map((pair) => ({
  clause: pair.clause,
  skills: pair.ids.flatMap((id) => BY_ID.get(id) ?? []),
}));

/**
 * The sentence as flat text. It exists to be measured, not rendered: the
 * shimmer's band is sized per character (DEFAULT_SPREAD_PER_CHAR_PX in
 * src/components/thread/shimmer.ts) and counting the string beats typing a
 * number that goes stale the first time a clause is edited.
 */
const SENTENCE_TEXT =
  LEAD + CLAUSES.map((c) => c.skills.map((s) => s.name).join(" and ") + c.clause).join(" ") + " " + TAIL;

// ===== THE STREAM ==========================================================
//
// One beat of shimmer on mount, then the sentence lands. It is the product's
// own running-label device (research-signals.tsx has the full note on why
// there is no spinner anywhere in this flow), applied to the paragraph rather
// than to any run inside it: one band across one block of text reads as one
// thing being said, where a band per chip would read as six effects racing.
//
// It costs nothing in height, which is why it is affordable at all — the
// treatment is a background clipped to glyphs that already exist. The chips
// are untouched by it for the same reason identity-chips gives: each one sets
// its own colour and paints its own fill over the top, so an on chip stays on
// while the words around it are still arriving.
//
// 1400ms is the working half of one research row, the tempo the screen next
// door already runs at. Starting on mount rather than on a prop is deliberate:
// this component owns one turn of speech, and a turn starts when it starts.
const SPEAK_MS = 1400;

// ===== THE CHIP ============================================================
//
// WHAT IT CARRIES, and what it does not.
//
// `name` is on the chip. It is the only field that is also an address — the
// mock's own comment records that `skills.sh/<repo>/<name>` is what addresses
// one of these — so it is the thing you would type, search for, or recognise
// again. Nothing else is on the chip: a second line would make it a card, and
// a card is the variant next door.
//
// `reason` and `repo` are in the tooltip, which is where per-item detail goes
// when the item lives in running text. `reason` is the only field that is
// about THIS reader rather than about the skill, so it is the one worth the
// hover; `repo` is the provenance, in mono because it is an identifier (brand
// rule 7) and because a skill name with no author behind it is a claim with
// nobody's name on it. Two short lines, no interactive content, so the tooltip
// stays a tooltip.
//
// `installs` is nowhere, and that is the deliberate omission. The mock is
// explicit that its order is relevance and not popularity, and that the
// biggest number in the set sits fifth to keep that honest. Printing
// "871.8K" beside one chip re-sorts the whole sentence with the reader's eye
// and turns a suggestion back into a chart. `summary` is nowhere either: it is
// a row of card copy, and `reason` says the same thing about the person
// reading it, which is strictly stronger at a sixth of the width.
//
// ON AND OFF WITHOUT A HUE. This screen spends its single tangerine on the
// composer's send arrow (brand rule 3), and on/off is a state rather than a
// category, so it gets none of the status hues identity-chips borrows for its
// one documented rule break. Three signals carry it instead, each redundant
// with the other two:
//
//   1. FILL. On is `bg-tint-20`, rule 4's active fill. Off has no fill at all
//      and wears `shadow-edge` instead, so it reads as an outline. Filled
//      against outlined is a silhouette difference you can see at the far end
//      of the sentence; the near miss to avoid was tint-10 against tint-20,
//      one step apart, which agent-card.tsx already found reads as "maybe
//      slightly lighter than its neighbour".
//   2. TEXT TIER. On is `text-foreground`, off is `text-foreground-low`. An
//      off skill recedes to the tier the sentence uses for provenance, which
//      is exactly what an untaken suggestion is.
//   3. GLYPH. Plus on an off chip, check on an on chip: add this, added.
//      Distinct shapes rather than a rotation pair (docs/brand/icons.md), so
//      the state survives greyscale, small sizes and colour blindness.
//
// Hover lifts an off chip to `bg-tint-10` and its label to the first tier, and
// an on chip to `bg-tint-25` — the step design.md names "dark hover on inline
// reference chips", which is precisely what this is. Nothing about the resting
// state depends on hover.
//
// WHY `Button` AND NOT `Toggle`. Toggle is the semantically obvious choice and
// it loses on geometry: its base is `inline-flex` and its smallest size is a
// 28px fixed height, and both of those are the bug identity-chips documents.
// An inline-flex takes its baseline from its first flex item, and a fixed
// height inside a 32px line box is a line box waiting to grow. `Button` with
// `size="none"` is the primitive's own escape hatch — "the caller owns height,
// padding and gap" — so the chip can be an inline-block with no height at all,
// which is the shape that gets the baseline right for free.
//
// `variant="chip"` was the other candidate and it bakes `aria-pressed:bg-primary`,
// a solid ink fill. Six solid ink pills in a sentence is a redacted document.
// `ghost` brings no resting fill, which is what an off chip wants, and the two
// state strings below override the rest.

function SkillChip({
  skill,
  on,
  onToggle,
}: {
  skill: SuggestedSkill;
  on: boolean;
  onToggle: () => void;
}) {
  const Mark = on ? IconCheck : IconPlus;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="none"
          aria-pressed={on}
          onClick={onToggle}
          className={cn(
            // `inline-block`, not the `inline-flex` the base string sets, and
            // that is the whole baseline trick — identity-chips.tsx measured
            // the inline-flex version 1.7px low and this file does not get to
            // re-introduce it. An inline-block takes its baseline from the last
            // line box INSIDE it, which here is the label, so the chip's word
            // sits on the same baseline as the words either side with no nudge
            // and no magic number. tailwind-merge resolves the display group in
            // favour of this one because cva appends `className` last.
            //
            // No height, for the same reason identity-chips sets none: padding
            // plus `leading-none` puts the chip at ~23px inside the sentence's
            // 32px line box, so a chip can never make its own line taller than
            // its neighbours and the paragraph keeps an even rhythm. A fixed
            // height would have to be re-derived every time the type moves.
            // No `overflow-hidden` anywhere for the same reason as well: it
            // moves an inline-block's baseline to the bottom margin edge.
            "mx-0.5 inline-block rounded-full px-2 py-1 align-baseline leading-none",
            on
              ? "bg-tint-20 text-foreground hover:bg-tint-25"
              : "bg-transparent text-foreground-low shadow-edge hover:bg-tint-10 hover:text-foreground",
          )}
        >
          {/* Only the MEDIA is a flex box, wrapped and `align-middle`d on its
              own. That is what pins it at 14px instead of letting a line box's
              descent stretch it, and it keeps the label as plain inline text
              in the chip's own line box, which is what the baseline reads. */}
          <span className="mr-1.5 inline-flex align-middle">
            <Mark className="size-3.5" aria-hidden="true" />
          </span>
          {skill.name}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {/* `reason` is written as a lower-case clause with no period (the mock
            says so), so the tooltip supplies the sentence around it rather
            than faking a capital. Naming the relationship out loud is the
            point: "why this one, for you" is the question a chip in a sentence
            cannot answer on its own. */}
        <span className="block">Suggested because {skill.reason}.</span>
        {/* `text-muted-foreground`, not `text-foreground-low`: TooltipContent
            remaps only `--foreground` and `--muted-foreground` onto the ink
            card, so the third tier would resolve against the page's palette
            and go nearly invisible on ink. */}
        <span className="mt-1 block font-mono text-muted-foreground">{skill.repo}</span>
      </TooltipContent>
    </Tooltip>
  );
}

// ===== THE COMPONENT =======================================================
//
// THE HEIGHT NEVER CHANGES, and on this variant that means the sentence never
// re-wraps. Four screens share one centred grid cell in this flow, so any
// growth re-centres the column and drags a FLIP-animated mark with it
// (chat-step.tsx has the full note). A sentence is the most fragile thing that
// could sit in that cell: one chip that gets 12px wider on click can push a
// word to the next line and cost the whole screen a 32px line.
//
// It is solved by construction rather than by reserving a box. Between on and
// off, the ONLY properties that differ are `background-color`, `color`,
// `box-shadow` and which of two same-sized glyphs is mounted. Not one of them
// participates in layout:
//
//   • the label text is identical in both states, and so is its size and its
//     weight — no `font-semibold` on the selected chip, which is the usual way
//     this bug gets in;
//   • the glyph is always present and always `size-3.5`, so `IconPlus` and
//     `IconCheck` occupy the same 14px box. A check that appears on selection
//     and a label that gains a suffix were both considered and both move the
//     right edge of the chip;
//   • `shadow-edge` is a box-shadow, so the off chip's hairline paints outside
//     layout rather than adding a border's 1px;
//   • the press feedback is `scale`, a transform, which does not reflow; and
//     the transition list is the primitive's own
//     `[color,background-color,box-shadow,transform]`, four properties that
//     are all paint.
//
// Every chip is therefore byte-for-byte the same width on and off, the line
// breaks are fixed the moment the component mounts, and there is nothing left
// for a click to move. The confirm line below is the one string that does
// change width, which is why it lives on its own pinned row where the change
// cannot reach the paragraph.

export function InlineSkills({ className }: { className?: string }) {
  const [on, setOn] = useState<ReadonlySet<string>>(() => new Set(PRESELECTED_SKILL_IDS));
  const [speaking, setSpeaking] = useState(true);
  // Cleared by any edit: a confirmation is about a set, and the moment the set
  // moves the acknowledgement is describing something that is no longer true.
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setSpeaking(false), SPEAK_MS);
    return () => window.clearTimeout(id);
  }, []);

  const toggle = (id: string) => {
    setConfirmed(false);
    setOn((prev) => {
      const next = new Set(prev);
      // `delete` reports whether it removed anything, which is the membership
      // test and the removal in one step.
      if (!next.delete(id)) next.add(id);
      return next;
    });
  };

  const count = on.size;
  const label = confirmed
    ? count === 0
      ? "Skipped for now"
      : `Added ${count} skill${count === 1 ? "" : "s"}`
    : count === 0
      ? "Continue without skills"
      : `Add ${count} skill${count === 1 ? "" : "s"}`;

  return (
    // A local provider, at a delay. The root layout opens tooltips at 0ms,
    // which is right for a toolbar and wrong for six triggers strung across
    // three lines of prose: crossing the sentence with a pointer would strobe.
    // Radix's own skip window is left alone, so once you are reading these the
    // rest still come instantly.
    <TooltipProvider delayDuration={350}>
      <div className={cn("flex w-full flex-col", className)}>
        {/* 16px on a 32px line: one step under the h1 it answers, which is the
            same voice at conversational volume rather than a second title.
            `font-normal` because every heading SIZE bakes the 600 heading
            weight and a 600 sentence is a shout; `text-foreground` because
            brand rule 2 gives the first tier to the voice.

            `leading-8` is bought for the chips, exactly as the h1's `leading-9`
            is: a ~23px chip needs a line box tall enough that it never becomes
            the tallest thing on its line. `text-pretty` rather than the h1's
            `text-balance` — balancing a three-line paragraph full of atomic
            pills likes to strand one chip on a line of its own, where pretty
            only protects the last line from a widow.

            No `max-w-*`. The prose measure rule would cap this near 70ch, but
            the sentence is answering an h1 that runs the full 752px column and
            a narrower one would read as a pull-quote. The parent owns the
            measure. */}
        <p
          className={cn(
            "text-base leading-8 font-normal text-pretty text-foreground",
            speaking && SHIMMER,
          )}
          style={
            speaking
              ? sweepStyle(SENTENCE_TEXT.length, "var(--shimmer-sweep)", "var(--color-foreground)")
              : undefined
          }
        >
          {LEAD}
          {CLAUSES.map((clause) => (
            <Fragment key={clause.clause}>
              {clause.skills.map((skill, i) => (
                <Fragment key={skill.id}>
                  {i > 0 && " and "}
                  <SkillChip skill={skill} on={on.has(skill.id)} onToggle={() => toggle(skill.id)} />
                </Fragment>
              ))}
              {clause.clause}{" "}
            </Fragment>
          ))}
          {TAIL}
        </p>

        {/* The confirm, and the only place a number lives.

            Third tier, 13px, underlined on the hairline the flow's foot links
            already wear (signup-legal.tsx) — a text affordance rather than a
            button, because a filled button here would be the loudest thing on
            a screen whose argument is that the suggestion needs no chrome. The
            count sits inside the label instead of beside it so there is one
            object to read and one thing to press.

            `tabular-nums` on the row: the digit is the only glyph that changes
            on a toggle, and a proportional 1 against a proportional 4 would
            shift the words after it. It cannot reach the paragraph from here,
            but a number that jiggles under a sentence that does not is the
            kind of detail that reads as sloppiness without ever being named.

            The row is a fixed 24px, so the label may say four different things
            at four different widths and the block below it never moves. That
            is also what lets the affordance stay hidden while the sentence is
            still arriving: you cannot accept a list that has not finished
            being read out. `inert` as well as `aria-hidden`, because a hidden
            button is still in the tab order otherwise.

            It acknowledges rather than resetting. A control that answers a
            click with nothing gets clicked three more times; a control that
            flashes and reverts asks you to catch it. This one holds "Added 3
            skills" until you change the set, which is the only reading that is
            still true a second later. Nothing authenticates: the set lives in
            this component and the mock is static, like everything else in this
            directory. */}
        <div className="mt-3 flex h-6 items-center">
          <Button
            type="button"
            variant="link"
            size="none"
            inert={speaking}
            aria-hidden={speaking || undefined}
            onClick={() => setConfirmed(true)}
            className={cn(
              "rounded-xs text-md leading-5 font-normal text-foreground-low tabular-nums underline decoration-border-loud underline-offset-4",
              "transition-[color,opacity,text-decoration-color] duration-(--duration-fast) ease-out-quart motion-reduce:transition-none",
              "hover:text-foreground hover:decoration-foreground",
              speaking ? "pointer-events-none opacity-0" : "opacity-100",
            )}
          >
            {label}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
