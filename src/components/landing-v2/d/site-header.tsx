import Link from "next/link";

import { Mark } from "@/components/brand/mark";
import { Button } from "@/components/ui/button";

import { A11Y } from "../a/content";
import { LINKS, NAV_D } from "./content";

// Variant A's header, with the wordmark pointed at this variant's own route
// and D's own nav beside it: the wordmark with the in-page links grouped next
// to it (hidden below lg), Log in and the Start button at the right edge. It
// sticks on the paper ground at 85% with the glass blur and one hairline.
//
// The links are D's, not A's: D is the short page, and A's five point at
// sections D does not carry.
//
// The two actions take `shape="soft"`, the squarer corner the hero's pair
// already uses (`rounded-sm`, 6px on the brand's 10px radius), so the header's
// Start and the hero's Launch agents read as one control at two sizes. The
// in-page links stay pills: a ghost button shows its corner on hover alone, and
// a row of soft rectangles there would read as five buttons rather than as
// navigation.
//
// Start keeps the default INK fill (`bg-primary` / `text-primary-foreground`),
// not the brand tangerine: the orange belongs to the hero, where the glyph in
// the headline and the call to action under it spend it together. A third
// orange in the chrome above them would make all three ordinary.
//
// Below `sm` the row carries the wordmark and Start alone. With both actions
// the row is 340px of content that cannot break — 117px of wordmark, the
// 24px gap, and two buttons that never wrap — against the 288px a 320px
// screen leaves between its gutters, so Start ran off the right edge and the
// page's own `overflow-x: clip` swallowed it without a scrollbar to show for
// it. Log in is the one that goes: it is the secondary of the two, and the
// hero repeats it a screen below and the footer again at the end. What is
// left measures 268px, inside the gutter on the narrowest phone.
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
          {NAV_D.map((item) => (
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
            shape="soft"
            className="h-11 min-w-11 max-sm:hidden md:h-8"
          >
            <Link href={LINKS.logIn.href}>{LINKS.logIn.label}</Link>
          </Button>
          <Button asChild size="sm" shape="soft" className="h-11 md:h-8">
            <Link href={LINKS.start.href}>{LINKS.start.label}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
