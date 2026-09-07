import Link from "next/link";
import { Overline } from "@/components/ui/overline";
import { SettingsPageHeader, SettingsShell } from "@/components/settings/settings-shell";
import { SettingsLinkCard } from "@/components/settings/settings-link-card";
import { UserIdRow } from "@/components/settings/user-id-row";
import { settingsSections } from "@/lib/mock/settings";

// /settings hub, transcribed from docs/reference/pages/settings.html:
// title + account row, then overline sections of link cards. Phase 2: the
// section labels are the brand overline (the caps group label on tier 3),
// the first card carries the page's single tinted brand surface, and the
// licenses link is tier-3 meta (docs/brand/design.md §4.1).
export function SettingsHub() {
  return (
    <SettingsShell>
      <SettingsPageHeader title="Settings" titleRowClassName="mb-2">
        <UserIdRow />
      </SettingsPageHeader>
      <div className="space-y-10">
        {settingsSections.map((section, sectionIndex) => (
          <section key={section.label}>
            <Overline asChild>
              <h2 className="mb-4">{section.label}</h2>
            </Overline>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.cards.map((card, cardIndex) => (
                <SettingsLinkCard key={card.slug} card={card} accent={sectionIndex === 0 && cardIndex === 0} />
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="mt-12">
        <Link
          className="text-xs text-foreground-low underline-offset-4 decoration-border-loud transition-[color,text-decoration-color] duration-(--duration-fast) ease-out-quart hover:text-muted-foreground hover:underline hover:decoration-foreground"
          href="/licenses"
        >
          Open source licenses
        </Link>
      </div>
    </SettingsShell>
  );
}
