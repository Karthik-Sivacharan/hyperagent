import { notFound } from "next/navigation";
import { threads } from "@/lib/mock/threads";
import { getConversation } from "@/lib/mock/conversation";
import { ThreadView } from "@/components/thread/thread-view";

export default async function ThreadPage({ params }: PageProps<"/thread/[id]">) {
  const { id } = await params;
  const thread = threads.find((t) => t.id === id);
  const conversation = getConversation(id);
  if (!thread || !conversation) notFound();
  return <ThreadView thread={thread} conversation={conversation} />;
}
