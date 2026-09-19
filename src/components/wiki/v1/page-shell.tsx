import { cookies } from "next/headers";
import { notFound, redirect, RedirectType } from "next/navigation";
import { WikiViewV1 } from "@/components/wiki/v1/wiki-view";
import {
  WIKI_WORKSPACE_SCOPE,
  getWikiScopedView,
  wikiAgents,
  wikiCounts,
  wikiGroupLabels,
  wikiGroupOrder,
  wikiJob,
  wikiLinkGroups,
  wikiLinkNames,
  wikiReadableNote,
  wikiScopedIndex,
  wikiScopedSlug,
  wikiScopeOf,
  wikiScopeOptions,
} from "@/lib/mock/wiki";

// The v1 article route: the same slice of the store the original ships
// (`getWikiView`, here within a scope), plus the few store readings v1 draws
// with: the group of every Topic the page links to, the group labels and
// order, and the names of the workspace's assistants. Two readings change
// what the page says: the body links the Topic names its composer left as
// words, and the Topic's history notes name assistants and Topics where the
// store writes their ids. Every value on the page comes from here.
//
// Scope, whose wiki is read, works as the design switch does: a `wiki-scope`
// cookie on /wiki, written by a Server Function and read here when the route
// renders, so no link carries it and nothing flashes. A slug resolves within
// the scope: a page the scope reads opens, another assistant's private page
// sends you to the shared page it supplements, and a page the scope cannot
// read is not found. The
// original design never reads this cookie; it always shows the workspace.

const SCOPE_COOKIE = "wiki-scope";

async function chooseWikiScope(slug: string, id: string) {
  "use server";
  const scope = wikiScopeOf(id);
  if (id !== WIKI_WORKSPACE_SCOPE && scope === null) return;
  (await cookies()).set(SCOPE_COOKIE, id, { path: "/wiki", maxAge: 60 * 60 * 24 * 365, sameSite: "lax", httpOnly: true });
  // The page on screen may not be in the new scope: open the scope's page on
  // the same Topic, or the wiki's first page when the scope has none.
  const target = wikiScopedSlug(slug, scope);
  if (target !== slug) redirect(target ? `/wiki/${target}` : "/wiki", RedirectType.replace);
}

export async function WikiPageShellV1({ slug, aside }: { slug: string; aside: React.ReactNode }) {
  const scope = wikiScopeOf((await cookies()).get(SCOPE_COOKIE)?.value);
  const target = wikiScopedSlug(slug, scope);
  if (target === null) notFound();
  if (target !== slug) redirect(`/wiki/${target}`);
  const found = getWikiScopedView(slug, scope);
  if (!found) notFound();
  const topic = {
    ...found.topic,
    versions: found.topic.versions.map((version) => ({ ...version, changeNote: wikiReadableNote(version.changeNote) })),
  };
  const view = { ...found, page: wikiLinkNames(found.page), topic };
  const index = wikiScopedIndex(scope);

  return (
    <WikiViewV1
      view={view}
      groups={index.groups}
      privatePages={index.privatePages}
      hiddenPages={index.hiddenPages}
      counts={wikiCounts()}
      linkGroups={wikiLinkGroups(view.page)}
      groupLabels={wikiGroupLabels}
      groupOrder={wikiGroupOrder}
      assistants={[...new Set(wikiAgents.map((agent) => agent.name))]}
      job={{
        runCount: wikiJob.runCount,
        threadCount: wikiJob.threadCount,
        messageCount: wikiJob.messageCount,
        memoryCount: wikiJob.memoryCount,
        documentCount: wikiJob.documentCount,
        windowStart: wikiJob.windowStart,
        windowEnd: wikiJob.windowEnd,
      }}
      scope={{
        value: scope ?? WIKI_WORKSPACE_SCOPE,
        options: wikiScopeOptions(),
        choose: chooseWikiScope.bind(null, slug),
      }}
      aside={aside}
    />
  );
}
