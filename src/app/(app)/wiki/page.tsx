import { WikiVersionedPage } from "@/components/wiki/wiki-versions";
import { wikiDefaultSlug } from "@/lib/mock/wiki";

export default function Page() {
  return <WikiVersionedPage slug={wikiDefaultSlug} />;
}
