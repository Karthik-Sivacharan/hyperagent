import { IconAddressBook, IconCompass, IconMail } from "@tabler/icons-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { DesktopWindow } from "../desktop-window";
import { Dock } from "../dock";
import {
  Bar,
  Blob,
  Check,
  Pill,
  Row,
  RowText,
  WindowFooter,
  WindowHeader,
} from "../skeleton";

// Sales: the Harbour Street Physio research. Behind, the account with each
// source checked off; in front, the two intro emails, drafted and held.

function Count({ children }: { children: ReactNode }) {
  return (
    <span className="shrink-0 text-xs text-foreground-low tabular-nums">
      {children}
    </span>
  );
}

// The three sources the research read, with what each one turned up.
const SOURCES = [
  { name: "Their website", found: "6 clinics", width: "w-3/5" },
  { name: "CRM notes", found: "2 contacts", width: "w-1/2" },
  { name: "Local news", found: "3 articles", width: "w-2/3" },
];

function Research() {
  return (
    <DesktopWindow className="top-[6%] left-[6%] h-[52%] w-[66%]">
      <WindowHeader
        title="Harbour Street Physio"
        trailing={<Bar className="w-12" />}
      />
      <div className="flex min-h-0 flex-1">
        <div className="flex w-[27%] shrink-0 flex-col gap-3 border-r border-border-subtle px-3 pt-4">
          <Bar className="w-4/5 bg-tint-20" />
          <Bar className="w-3/5" />
          <Bar className="w-2/3" />
          <Bar className="w-1/2" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-3 border-b border-border-subtle px-4 py-3.5">
            <Blob className="size-8 rounded-lg" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Bar className="w-3/4 bg-tint-20" />
              <Bar className="w-1/2" />
            </div>
          </div>
          {SOURCES.map((source) => (
            <Row
              key={source.name}
              lead={<Check />}
              trailing={<Count>{source.found}</Count>}
            >
              <RowText>{source.name}</RowText>
              <Bar className={source.width} />
            </Row>
          ))}
          <div className="flex flex-col gap-2 px-4 pt-3.5">
            <Bar className="w-2/5 bg-tint-20" />
            <Bar className="w-11/12" />
            <Bar className="w-3/4" />
          </div>
        </div>
      </div>
      <WindowFooter>Research done, 3 sources</WindowFooter>
    </DesktopWindow>
  );
}

// The two people who decide, from the research doc.
const DRAFTS = [
  { to: "Sam Reyes", subject: "w-4/5", preview: "w-3/5" },
  { to: "Dr. Ana Brooks", subject: "w-3/4", preview: "w-1/2" },
];

function IntroEmails() {
  return (
    <DesktopWindow className="top-[44%] left-[39%] w-[55%]">
      <WindowHeader title="Intro email drafts" />
      {DRAFTS.map((draft) => (
        <Row
          key={draft.to}
          className="py-3"
          lead={<Blob className="size-8 self-start" />}
          trailing={<Pill tone="draft">Draft</Pill>}
        >
          <RowText>{draft.to}</RowText>
          <Bar className={draft.subject} />
          <Bar className={cn(draft.preview, "bg-tint-12")} />
        </Row>
      ))}
      <WindowFooter trailing="0 sent">2 drafts held for your OK</WindowFooter>
    </DesktopWindow>
  );
}

export function SalesScene() {
  return (
    <>
      <Research />
      <IntroEmails />
      <Dock
        apps={[
          { icon: IconMail, tone: "ink", open: true },
          { icon: IconAddressBook, open: true },
          { icon: IconCompass },
        ]}
      />
    </>
  );
}
