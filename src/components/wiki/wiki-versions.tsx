import { cookies } from "next/headers";
import { WikiPageShell } from "@/components/wiki/wiki-page-shell";
import { WikiPageShellV1 } from "@/components/wiki/v1/page-shell";
import { WikiVersionToggle } from "@/components/wiki/wiki-version-toggle";

// The designs of the article page, oldest first. Each one is a server shell
// that takes the slug and the switch to put in its header; a new design is
// one more entry here and joins the switch on its own.
//
// The choice is a cookie on /wiki, written by a Server Function and read
// when the route renders. It survives moving between pages and a reload
// without any link carrying it, and the server renders the chosen design
// only, so nothing flashes. The price is that the article route renders per
// request rather than at build time.

type Shell = (props: { slug: string; aside: React.ReactNode }) => React.ReactNode;

const VERSIONS: { id: string; label: string; Shell: Shell }[] = [
  { id: "original", label: "Original", Shell: WikiPageShell },
  { id: "v1", label: "v1", Shell: WikiPageShellV1 },
];

const DEFAULT_VERSION = "v1";
const COOKIE = "wiki-version";

async function chooseWikiVersion(id: string) {
  "use server";
  if (!VERSIONS.some((version) => version.id === id)) return;
  (await cookies()).set(COOKIE, id, { path: "/wiki", maxAge: 60 * 60 * 24 * 365, sameSite: "lax", httpOnly: true });
}

export async function WikiVersionedPage({ slug }: { slug: string }) {
  const chosen = (await cookies()).get(COOKIE)?.value;
  const version =
    VERSIONS.find((candidate) => candidate.id === chosen) ??
    (VERSIONS.find((candidate) => candidate.id === DEFAULT_VERSION) as (typeof VERSIONS)[number]);
  const { Shell } = version;

  return (
    <Shell
      slug={slug}
      aside={
        <WikiVersionToggle
          value={version.id}
          options={VERSIONS.map(({ id, label }) => ({ id, label }))}
          choose={chooseWikiVersion}
        />
      }
    />
  );
}
