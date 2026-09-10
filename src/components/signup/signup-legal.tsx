import { cn } from "@/lib/utils";

// The foot of the page: the terms, and nothing else. They sit on the third
// text tier so they read as provenance rather than copy; the links inside step
// up to the first tier and carry the brand's underline (the `.genui-prose a`
// treatment in src/design/brand/brand.css: 4px offset, a hairline decoration
// that darkens on hover).
//
// One line, not a paragraph: the long disclosure was doing the job of a terms
// page inside a signup screen. The short form is the convention across the
// auth pages we looked at, and the detail lives behind the two links.
//
// This used to be a centring column wrapping a log-in escape hatch above the
// terms. The escape hatch is gone, so the wrapper is gone with it: one
// paragraph needs no flex parent, and `w-full` keeps the measure the wrapper
// used to set.
//
// Two feet live here, one per screen, sharing LINK so they are typographically
// the same line and the swap between them changes only the words. The signin
// screen owes you the terms; the profile screen owes you something else
// entirely — it just filled three fields you never typed, so the line in that
// slot has to answer "where did that come from" before anyone has to ask.
const LINK =
  "rounded-xs font-medium text-foreground underline decoration-border-loud underline-offset-4 outline-none transition-[text-decoration-color] duration-(--duration-fast) ease-out-quart hover:decoration-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function SignupLegal({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "w-full text-center text-xs leading-5 text-foreground-low",
        className,
      )}
    >
      By signing up, you agree to our{" "}
      <a href="#" className={LINK}>
        Terms of Service
      </a>{" "}
      and{" "}
      <a href="#" className={LINK}>
        Privacy Policy
      </a>
    </p>
  );
}

// The profile screen's foot. It states the provenance in the sentence itself
// rather than hiding all of it behind the link, because the two sources have
// very different stakes: the name and photo came from a token the user just
// consented to, while the company details came from a third-party lookup they
// did not. Naming both in the open is the honest version, and the link is
// there for the detail rather than for the disclosure.
export function SignupProvenance({ className }: { className?: string }) {
  return (
    <p className={cn("w-full text-center text-xs leading-5 text-foreground-low", className)}>
      From your Google account and public company records.
      {/* The link takes its own line rather than running on. Together the two
          run past the 384px column, and a wrapped link breaks across the line
          mid-phrase — the underline stops in the middle of "we get" and the
          one interactive thing in the foot stops looking like one thing.
          `block` also widens the target to the full column, which is the whole
          justification for a 12px link on touch. */}
      <a href="#" className={cn(LINK, "mt-0.5 block")}>
        How we get this information
      </a>
    </p>
  );
}
