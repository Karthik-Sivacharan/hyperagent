import Link from "next/link";

import { Mark } from "@/components/brand/mark";
import { Button } from "@/components/ui/button";

import { A11Y, NAV } from "../a/content";
import { LINKS } from "./content";

// Variant A's header, unchanged but for the wordmark, which points at this
// variant's own route: the wordmark with the in-page links grouped beside it
// (hidden below lg), Log in and the ink Start button at the right edge. It
// sticks on the paper ground at 85% with the glass blur and one hairline.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-(--z-sticky) border-b border-border-subtle bg-surface-secondary/85 px-4 backdrop-blur-glass sm:px-6">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6">
        <Link
          href={LINKS.home.href}
          className="flex items-center gap-2 rounded-md py-2.5 text-base font-semibold text-foreground"
        >
          <Mark size={20} />
          {LINKS.home.label}
        </Link>
        <nav
          aria-label={A11Y.mainNav}
          className="hidden flex-1 items-center gap-1 lg:flex"
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
          <Button asChild variant="ghost" size="sm" className="h-11 md:h-8">
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
