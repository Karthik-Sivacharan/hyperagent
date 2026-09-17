import { WikiPageShell } from "@/components/wiki/wiki-page-shell";
import { wikiDefaultSlug } from "@/lib/mock/wiki";

export default function Page() {
  return <WikiPageShell slug={wikiDefaultSlug} />;
}
