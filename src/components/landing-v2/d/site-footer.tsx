import Link from "next/link";

import { Mark } from "@/components/brand/mark";
import { Overline } from "@/components/ui/overline";

import { FOOTER, type LandingLink } from "../a/content";
import { LINKS } from "./content";

// A footer link: 14px on the second tier, lifting to the first on hover. On
// a phone each row is 44px tall (a thumb); beside a pointer it drops to 28.
const LINK_CLASS =
  "inline-block py-3 text-sm text-muted-foreground transition-colors duration-(--duration-fast) ease-out-quart hover:text-foreground md:py-1";

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

// Variant A's footer, with the wordmark pointing at this variant's route.
// It continues the closing band's dark ground under one hairline: the
// wordmark, then a caps label over each group of links.
export function SiteFooter() {
  return (
    <footer className="dark bg-background px-4 text-foreground sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-10 border-t border-border-subtle py-12 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href={LINKS.home.href}
          className="-my-2.5 flex items-center gap-2 self-start rounded-md py-2.5 text-base font-semibold text-foreground"
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
