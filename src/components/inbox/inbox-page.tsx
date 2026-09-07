import { CheckCheck } from "lucide-react";
import { PageHeading } from "@/components/resources/page-heading";

// Transcribed from docs/reference/pages/inbox.html. The live account has
// nothing pending, so the page is the title and its all-clear empty state.
// Phase 2: the check is a small status mark, the one sanctioned use of the
// success hue; the title sits on the first text tier in the display face and
// the line under it on the second (docs/brand/design.md §4.1, §12).
export function InboxPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex h-full min-h-0 flex-col">
        <div className="px-6 pt-4">
          <PageHeading title="Inbox" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <CheckCheck className="size-8 text-success" aria-hidden="true" />
          <div className="font-heading text-[15px] font-medium text-foreground">Nothing needs your attention</div>
          <div className="text-[13px] text-muted-foreground">
            Approvals, agent questions, and failing schedules will show up here.
          </div>
        </div>
      </div>
    </div>
  );
}
