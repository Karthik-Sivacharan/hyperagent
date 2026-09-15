import Link from "next/link";

import { Mark } from "@/components/brand/mark";
import { Overline } from "@/components/ui/overline";

import { FOOTER, LINKS, type LandingLink } from "./content";

// A footer link: 14px on the second tier, lifting to the first on hover. It
// is a block with 12px above and below on a phone (a 44px row for a thumb)
// and 4px beside a pointer, so the whole row takes the tap and the list
// needs no gap to keep that pitch.
const LINK_CLASS =
  "inline-block py-3 md:py-1 text-sm text-muted-foreground transition-colors duration-(--duration-fast) ease-out-quart hover:text-foreground";

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

// The footer sits on the same ink as the rest of the page (the wrapper's
// `dark` already re-maps every token), under one hairline: the wordmark,
// then a caps label over each group of links.
export function SiteFooter() {
  return (
    <footer className="bg-background px-4 text-foreground sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-10 border-t border-border-subtle py-12 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href={LINKS.home.href}
          className="flex h-11 items-center gap-2 self-start rounded-md text-base font-medium text-foreground"
        >
          <Mark size={20} />
          {LINKS.home.label}
        </Link>
        {FOOTER.groups.map((group) => (
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
    </footer>
  );
}
