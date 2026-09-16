import { IconArrowUp } from "@tabler/icons-react";
import Link from "next/link";

import { Mark } from "@/components/brand/mark";
import { Overline } from "@/components/ui/overline";
import { cn } from "@/lib/utils";

import { type LandingLink } from "../a/content";
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

// The page's ending, in two tiers on the ink ground: the brand with the
// promise under it and the links beside it, then a hairline and one quiet
// line of fine print.
//
// IT IS TWO TIERS BECAUSE ONE DID NOT END ANYTHING. With a wordmark and two
// groups of unequal length on a single tier, the content stopped wherever the
// longest column ran out and left the rest of the ink blank, so the band read
// as a page that had been cut off rather than one that had finished. A rule
// with a short line under it is the terminator: it gives the ground a second
// edge to answer the first, and the blank that is left is now margin between
// two things instead of the absence of a third.
//
// The left column carries the promise in one sentence (`FOOTER_D.line`). That
// is the other half of the same fix — a lone wordmark in a column of its own
// is the thinnest thing on the page, and a short paragraph is what gives the
// side the links sit against any weight at all. The wordmark goes up a step
// from the header's 16px for the same reason: at the top it is the way home,
// and down here nobody needs that, so what is left for it to be is a signature.
//
// The two groups sit in equal tracks of the row's remaining width rather than
// hard against its right edge. Pushed right they clump into one block and the
// middle of the footer opens into a hole; spread, they keep the column rhythm
// the bands above use.
//
// NO HAIRLINE ON THE TOP EDGE. Variant A draws one because A's closing band is
// a full-bleed dark band and its footer continues that same ground, so without
// a line there is nothing to say where the band stops and the footer starts.
// D's closing band is a rounded panel on the paper ground with its own edges
// (`./closing`), so the footer's ink arrives on paper and the change of ground
// IS the edge. A hairline would land exactly on it and read as a smudge along
// it. The rule inside the footer is the only one it needs.
//
// The inset is the page's heading-to-content step (64 / 80px), one below the
// band step the four sections above take, because that change of ground is
// already doing a separator's work and a band's worth of padding on top of it
// would read as a hole rather than as an ending.
export function SiteFooter() {
  // Read from the clock at build time rather than written into the copy, so
  // the line cannot be left stamped with a year that has passed; see the note
  // on FOOTER_D. /landing/d prerenders, so the value is fixed per build, which
  // is also what keeps the page's screenshots comparable.
  const year = new Date().getFullYear();

  return (
    <footer className="dark bg-background px-4 text-foreground sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-12 py-16 md:py-20 lg:flex-row lg:gap-16">
          <div className="lg:w-1/3">
            <Link
              href={LINKS.home.href}
              className="-my-2.5 inline-flex items-center gap-2 rounded-md py-2.5 text-lg font-semibold text-foreground"
            >
              <Mark size={24} />
              {LINKS.home.label}
            </Link>
            <p className="mt-4 max-w-sm text-sm text-pretty text-muted-foreground">
              {FOOTER_D.line}
            </p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-x-8 gap-y-10 lg:gap-x-16">
            {FOOTER_D.groups.map((group) => (
              <nav
                key={group.title}
                aria-label={group.title}
                className="flex flex-col gap-2"
              >
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
            ))}
          </div>
        </div>
        {/* The fine print. The copyright takes the third text tier, which is
            the quietest the ink ground has that still measures over the 4.5:1
            floor (5.56:1); the way back up stays on the link tier because it
            is a link. Reversed on a phone so the one thing in the row that
            can be tapped sits above the line that cannot. */}
        <div className="flex flex-col-reverse items-start gap-1 border-t border-border-subtle py-4 sm:flex-row sm:items-center sm:justify-between sm:py-8">
          <p className="text-sm text-foreground-low">
            © {year} {LINKS.home.label}
          </p>
          <a
            href={FOOTER_D.top.href}
            className={cn(LINK_CLASS, "inline-flex items-center gap-1.5")}
          >
            {FOOTER_D.top.label}
            <IconArrowUp size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
