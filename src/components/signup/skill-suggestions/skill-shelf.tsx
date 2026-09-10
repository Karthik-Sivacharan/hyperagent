"use client";

import { useId, useState } from "react";
import { IconCheck } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PRESELECTED_SKILL_IDS, SUGGESTED_SKILLS, type SuggestedSkill } from "@/lib/mock/suggested-skills";
import { cn } from "@/lib/utils";

// The six suggested skills, one block under the four agent cards.
//
// THE ARGUMENT. By the time this block is reached the screen has already said
// everything it has to say in cards: two record cards on the step before, four
// agent cards immediately above. A question card here — a bordered panel with
// a prompt at the top and a row of chips inside it — would be the screen
// changing its mind about what kind of object a suggestion is, three
// suggestions in. So the skills arrive as cards too, in the same material as
// their neighbours, and the block reads as the sentence continuing rather than
// as a form appearing at the end of it. The only new copy is one lead-in line,
// because the reader already knows what this screen is doing.
//
// MIRRORED, NOT IMPORTED, and the precedent for that is AgentCard itself.
// AgentCard wears FoundCard's look without being built on FoundCard, for a
// reason it states in its own header: the anatomy is different, and composing
// it would have meant making three parts optional and then passing three
// nulls. The same is true one step further out. AgentCard takes a
// `SuggestedAgent`, a `ready` flag and a skeleton layer keyed to the research
// pass; a skill has no tool row, no pending state (it was on skills.sh before
// this account existed) and four fields the agent has none of. Importing it
// would mean either handing it a fake agent — a lie in the type — or widening
// its props for a caller it does not know about, which is the one thing a
// variant built beside it must not do. What carries the family is the shell
// string, copied deliberately rather than approximately: `bg-tint-7` at rest,
// `bg-tint-10` on hover, `bg-tint-20` picked, `shadow-card-soft` under an
// `after:` rim, the same duration and the same focus ring. Same material, one
// size down.
//
// DENSITY: six cards in roughly the four agents' vertical budget. Three
// approaches were open — a denser card, more columns, or a shelf that hides
// two rows behind a reveal — and the reveal is the one that costs the most and
// buys the least here. It adds a control, a second state and a scoped box to
// keep the page still, all to hide two cards that are already cheap. Columns
// were tried and abandoned on measurement: at three columns a card is 242px,
// and `arvindrk/extract-design-system` alone overruns that line, so the
// provenance the mock data insists on would have had to go. So the density
// comes out of the CARD. It keeps the agent grid's two columns, which is what
// makes the two blocks read as one column of thought, and it drops one step on
// every axis: 12px of padding against 16, a 14px name against 16, a 12px body
// against 14, and no tool row at all. Six of these stack in about what four
// agent tiles cost, which is the whole claim.
//
// THE NAME IS MONO because it is an identifier, not a title: skills.sh
// addresses this thing as `skills.sh/<repo>/<name>` and both halves are typed,
// not read. It is also the clearest single signal that a skill is a different
// kind of object from an agent — the cards above set their titles in the
// heading face — without spending a colour or a border to say so.
//
// SELECTION SPENDS NO ACCENT, and the neighbouring card learned this the hard
// way: its ring was `border-loud` first, which is tint-20, the same value as
// the fill under it, so the whole picked state came down to one tint step and
// could not be read. It is `bg-tint-20` under a hairline on the FOREGROUND
// now, and that pair is copied here exactly. What is added is the check mark,
// and it is added for a reason this block has and that one does not: the
// agents are a single pick, these stack. A leading checkbox is the one mark
// that says a set is being built rather than an option chosen, and with six
// cards and three of them on, a per-card glyph beats a fill step that can only
// be read by comparing across the grid. The mark wears the `Checkbox`
// primitive's own skin (`border-input` at rest, ink when on) but is a span:
// a real checkbox inside the card's button would be an interactive element
// nested in a control, and `aria-pressed` on the button already carries the
// state.
//
// NOTHING HERE CHANGES HEIGHT WHEN ITS STATE CHANGES, which is the binding
// constraint on this screen: the four steps share one centred grid cell, so
// any growth re-centres the column and drags the FLIP-animated mark with it
// (signup-screen.tsx). Every state this block has is paint. The fill, the
// hairline and the lift are background-color and box-shadow, neither of which
// takes part in layout; the check is a fixed 16px box whose glyph fades from
// `text-transparent` rather than mounting; the summary is clamped at two lines
// of static text; the foot row is a fixed `h-8` with a truncating status line
// and a `shrink-0` button, so the count and the button label change width and
// never wrap. The count is `tabular-nums` for the same reason one step down:
// a digit that changes width is a small layout shift inside a line.
//
// WHAT IS DELIBERATELY NOT ON THE CARD is `reason`, the one clause in the data
// that says why THIS record gets THIS skill. It is the best sentence in the
// file and it does not fit: the card's four lines are already what a reader
// needs to decide (what it is called, what it does, who publishes it, how many
// people run it), and a fifth line would push the block past the agents it is
// supposed to follow quietly. It is left in the data rather than trimmed away,
// because the block that eventually explains a suggestion out loud will want
// it.

/** The picked mark. Decorative: `aria-pressed` on the card carries the state. */
function PickMark({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-4 shrink-0 place-content-center rounded-sm border transition-[background-color,border-color,color] duration-(--duration-fast) ease-out-quart motion-reduce:transition-none",
        // The glyph is always in the box and only its colour moves, so the
        // mark develops instead of popping and the box never resizes.
        selected ? "border-primary bg-primary text-primary-foreground" : "border-input text-transparent",
      )}
    >
      <IconCheck className="size-3" aria-hidden="true" />
    </span>
  );
}

function SkillCard({
  skill,
  selected,
  onToggle,
}: {
  skill: SuggestedSkill;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    // The sanctioned raw-control shape: the card IS the pressable element, so
    // it is a `Card` with a button as its element and nothing in between,
    // exactly as thread/option-cards.tsx and agent-card.tsx do it
    // (components.test.ts checks that the button is the asChild primitive's
    // immediate child). `aria-pressed` rather than a checkbox role because the
    // card is the control here, and a pressed card is what the screen above
    // already established.
    <Card
      asChild
      size="none"
      className={cn(
        // `h-full` so a row of these squares up on the taller of the two, and
        // `gap-1` in place of the primitive's own `--card-spacing` gap
        // (tailwind-merge keeps the last one), which at `size="none"` is zero.
        // `rounded-xl` is the brand's 14px small-card radius rather than the
        // 22px the primitive defaults to: at 100px tall, 22px corners eat the
        // card. The rim has to follow the same radius or it draws a rounder
        // shape than the card it is lighting.
        "relative h-full w-full gap-1 rounded-xl p-3 text-left shadow-card-soft",
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-xl after:shadow-rim-soft",
        "transition-[background-color,box-shadow] duration-(--duration-slow) ease-out motion-reduce:transition-none",
        selected ? "bg-tint-20 shadow-card-hover ring-1 ring-foreground" : "bg-tint-7 hover:bg-tint-10",
        // The `.focus-ring` class expanded rather than applied: it sets a raw
        // `box-shadow`, which would wipe both the card's own shadow and the
        // picked hairline for as long as the card had focus. The ring
        // utilities compose through custom properties instead, so a picked
        // card that is also focused keeps everything it is wearing.
        "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      <button type="button" aria-pressed={selected} onClick={onToggle}>
        {/* Spans throughout: a button's content model is phrasing content and
            this one is full of boxes. */}
        <span className="flex min-w-0 items-center gap-2">
          <PickMark selected={selected} />
          <span className="truncate font-mono text-sm leading-5 font-medium text-foreground">{skill.name}</span>
        </span>

        {/* Two lines, the same clamp the agent cards take: the third line is
            never the one that matters, and letting it exist makes a grid of
            cards ragged. Every summary here leads with what the skill does, so
            two lines is the whole deciding fact. */}
        <span className="line-clamp-2 text-xs leading-4 text-muted-foreground">{skill.summary}</span>

        {/* Provenance, on the card's floor. `mt-auto` so it stays there when a
            short summary leaves a stretched card with room to spare — the row
            is the card's base line, not something trailing the copy. The repo
            is mono for the same reason the name is, and it is the half that
            truncates, because the count beside it is four characters that mean
            nothing once they are cut. */}
        <span className="mt-auto flex min-w-0 items-center gap-1.5 text-xs leading-4 text-foreground-low">
          <span className="truncate font-mono">{skill.repo}</span>
          <span aria-hidden="true">·</span>
          <span className="shrink-0 tabular-nums">{skill.installs} installs</span>
        </span>
      </button>
    </Card>
  );
}

export function SkillShelf({ className }: { className?: string }) {
  // A Set rather than an array: the only two questions this block asks are
  // "is this one on" and "how many", and both are one call on a Set.
  const [picked, setPicked] = useState<ReadonlySet<string>>(() => new Set(PRESELECTED_SKILL_IDS));
  // Local, and cleared by any change to the set, because a receipt that
  // outlives the thing it is a receipt for is a lie. Nothing installs here;
  // the flow is static, like every other mock in this directory.
  const [confirmed, setConfirmed] = useState(false);
  const leadId = useId();

  const count = picked.size;

  function toggle(id: string) {
    setConfirmed(false);
    setPicked((current) => {
      const next = new Set(current);
      // `delete` reports whether it removed anything, so the toggle is one
      // lookup rather than a `has` followed by a branch.
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

  return (
    <div className={cn("flex w-full flex-col", className)}>
      {/* One line, two tiers. The first half ties the block to the research
          pass that produced it, so this reads as the same reading continuing
          rather than as a new question; the second half is there because the
          four cards above are a single pick and these are not, and the reader
          should not have to discover that by clicking twice. Neither half
          names a number, so neither goes stale the moment the set changes. */}
      <p id={leadId} className="text-sm text-muted-foreground">
        The same reading turned up these skills.{" "}
        <span className="text-foreground-low">Pick as many as you like.</span>
      </p>

      {/* Two columns, the agent grid's own count, at a 12px gap rather than
          its 16: a tighter gutter is what makes a smaller card read as a
          smaller card rather than as the same card badly spaced. One column
          below `sm`, where two would put four words on a line. */}
      <div role="group" aria-labelledby={leadId} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SUGGESTED_SKILLS.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            selected={picked.has(skill.id)}
            onToggle={() => toggle(skill.id)}
          />
        ))}
      </div>

      {/* The foot: a fixed 32px line, so nothing in it can move the block.
          The count reads on the left and the action carries it on the right —
          the duplication is deliberate and only the left half is announced,
          because a button's label is read on focus and a live region that
          repeats it would say the number twice on every click. "of 6" is the
          part the button cannot say, and it is the part that tells a reader
          three more exist. */}
      <div className="mt-3 flex h-8 items-center justify-between gap-3">
        <p
          role="status"
          aria-live="polite"
          className="min-w-0 truncate text-xs text-foreground-low tabular-nums"
        >
          {confirmed
            ? `Added ${count} to your workspace. Change them any time in Skills.`
            : `${count} of ${SUGGESTED_SKILLS.length} picked`}
        </p>

        {/* Ink, not tangerine: brand rule 3 gives this screen exactly one
            accent and it is already spent on the composer's send arrow, which
            outranks this. Ink against tangerine is a legible second place;
            two tangerines would be no ranking at all. The confirmed state
            steps down to the hairline outline rather than swapping the label
            in place, so "done" is told by weight as well as by words. */}
        <Button
          size="sm"
          variant={confirmed ? "outline" : "default"}
          disabled={count === 0}
          onClick={() => setConfirmed(true)}
          className="shrink-0"
        >
          {confirmed ? (
            <>
              <IconCheck aria-hidden="true" />
              Added
            </>
          ) : count === 0 ? (
            "Add skills"
          ) : (
            `Add ${count} ${count === 1 ? "skill" : "skills"}`
          )}
        </Button>
      </div>
    </div>
  );
}
