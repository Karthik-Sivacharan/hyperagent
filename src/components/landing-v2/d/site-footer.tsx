import Link from "next/link";

import { Mark } from "@/components/brand/mark";
import { Overline } from "@/components/ui/overline";

import { type LandingLink } from "../a/content";
import { Reveal } from "../reveal";
import { FOOTER_D, LINKS } from "./content";

// A footer link: 14px on the second tier, lifting to the first on hover. On
// a phone each row is 44px tall (a thumb); beside a pointer it drops to 28.
// The box is only as wide as its label, and the shortest of them ("Log in")
// sets 39px, so `min-w-11` holds the other side of the thumb too.
const LINK_CLASS =
  "inline-block min-w-11 py-3 text-sm text-muted-foreground transition-colors duration-(--duration-fast) ease-out-quart hover:text-foreground md:py-1";

// In-page links are plain anchors; routes go through next/link.
function FooterLink({ link }: { link: LandingLink }) {
  if (link.href.startsWith("#")) {
    return (
      <a href={link.href} className={LINK_CLASS}>
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.href} className={LINK_CLASS}>
      {link.label}
    </Link>
  );
}

// Variant A's footer, with the wordmark pointing at this variant's route and
// D's own link groups: the wordmark, then a caps label over each group of
// links. A's footer continues the closing band's dark ground under one
// hairline; D no longer renders that band, so the footer's dark ground is
// itself the page's last edge and the hairline is gone — it would land
// exactly on the paper-to-ink change and read as a smudge on it. Restoring
// the closing band brings the hairline back with it.
//
// D is the short page, so it carries two groups rather than A's three: the
// sections that are actually on it, and the account links. The grid is a
// three-track row from `lg` to match (wordmark, Product, Account) instead of
// A's four, so the groups do not strand a column of air at the right.
//
// The inset is the page's heading-to-content step (64 / 80px), one below the
// band step the four sections above take, because the change of ground to ink
// is already the separator here and a band's worth of padding on top of it
// would read as a hole rather than as an ending.
export function SiteFooter() {
  return (
    <footer className="dark bg-background px-4 text-foreground sm:px-6">
      {/* The page's last arrival, on the same recipe as the three bands above
          so the ending is not the one thing that pops in. The three columns
          cross the fold together, so they take the row stagger the team cards
          take; the reveal sits on the columns rather than on the grid around
          them, so the 16px of rise stays inside the grid's own 64px of bottom
          padding and the document's scroll height never moves. */}
      <div className="mx-auto grid max-w-6xl gap-10 py-16 sm:grid-cols-2 md:py-20 lg:grid-cols-3">
        <Reveal className="self-start">
          <Link
            href={LINKS.home.href}
            className="-my-2.5 flex items-center gap-2 rounded-md py-2.5 text-base font-semibold text-foreground"
          >
            <Mark size={20} />
            {LINKS.home.label}
          </Link>
        </Reveal>
        {FOOTER_D.groups.map((group, index) => (
          <Reveal key={group.title} step={index + 1}>
            <nav aria-label={group.title} className="flex flex-col gap-2">
              <Overline asChild>
                <p>{group.title}</p>
              </Overline>
              <ul role="list" className="flex flex-col">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <FooterLink link={link} />
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>
        ))}
      </div>
    </footer>
  );
}
