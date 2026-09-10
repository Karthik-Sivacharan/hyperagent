"use client";

import Image from "next/image";
import { IconSparkles } from "@tabler/icons-react";

import { MaterialMark } from "@/components/brand/logo-motion/material-mark";
import { FoundCard } from "@/components/signup/found-card";
import { SignupProvenance } from "@/components/signup/signup-legal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  SIGNUP_COMPANY,
  SIGNUP_PERSON,
  signupFullName,
  signupInitials,
} from "@/lib/mock/signup-identity";
import { cn } from "@/lib/utils";

// What the screen shows once the provider has come back: the record we built,
// as two cards you confirm rather than a form you fill. The whole argument of
// the flow is that the fields are already right, so the primary action is
// "carry on with these" and editing is the exception — hence a corner pencil
// on each card instead of six inputs.
//
// The mark stays, at the loading screen's 44px rather than the landing
// screen's 64. Reading the three sizes in order — 64 at rest, 44 turning, 44
// still — the mark shrinks as it starts working and stays small once the page
// has a subject of its own. It is `spin="hover"` again here: the work is done,
// so it goes back to being a logo you can play with.
const MARK_PX = 44;

export function ProfileStep({
  headingRef,
  className,
}: {
  /** Focus lands here on arrival — see the note in signup-screen.tsx. */
  headingRef?: React.Ref<HTMLHeadingElement>;
  className?: string;
}) {
  return (
    <div className={cn("flex w-full flex-col items-center", className)}>
      <MaterialMark size={MARK_PX} />

      {/* Their name, not the product's: the landing screen already introduced
          Hyperagent, and repeating it here would spend the one line that can
          instead prove the page knows who arrived. */}
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-6 text-center font-heading text-2xl font-strong outline-none"
      >
        Welcome, {SIGNUP_PERSON.firstName}
      </h1>
      <p className="mt-1 text-center text-sm text-muted-foreground">
        Here&rsquo;s what we found. Change anything that&rsquo;s off.
      </p>

      <div className="mt-7 flex w-full flex-col gap-3">
        <FoundCard
          media={
            // size-12 overrides the primitive's default 32px: at 48 the photo
            // is a portrait rather than a list-row bullet, and it matches the
            // company tile below it so the two cards share a left edge.
            <Avatar className="size-12">
              <AvatarImage asChild src={SIGNUP_PERSON.avatarSrc} alt="">
                {/* next/image so the 800px source is served at the 2x this
                    needs. `alt=""` because the name is right beside it. */}
                <Image src={SIGNUP_PERSON.avatarSrc} alt="" width={96} height={96} priority />
              </AvatarImage>
              <AvatarFallback className="text-sm">{signupInitials}</AvatarFallback>
            </Avatar>
          }
          title={signupFullName}
          subtitle={SIGNUP_PERSON.role}
          editLabel="Edit your name and role"
        >
          {/* Mono, because an address is an identifier and the brand reserves
              Geist Mono for exactly that (docs/brand/design.md §7). It also
              stops the address from reading as a third line of prose. */}
          <p className="truncate font-mono text-md text-foreground-low">{SIGNUP_PERSON.email}</p>
        </FoundCard>

        <FoundCard
          media={
            // The logo keeps its own purple (brand rule 10: imagery is not
            // tokenised), so the tile under it has to work in both themes.
            // `bg-card` is the one fill that steps AWAY from the card in both:
            // white against the light card's tint, and neutral-900 above the
            // dark one. A second tint would have vanished into the first.
            <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-card shadow-edge">
              <Image
                src={SIGNUP_COMPANY.logoSrc}
                alt=""
                width={96}
                height={96}
                className="size-8 object-contain"
              />
            </span>
          }
          title={SIGNUP_COMPANY.name}
          subtitle={SIGNUP_COMPANY.domain}
          editLabel="Edit your company details"
          footer={
            <div className="flex flex-wrap gap-1.5">
              {SIGNUP_COMPANY.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          }
        >
          {/* Clamped at two lines, the measurement taken off the Gumloop tile:
              a description that can grow to four lines makes a row of cards
              ragged, and the third line is never the one that matters. */}
          <p className="line-clamp-2 text-sm text-muted-foreground">{SIGNUP_COMPANY.description}</p>
        </FoundCard>
      </div>

      {/* The one accent on the screen (brand rule 3), and it is spent on the
          path this whole flow exists to sell. The second action is the same
          tinted, hairlined row the provider buttons upstairs wear, so the
          column keeps one shape from the first screen to the last — and it
          names what you get rather than what you give up: "Skip" would make
          the quiet option sound like a loss. */}
      <div className="mt-7 flex w-full flex-col gap-2.5">
        <Button type="button" variant="brand" size="lg" shape="soft" className="w-full">
          <IconSparkles aria-hidden="true" />
          Personalize my onboarding
        </Button>
        <Button
          type="button"
          variant="tint"
          size="lg"
          shape="soft"
          className="w-full border border-input text-foreground"
        >
          Set up manually
        </Button>
      </div>

      <SignupProvenance className="mt-8" />
    </div>
  );
}
