import { notFound } from "next/navigation";
import { SettingsPageHeader, SettingsShell } from "@/components/settings/settings-shell";
import { findSettingsCard } from "@/lib/mock/settings";

// Placeholder body for the settings sub-routes that are not cloned yet:
// the hub card's title and description in the standard settings header,
// so every card on /settings resolves instead of 404ing.
export function SettingsSubpage({ href }: { href: string }) {
  const card = findSettingsCard(href);
  if (!card) notFound();
  return (
    <SettingsShell>
      <SettingsPageHeader title={card.title} description={card.description} backHref="/settings" />
    </SettingsShell>
  );
}
