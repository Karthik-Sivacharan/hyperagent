import Link from "next/link";

import { Mark } from "@/components/brand/mark";
import { Button } from "@/components/ui/button";

import { A11Y, LINKS, NAV } from "./content";

// Adapted from v1's header for this variant's section ids. The wordmark,
// four in-page links (hidden below md; the footer repeats them), Log in and
// the ink Start button. Sticky on the paper ground at 85% with the glass
// blur and one hairline; it never animates. Controls are 44px on a phone.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-(--z-sticky) border-b border-border-subtle bg-background/85 px-4 backdrop-blur-glass sm:px-6">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6">
        <Link
          href={LINKS.home.href}
          className="flex min-h-11 items-center gap-2 rounded-md text-base font-semibold text-foreground"
        >
          <Mark size={20} />
          {LINKS.home.label}
        </Link>
        <nav
          aria-label={A11Y.mainNav}
          className="hidden flex-1 items-center gap-1 md:flex"
        >
          {NAV.map((item) => (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <a href={item.href}>{item.label}</a>
            </Button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="max-md:h-11">
            <Link href={LINKS.logIn.href}>{LINKS.logIn.label}</Link>
          </Button>
          <Button asChild size="sm" className="max-md:h-11">
            <Link href={LINKS.start.href}>{LINKS.start.label}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
