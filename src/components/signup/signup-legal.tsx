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
