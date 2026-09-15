import { IconBook2, IconInbox, IconMail } from "@tabler/icons-react";

import { DesktopWindow } from "../desktop-window";
import { Dock } from "../dock";
import {
  Bar,
  Blob,
  Pill,
  Row,
  RowText,
  WindowFooter,
  WindowHeader,
} from "../skeleton";

// Customer Support: the overnight queue. Behind, the help desk sorted by
// urgency, the three urgent tickets on top and the drafted ones held; in
// front, one reply draft held for an OK before anything is sent.

type Ticket = { subject: string; tone: "urgent" | "held"; preview: string };

const TICKETS: Ticket[] = [
  { subject: "Front desk locked out", tone: "urgent", preview: "w-3/5" },
  { subject: "Booking page will not load", tone: "urgent", preview: "w-1/2" },
  { subject: "Charged twice for September", tone: "urgent", preview: "w-2/3" },
  { subject: "Resetting a password", tone: "held", preview: "w-2/5" },
  { subject: "Changing reminder times", tone: "held", preview: "w-1/2" },
];

function Queue() {
  return (
    <DesktopWindow className="top-[6%] left-[6%] h-[48%] w-[70%]">
      <WindowHeader
        title="Overnight queue"
        trailing={<Bar className="w-16" />}
      />
      <div className="flex min-h-0 flex-1">
        <div className="flex w-[24%] shrink-0 flex-col gap-3 border-r border-border-subtle px-3 pt-4">
          <Bar className="w-4/5 bg-tint-20" />
          <Bar className="w-3/5" />
          <Bar className="w-2/3" />
          <Bar className="w-1/2" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          {TICKETS.map((ticket) => (
            <Row
              key={ticket.subject}
              lead={<Blob />}
              trailing={
                <Pill tone={ticket.tone}>
                  {ticket.tone === "urgent" ? "Urgent" : "Held"}
                </Pill>
              }
            >
              <RowText>{ticket.subject}</RowText>
              <Bar className={ticket.preview} />
            </Row>
          ))}
        </div>
      </div>
      <WindowFooter>23 tickets since 6 PM</WindowFooter>
    </DesktopWindow>
  );
}

function ReplyDraft() {
  return (
    <DesktopWindow className="top-[47%] left-[38%] w-[56%]">
      <WindowHeader
        title="Reply: resetting a password"
        trailing={<Pill tone="held">Held</Pill>}
      />
      <div className="flex flex-col gap-3 px-4 pt-4 pb-5">
        <div className="flex items-center gap-2.5">
          <Blob />
          <Bar className="w-1/4 bg-tint-20" />
        </div>
        <div className="flex flex-col gap-2.5">
          <Bar className="w-11/12" />
          <Bar className="w-4/5" />
          <Bar className="w-5/6" />
        </div>
        <div className="flex flex-col gap-2.5">
          <Bar className="w-3/4" />
          <Bar className="w-2/5" />
        </div>
      </div>
      <WindowFooter trailing="Not sent">1 of 17 drafts</WindowFooter>
    </DesktopWindow>
  );
}

export function SupportScene() {
  return (
    <>
      <Queue />
      <ReplyDraft />
      <Dock
        apps={[
          { icon: IconInbox, tone: "ink", open: true },
          { icon: IconMail, open: true },
          { icon: IconBook2 },
        ]}
      />
    </>
  );
}
