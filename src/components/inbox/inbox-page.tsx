import { CheckCheck } from "lucide-react";
import { PageHeading } from "@/components/resources/page-heading";

// Transcribed from docs/reference/pages/inbox.html. The live account has
// nothing pending, so the page is the title and its all-clear empty state.
export function InboxPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex h-full min-h-0 flex-col">
        <div className="px-6 pt-4">
          <PageHeading title="Inbox" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <CheckCheck className="size-8 text-green-500" aria-hidden="true" />
          <div className="font-medium text-[15px]">Nothing needs your attention</div>
          <div className="text-[13px] text-muted-foreground">
            Approvals, agent questions, and failing schedules will show up here.
          </div>
        </div>
      </div>
    </div>
  );
}
