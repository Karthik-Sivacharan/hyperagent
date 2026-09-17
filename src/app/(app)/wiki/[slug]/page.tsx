import { WikiPageShell } from "@/components/wiki/wiki-page-shell";
import { wikiPages } from "@/lib/mock/wiki";

export function generateStaticParams() {
  return wikiPages.map((page) => ({ slug: page.slug }));
}

export default async function Page({ params }: PageProps<"/wiki/[slug]">) {
  const { slug } = await params;
  return <WikiPageShell slug={slug} />;
}
