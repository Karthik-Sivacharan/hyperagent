"use client";

import { Composer } from "@/components/composer/composer";
import { AgentCard } from "@/components/signup/agent-card";
import { CompanyChip, PersonChip, RoleChip } from "@/components/signup/identity-chips";
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
// its own hue (identity-chips.tsx). Then the four agents it came back with,
// then a composer if the four are wrong. Nothing here is real: SUGGESTED_AGENTS
// is static, like every other mock in this repo.
//
// The column is wider than the three screens before it — 752px against 384 —
// because a 384px column would break the sentence across five lines and stack
// the agent cards one per row. signup-screen.tsx owns that widening; see the
// note on the stage there.

export function ChatStep({
  headingRef,
  className,
}: {
  /** Focus lands here on arrival — see the note in signup-screen.tsx. */
  headingRef?: React.Ref<HTMLHeadingElement>;
  className?: string;
}) {
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
          line with half of the first one empty. */}
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-6 text-xl leading-9 font-normal text-balance text-foreground outline-none"
      >
        Researching agents for <PersonChip /> to help with the <RoleChip /> role at{" "}
        <CompanyChip />
      </h1>

      {/* Two columns at this measure, one when the viewport cannot hold two.
          gap-4 is the repo's card-grid gap everywhere else (marketplace, home,
          settings, skills) and the 16px measured on the reference tile row. */}
      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SUGGESTED_AGENTS.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      {/* The out. Four suggestions are a guess, and the composer is where you
          say so — its placeholder is the only other copy on the screen, which
          is the point: the sentence is the hero and everything else is a
          control. No agent picker and no integrations strip, both of which
          name things that do not exist yet for this account. */}
      <Composer
        className="mt-7"
        showAgentPicker={false}
        showIntegrationsFooter={false}
        placeholder="Or tell me what you're working on…"
      />
    </div>
  );
}
