"use client";

import { useEffect, useId, useRef, useState } from "react";
import { IconCheck, IconDownload } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { NavItem } from "@/components/ui/nav-item";
import { PRESELECTED_SKILL_IDS, SUGGESTED_SKILLS, type SuggestedSkill } from "@/lib/mock/suggested-skills";
import { cn } from "@/lib/utils";

// The skills question, asked in the product's own voice.
//
// GROUND TRUTH is docs/reference/overlays/thread-question-card.html, captured
// off a live hyperagent.com thread on 2026-09-10: the inline block an
// assistant turn uses when it needs an answer before it can go on. Three
// parts, and the whole point is that they are always these three — a question
// at 14/20 medium in 16/16/12 of padding, option rows that bleed 8px past the
// card's measure and stand 32px tall behind a 16px indicator, and a footer
// holding Skip beside a confirm that is dead until something is chosen. The
// metrics below are that dump's; the materials are this repo's.
//
// It is a CHECKBOX where the product has a radio (`data-selection-kind="radio"`
// in the dump, one answer to one question). Skills are not alternatives to each
// other — a design engineer wants the taste one and the iOS one and the review
// one — so a set that forced a choice would be asking a question the reader
// does not have, and the indicator has to say so before the first click: round
// means one, square means as many as you like. Three arrive ticked, which is
// suggested-skills.ts's own argument (nothing ticked hands back the work the
// screen claimed to have done; everything ticked is not a suggestion).
//
// WHAT EARNS A PLACE ON A ROW. The row is 36px, so exactly one line of text
// gets through, and the data offers two prose fields for it. `summary` is the
// skill's own meta description, lifted from skills.sh — six of them stacked
// are six vendors pitching at once, and every one of them is a paraphrase of
// the name directly above it (`design-mobile-apps`, `web-design-guidelines`:
// the names do this work already). `reason` is the only line on this card that
// could not have been written before something read the record, and the card's
// entire claim is "these fit YOU". A suggestion screen that drops its reasons
// and keeps the vendor blurbs is a directory. So `reason` runs beside the
// name and `summary` is not rendered at all.
//
// `repo` and `installs` are the receipt, and they sit together at the row's
// far edge because that is what they are: where the thing came from and how
// many people took it. Both go in `text-label-12-mono` — brand.css reserves
// that role for "figures and provenance", which is these two exactly — and
// the marketplace's own install stat (`ListingStatPills`) already spells the
// pair as a download glyph plus the count, so this is the same object twice
// rather than a new one. The NAME stays in the sans: brand.css is explicit
// that a label naming a thing is not a mono label, and six mono names beside
// six sans clauses would turn a suggestion into a lockfile.
//
// NO ACCENT, and no ring either. The screen's one tangerine is the composer's
// send button (brand rule 3), so a tick is told in ink and tint: the row fills
// to `bg-tint-20`, and the indicator flips to the ink fill the app's own
// Checkbox wears on /memories. HANDOFF records that agent-card.tsx needed a
// hairline on the FOREGROUND on top of that fill, because its first attempt
// ringed a tint-20 fill in tint-20 and the whole state came down to one tint
// step. The lesson is the diagnosis, not the prescription — do not let
// selection rest on one step of the same material — and the answer here is a
// different one because the shape is different. One picked card in four is a
// spotlight and can afford an outline; three ticked rows in six are a group,
// and outlining half a list turns a calm card into a form with three flagged
// fields. The indicator carries it instead, and it carries it further than any
// ring could: an empty box against a filled one is a contrast flip, not a step.
//
// NOTHING HERE CHANGES HEIGHT, which is the constraint the whole screen is
// built around — the four steps share one centred grid cell and any growth
// re-centres the column and drags the flying mark with it (chat-step.tsx).
// Ticking is paint only: a fill, a border colour, a glyph already mounted at
// zero opacity. Every row is one line that cannot wrap (`truncate` under the
// row's own `whitespace-nowrap`), so `min-h-9` is a floor the content can
// never lift. And the confirm's label counts out loud, which is a width that
// moves, so it is given a fixed measure wide enough for "Install 6 skills"
// and tabular figures inside it; without both, every tick would nudge Skip
// sideways.
//
// THREE THINGS THE DUMP HAS THAT THIS DOES NOT. The collapse chevron, because
// collapsing is the one gesture this screen cannot survive and a question in a
// thread has somewhere to get out of the way TO. The scroller
// (`min-h-0 flex-1 overflow-y-auto`), because the product's card is sized by a
// panel and this one is sized by six rows that always fit; a scrollbar gutter
// waiting for a seventh is chrome paid for in advance. And the free-text row,
// because the composer sitting under this card on the same screen already IS
// the free-text answer, and two boxes asking "or say something else" are two
// doors to one room.

/**
 * The tick box: 16px, the metric the dump gives its indicator.
 *
 * Not the `Checkbox` primitive, and the reason is structural rather than
 * stylistic — radix renders a real `button[role=checkbox]`, and a control
 * inside the row's control is invalid HTML and an unreachable tab stop. The
 * row is the control; this is a picture of one, which is the same call the
 * product makes (its own radio indicator is a `div`). It reads as `IconTile`
 * for the same reason the dump's does: a small surface framing a glyph, named
 * with the slot the live site emits. The size and the tone are overridden
 * because 16px is below the tile scale's first step and "ink when ticked" is
 * not one of its three tones; what is borrowed is the centring and the name.
 *
 * The rest state and the ticked state are lifted verbatim from `checkbox.tsx`
 * (`border-input` on the canvas, then `bg-primary` with a white check) so a
 * tick box means the same thing here as it does on /memories. Consistency of
 * the small controls is most of what makes a set of screens feel like one
 * product.
 */
function Tick({ checked }: { checked: boolean }) {
  return (
    <IconTile
      aria-hidden="true"
      data-selection-kind="checkbox"
      tone="raised"
      className={cn(
        "size-4 rounded-sm border border-input shadow-none transition-[background-color,border-color,color] duration-(--duration-fast) ease-out-quart motion-reduce:transition-none",
        checked && "border-primary bg-primary text-primary-foreground",
      )}
    >
      {/* Mounted in both states and faded, never conditionally rendered: a
          glyph that arrives is a glyph that could reflow its box, and this box
          sits at the head of a row whose height is the screen's one hard
          constraint. The quarter-scale is the only motion on the card, it is
          answering a click, and it is transform-only. */}
      <IconCheck
        className={cn(
          "size-3.5 transition-[opacity,scale] duration-(--duration-fast) ease-out-quart motion-reduce:transition-none",
          checked ? "opacity-100 motion-safe:scale-100" : "opacity-0 motion-safe:scale-75",
        )}
        aria-hidden="true"
      />
    </IconTile>
  );
}

function SkillRow({
  skill,
  checked,
  onToggle,
  locked = false,
}: {
  skill: SuggestedSkill;
  checked: boolean;
  onToggle: () => void;
  /** The question has been answered: the tick is a record now, not a control. */
  locked?: boolean;
}) {
  return (
    // `NavItem` rather than a `Button`, because this repo already has a
    // primitive for "a full-width row you can press": tint hover, the chip's
    // 200ms colour move, no press-scale (0.98 is a pixel on a 32px button and
    // fourteen on a 720px row) and no `justify-center` to undo. What it does
    // not get is its `active` prop, which lifts the row to `font-medium` — a
    // weight change on selection is a reflow inside a row that has sworn not
    // to have one, so the ticked fill is set here by hand.
    //
    // `w-auto` cancels the primitive's `w-full`: a percentage width plus a
    // negative margin is over-constrained, so the row would have slid 8px left
    // instead of growing 8px each way, and the dump's `-mx-2` bleed is what
    // puts the hover fill outside the card's text measure where a list row's
    // fill belongs.
    //
    // `role="checkbox"` with `aria-checked` rather than `aria-pressed`,
    // because the box drawn at the head of the row says checkbox and the two
    // should not disagree; Space toggles it, as it would on the real control.
    // Focus is the app's global 2px ring (globals.css `:focus-visible`), the
    // same one every sidebar row wears, and it clears the card's clipped edge
    // with 4px to spare.
    //
    // LOCKED, once the question is answered, the row is `disabled` rather than
    // `inert`. Both stop the click; only `disabled` keeps the row in the
    // accessibility tree, and the six ticks are the one place the answer is
    // still spelled out in full — an inert list would leave a screen reader
    // with the footer's count and no names. Nothing about the fill moves: a
    // ticked row keeps its `bg-tint-20`, and the hover steps are dropped along
    // with the pointer so a record does not light up like an offer.
    <NavItem
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      disabled={locked}
      className={cn(
        // 36px and a 12px gap, over the dump's 32 and 8: at the dump's metrics
        // the name, reason and receipt ran into each other and read cramped.
        "-mx-2 min-h-9 w-auto gap-3 rounded-md px-2 text-left",
        locked
          ? cn("cursor-default", checked && "bg-tint-20")
          : checked
            ? "bg-tint-20 hover:bg-tint-20"
            : "hover:bg-tint-10",
      )}
    >
      <Tick checked={checked} />

      {/* Name and reason share a baseline rather than a centre line: two sizes
          centred against each other read as two rows squeezed into one.

          THE ORDER THINGS GIVE WAY IN, narrowest last: the reason, then the
          repo, and never the name. The name is the only field that is also an
          address, so a row that clips it has stopped naming the thing it
          offers. Flexbox shrinks in proportion rather than in order, so the
          order is built out of minimums instead:
            • the name is `whitespace-nowrap`, because a hyphenated name
              ("extract-design-system") otherwise reports its longest SEGMENT
              as its min-content, and the wrapper would shrink to that and let
              the rest of the name hang out of it;
            • the reason is `w-0 flex-1`, so it contributes nothing to the
              wrapper's min-content — a truncating label still reports its
              whole string there, which is the classic trap;
            • so this wrapper, with no `min-w-0`, can never be narrower than
              the name plus its gap, and every pixel it cannot give up has to
              come out of the receipt, where the repo truncates.
          Measured: nothing escapes from a 752px card down to 290 (it did from
          440 down before); at 752, 712, 600 and 512 every row is
          pixel-identical to the version without this rule, because there the
          wrapper's share already clears the name. The install count is the
          last thing standing and it is pushed 9px out of a 280px card, a
          column the shell never produces (its floor is 512 while docked) and
          only a phone under ~325px wide would. */}
      <span className="flex flex-1 items-baseline gap-3">
        <span className="shrink-0 whitespace-nowrap font-medium text-foreground">{skill.name}</span>
        {/* The 13px metadata role, one tier down, and the first thing to give
            way when the column narrows — it is the line this card added, so it
            is the line this card can afford to lose. */}
        <span className="w-0 min-w-0 flex-1 truncate text-md text-muted-foreground">{skill.reason}</span>
      </span>

      {/* The receipt. `aria-label` carries the unit the glyph carries visually,
          exactly as ListingStatPills does it, so the row's accessible name ends
          "259.3K installs" rather than a bare number. */}
      <span className="flex min-w-0 shrink items-center gap-3 text-label-12-mono text-foreground-low">
        <span className="truncate">{skill.repo}</span>
        <span className="inline-flex shrink-0 items-center gap-1" aria-label={`${skill.installs} installs`}>
          <IconDownload className="size-3" aria-hidden="true" />
          {skill.installs}
        </span>
      </span>
    </NavItem>
  );
}

/**
 * What the reader chose. `install` carries the ids in the rows' own order,
 * which is the mock's relevance order, so the thread can name them in the
 * order the card listed them.
 */
export type SkillAnswer = { kind: "install"; ids: string[] } | { kind: "skip" };

export function SkillQuestionCard({
  className,
  question = "Which skills should I install?",
  onAnswer,
  answered = false,
}: {
  className?: string;
  /**
   * The question, in the product's 14/20 medium. Defaults to the wording the
   * comparison page has always shown; the thread passes one that names the
   * agent it just drafted.
   */
  question?: string;
  /**
   * Wires Skip and Install. Omitted, both stay the inert pair they are on
   * /design/skill-suggestions, where there is nothing downstream to answer
   * INTO — the same opt-in shape the Composer's `onSend` has, for the same
   * reason.
   */
  onAnswer?: (answer: SkillAnswer) => void;
  /**
   * The question has been answered. Rows lock and the footer turns into the
   * outcome. Owned by the caller rather than set here on click, because the
   * card is one message in a thread and the thread decides when an answer has
   * been taken.
   */
  answered?: boolean;
}) {
  const questionId = useId();
  const [picked, setPicked] = useState<ReadonlySet<string>>(() => new Set(PRESELECTED_SKILL_IDS));
  // Which button was pressed, kept here because only this card knows it: the
  // caller's `answered` is a yes/no, and the footer has to say WHICH answer.
  const [chosen, setChosen] = useState<SkillAnswer["kind"] | null>(null);
  const count = picked.size;

  // Focus is RESCUED, never taken. The button the reader pressed is about to
  // be replaced by the outcome line, and a focused element that unmounts drops
  // focus to <body>, so the next Tab would start from the top of the document.
  // The outcome catches it, on two conditions: the footer held focus when the
  // answer was given, and nothing has put focus anywhere else since. The
  // second one is the caller's right of way — the thread hands focus to its
  // composer in the same handler that takes the answer, because the next
  // thing a reader does in a thread is write, and a card that pulled focus
  // back onto its own receipt would be overruling that from inside a message.
  // `preventScroll` because the thread owns its own scroll.
  const footerRef = useRef<HTMLDivElement>(null);
  const outcomeRef = useRef<HTMLParagraphElement>(null);
  const footerHadFocus = useRef(false);
  useEffect(() => {
    if (!answered || !footerHadFocus.current) return;
    footerHadFocus.current = false;
    const active = document.activeElement;
    const dropped = !active || active === document.body || !!footerRef.current?.contains(active);
    if (dropped) outcomeRef.current?.focus({ preventScroll: true });
  }, [answered]);

  const answer = (next: SkillAnswer) => {
    footerHadFocus.current = footerRef.current?.contains(document.activeElement) ?? false;
    setChosen(next.kind);
    onAnswer?.(next);
  };

  // What the footer reports once it is a record. Past tense and a count, the
  // same shape inline-skills.tsx's confirm settles into, with the verb the
  // button used — "Install" becomes "Installed", not "Added", so the answer
  // and the question stay one action. An `answered` with no press behind it
  // (the caller answered for the reader) reads as the ticks say.
  const outcome =
    chosen === "skip" || (chosen === null && count === 0)
      ? "Skipped for now"
      : `Installed ${count} ${count === 1 ? "skill" : "skills"}`;

  return (
    // The shell found-card.tsx and agent-card.tsx already wear on this screen:
    // `size="none"` so the dump's own 16/16/12 padding survives, `bg-tint-7`
    // because a percentage of the theme's neutral steps the same amount in
    // both themes (and `bg-card` is the canvas in light, which would make this
    // a card you cannot see), and the soft shadow with its rim light so the
    // three cards on the screen read as one family rather than three
    // strangers. The dump's 16px corner becomes the brand's 22: this card
    // sits beside the agent tiles, and matching them beats matching the site.
    <Card
      size="none"
      className={cn(
        "relative w-full bg-tint-7 shadow-card-soft",
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-3xl after:shadow-rim-soft",
        className,
      )}
    >
      {/* The question, at the dump's 14/20 medium. Short and functional, the
          way the product asks ("What kind of output should this rubric
          evaluate?"), and it uses the verb the confirm button repeats — the
          question and its answer should not be two different actions. */}
      <p id={questionId} className="px-4 pt-4 pb-3 text-sm leading-5 font-medium text-foreground">
        {question}
      </p>

      {/* 4px between rows, where the dump stacks them flush: flush, three
          ticked rows fused into one tinted slab and the list read cramped. It
          costs 20px of column, and each tick stays its own row. The group is
          labelled by the question so a screen reader meets the six checkboxes
          with the sentence they answer. */}
      <div role="group" aria-labelledby={questionId} className="flex flex-col gap-1 px-4">
        {SUGGESTED_SKILLS.map((skill) => (
          <SkillRow
            key={skill.id}
            skill={skill}
            checked={picked.has(skill.id)}
            locked={answered}
            onToggle={() =>
              setPicked((current) => {
                const next = new Set(current);
                if (!next.delete(skill.id)) next.add(skill.id);
                return next;
              })
            }
          />
        ))}
      </div>

      {/* Skip immediately left of the confirm, both at the right edge. The
          dump reaches that with `justify-between` and an empty span holding
          the left half open; one `justify-end` renders the same footer with
          one fewer node.

          Both are terminal. Without `onAnswer` this card has nothing
          downstream to be terminal INTO, so neither carries a handler — the
          same shape found-card.tsx's pencil has, and the honest one: a confirm
          that faked a success state would be the one lie suggested-skills.ts
          went out of its way not to tell. With it, the thread is downstream,
          and pressing either one sends the answer there.

          They stay pills. The dump's 8px is the site's button radius and the
          re-skin's whole job is to replace it (brand rule 6: pill controls);
          8px survives on the rows above, where it is also the brand's own
          menu-item radius, but two square buttons here would be the only
          non-pill controls on a screen whose composer, escape hatch and every
          card action are pills.

          ANSWERED, the pair gives way to the outcome in the same box. The row
          is `h-8` either way — two `size="sm"` buttons or one 32px line — so
          the card keeps its height exactly and a thread that has scrolled to
          it does not jump when it resolves. Right-aligned, so the words land
          where the button that caused them was. */}
      <div ref={footerRef} className="flex items-center justify-end gap-2 px-4 pt-3 pb-4">
        {answered ? (
          // `role="status"` so the outcome is announced once when it replaces
          // the buttons; `tabIndex={-1}` only so a dropped focus has somewhere
          // to land (see the effect above) — it is not a tab stop. Third tier and a
          // check, the quiet shape a receipt takes everywhere else in this
          // flow (research-signals.tsx's "Read 5 sources"). The check is only
          // for an install: a skip that wore a tick would be celebrating
          // nothing.
          <p
            ref={outcomeRef}
            role="status"
            tabIndex={-1}
            className="flex h-8 items-center gap-1.5 text-sm text-foreground-low outline-none tabular-nums"
          >
            {chosen !== "skip" && count > 0 && <IconCheck className="size-3.5" aria-hidden="true" />}
            {outcome}
          </p>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAnswer ? () => answer({ kind: "skip" }) : undefined}
            >
              Skip
            </Button>
            {/* Ink, not `brand`: rule 3 gives the screen one tangerine and the
                composer's send arrow has it. `min-w-36` holds the widest label
                this can ever print, and the tabular figures keep the digit from
                breathing, so counting up from one to six moves nothing.

                The ids go out in the ROWS' order, not the order they were
                ticked: the set is a set, and the thread naming them in the
                order the card listed them is the one order the reader has
                already seen. */}
            <Button
              type="button"
              size="sm"
              disabled={count === 0}
              className="min-w-36 tabular-nums"
              onClick={
                onAnswer
                  ? () =>
                      answer({
                        kind: "install",
                        ids: SUGGESTED_SKILLS.filter((skill) => picked.has(skill.id)).map((skill) => skill.id),
                      })
                  : undefined
              }
            >
              {count === 0 ? "Install skills" : `Install ${count} ${count === 1 ? "skill" : "skills"}`}
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
