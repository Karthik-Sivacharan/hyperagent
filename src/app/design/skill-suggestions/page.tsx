"use client";

import { Overline } from "@/components/ui/overline";
import { SkillQuestionCard } from "@/components/signup/skill-suggestions/question-card";
import { SkillShelf } from "@/components/signup/skill-suggestions/skill-shelf";
import { InlineSkills } from "@/components/signup/skill-suggestions/inline-skills";

// Compare the three ways the signup flow could offer skills, the same way
// /design/tools compares the three Tools panels: each one is the real
// component with its real state, not a picture of one.
//
// STACKED, not three columns. These are all width-sensitive — the shelf's
// density, the chips' wrapping and the card's row truncation all change
// completely at a different measure — so each renders at 752px, which is
// exactly what the fourth signup screen gives them (the same box the agent
// cards and the composer already use). Three columns at a third of that would
// compare three things none of which is the thing that would ship.

const NOTES = [
  {
    id: "question-card",
    label: "A · The question card",
    blurb: "The product's own inline-question block, ticked rather than picked.",
    buys:
      "Borrowed credibility. This is the block the real thread already uses to ask something mid-turn, so it reads as the agent asking rather than as onboarding upselling. Densest of the three: six skills, their owners and their install counts all fit without scrolling.",
    costs:
      "It is a form, and it looks like one. Arriving right under four cards you have just been invited to click, a second list with tick boxes asks the reader to change mode. It is also the only one of the three that adds a new component shape to the screen.",
    Component: SkillQuestionCard,
  },
  {
    id: "skill-shelf",
    label: "B · The skill shelf",
    blurb: "The screen already speaks in cards, so the skills arrive as cards too.",
    buys:
      "One language for the whole screen. Nothing changes mode between the agents and the skills — same tint, same rim, same press — so the page reads as one continuous offer rather than two blocks stapled together. Cards also carry a summary comfortably, which the other two have to fight for.",
    costs:
      "Weight. Four agent cards plus six skill cards is ten pickable rectangles above one composer, and the skills are the less important half. Risks turning the screen into a catalogue at exactly the moment it should be handing over to the chat.",
    Component: SkillShelf,
  },
  {
    id: "inline-skills",
    label: "C · Inline in the stream",
    blurb: "The agent names them in the sentence it is already saying.",
    buys:
      "Almost no chrome. It stays a conversation, which is the thing this screen is trying to become — the agent mentions what it would pick up, and picking up is a click on the word. Lightest to add and the easiest to ignore, which for a secondary offer is a feature.",
    costs:
      "Least legible set. A reader scanning cannot see six skills as six things, install counts and owners have nowhere to live, and the sentence has to be written around the data rather than the other way round. Hardest of the three to keep from re-wrapping.",
    Component: InlineSkills,
  },
];

export default function SkillSuggestionsPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-8 py-12">
        <header className="flex flex-col gap-2">
          <Overline>Signup · skill suggestions</Overline>
          <h1 className="font-heading text-2xl">Three ways to offer skills</h1>
          <p className="max-w-content text-muted-foreground text-sm">
            Each block below is the live component at 752px, the measure the fourth signup screen
            gives it. Data is the real skills.sh listing read on 2026-09-10 — real names, real
            owners, real install counts.
          </p>
        </header>

        {NOTES.map(({ id, label, blurb, buys, costs, Component }) => (
          <section key={id} className="flex flex-col gap-4">
            <header className="flex flex-col gap-1">
              <Overline>{label}</Overline>
              <p className="text-foreground text-sm">{blurb}</p>
            </header>

            <dl className="grid max-w-content gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-foreground-low text-xs">Buys you</dt>
                <dd className="text-muted-foreground">{buys}</dd>
              </div>
              <div>
                <dt className="text-foreground-low text-xs">Costs you</dt>
                <dd className="text-muted-foreground">{costs}</dd>
              </div>
            </dl>

            {/* The 752px box, and a hairline around it so the variant's own
                edges are readable against the page rather than blending into
                it. The signup screen has no such frame; this is scaffolding. */}
            <div className="w-fit rounded-3xl border border-border-subtle border-dashed p-4">
              <div className="w-[752px] max-w-full">
                <Component />
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
