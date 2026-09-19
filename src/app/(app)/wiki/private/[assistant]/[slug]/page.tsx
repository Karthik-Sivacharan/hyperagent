import { WikiVersionedPage } from "@/components/wiki/wiki-versions";

// A page one assistant composed for itself. Its slug is
// private/<assistant id>/<page>, as the store has it; the article route
// resolves it within the scope being read.

export default async function Page({ params }: { params: Promise<{ assistant: string; slug: string }> }) {
  const { assistant, slug } = await params;
  return <WikiVersionedPage slug={`private/${assistant}/${slug}`} />;
}
