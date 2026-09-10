import Image from "next/image";
import { IconBriefcase } from "@tabler/icons-react";

import { SIGNUP_COMPANY, SIGNUP_PERSON } from "@/lib/mock/signup-identity";
import { cn } from "@/lib/utils";

// The three coloured pieces the chat step's opening sentence is built from.
// Each one names a different KIND of thing the flow read off the identity
// provider — a person, a role, a company — and the hue is what says which
// kind, before the eye reaches the word. Three tints in one sentence is the
// only reason this exists: with one tint they would read as three instances
// of the same thing, which is exactly what they are not.
//
// DELIBERATE DEVIATION from brand rule 8 (docs/brand/reskin-conventions.md:
// "status is quiet... success / warning / info appear as a small dot or a
// tinted chip"). Rule 8 is about not shouting an alarm; it assumes a status
// hue always MEANS a status. Here the three hues carry no state at all —
// nothing is failing, nothing succeeded — they are category labels, and the
// tokens are simply the only three distinct, theme-aware hues the system
// ships. The deviation is kept inside rule 8's own shape (a 10% tint with the
// hue as text, never a solid fill) and inside rule 3 (`brand` is NOT one of
// the three, so the screen's single tangerine is still the composer's send).
// `destructive` is left out for the obvious reason: red is the one hue that
// cannot be read as a neutral category.
//
// Blue for the person, green for the role, amber for the company. The order
// walks cool to warm across the sentence rather than jumping about, and amber
// lands on the one chip whose media is a real logo — Trainwell's purple mark
// reads against warm gold, where green would fight it.
type ChipTone = "info" | "success" | "warning";

const TONE: Record<ChipTone, string> = {
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
};

/**
 * One chip, sized to sit inside a 20px sentence on a 36px line.
 *
 * `inline-block` rather than the `inline-flex` this wants to be, and that is
 * the whole trick. An inline-block takes its baseline from the last line box
 * INSIDE it — the label — so the chip's word lands on exactly the same
 * baseline as the words either side of it, with no nudge and no magic number.
 * An inline-flex takes its baseline from its FIRST flex item instead, which
 * here is a 20px image whose baseline is its bottom edge; `align-middle` was
 * the usual escape from that and it left the label sitting 1.7px low against
 * the sentence, measured at 1456x868. So the label is plain inline text in the
 * chip's own line box and only the MEDIA is a flex box, wrapped and
 * `align-middle`d on its own — which is also what pins its height at exactly
 * 20px instead of letting a line box's descent stretch it.
 *
 * Nothing here sets a height. The chip comes out ~30px tall on Geist's
 * metrics, well under the sentence's 36px line box, so a chip never makes its
 * line taller than the lines around it and the paragraph keeps an even
 * rhythm (verified: a two-line sentence measures exactly 72px). A fixed
 * height would have to be re-derived every time the sentence changes size.
 * For the same reason there is no `overflow-hidden` anywhere on this box:
 * overflow on an inline-block moves its baseline to the bottom margin edge
 * and throws away everything above.
 *
 * `whitespace-nowrap` keeps the chip atomic: the sentence wraps AROUND it, so
 * a chip can end a line and the next word starts the next one, rather than the
 * chip splitting across the break and losing half its background.
 *
 * `rounded-lg` (10px) rather than the pill every other chip in the system
 * wears: brand.css names 10px "inline reference chips", and that is precisely
 * what these are. A full pill at this height reads as a control you can press.
 */
export function IdentityChip({
  tone,
  media,
  children,
  className,
}: {
  tone: ChipTone;
  /** The leading avatar, logo or icon. 20px square. */
  media: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "mx-0.5 inline-block rounded-lg py-1 pr-2 pl-1.5 align-baseline leading-none font-medium whitespace-nowrap",
        TONE[tone],
        className,
      )}
    >
      <span className="mr-1.5 inline-flex align-middle">{media}</span>
      {children}
    </span>
  );
}

/**
 * `data-morph` is the handle signup-screen.tsx flies the profile step's two
 * cards onto. It sits on the element whose box has to match the card's media
 * exactly — the image itself here, the plate below — because the animation is
 * a rect-to-rect transform and a wrapper with padding would land it short.
 */
export function PersonChip() {
  return (
    <IdentityChip
      tone="info"
      media={
        <Image
          data-morph="person"
          src={SIGNUP_PERSON.avatarSrc}
          alt=""
          width={80}
          height={80}
          className="size-5 shrink-0 rounded-sm object-cover"
        />
      }
    >
      {SIGNUP_PERSON.firstName}
    </IdentityChip>
  );
}

export function RoleChip() {
  return (
    <IdentityChip
      tone="success"
      // The one chip with no artwork behind it, so it takes a glyph in the
      // chip's own hue. A briefcase rather than a person: the person is the
      // chip before it, and this one is the job, not who holds it.
      media={<IconBriefcase className="size-5 shrink-0" aria-hidden="true" />}
    >
      {SIGNUP_PERSON.role}
    </IdentityChip>
  );
}

export function CompanyChip() {
  return (
    <IdentityChip
      tone="warning"
      media={
        // The same plate the company card upstairs puts its logo on, at 20px
        // instead of 48. `bg-card` for the same reason it gives there: the
        // mark keeps its own purple (brand rule 10, imagery is not tokenised),
        // so it needs a fill that steps away from the ground in BOTH themes,
        // and a second tint over the amber one would not.
        <span
          data-morph="company"
          className="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-card"
        >
          <Image
            src={SIGNUP_COMPANY.logoSrc}
            alt=""
            width={80}
            height={80}
            className="size-3.5 object-contain"
          />
        </span>
      }
    >
      {SIGNUP_COMPANY.name}
    </IdentityChip>
  );
}
