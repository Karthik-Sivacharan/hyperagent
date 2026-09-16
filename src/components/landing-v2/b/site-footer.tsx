import Link from "next/link";

import { Mark } from "@/components/brand/mark";
import { Overline } from "@/components/ui/overline";

import { FOOTER, LINKS, type LandingLink } from "./content";

// A footer link on the second tier, lifting to the first on hover. The row
// is 44px on a phone and 28px beside a pointer.
const LINK_CLASS =
  "inline-block py-3 text-sm text-muted-foreground transition-colors duration-(--duration-fast) ease-out-quart hover:text-foreground md:py-1";

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

// Adapted from v1's footer for this variant's ids and kept on the paper
// ground: one hairline, the wordmark, a caps label over each group.
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="px-4 sm:px-6">
      <div className="mx-auto max-w-6xl border-t border-border-subtle py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href={LINKS.home.href}
            className="flex min-h-11 items-center gap-2 self-start rounded-md text-base font-semibold text-foreground md:min-h-0"
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
        <p className="mt-12 text-xs text-foreground-low">
          &copy; {year} {FOOTER.legal}
        </p>
      </div>
    </footer>
  );
}
