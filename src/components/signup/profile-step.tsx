"use client";

import Image from "next/image";
import { Mark } from "@/components/brand/mark";
import { FoundCard } from "@/components/signup/found-card";
import { SignupProvenance } from "@/components/signup/signup-legal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Overline } from "@/components/ui/overline";
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
//
// The mark itself is no longer rendered here, though. All three screens share
// one instance, owned by signup-screen.tsx and flown between them, because an
// instance per screen replays its entrance on every swap — the blink the flow
// used to open and close with. What this file keeps is the seat the mark lands
// in: an empty 44px box in the same place in the column, found by its data
// attribute. See MARK_SMALL_PX in signup-screen.tsx, which this has to match.

export function ProfileStep({
  headingRef,
  onPersonalize,
  className,
}: {
  /** Focus lands here on arrival — see the note in signup-screen.tsx. */
  headingRef?: React.Ref<HTMLHeadingElement>;
  /** Hands the flow to the chat step. Owned by signup-screen.tsx. */
  onPersonalize?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex w-full flex-col items-center", className)}>
      <div data-mark-slot="profile" className="size-11" />

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

      {/* Each card gets the caps group label the brand mandates over a group
          of cards (docs/brand/design.md §4.1, and the `.text-label-12-caps`
          note in brand.css names this exact case). Two cards with the same
          anatomy need to say which is which before the eye reaches their
          contents — without them the second card's "Trainwell" is doing double
          duty as both a company name and the reason the card exists.
          
          Left-aligned against the card's edge rather than centred with the
          heading above: a label belongs to the card under it, not to the page,
          and centring it would read as a second subheading. `gap-5` between
          the groups, `mb-2` inside one, so a label sits closer to the card it
          names than to the card above it. */}
      <div className="mt-7 flex w-full flex-col gap-5">
        <div>
          <Overline className="mb-2">You</Overline>
          <FoundCard
            media={
              // size-12 overrides the primitive's default 32px: at 48 the photo
              // is a portrait rather than a list-row bullet, and it matches the
              // company tile below it so the two cards share a left edge.
              //
              // ...and `rounded-xl` overrides its default circle, for the same
              // reason: the two cards are the same object twice, so their media
              // has to be the same shape. A circle beside a rounded square reads
              // as two different kinds of thing. Three overrides, because the
              // primitive rounds the root, the image and the fallback separately
              // and the root's hairline rides on an `after:` pseudo-element that
              // has to follow the corner too.
              <Avatar className="size-12 rounded-xl after:rounded-xl">
                <AvatarImage
                  asChild
                  src={SIGNUP_PERSON.avatarSrc}
                  alt=""
                  className="rounded-xl"
                >
                  {/* next/image so the 800px source is served at the 2x this
                    needs. `alt=""` because the name is right beside it. */}
                  <Image
                    src={SIGNUP_PERSON.avatarSrc}
                    alt=""
                    width={96}
                    height={96}
                    priority
                  />
                </AvatarImage>
                <AvatarFallback className="rounded-xl text-sm">
                  {signupInitials}
                </AvatarFallback>
              </Avatar>
            }
            title={signupFullName}
            subtitle={SIGNUP_PERSON.role}
            editLabel="Edit your name and role"
          >
            {/* Set in the body face, at the same size and tier as the company
              card's description below it. Geist Mono is the brand's identifier
              face and an address does qualify, but the two cards' body lines
              are the same slot in the same object, and setting one of them in
              a different typeface splits a pair that everything else about
              these cards works to hold together. */}
            <p className="truncate text-sm text-muted-foreground">
              {SIGNUP_PERSON.email}
            </p>
          </FoundCard>
        </div>

        <div>
          <Overline className="mb-2">Your company</Overline>
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
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {SIGNUP_COMPANY.description}
            </p>
          </FoundCard>
        </div>
      </div>

      {/* The one accent on the screen (brand rule 3), and it is spent on the
          path this whole flow exists to sell. The second action is the same
          tinted, hairlined row the provider buttons upstairs wear, so the
          column keeps one shape from the first screen to the last — and it
          names what you get rather than what you give up: "Skip" would make
          the quiet option sound like a loss. */}
      <div className="mt-7 flex w-full flex-col gap-2.5">
        <Button
          type="button"
          variant="brand"
          size="lg"
          shape="soft"
          className="w-full"
          onClick={onPersonalize}
        >
          {/* The mark rather than a sparkle: this button starts the thing the
              product does, so the product's own glyph is the honest label for
              it, and a sparkle is what everyone else's AI button wears. Flat
              and still — `Mark`, not a motion variant — because a 17px logo
              inside a button is an icon, and the material filters do not read
              below 40px anyway. It inherits `text-brand-foreground` from the
              button, so it paints as one piece with the label. */}
          <Mark size={17} />
          Hyperpersonalize my onboarding
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
