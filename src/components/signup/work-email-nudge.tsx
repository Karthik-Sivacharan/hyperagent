import { IconCoins } from "@tabler/icons-react";

import { cn } from "@/lib/utils";

// The onboarding incentive that this signup page feeds: sign up with a work
// address and the account starts with token credit. It is the page's one
// accent moment, so it stays a single boxed callout rather than a banner
// (docs/brand/reskin-conventions.md, "one accent, rarely solid"): a full-width
// panel on the same 6px `rounded-sm` corner as the provider rows below it, so
// the column reads as one shape.
//
// The three oranges are all semantic tokens, never raw tangerine steps: each
// one already resolves to a different step per theme (`bg-brand-subtle` is
// tangerine-50 in light and tangerine-950 in dark, the copy tangerine-700 /
// tangerine-300, the icon tangerine-500 / tangerine-400), so the shading comes
// for free and dark mode stays dark — a hardcoded step would paint a near-white
// slab here. The hairline is an alpha of the accent for the same reason.
//
// `IconCoins` over `IconCurrencyDollar`: the copy already carries a "$100", so
// a second dollar glyph beside it just repeats itself; coins read as credit.
// The icon and copy centre as one unit, the same way the provider rows below
// centre their mark and label, so the column reads as one centred stack.
//
// REMOVABLE: delete this file and its one <WorkEmailNudge /> line in
// signup-screen.tsx. Nothing else refers to it.
export function WorkEmailNudge({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "flex w-full items-center justify-center gap-2.5 rounded-sm border border-brand-accent/20 bg-brand-subtle px-3.5 py-3 text-center text-sm font-medium text-brand-subtle-foreground",
        className,
      )}
    >
      <IconCoins className="size-4 shrink-0 text-brand-accent" aria-hidden="true" />
      Use your work email to get $100 in token credit
    </p>
  );
}
