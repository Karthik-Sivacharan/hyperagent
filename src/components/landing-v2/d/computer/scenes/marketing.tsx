import {
  IconCalendarWeek,
  IconCircleDashed,
  IconFileText,
  IconSpeakerphone,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";

import { DesktopWindow } from "../desktop-window";
import { Dock } from "../dock";
import {
  Bar,
  Check,
  Pill,
  Row,
  RowText,
  WindowFooter,
  WindowHeader,
} from "../skeleton";

// Marketing: the Waitlist launch. Behind, the week-by-week schedule with launch
// day and the held ads test marked; in front, the plan's channels, three set
// and the $2,000 ads test waiting for an OK before anything is booked.

type CardTone = "plain" | "launch" | "held";

const CARD_TONE = {
  plain: { card: "shadow-edge", lead: "bg-tint-20", bar: "bg-tint-15" },
  launch: { card: "bg-success/8", lead: "bg-success/30", bar: "bg-success/20" },
  held: { card: "bg-warning/8", lead: "bg-warning/30", bar: "bg-warning/20" },
} as const;

type Card = { tone: CardTone; widths: [string, string] };

// The plan's schedule: drafts the week before, launch email and banner on the
// day, the ads test and second story after, then results against the goal.
const WEEKS: { label: string; cards: Card[] }[] = [
  {
    label: "28 Sep",
    cards: [
      { tone: "plain", widths: ["w-4/5", "w-3/5"] },
      { tone: "plain", widths: ["w-2/3", "w-1/2"] },
      { tone: "plain", widths: ["w-3/4", "w-2/5"] },
    ],
  },
  {
    label: "6 Oct",
    cards: [
      { tone: "launch", widths: ["w-4/5", "w-1/2"] },
      { tone: "plain", widths: ["w-3/5", "w-2/3"] },
    ],
  },
  {
    label: "12 Oct",
    cards: [
      { tone: "held", widths: ["w-2/3", "w-3/5"] },
      { tone: "plain", widths: ["w-4/5", "w-1/2"] },
    ],
  },
  {
    label: "26 Oct",
    cards: [{ tone: "plain", widths: ["w-3/4", "w-3/5"] }],
  },
];

function ScheduleCard({ tone, widths }: Card) {
  const t = CARD_TONE[tone];
  return (
    <div className={cn("flex flex-col gap-2 rounded-lg p-2.5", t.card)}>
      <Bar className={cn(widths[0], t.lead)} />
      <Bar className={cn(widths[1], t.bar)} />
      <Bar className={cn("w-1/3", t.bar)} />
    </div>
  );
}

function Schedule() {
  return (
    <DesktopWindow className="top-[6%] left-[6%] h-[44%] w-[68%]">
      <WindowHeader
        title="Launch schedule"
        trailing={<Bar className="w-12" />}
      />
      <div className="grid min-h-0 flex-1 grid-cols-4 gap-2 p-3">
        {WEEKS.map((week) => (
          <div key={week.label} className="flex min-w-0 flex-col gap-2">
            <p className="px-0.5 text-xs text-foreground-low">{week.label}</p>
            {week.cards.map((card, i) => (
              <ScheduleCard key={i} {...card} />
            ))}
          </div>
        ))}
      </div>
    </DesktopWindow>
  );
}

function Plan() {
  return (
    <DesktopWindow className="top-[40%] left-[36%] w-[58%]">
      <WindowHeader
        title="Waitlist launch plan"
        trailing={<Bar className="w-10" />}
      />
      <div className="flex flex-col gap-2 border-b border-border-subtle px-4 py-3.5">
        <Bar className="w-11/12 bg-tint-20" />
        <Bar className="w-3/4" />
      </div>
      <Row lead={<Check />} trailing={<Bar className="w-10 shrink-0" />}>
        <RowText>Email to current clinics</RowText>
      </Row>
      <Row lead={<Check />} trailing={<Bar className="w-8 shrink-0" />}>
        <RowText>In-app banner</RowText>
      </Row>
      <Row lead={<Check />} trailing={<Bar className="w-12 shrink-0" />}>
        <RowText>Two customer stories</RowText>
      </Row>
      <Row
        className="border-b-0"
        lead={
          <IconCircleDashed
            aria-hidden="true"
            stroke={1.75}
            className="size-4 shrink-0 text-warning"
          />
        }
        trailing={<Pill tone="held">Needs your OK</Pill>}
      >
        <RowText>Paid ads, $2,000 test</RowText>
      </Row>
      <WindowFooter trailing="Not booked">
        Goal: 150 clinics by 31 Oct
      </WindowFooter>
    </DesktopWindow>
  );
}

export function MarketingScene() {
  return (
    <>
      <Schedule />
      <Plan />
      <Dock
        apps={[
          { icon: IconCalendarWeek, tone: "ink", open: true },
          { icon: IconFileText, open: true },
          { icon: IconSpeakerphone },
        ]}
      />
    </>
  );
}
