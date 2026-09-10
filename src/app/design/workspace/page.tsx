import { notFound } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { ThreadView } from "@/components/thread/thread-view";
import { Workspace } from "@/components/workspace/workspace";
import { getConversation } from "@/lib/mock/conversation";
import { threads } from "@/lib/mock/threads";
import { WORKSPACE_ACTIVE_ID, WORKSPACE_ARTIFACTS } from "@/lib/mock/workspace";

// The artifact workspace, built but not wired: the thread screen as it looks
// once a thread has produced something, the conversation in its 512px column
// and the desktop beside it. The real shell and the real thread view, so the
// pairing reads the way it will ship; no cloned route passes `workspace`, so
// /thread/[id] is unchanged. Compare with
// docs/reference/overlays/thread-workspace-carousel.html at 1456×868.

export default function WorkspacePreviewPage() {
  const thread = threads.find((t) => getConversation(t.id));
  const conversation = thread && getConversation(thread.id);
  if (!thread || !conversation) notFound();

  return (
    <AppShell>
      <ThreadView
        thread={thread}
        conversation={conversation}
        workspace={<Workspace artifacts={WORKSPACE_ARTIFACTS} activeId={WORKSPACE_ACTIVE_ID} />}
      />
    </AppShell>
  );
}
