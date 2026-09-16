// Every word on landing v2, variant C ("Ink"), in one place. The section
// components read their copy from here, so a copy edit never touches layout.
//
// Voice: name the job, not its quality; pair every autonomy claim with its
// check; numbers carry units; sentence case; no invented customers, quotes
// or figures. Product pictures use generic names ("Finance agent") and
// example values, and say so where a number appears.
//
// The pricing facts are imported from v1's content so the two pages can
// never disagree on a price or a bonus.

import { PRICING as V1_PRICING } from "@/components/landing/content";

export type LandingLink = { label: string; href: string };

// A heading in two tones: `lead` in the first text tier, `rest` in the second.
export type TwoTone = { lead: string; rest?: string };

export type SectionCopy = { id: string; heading: TwoTone; intro?: string };

// The glyph an agent's avatar carries. The component maps each key to a
// Tabler icon; content never holds a component.
export type Glyph =
  | "coin"
  | "target"
  | "truck"
  | "users"
  | "megaphone"
  | "scale"
  | "mail"
  | "checklist"
  | "card"
  | "search"
  | "database"
  | "chart"
  | "send"
  | "pin"
  | "report"
  | "box"
  | "userSearch"
  | "calendar"
  | "file"
  | "clipboard"
  | "calendarEvent"
  | "trend"
  | "chartLine"
  | "brush";

export type AgentStatus = "running" | "done" | "needsYou" | "scheduled";

// One entry of the hero's scripted thread. `at` is when it appears, in
// milliseconds after the frame mounts. The whole script plays once.
export type HeroEntry =
  | { kind: "system"; at: number; text: string }
  | { kind: "user"; at: number; text: string }
  | { kind: "agent"; at: number; text: string }
  | {
      kind: "computer";
      at: number;
      title: string;
      rows: { label: string; value: string }[];
      working: string;
      done: string;
      doneAt: number;
    }
  | {
      kind: "ask";
      at: number;
      label: string;
      text: string;
      approve: string;
      hold: string;
    }
  | { kind: "receipt"; at: number; lines: string[]; summary: string };

// One bubble of a use-case thread: a short exchange, no timing.
export type CaseEntry =
  | { kind: "user"; text: string }
  | { kind: "agent"; text: string }
  | { kind: "ask"; text: string }
  | { kind: "done"; text: string };

export type CaseAgent = {
  value: string;
  name: string;
  blurb: string;
  glyph: Glyph;
  thread: CaseEntry[];
};

export type Department = {
  value: string;
  label: string;
  title: string;
  subtitle: string;
  agents: CaseAgent[];
};

export type Question = { question: string; answer: string };

// The week's three cards each end in a picture of one kind.
export type WeekPicture =
  | { kind: "brief"; label: string; chip: string; text: string; by: string }
  | {
      kind: "runs";
      label: string;
      rows: {
        when: string;
        job: string;
        took: string;
        state: "done" | "needsYou";
      }[];
    }
  | {
      kind: "report";
      label: string;
      from: string;
      time: string;
      text: string;
      receipt: string;
    };

export type WeekCard = {
  day: string;
  fact: string;
  factLabel: string;
  body: string;
  picture: WeekPicture;
};

export const LINKS = {
  home: { label: "Hyperagent", href: "/landing/c" },
  start: { label: "Start an agent", href: "/signup" },
  logIn: { label: "Log in", href: "/threads/new" },
  tour: { label: "See the jobs", href: "#use-cases" },
} satisfies Record<string, LandingLink>;

export const A11Y = {
  skip: "Skip to content",
  mainNav: "Main",
  departments: "Departments",
  agentsIn: (department: string) => `Agents in ${department}`,
  exampleThread: (agent: string) => `An example thread with the ${agent}`,
};

export const STATUS_LABEL: Record<AgentStatus, string> = {
  running: "Running",
  done: "Done",
  needsYou: "Needs you",
  scheduled: "Scheduled",
};

export const NAV: LandingLink[] = [
  { label: "Use cases", href: "#use-cases" },
  { label: "A week", href: "#week" },
  { label: "Receipts", href: "#receipts" },
  { label: "Control", href: "#control" },
  { label: "Pricing", href: "#pricing" },
];

export const HERO = {
  heading: {
    lead: "Hand off the weekly work.",
    rest: "Keep the final say.",
  } satisfies TwoTone,
  lede: "Each recurring job gets an agent with its own computer. It signs in to your tools, works overnight, reports in Slack, and holds anything risky until you approve it.",
  fine: "Plans from $20 a month. Credit pays for what your agents use.",
  demo: {
    label:
      "An example run. The Finance agent reconciles last week's payouts on its own computer, asks before posting entries to the books, and ends with a receipt.",
    caption:
      "An example run. Times, costs and scores are illustrative, not measured.",
    sidebarLabel: "Agents",
    composer: "Message the Finance agent",
    agents: [
      {
        name: "Finance agent",
        job: "Weekly payout reconciliation",
        status: "running" as AgentStatus,
        glyph: "coin" as Glyph,
        selected: true,
      },
      {
        name: "Sales agent",
        job: "Monday pipeline digest",
        status: "done" as AgentStatus,
        glyph: "target" as Glyph,
        selected: false,
      },
      {
        name: "Operations agent",
        job: "Supplier confirmations",
        status: "needsYou" as AgentStatus,
        glyph: "truck" as Glyph,
        selected: false,
      },
      {
        name: "Hiring agent",
        job: "Interview scheduling",
        status: "scheduled" as AgentStatus,
        glyph: "users" as Glyph,
        selected: false,
      },
      {
        name: "Marketing agent",
        job: "Weekly content calendar",
        status: "done" as AgentStatus,
        glyph: "megaphone" as Glyph,
        selected: false,
      },
    ],
    thread: [
      { kind: "system", at: 400, text: "Scheduled run, Monday 07:00" },
      {
        kind: "user",
        at: 900,
        text: "Reconcile last week's payouts against the books. Flag anything off by more than $50.",
      },
      {
        kind: "agent",
        at: 1700,
        text: "On it. Signing in to the payments dashboard and pulling last week's payouts.",
      },
      {
        kind: "computer",
        at: 2500,
        title: "Its computer",
        rows: [
          { label: "Browser", value: "Payouts, week 37" },
          { label: "Shell", value: "export payouts.csv, 412 rows" },
        ],
        working: "Working",
        done: "Done",
        doneAt: 3600,
      },
      {
        kind: "agent",
        at: 3900,
        text: "412 payouts matched. 3 are off by more than $50, all from one refund batch.",
      },
      {
        kind: "ask",
        at: 4700,
        label: "Needs you",
        text: "Post 3 adjusting entries to the books?",
        approve: "Approve",
        hold: "Hold",
      },
      { kind: "user", at: 5700, text: "Approve all three." },
      {
        kind: "receipt",
        at: 6400,
        lines: [
          "Payouts pulled, 412 rows",
          "Matched against the books",
          "3 entries posted after approval",
        ],
        summary: "6 min 12 s, $0.84, judge 9.1 of 10",
      },
      { kind: "system", at: 7100, text: "Reported in Slack" },
    ] satisfies HeroEntry[],
  },
  startsFrom: {
    label: "Starts from",
    items: [
      "A thread",
      "Slack",
      "Telegram",
      "Email",
      "A webhook",
      "A schedule",
      "An MCP client",
    ],
  },
};

export const USE_CASES = {
  section: {
    id: "use-cases",
    heading: { lead: "One team of agents,", rest: "across every function." },
    intro:
      "Pick a department. Each agent has a job, the tools it may touch, and a schedule anyone on the team can read.",
  } satisfies SectionCopy,
  action: {
    label: "Start with this job",
    href: "/signup",
  } satisfies LandingLink,
  departments: [
    {
      value: "finance",
      label: "Finance",
      title: "Finance",
      subtitle: "Reconcile, chase and close.",
      agents: [
        {
          value: "reconciliation",
          name: "Reconciliation agent",
          blurb: "Payouts against the books, weekly",
          glyph: "scale",
          thread: [
            {
              kind: "user",
              text: "Reconcile last week's payouts against the books.",
            },
            {
              kind: "agent",
              text: "412 matched. 3 are off by more than $50, all from one refund batch.",
            },
            { kind: "ask", text: "Post 3 adjusting entries?" },
          ],
        },
        {
          value: "collections",
          name: "Collections agent",
          blurb: "Reminders for invoices past 30 days",
          glyph: "mail",
          thread: [
            {
              kind: "user",
              text: "Draft reminders for anything unpaid after 30 days.",
            },
            {
              kind: "agent",
              text: "7 invoices qualify. The drafts are ready, nothing sent.",
            },
            { kind: "ask", text: "Send 7 reminders?" },
          ],
        },
        {
          value: "close",
          name: "Close agent",
          blurb: "The month-end checklist",
          glyph: "checklist",
          thread: [
            { kind: "user", text: "Prepare the month-end close checklist." },
            {
              kind: "agent",
              text: "22 items, 4 waiting on other people. Owners are tagged.",
            },
            { kind: "done", text: "Checklist posted in Slack" },
          ],
        },
        {
          value: "spend",
          name: "Spend agent",
          blurb: "Card spend by team, every Friday",
          glyph: "card",
          thread: [
            {
              kind: "user",
              text: "Break down last week's card spend by team.",
            },
            {
              kind: "agent",
              text: "Engineering is up 18% on the week, from one vendor.",
            },
            { kind: "done", text: "Report posted, 4 min 02 s, $0.41" },
          ],
        },
      ],
    },
    {
      value: "sales",
      label: "Sales",
      title: "Sales",
      subtitle: "Research, update and digest.",
      agents: [
        {
          value: "research",
          name: "Research agent",
          blurb: "New accounts researched overnight",
          glyph: "search",
          thread: [
            { kind: "user", text: "Research the 20 accounts added yesterday." },
            {
              kind: "agent",
              text: "20 profiles written: size, stack, and the last thing they announced.",
            },
            { kind: "done", text: "Profiles added to the CRM" },
          ],
        },
        {
          value: "crm",
          name: "CRM agent",
          blurb: "The CRM updated after every call",
          glyph: "database",
          thread: [
            {
              kind: "user",
              text: "Log today's calls and update each deal stage.",
            },
            {
              kind: "agent",
              text: "6 calls logged. 2 deals moved to proposal.",
            },
            { kind: "ask", text: "Mark one deal as lost?" },
          ],
        },
        {
          value: "pipeline",
          name: "Pipeline agent",
          blurb: "The Monday pipeline digest",
          glyph: "chart",
          thread: [
            {
              kind: "user",
              text: "Post the pipeline digest before the Monday meeting.",
            },
            {
              kind: "agent",
              text: "14 open deals, 3 slipped a week. The digest is drafted.",
            },
            { kind: "done", text: "Posted in Slack at 08:30" },
          ],
        },
        {
          value: "outreach",
          name: "Outreach agent",
          blurb: "Follow-ups drafted, never sent alone",
          glyph: "send",
          thread: [
            { kind: "user", text: "Draft follow-ups for last week's demos." },
            {
              kind: "agent",
              text: "9 drafts in your voice. Each one waits for you.",
            },
            { kind: "ask", text: "Send 9 follow-ups?" },
          ],
        },
      ],
    },
    {
      value: "operations",
      label: "Operations",
      title: "Operations",
      subtitle: "Chase, flag and report.",
      agents: [
        {
          value: "supplier",
          name: "Supplier agent",
          blurb: "Late confirmations chased",
          glyph: "truck",
          thread: [
            {
              kind: "user",
              text: "Chase suppliers for confirmations past due.",
            },
            {
              kind: "agent",
              text: "5 chased by email. 2 confirmed, 3 still open.",
            },
            { kind: "done", text: "Open items listed in the tracker" },
          ],
        },
        {
          value: "delivery",
          name: "Delivery agent",
          blurb: "Orders at risk of missing their date",
          glyph: "pin",
          thread: [
            {
              kind: "user",
              text: "Flag orders at risk of missing their delivery date.",
            },
            { kind: "agent", text: "8 at risk, all on one carrier lane." },
            { kind: "ask", text: "Reroute 8 orders?" },
          ],
        },
        {
          value: "reporting",
          name: "Reporting agent",
          blurb: "The weekly operations report",
          glyph: "report",
          thread: [
            { kind: "user", text: "Write the weekly operations report." },
            {
              kind: "agent",
              text: "The draft is ready: throughput, exceptions, and what changed.",
            },
            { kind: "done", text: "Sent to the operations channel" },
          ],
        },
        {
          value: "inventory",
          name: "Inventory agent",
          blurb: "Stock counts checked nightly",
          glyph: "box",
          thread: [
            {
              kind: "user",
              text: "Compare tonight's stock count with the system.",
            },
            { kind: "agent", text: "3 lines are off by more than 5%." },
            { kind: "ask", text: "Post 3 adjustments?" },
          ],
        },
      ],
    },
    {
      value: "hiring",
      label: "Hiring",
      title: "Hiring",
      subtitle: "Source, schedule and prepare.",
      agents: [
        {
          value: "sourcing",
          name: "Sourcing agent",
          blurb: "Candidates for open roles",
          glyph: "userSearch",
          thread: [
            {
              kind: "user",
              text: "Source candidates for the account manager role.",
            },
            {
              kind: "agent",
              text: "18 profiles match. 6 are ranked for a first look.",
            },
            { kind: "done", text: "Slate added to the pipeline" },
          ],
        },
        {
          value: "scheduling",
          name: "Scheduling agent",
          blurb: "Interviews across calendars",
          glyph: "calendar",
          thread: [
            {
              kind: "user",
              text: "Schedule first rounds for the 6 on the slate.",
            },
            { kind: "agent", text: "5 booked. One needs a different week." },
            { kind: "ask", text: "Offer next week's slots?" },
          ],
        },
        {
          value: "offer",
          name: "Offer agent",
          blurb: "Offer letters ready for approval",
          glyph: "file",
          thread: [
            {
              kind: "user",
              text: "Prepare the offer letter for the finalist.",
            },
            {
              kind: "agent",
              text: "Drafted on the template, salary left blank.",
            },
            { kind: "ask", text: "Fill in the approved salary?" },
          ],
        },
        {
          value: "onboarding",
          name: "Onboarding agent",
          blurb: "Day-one checklists",
          glyph: "clipboard",
          thread: [
            { kind: "user", text: "Set up onboarding for the new starter." },
            {
              kind: "agent",
              text: "Accounts requested, checklist drafted, buddy assigned.",
            },
            { kind: "done", text: "Checklist shared with the manager" },
          ],
        },
      ],
    },
    {
      value: "marketing",
      label: "Marketing",
      title: "Marketing",
      subtitle: "Plan, draft and measure.",
      agents: [
        {
          value: "calendar",
          name: "Calendar agent",
          blurb: "The weekly content calendar",
          glyph: "calendarEvent",
          thread: [
            { kind: "user", text: "Plan next week's content calendar." },
            {
              kind: "agent",
              text: "8 posts drafted around the launch. Two need a graphic.",
            },
            { kind: "done", text: "Calendar posted for review" },
          ],
        },
        {
          value: "trends",
          name: "Trends agent",
          blurb: "Trending topics, every Monday",
          glyph: "trend",
          thread: [
            {
              kind: "user",
              text: "What is trending in our category this week?",
            },
            {
              kind: "agent",
              text: "5 topics with sources. Two match posts already in the queue.",
            },
            { kind: "done", text: "Brief posted in Slack" },
          ],
        },
        {
          value: "campaign",
          name: "Campaign agent",
          blurb: "Campaign numbers, weekly",
          glyph: "chartLine",
          thread: [
            { kind: "user", text: "Summarise last week's campaign numbers." },
            {
              kind: "agent",
              text: "Spend up 4%, sign-ups flat. One ad set carries most of it.",
            },
            { kind: "ask", text: "Pause the two weakest ad sets?" },
          ],
        },
        {
          value: "brand",
          name: "Brand agent",
          blurb: "Landing pages in the house style",
          glyph: "brush",
          thread: [
            {
              kind: "user",
              text: "Draft a landing page for the spring offer.",
            },
            {
              kind: "agent",
              text: "A draft page is on a preview link, in the house style.",
            },
            { kind: "done", text: "Preview shared, nothing published" },
          ],
        },
      ],
    },
  ] satisfies Department[],
  needsYou: "Needs you",
};

const WEEK_CARDS: WeekCard[] = [
  {
    day: "Monday",
    fact: "07:00",
    factLabel: "The schedule",
    body: "The brief runs on its own. You wrote it once, in plain words, with the limit it must not cross.",
    picture: {
      kind: "brief",
      label: "The brief as the agent receives it",
      chip: "Every Monday, 07:00",
      text: "Reconcile last week's payouts against the books. Flag anything off by more than $50. Do not post entries before a person has approved them.",
      by: "Written by the finance lead",
    },
  },
  {
    day: "Wednesday",
    fact: "3 runs",
    factLabel: "So far this week",
    body: "Each run happens on the agent's own computer: a browser, a shell and files. Anything past the limit waits for a person.",
    picture: {
      kind: "runs",
      label: "The week's runs so far",
      rows: [
        {
          when: "Mon 07:00",
          job: "Weekly payout reconciliation",
          took: "6 min 12 s",
          state: "done",
        },
        {
          when: "Tue 07:00",
          job: "Weekly payout reconciliation",
          took: "5 min 48 s",
          state: "done",
        },
        {
          when: "Wed 07:00",
          job: "Weekly payout reconciliation",
          took: "7 min 03 s",
          state: "needsYou",
        },
      ],
    },
  },
  {
    day: "Friday",
    fact: "$2.61",
    factLabel: "The week's cost",
    body: "Every run comes with a receipt: duration, cost, and a judge's score against your rubric, posted where the team already talks.",
    picture: {
      kind: "report",
      label: "The report in Slack",
      from: "Finance agent",
      time: "07:06",
      text: "Payouts reconciled. 3 adjusting entries posted after approval.",
      receipt: "Receipt: 6 min 12 s, $0.84, judge 9.1 of 10",
    },
  },
];

export const WEEK = {
  section: {
    id: "week",
    heading: { lead: "What a week looks like", rest: "for one job." },
    intro:
      "Brief it on Monday, let it run mid-week, read the receipts on Friday. The numbers on these cards are examples.",
  } satisfies SectionCopy,
  exampleNote: "Example values",
  cards: WEEK_CARDS,
};

export const RECEIPTS = {
  section: {
    id: "receipts",
    heading: { lead: "Every run comes with", rest: "a receipt." },
    intro:
      "See how long each job took, what it cost, how an independent judge scored it against your rubric, and what it is waiting on.",
  } satisfies SectionCopy,
  log: {
    title: "Monday night",
    count: "5 runs",
    note: "Example values",
    columns: {
      time: "Time",
      agent: "Agent",
      job: "Job",
      took: "Duration",
      cost: "Cost",
      score: "Score",
      state: "State",
    },
    rows: [
      {
        time: "01:00",
        agent: "Research agent",
        job: "New accounts researched",
        took: "12 min 40 s",
        cost: "$1.92",
        score: "9.3",
        state: "done" as AgentStatus,
      },
      {
        time: "02:30",
        agent: "Supplier agent",
        job: "Late confirmations chased",
        took: "4 min 15 s",
        cost: "$0.52",
        score: "8.8",
        state: "done" as AgentStatus,
      },
      {
        time: "04:00",
        agent: "Sourcing agent",
        job: "Candidates for open roles",
        took: "18 min 05 s",
        cost: "$2.70",
        score: "9.0",
        state: "done" as AgentStatus,
      },
      {
        time: "06:00",
        agent: "Delivery agent",
        job: "Orders at risk flagged",
        took: "7 min 03 s",
        cost: "$0.95",
        score: "8.6",
        state: "needsYou" as AgentStatus,
      },
      {
        time: "07:00",
        agent: "Finance agent",
        job: "Weekly payout reconciliation",
        took: "6 min 12 s",
        cost: "$0.84",
        score: "9.1",
        state: "done" as AgentStatus,
      },
    ],
    total: {
      label: "Total",
      took: "48 min 15 s",
      cost: "$6.93",
      score: "9.0",
      scoreLabel: "average",
    },
  },
  notes: [
    {
      title: "Scored by a judge",
      body: "A separate model scores every run against rubrics you write, so quality is a number you can watch week to week.",
    },
    {
      title: "Priced per run",
      body: "Credit pays for model tokens, browser minutes, searches and actions, so every run shows what it cost.",
    },
  ],
};

export const CONTROL = {
  section: {
    id: "control",
    heading: { lead: "It asks before", rest: "anything that matters." },
    intro:
      "Decide what each agent may do on its own. Everything else waits for a person.",
  } satisfies SectionCopy,
  autonomy: {
    title: "Ask first, or draw the line",
    body: "Choose per agent whether it acts or asks, and write the exceptions in plain words.",
    picture: {
      label:
        "The autonomy setting, set to ask first, with one exception written under it",
      options: [
        { value: "ask", label: "Ask first" },
        { value: "auto", label: "Auto" },
      ],
      selected: "ask",
      ruleLabel: "Exception",
      rule: "Hold any refund over $500.",
    },
  },
  tiles: [
    {
      title: "Logins stay out of its computer",
      body: "Connections use OAuth, and the tokens never enter the agent's sandbox.",
      rows: [
        { label: "Account", value: "Connected" },
        { label: "Token", value: "Kept outside the sandbox" },
        { label: "Passwords on its computer", value: "None" },
      ],
    },
    {
      title: "Read-only until you say so",
      body: "Scheduled runs read what they need and change nothing until someone approves.",
      rows: [
        { label: "Unattended runs", value: "Read only" },
        { label: "Writes", value: "After approval" },
        { label: "Pending", value: "1 change", needsYou: true },
      ],
    },
    {
      title: "A budget on every run",
      body: "Caps per agent and per run, and one shared bill for the team.",
      rows: [
        { label: "Cap per run", value: "$5.00" },
        { label: "Plan", value: "$100 a month" },
        { label: "Used this month", value: "$41.20" },
      ],
    },
  ],
};

export const PRICING = {
  section: {
    id: "pricing",
    heading: { lead: "Plans from $20 a month." },
    intro:
      "Credit pays for what agents use: model tokens, browser minutes, searches and actions. Larger plans add bonus credit.",
  } satisfies SectionCopy,
  unit: V1_PRICING.unit,
  plans: V1_PRICING.plans,
  more: V1_PRICING.more,
  faq: {
    id: "faq",
    heading: "Questions",
    items: V1_PRICING.faq.items satisfies Question[],
  },
};

export const CLOSING = {
  heading: "Start with one job you do every week.",
  fine: "Plans from $20 a month.",
};

export const FOOTER = {
  groups: [
    {
      title: "Product",
      links: [
        { label: "Use cases", href: "#use-cases" },
        { label: "A week", href: "#week" },
        { label: "Receipts", href: "#receipts" },
        { label: "Control", href: "#control" },
      ],
    },
    {
      title: "Plans",
      links: [
        { label: "Pricing", href: "#pricing" },
        { label: "Questions", href: "#faq" },
      ],
    },
    {
      title: "Account",
      links: [LINKS.logIn, LINKS.start],
    },
  ] satisfies { title: string; links: LandingLink[] }[],
};
