// Every word on landing v2, variant B. Components read their copy from
// here and never hard-code a visible or announced string. Pricing facts are
// imported from v1 so the ladder stays one source of truth.
//
// Voice (kept from v1): name the job, not its quality; pair every autonomy
// claim with its check; numbers carry units; sentence case; no em dashes or
// middle dots; no invented customers, quotes or figures. Every product
// picture is an example with generic names.

import {
  PRICING as V1_PRICING,
  type TwoTone,
} from "@/components/landing/content";

export { creditLine, formatUsd } from "@/components/landing/content";
export type { TwoTone } from "@/components/landing/content";

export type LandingLink = { label: string; href: string };

export type SectionCopy = {
  id: string;
  eyebrow?: string;
  heading: TwoTone;
  intro?: string;
};

export const LINKS = {
  home: { label: "Hyperagent", href: "/landing/b" },
  start: { label: "Start an agent", href: "/signup" },
  logIn: { label: "Log in", href: "/threads/new" },
  seeRun: { label: "Watch an agent work", href: "#use-cases" },
} satisfies Record<string, LandingLink>;

export const A11Y = {
  skip: "Skip to content",
  mainNav: "Main",
  departments: "Departments",
  agents: "Agents in this department",
  formats: "Formats",
  transcript: "Example conversation",
  thread: "Example thread",
  typing: "The agent is typing",
  gallery: "Example work",
  integrations: "Where an agent starts from and reports to",
};

export const NAV: LandingLink[] = [
  { label: "Use cases", href: "#use-cases" },
  { label: "Work", href: "#work" },
  { label: "Receipts", href: "#receipts" },
  { label: "Pricing", href: "#pricing" },
];

// ---------------------------------------------------------------------------
// Hero

export type ThreadStep = {
  icon: "search" | "compare" | "draft" | "post";
  text: string;
};

export const HERO = {
  heading: {
    lead: "Give every recurring job an agent.",
    rest: "Keep the final say.",
  } satisfies TwoTone,
  lede: "Each agent has its own computer and a brief you write once. It signs into your tools, does the job on schedule, reports where your team already talks, and holds anything risky until you approve it.",
  thread: {
    agent: { name: "Pipeline agent", initial: "P" },
    schedule: "Every Monday, 07:00",
    status: { working: "Working", done: "Done" },
    request:
      "Pull last week's pipeline from HubSpot, flag any deal with no activity in 14 days, and post the digest to #sales before the Monday meeting. Do not email anyone.",
    steps: [
      { icon: "search", text: "Signed into HubSpot and read 63 open deals" },
      {
        icon: "compare",
        text: "Compared last activity against the 14 day limit",
      },
      { icon: "draft", text: "Drafted the digest, 4 deals flagged" },
      { icon: "post", text: "Posted to #sales with the deal links" },
    ] satisfies ThreadStep[],
    receipt: { duration: "14m 22s", cost: "$4.18", score: "8.7 of 10" },
    receiptLabels: { duration: "Duration", cost: "Cost", score: "Judge" },
    needsYou: {
      label: "Needs you",
      text: "Two reminder emails are drafted for the deals that went quiet. Send them?",
      approve: "Send both",
      skip: "Hold",
    },
  },
  integrations: {
    label: "Starts from and reports to",
    items: [
      "Slack",
      "Telegram",
      "Gmail",
      "Google Drive",
      "HubSpot",
      "Notion",
      "Airtable",
      "A webhook",
      "A schedule",
    ],
  },
};

// ---------------------------------------------------------------------------
// Use cases (the centrepiece)

export type Line = { from: "person" | "agent"; text: string };

export type UseCaseAgent = {
  value: string;
  name: string;
  initial: string;
  role: string;
  schedule: string;
  lines: Line[];
};

export type Department = {
  value: string;
  label: string;
  title: string;
  subtitle: string;
  agents: UseCaseAgent[];
};

export const USE_CASES = {
  section: {
    id: "use-cases",
    heading: {
      lead: "Agents for every function",
      rest: "and every recurring job.",
    },
  } satisfies SectionCopy,
  action: { label: "Start this agent", href: "/signup" },
  departments: [
    {
      value: "marketing",
      label: "Marketing",
      title: "Marketing",
      subtitle: "Research, draft and publish on a schedule",
      agents: [
        {
          value: "content",
          name: "Content agent",
          initial: "C",
          role: "Weekly content plan",
          schedule: "Every Friday, 15:00",
          lines: [
            {
              from: "person",
              text: "Draft next week's content plan from what did best this month and post it to #marketing by Monday.",
            },
            {
              from: "agent",
              text: "On it. Reading this month's post performance and the topics moving in your space.",
            },
            {
              from: "agent",
              text: "Plan drafted: five posts, two threads, one newsletter. Posted to #marketing with the sources. 11m 04s, $3.12.",
            },
            { from: "person", text: "Move the launch thread to Thursday." },
            {
              from: "agent",
              text: "Moved. I will keep the plan current as the schedule changes.",
            },
          ],
        },
        {
          value: "campaign",
          name: "Campaign agent",
          initial: "C",
          role: "Out-of-home campaign research",
          schedule: "On request",
          lines: [
            {
              from: "person",
              text: "Find billboard sites near our three shops and show the creative in place on each.",
            },
            {
              from: "agent",
              text: "Shortlisting twelve sites by footfall and price, then rendering the creative on each one.",
            },
            {
              from: "agent",
              text: "Done: a ranked list of eight sites with rates, and a page showing the creative in place. 8m, $6.41.",
            },
            { from: "person", text: "Which two would you book?" },
            {
              from: "agent",
              text: "Sites two and five, the best footfall for the price. Booking waits for your approval.",
            },
          ],
        },
        {
          value: "brand",
          name: "Brand agent",
          initial: "B",
          role: "Identity, packaging, launch site",
          schedule: "On request",
          lines: [
            {
              from: "person",
              text: "Take the bakery from one shop to a proper brand: logo, packaging and a launch site.",
            },
            {
              from: "agent",
              text: "Starting with three logo directions and a palette. I will show them before building anything else.",
            },
            {
              from: "agent",
              text: "Directions posted. Pick one and I will do the packaging and the site from it.",
            },
            { from: "person", text: "Direction two." },
            {
              from: "agent",
              text: "Building the packaging mockups and the launch site now. 15m, $3.88 so far.",
            },
          ],
        },
        {
          value: "ads",
          name: "Ad agent",
          initial: "A",
          role: "Ad creative in three formats",
          schedule: "On request",
          lines: [
            {
              from: "person",
              text: "Turn the product demo into ad creative for three placements.",
            },
            {
              from: "agent",
              text: "Cutting a 15 second vertical, a 30 second square and one static from the demo.",
            },
            {
              from: "agent",
              text: "Three cuts rendered with captions. Review them before I upload anything.",
            },
          ],
        },
      ],
    },
    {
      value: "sales",
      label: "Sales",
      title: "Sales",
      subtitle: "Qualify, research and keep the CRM current",
      agents: [
        {
          value: "pipeline",
          name: "Pipeline agent",
          initial: "P",
          role: "Monday pipeline digest",
          schedule: "Every Monday, 07:00",
          lines: [
            {
              from: "person",
              text: "Every Monday, post the pipeline digest to #sales with the deals that went quiet.",
            },
            {
              from: "agent",
              text: "Set for Mondays at 07:00. Reading HubSpot now for the first one.",
            },
            {
              from: "agent",
              text: "Digest posted: 63 open deals, four quiet for 14 days, two closing this week. 6m 40s, $1.92.",
            },
            { from: "person", text: "Draft nudges for the quiet ones." },
            {
              from: "agent",
              text: "Four reminders drafted. They stay in drafts until you approve them.",
            },
          ],
        },
        {
          value: "research",
          name: "Research agent",
          initial: "R",
          role: "Account research overnight",
          schedule: "Every weekday, 05:00",
          lines: [
            {
              from: "person",
              text: "Research the twenty accounts on this list before tomorrow's calls.",
            },
            {
              from: "agent",
              text: "Reading their sites, filings and recent news. One page per account.",
            },
            {
              from: "agent",
              text: "Twenty briefs in the shared folder, each with three talking points. 22m, $9.40.",
            },
          ],
        },
        {
          value: "crm",
          name: "CRM agent",
          initial: "C",
          role: "Notes and next steps after every call",
          schedule: "After every call",
          lines: [
            {
              from: "person",
              text: "After each call, log the notes and the next step in HubSpot.",
            },
            {
              from: "agent",
              text: "Watching the transcripts folder. I will update the deal and post a summary here.",
            },
            {
              from: "agent",
              text: "Logged three calls today. One deal moved to Proposal. Nothing was sent to a customer.",
            },
          ],
        },
        {
          value: "quote",
          name: "Quote agent",
          initial: "Q",
          role: "Quotes prepared for approval",
          schedule: "On request",
          lines: [
            {
              from: "person",
              text: "Prepare a quote for the 40 seat request.",
            },
            {
              from: "agent",
              text: "Using the current price list and the discount rules. 40 seats, annual: $19,200.",
            },
            {
              from: "agent",
              text: "Quote drafted as a document. It needs your approval before it goes out.",
            },
          ],
        },
      ],
    },
    {
      value: "recruiting",
      label: "Recruiting",
      title: "Recruiting",
      subtitle: "Source, rank and schedule",
      agents: [
        {
          value: "sourcing",
          name: "Sourcing agent",
          initial: "S",
          role: "Candidate slates for open roles",
          schedule: "Every weekday, 06:00",
          lines: [
            {
              from: "person",
              text: "Source candidates for the head of growth role and rank them.",
            },
            {
              from: "agent",
              text: "Searching profiles and public work. Ranking on the five skills in the brief.",
            },
            {
              from: "agent",
              text: "A dashboard of twenty candidates with skill sliders and notes. 22m, $14.18.",
            },
            { from: "person", text: "Weight product sense higher." },
            {
              from: "agent",
              text: "Re-ranked. Three new names moved into the top ten.",
            },
          ],
        },
        {
          value: "scheduling",
          name: "Scheduling agent",
          initial: "S",
          role: "Interviews across calendars",
          schedule: "On request",
          lines: [
            {
              from: "person",
              text: "Schedule first rounds for the six shortlisted candidates this week.",
            },
            {
              from: "agent",
              text: "Checking the panel's calendars and sending invites for the open slots.",
            },
            {
              from: "agent",
              text: "Five booked, one waiting on a reply. Confirmations are in the thread.",
            },
          ],
        },
        {
          value: "playbook",
          name: "Playbook agent",
          initial: "P",
          role: "A hiring playbook that stays current",
          schedule: "When the process changes",
          lines: [
            {
              from: "person",
              text: "Write the hiring playbook for engineering and keep it current.",
            },
            {
              from: "agent",
              text: "Drafting from the last three hires: stages, rubrics, who does what.",
            },
            {
              from: "agent",
              text: "Playbook published as a document. I will update it when the process changes.",
            },
          ],
        },
        {
          value: "offer",
          name: "Offer agent",
          initial: "O",
          role: "Offer letters for approval",
          schedule: "On request",
          lines: [
            {
              from: "person",
              text: "Prepare the offer for the senior designer.",
            },
            {
              from: "agent",
              text: "Using the band and the template. Draft attached, nothing sent.",
            },
            {
              from: "agent",
              text: "Ready for your approval. It goes out only when you say so.",
            },
          ],
        },
      ],
    },
    {
      value: "finance",
      label: "Finance",
      title: "Finance",
      subtitle: "Reconcile, close and report",
      agents: [
        {
          value: "reconcile",
          name: "Reconciliation agent",
          initial: "R",
          role: "Weekly payouts against the books",
          schedule: "Every Monday, 06:00",
          lines: [
            {
              from: "person",
              text: "Reconcile this week's payouts against the ledger.",
            },
            {
              from: "agent",
              text: "Matching 214 payouts. Flagging anything off by more than a dollar.",
            },
            {
              from: "agent",
              text: "211 matched, three flagged with notes. Report in the thread. 9m, $2.60.",
            },
          ],
        },
        {
          value: "invoices",
          name: "Invoice agent",
          initial: "I",
          role: "Reminders for overdue invoices",
          schedule: "Every weekday, 09:00",
          lines: [
            {
              from: "person",
              text: "Draft reminders for invoices unpaid after 30 days.",
            },
            {
              from: "agent",
              text: "Seven invoices qualify. Drafting one reminder each in your tone.",
            },
            {
              from: "agent",
              text: "Drafts ready. Any over $5,000 wait for your approval before sending.",
            },
          ],
        },
        {
          value: "close",
          name: "Close agent",
          initial: "C",
          role: "Month-end close checklist",
          schedule: "First of the month",
          lines: [
            {
              from: "person",
              text: "Prepare the month-end close checklist and track it.",
            },
            {
              from: "agent",
              text: "Checklist built from last month's close: 18 items with owners.",
            },
            {
              from: "agent",
              text: "Posted to #finance. I will tick items off as the documents land.",
            },
          ],
        },
        {
          value: "signals",
          name: "Signals agent",
          initial: "S",
          role: "Market signal briefs",
          schedule: "Every weekday, 06:30",
          lines: [
            {
              from: "person",
              text: "Every morning, send a brief on the signals that matter for our sector.",
            },
            {
              from: "agent",
              text: "Reading filings, prices and news at 06:30. First brief tomorrow.",
            },
            {
              from: "agent",
              text: "Brief sent: three signals, each with its source. 4m, $1.10.",
            },
          ],
        },
      ],
    },
    {
      value: "operations",
      label: "Operations",
      title: "Operations",
      subtitle: "Chase, flag and report",
      agents: [
        {
          value: "suppliers",
          name: "Supplier agent",
          initial: "S",
          role: "Chase late confirmations",
          schedule: "Every weekday, 08:00",
          lines: [
            {
              from: "person",
              text: "Chase suppliers who have not confirmed this week's orders.",
            },
            {
              from: "agent",
              text: "Nine unconfirmed. Drafting a chase for each with the order details.",
            },
            {
              from: "agent",
              text: "Drafts are in the thread. Send them, or I will hold until you have looked.",
            },
          ],
        },
        {
          value: "delivery",
          name: "Delivery agent",
          initial: "D",
          role: "Orders at risk of missing their date",
          schedule: "Every hour",
          lines: [
            {
              from: "person",
              text: "Flag orders at risk of missing their delivery date.",
            },
            {
              from: "agent",
              text: "Comparing carrier updates with the promised dates. Six orders at risk.",
            },
            {
              from: "agent",
              text: "Table posted with the reason for each. Updating every hour.",
            },
          ],
        },
        {
          value: "report",
          name: "Report agent",
          initial: "R",
          role: "Weekly operations report",
          schedule: "Every Friday, 15:00",
          lines: [
            {
              from: "person",
              text: "Write the weekly operations report every Friday afternoon.",
            },
            {
              from: "agent",
              text: "Pulling throughput, delays and open issues from the tracker.",
            },
            {
              from: "agent",
              text: "Report drafted with charts and posted to #ops for review. 7m, $2.05.",
            },
          ],
        },
        {
          value: "tracker",
          name: "Tracker agent",
          initial: "T",
          role: "A live tracker of open issues",
          schedule: "Every hour",
          lines: [
            {
              from: "person",
              text: "Build a tracker of open issues and keep it current.",
            },
            {
              from: "agent",
              text: "Building a dashboard from the issues list with owners and ages.",
            },
            {
              from: "agent",
              text: "Live at the link in the thread. It refreshes each hour.",
            },
          ],
        },
      ],
    },
  ] satisfies Department[],
};

// ---------------------------------------------------------------------------
// Output gallery

export type Format = "website" | "video" | "slides" | "document" | "dashboard";

export type WorkItem = {
  title: string;
  request: string;
  duration: string;
  cost: string;
};

export type FormatTab = {
  value: Format;
  label: string;
  line: string;
  items: WorkItem[];
};

export const WORK = {
  section: {
    id: "work",
    heading: {
      lead: "Finished work in every format,",
      rest: "not a summary of it.",
    },
    intro:
      "Websites that are built and hosted, decks in your house style, documents that stay current, dashboards that refresh. Each square is one request and what came back.",
  } satisfies SectionCopy,
  composer: { attach: "Attach", send: "Send" },
  meta: { duration: "Duration", cost: "Cost" },
  tabs: [
    {
      value: "website",
      label: "Websites",
      line: "Pages that render live, built and hosted, not pasted into a document.",
      items: [
        {
          title: "Market signal brief",
          request:
            "Build a page that sums up this week's market signals for the leadership team",
          duration: "12m",
          cost: "$4.20",
        },
        {
          title: "Candidate slate",
          request:
            "Turn the shortlist into a page the panel can review before Thursday",
          duration: "18m",
          cost: "$6.10",
        },
        {
          title: "Comp analysis",
          request:
            "Compare our pricing page with the six competitors on this list",
          duration: "16m",
          cost: "$5.30",
        },
        {
          title: "Landing page",
          request: "Build and host a landing page for the spring collection",
          duration: "25m",
          cost: "$8.75",
        },
      ],
    },
    {
      value: "video",
      label: "Video",
      line: "Demos, listing tours and ad creative, rendered with captions and ready to post.",
      items: [
        {
          title: "Product demo",
          request:
            "Cut a 60 second demo from the recorded walkthrough, with captions",
          duration: "20m",
          cost: "$12.40",
        },
        {
          title: "Listing tour",
          request: "Turn this listing into a cinematic tour",
          duration: "29m",
          cost: "$24.79",
        },
        {
          title: "Animated walkthrough",
          request: "Animate the onboarding flow as a 30 second walkthrough",
          duration: "24m",
          cost: "$18.20",
        },
        {
          title: "Ad creative",
          request:
            "Make three ad cuts from the demo: square, vertical and one static",
          duration: "17m",
          cost: "$10.60",
        },
      ],
    },
    {
      value: "slides",
      label: "Slides",
      line: "Decks in your house style, from first draft to the version you present.",
      items: [
        {
          title: "Pitch deck",
          request:
            "Draft the seed pitch deck in our house style from the strategy document",
          duration: "14m",
          cost: "$4.90",
        },
        {
          title: "Hiring kickoff",
          request: "Prepare the kickoff deck for the head of growth search",
          duration: "9m",
          cost: "$2.80",
        },
        {
          title: "Team review",
          request:
            "Build the monthly team review from the tracker and last month's deck",
          duration: "11m",
          cost: "$3.40",
        },
        {
          title: "Board update",
          request:
            "Draft the board update from the finance close and the pipeline",
          duration: "13m",
          cost: "$4.60",
        },
      ],
    },
    {
      value: "document",
      label: "Documents",
      line: "Documents an agent keeps current as the work moves, not a snapshot.",
      items: [
        {
          title: "Strategy document",
          request:
            "Write the Q3 strategy document from the planning notes and keep it current",
          duration: "15m",
          cost: "$5.10",
        },
        {
          title: "Research report",
          request:
            "Research the ten accounts on this list and write a report on each",
          duration: "22m",
          cost: "$9.40",
        },
        {
          title: "Hiring playbook",
          request:
            "Write the engineering hiring playbook from our last three hires",
          duration: "12m",
          cost: "$3.90",
        },
        {
          title: "Monday brief",
          request:
            "Every Monday, brief me on what changed across Slack, Gmail and HubSpot",
          duration: "5m",
          cost: "$1.60",
        },
      ],
    },
    {
      value: "dashboard",
      label: "Dashboards",
      line: "Live views with the context on what matters, refreshed on a schedule.",
      items: [
        {
          title: "Live metrics",
          request:
            "Build a dashboard of the metrics that matter, refreshed every hour",
          duration: "19m",
          cost: "$7.30",
        },
        {
          title: "Pipeline view",
          request: "Show the pipeline by stage with the deals that went quiet",
          duration: "10m",
          cost: "$3.20",
        },
        {
          title: "Hiring scorecard",
          request:
            "Source and rank candidates in a dashboard with skill sliders",
          duration: "22m",
          cost: "$14.18",
        },
        {
          title: "Issue tracker",
          request: "Track open operations issues with owners and ages",
          duration: "8m",
          cost: "$2.40",
        },
      ],
    },
  ] satisfies FormatTab[],
};

// ---------------------------------------------------------------------------
// Receipts

export type ReceiptRow = { key: string; value: string };

export const RECEIPTS = {
  section: {
    id: "receipts",
    heading: { lead: "Every run comes with a receipt", rest: "and a score." },
    intro:
      "How long each job took, what it cost, how an independent judge scored it against your rubric, and what it is waiting on.",
  } satisfies SectionCopy,
  cards: [
    {
      title: "Scored by a judge",
      body: "A separate model scores every run against rubrics you write, so quality is a number you can watch week to week.",
      receipt: {
        title: "Weekly pipeline review",
        subtitle: "Pipeline agent, Monday 07:00",
        rows: [
          { key: "Duration", value: "14m 22s" },
          { key: "Cost", value: "$4.18" },
          { key: "Judge score", value: "8.7 of 10" },
          { key: "Rubric", value: "Accuracy, completeness, tone" },
        ] satisfies ReceiptRow[],
        state: {
          label: "Needs you",
          text: "Two reminder emails waiting to be sent",
        },
      },
    },
    {
      title: "Priced per run",
      body: "Credit pays for model tokens, browser minutes, searches and actions, so every run shows exactly what it cost.",
      receipt: {
        title: "What this run used",
        subtitle: "Same run, itemised",
        rows: [
          { key: "Model tokens", value: "$2.90" },
          { key: "Browser minutes", value: "$0.84" },
          { key: "Searches", value: "$0.30" },
          { key: "Actions", value: "$0.14" },
        ] satisfies ReceiptRow[],
        total: { key: "Total", value: "$4.18" },
      },
    },
  ],
};

// ---------------------------------------------------------------------------
// Control

export type ControlItem = {
  title: string;
  body: string;
  setting: string;
  value: string;
};

export const CONTROL = {
  section: {
    id: "control",
    heading: { lead: "It asks before", rest: "anything that matters." },
    intro:
      "Decide what each agent may do on its own. Everything else waits for a person.",
  } satisfies SectionCopy,
  items: [
    {
      title: "Ask first, or draw the line",
      body: "Choose per agent whether it acts or asks, and write the exceptions in plain words.",
      setting: "Autonomy",
      value: "Ask first",
    },
    {
      title: "Logins stay out of its computer",
      body: "Connections use OAuth, and the tokens never enter the agent's sandbox.",
      setting: "Tokens",
      value: "Kept outside the sandbox",
    },
    {
      title: "Read-only until you say so",
      body: "Scheduled runs read what they need and change nothing until someone approves.",
      setting: "Unattended runs",
      value: "Read-only",
    },
    {
      title: "A budget on every run",
      body: "Caps per agent and per run, and one shared bill for the team.",
      setting: "Cap per run",
      value: "$10",
    },
  ] satisfies ControlItem[],
};

// ---------------------------------------------------------------------------
// Pricing: the v1 facts, unchanged

export const PRICING = {
  section: {
    id: "pricing",
    heading: { lead: "Plans from $20 a month." },
    intro: V1_PRICING.section.intro,
  } satisfies SectionCopy,
  unit: V1_PRICING.unit,
  plans: V1_PRICING.plans,
  more: V1_PRICING.more,
  faq: V1_PRICING.faq,
};

// ---------------------------------------------------------------------------
// Closing and footer

export const CLOSING = {
  heading: "Start with one job you do every week.",
  fine: "Plans from $20 a month. Credit pays for what your agents use.",
};

export const FOOTER = {
  legal: "Hyperagent",
  groups: [
    {
      title: "Product",
      links: [
        { label: "Use cases", href: "#use-cases" },
        { label: "Work", href: "#work" },
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
