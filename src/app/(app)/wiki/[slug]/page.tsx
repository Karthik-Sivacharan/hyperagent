import { WikiVersionedPage } from "@/components/wiki/wiki-versions";

export default async function Page({ params }: PageProps<"/wiki/[slug]">) {
  const { slug } = await params;
  return <WikiVersionedPage slug={slug} />;
}
