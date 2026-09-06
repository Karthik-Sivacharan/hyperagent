import { threads } from "@/lib/mock/threads";
import { ThreadsPage } from "@/components/threads/threads-page";

export default function Page() {
  return <ThreadsPage threads={threads} />;
}
