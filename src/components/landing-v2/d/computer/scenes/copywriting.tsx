import {
  IconBold,
  IconBrowser,
  IconItalic,
  IconLink,
  IconList,
  IconMail,
  IconQuote,
  IconWriting,
} from "@tabler/icons-react";
import type { ReactNode } from "react";

import { DesktopWindow } from "../desktop-window";
import { Dock } from "../dock";
import { Bar, Pill, WindowFooter, WindowHeader } from "../skeleton";

// Copywriting: the Waitlist launch. Behind, the launch email with its subject
// line, still a draft; in front, the landing page doc with its two headline
// options at the top, waiting for someone to pick one.

function FormatBar() {
  return (
    <div className="flex h-8 shrink-0 items-center gap-3 border-b border-border-subtle bg-surface-secondary px-4 text-foreground-low">
      <Bar className="w-12 bg-tint-20" />
      <span className="h-3.5 w-px bg-tint-15" />
      <IconBold aria-hidden="true" stroke={2} className="size-3.5 shrink-0" />
      <IconItalic aria-hidden="true" stroke={2} className="size-3.5 shrink-0" />
      <span className="h-3.5 w-px bg-tint-15" />
      <IconList aria-hidden="true" stroke={2} className="size-3.5 shrink-0" />
      <IconLink aria-hidden="true" stroke={2} className="size-3.5 shrink-0" />
    </div>
  );
}

function Headline({
  letter,
  children,
}: {
  letter: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg px-3 py-2 shadow-edge">
      <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-surface-secondary text-xs font-medium text-foreground-low">
        {letter}
      </span>
      <p className="text-sm leading-5 font-medium text-balance text-foreground">
        {children}
      </p>
    </div>
  );
}

// The three benefits: a bold lead-in, then the sentence.
const BENEFITS = [
  { lead: "w-1/5 bg-tint-20", rest: "w-1/2" },
  { lead: "w-1/6 bg-tint-20", rest: "w-2/5" },
  { lead: "w-1/4 bg-tint-20", rest: "w-1/3" },
];

function LandingPage() {
  return (
    <DesktopWindow className="top-[32%] left-[6%] w-[64%]">
      <WindowHeader
        title="Waitlist landing page"
        trailing={<Pill tone="held">Pick a headline</Pill>}
      />
      <FormatBar />
      <div className="flex flex-col gap-4 px-5 pt-4 pb-5">
        <div className="flex flex-col gap-2">
          <p className="text-xs text-foreground-low">Headline options</p>
          <Headline letter="A">
            Fill cancelled appointments before the phone rings.
          </Headline>
          <Headline letter="B">
            Someone is already waiting for that empty slot.
          </Headline>
        </div>
        <div className="flex flex-col gap-2">
          <Bar className="w-11/12" />
          <Bar className="w-3/5" />
        </div>
        <div className="flex flex-col gap-2.5">
          {BENEFITS.map((benefit, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="size-1.5 shrink-0 rounded-full bg-tint-20" />
              <Bar className={benefit.lead} />
              <Bar className={benefit.rest} />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <IconQuote
            aria-hidden="true"
            stroke={2}
            className="size-3.5 shrink-0 text-foreground-low"
          />
          <Bar className="w-3/5" />
          <Bar className="w-1/6 bg-tint-12" />
        </div>
      </div>
      <WindowFooter trailing="Not published">
        3 benefits, 1 approved quote
      </WindowFooter>
    </DesktopWindow>
  );
}

function LaunchEmail() {
  return (
    <DesktopWindow className="top-[6%] right-[6%] h-[46%] w-[62%]">
      <WindowHeader
        title="Launch email draft"
        trailing={<Pill tone="draft">Draft</Pill>}
      />
      <div className="flex h-9 shrink-0 items-center gap-3 border-b border-border-subtle px-4">
        <span className="w-12 shrink-0 text-xs text-foreground-low">To</span>
        <Bar className="w-1/3" />
      </div>
      <div className="flex h-9 shrink-0 items-center gap-3 border-b border-border-subtle px-4">
        <span className="w-12 shrink-0 text-xs text-foreground-low">
          Subject
        </span>
        <p className="truncate text-xs font-medium text-foreground">
          Your cancelled appointments, filled by text
        </p>
      </div>
      <div className="flex flex-col gap-2.5 px-4 pt-4">
        <Bar className="w-4/5" />
        <Bar className="w-11/12" />
        <Bar className="w-2/3" />
        <Bar className="mt-2 w-3/4" />
        <Bar className="w-1/2" />
      </div>
      <WindowFooter trailing="1 of 3 sends">For current clinics</WindowFooter>
    </DesktopWindow>
  );
}

export function CopywritingScene() {
  return (
    <>
      <LaunchEmail />
      <LandingPage />
      <Dock
        apps={[
          { icon: IconWriting, tone: "ink", open: true },
          { icon: IconMail, open: true },
          { icon: IconBrowser },
        ]}
      />
    </>
  );
}
