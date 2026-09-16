import Link from "next/link";

import { Mark } from "@/components/brand/mark";
import { Button } from "@/components/ui/button";

import { A11Y, LINKS, NAV } from "./content";

// The page's only chrome, adapted from v1 for the dark ground: the wordmark,
// five in-page links (hidden below md; the footer repeats them), Log in and
// the primary Start pill (light on ink, since `primary` flips with the
// wrapper's `dark`). It sticks on the canvas at 85% with the glass blur and
// one hairline, and it never animates. Every control is 44px tall on a
// phone (a thumb) and the brand's 32px beside a pointer.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-(--z-sticky) border-b border-border-subtle bg-background/85 px-4 backdrop-blur-glass sm:px-6">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6">
        <Link
          href={LINKS.home.href}
          className="flex h-11 items-center gap-2 rounded-md text-base font-medium text-foreground"
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
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-11 min-w-11 md:h-8"
          >
            <Link href={LINKS.logIn.href}>{LINKS.logIn.label}</Link>
          </Button>
          <Button asChild size="sm" className="h-11 md:h-8">
            <Link href={LINKS.start.href}>{LINKS.start.label}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
