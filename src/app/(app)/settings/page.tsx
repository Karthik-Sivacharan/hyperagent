import Link from "next/link";
import { SettingsPageHeader, SettingsShell } from "@/components/settings/settings-shell";
import { SettingsLinkCard } from "@/components/settings/settings-link-card";
import { UserIdRow } from "@/components/settings/user-id-row";
import { settingsSections } from "@/lib/mock/settings";

// /settings hub, transcribed from docs/reference/pages/settings.html:
// title + account row, then overline sections of link cards.
export default function Page() {
  return (
    <SettingsShell>
      <SettingsPageHeader title="Settings" titleRowClassName="mb-2">
        <UserIdRow />
      </SettingsPageHeader>
      <div className="space-y-10">
        {settingsSections.map((section) => (
          <section key={section.label}>
            <h2 data-slot="overline" className="font-medium text-muted-foreground text-xs uppercase tracking-wider mb-4">
              {section.label}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.cards.map((card) => (
                <SettingsLinkCard key={card.slug} card={card} />
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="mt-12">
        <Link
          className="text-muted-foreground/70 text-xs underline-offset-4 transition-colors hover:text-muted-foreground hover:underline"
          href="/licenses"
        >
          Open source licenses
        </Link>
      </div>
    </SettingsShell>
  );
}
