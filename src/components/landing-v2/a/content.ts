// Every word on landing v2, variant A, in one place. The components read
// their copy from here, so a copy edit never touches layout. Product facts
// (formats, integrations, triggers, plans, control rules) come from
// src/components/landing/content.ts and the product's current site; every
// run, name and figure in a product picture is an example and reads as one.
//
// Voice: name the job, not its quality; pair every autonomy claim with its
// check; numbers carry units; one idea per block; sentence case; no invented
// customers, quotes or figures; no other company's name except the
// integrations the product offers.

import { PRICING as V1_PRICING } from "@/components/landing/content";

export { creditLine, formatUsd } from "@/components/landing/content";

export type LandingLink = { label: string; href: string };

// A section heading in the cursor shape: the claim in the first text tier and
// an equal-size line under it in the second.
export type Heading = { title: string; sub: string };

export type Step = { text: string; at: string };

export type Receipt = { duration: string; cost: string; score: string };

// One run of one agent, drawn as a thread: the request, what the agent did,
// and the receipt at the end.
export type Run = {
  job: string;
  request: string;
  steps: Step[];
  receipt: Receipt;
};

export type Agent = { name: string; initials: string; role: string; run: Run };

export type Bubble = { from: "you" | "agent"; text: string };

export type Department = {
  value: string;
  label: string;
  title: string;
  sub: string;
  bubbles: Bubble[];
  agents: Agent[];
};

export type Format = {
  id: string;
  name: string;
  body: string;
  examples: string[];
};

export type RunRow = {
  time: string;
  agent: string;
  job: string;
  duration: string;
  cost: string;
  score: string;
  state: "done" | "waiting" | "running";
};

export type ControlItem = { title: string; body: string; example: string };

export const LINKS = {
  home: { label: "Hyperagent", href: "/landing/a" },
  start: { label: "Start an agent", href: "/signup" },
  logIn: { label: "Log in", href: "/threads/new" },
} satisfies Record<string, LandingLink>;

export const A11Y = {
  skip: "Skip to content",
  mainNav: "Main",
  departments: "Departments",
  agents: "Agents in this department",
  browser: "Browser window",
  computer: "The agent's computer",
  runs: "Example runs from one Monday morning",
  working: "Working",
};

export const NAV: LandingLink[] = [
  { label: "Use cases", href: "#use-cases" },
  { label: "Formats", href: "#formats" },
  { label: "Receipts", href: "#receipts" },
  { label: "Control", href: "#control" },
  { label: "Pricing", href: "#pricing" },
];

export const HERO = {
  title: "Hand off the weekly work.",
  sub: "Each recurring job gets an agent with its own computer. You keep the final say.",
  fine: "Plans from $20 a month. Credit pays for what your agents use.",
  window: {
    url: "hyperagent.com/threads/weekly-pipeline-review",
    sidebar: [
      {
        label: "This week",
        items: [
          { name: "Weekly pipeline review", state: "running" as const },
          { name: "Invoice reminders", state: "done" as const },
          { name: "Late supplier confirmations", state: "done" as const },
        ],
      },
      {
        label: "Scheduled",
        items: [
          {
            name: "Candidate slate, product designer",
            state: "queued" as const,
          },
          { name: "Market signal brief", state: "queued" as const },
        ],
      },
    ],
    thread: {
      title: "Weekly pipeline review",
      agent: "Sales agent",
      schedule: "Every Monday at 07:00",
      you: "You",
      request:
        "Every Monday at 7:00, pull last week's pipeline from HubSpot, flag deals with no activity in 14 days, and post the digest in #sales before the 9:00 meeting. Never email a customer.",
      steps: [
        { text: "Signed in to HubSpot", at: "0:08" },
        { text: "Pulled 212 open deals and 14 days of activity", at: "0:41" },
        {
          text: "Flagged 9 deals with no activity since 1 September",
          at: "2:15",
        },
        { text: "Drafted the digest: 9 deals, 3 owners", at: "5:30" },
      ] satisfies Step[],
      ask: {
        label: "Waiting on you",
        body: "Post the digest in #sales? Unattended runs are read-only, so this waits for a person.",
        approve: "Post it",
        edit: "Edit first",
      },
      receipt: {
        duration: "6m 12s",
        cost: "$0.84",
        score: "Judge 9.1 / 10",
        waiting: "1 decision waiting",
      },
    },
    computer: {
      title: "Its computer",
      rows: [
        { label: "Browser", value: "HubSpot, Deals, no activity in 14 days" },
        { label: "Shell", value: "python flag_stale.py --days 14" },
        { label: "Files", value: "pipeline-week-37.csv, 212 rows" },
      ],
    },
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
  id: "use-cases",
  heading: {
    title: "One team of agents, across every function.",
    sub: "Each department gets agents with names, jobs and schedules. Pick one to see a run.",
  } satisfies Heading,
  action: { label: "Start this agent", href: "/signup" } satisfies LandingLink,
  departments: [
    {
      value: "finance",
      label: "Finance",
      title: "Finance",
      sub: "Reconcile, chase and close without the Friday scramble.",
      bubbles: [
        {
          from: "you",
          text: "@Finance agent, which invoices are past 30 days?",
        },
        {
          from: "agent",
          text: "Seven, totalling $18,420. Reminders are drafted for all of them and waiting for your approval.",
        },
      ],
      agents: [
        {
          name: "Payout reconciler",
          initials: "PR",
          role: "Matches the week's payouts to the books",
          run: {
            job: "Weekly payout reconciliation",
            request:
              "Every Friday at 16:00, match this week's payouts to the ledger and list anything off by more than $5.",
            steps: [
              { text: "Pulled 148 payouts and 151 ledger entries", at: "0:32" },
              { text: "Matched 146, found 2 differences over $5", at: "2:04" },
              { text: "Drafted the reconciliation note", at: "4:10" },
            ],
            receipt: { duration: "4m 50s", cost: "$0.61", score: "9.4" },
          },
        },
        {
          name: "Invoice chaser",
          initials: "IC",
          role: "Drafts reminders for invoices unpaid after 30 days",
          run: {
            job: "Invoice reminders",
            request:
              "Every Monday, list invoices unpaid after 30 days and draft a reminder for each. Send nothing until I have seen it.",
            steps: [
              { text: "Found 7 invoices past 30 days", at: "0:21" },
              { text: "Drafted 7 reminders in our tone", at: "1:48" },
              { text: "Held all 7 for approval", at: "3:40" },
            ],
            receipt: { duration: "3m 40s", cost: "$0.52", score: "9.6" },
          },
        },
        {
          name: "Close checklist",
          initials: "CC",
          role: "Prepares the month-end close checklist",
          run: {
            job: "Month-end close checklist",
            request:
              "On the last working day of each month, prepare the close checklist with owners and what is still open.",
            steps: [
              {
                text: "Listed 23 close tasks from last month's checklist",
                at: "0:15",
              },
              {
                text: "Marked 19 done, 4 open, from the shared drive",
                at: "1:52",
              },
              { text: "Wrote the checklist with owners", at: "3:05" },
            ],
            receipt: { duration: "3m 30s", cost: "$0.44", score: "9.2" },
          },
        },
        {
          name: "Spend watcher",
          initials: "SW",
          role: "Flags card spend outside policy",
          run: {
            job: "Card spend check",
            request:
              "Every Wednesday, review last week's card spend against the policy and flag anything outside it.",
            steps: [
              { text: "Pulled 312 card transactions", at: "0:27" },
              { text: "Checked each against the spend policy", at: "2:36" },
              { text: "Flagged 5 for a person to review", at: "3:58" },
            ],
            receipt: { duration: "4m 12s", cost: "$0.58", score: "9.0" },
          },
        },
      ],
    },
    {
      value: "sales",
      label: "Sales",
      title: "Sales",
      sub: "Research overnight, keep the CRM honest, report before the meeting.",
      bubbles: [
        { from: "you", text: "Break down the deals closed in Q3 by industry." },
        {
          from: "agent",
          text: "Done. 41 deals across 6 industries, with a table in the thread. Software led at 38% of value.",
        },
      ],
      agents: [
        {
          name: "Account researcher",
          initials: "AR",
          role: "Researches new accounts overnight",
          run: {
            job: "Account research",
            request:
              "Every night, research the accounts added to the CRM that day: what they do, who leads it, and one reason to talk.",
            steps: [
              { text: "Found 12 accounts added today", at: "0:11" },
              { text: "Read each company's site and recent news", at: "6:40" },
              { text: "Wrote a one-page note per account", at: "13:02" },
            ],
            receipt: { duration: "14m 20s", cost: "$2.36", score: "8.9" },
          },
        },
        {
          name: "CRM updater",
          initials: "CU",
          role: "Updates the CRM after every call",
          run: {
            job: "Post-call CRM update",
            request:
              "After every sales call, read the notes and update the deal stage, next step and close date in HubSpot.",
            steps: [
              { text: "Read the call notes, 3 calls today", at: "0:09" },
              { text: "Drafted 3 deal updates", at: "1:14" },
              { text: "Held the stage changes for approval", at: "1:50" },
            ],
            receipt: { duration: "2m 02s", cost: "$0.29", score: "9.3" },
          },
        },
        {
          name: "Pipeline reporter",
          initials: "PR",
          role: "Posts the pipeline digest before the Monday meeting",
          run: {
            job: "Weekly pipeline review",
            request:
              "Every Monday at 7:00, pull last week's pipeline, flag deals with no activity in 14 days, and post the digest in #sales.",
            steps: [
              {
                text: "Pulled 212 open deals and 14 days of activity",
                at: "0:41",
              },
              {
                text: "Flagged 9 deals with no activity since 1 September",
                at: "2:15",
              },
              { text: "Drafted the digest: 9 deals, 3 owners", at: "5:30" },
            ],
            receipt: { duration: "6m 12s", cost: "$0.84", score: "9.1" },
          },
        },
        {
          name: "Comp analyst",
          initials: "CA",
          role: "Keeps the competitor comparison current",
          run: {
            job: "Comp analysis refresh",
            request:
              "Every two weeks, refresh the competitor comparison: pricing pages, plan names and anything new they announced.",
            steps: [
              { text: "Opened 6 pricing pages in its browser", at: "1:05" },
              { text: "Found 2 plan changes since last time", at: "4:22" },
              { text: "Updated the comparison doc", at: "8:47" },
            ],
            receipt: { duration: "9m 14s", cost: "$1.62", score: "8.7" },
          },
        },
      ],
    },
    {
      value: "operations",
      label: "Operations",
      title: "Operations",
      sub: "Chase what is late, flag what is at risk, write the report.",
      bubbles: [
        { from: "you", text: "Anything at risk of missing Friday's delivery?" },
        {
          from: "agent",
          text: "Three orders. Two are waiting on a supplier confirmation, one is short on stock. Details are in the tracker.",
        },
      ],
      agents: [
        {
          name: "Supplier chaser",
          initials: "SC",
          role: "Chases suppliers for late confirmations",
          run: {
            job: "Late supplier confirmations",
            request:
              "Every morning, find purchase orders with no confirmation after 2 days and draft a chase to each supplier.",
            steps: [
              { text: "Found 4 orders unconfirmed after 2 days", at: "0:18" },
              { text: "Drafted 4 chase emails", at: "2:30" },
              { text: "Held them for approval", at: "8:05" },
            ],
            receipt: { duration: "8m 05s", cost: "$1.17", score: "8.8" },
          },
        },
        {
          name: "Delivery-risk flagger",
          initials: "DR",
          role: "Flags orders at risk of missing their date",
          run: {
            job: "Delivery risk check",
            request:
              "Twice a day, compare open orders with stock and supplier dates and flag any order that may miss its delivery date.",
            steps: [
              { text: "Checked 86 open orders against stock", at: "0:44" },
              { text: "Compared against 12 supplier dates", at: "1:36" },
              { text: "Flagged 3 orders at risk", at: "2:51" },
            ],
            receipt: { duration: "2m 51s", cost: "$0.38", score: "9.0" },
          },
        },
        {
          name: "Ops reporter",
          initials: "OR",
          role: "Writes the weekly operations report",
          run: {
            job: "Weekly operations report",
            request:
              "Every Friday at 15:00, write the operations report: orders shipped, late orders, stock-outs, and what changed from last week.",
            steps: [
              { text: "Pulled the week's orders and shipments", at: "0:36" },
              { text: "Compared with last week's report", at: "3:10" },
              { text: "Wrote the report as a document", at: "7:22" },
            ],
            receipt: { duration: "7m 40s", cost: "$1.05", score: "9.2" },
          },
        },
        {
          name: "Tracker keeper",
          initials: "TK",
          role: "Keeps the order tracker current",
          run: {
            job: "Order tracker update",
            request:
              "Every hour during the day, update the order tracker from the warehouse sheet and the carrier pages.",
            steps: [
              { text: "Read the warehouse sheet, 41 changes", at: "0:12" },
              { text: "Opened 9 carrier pages for updates", at: "1:48" },
              { text: "Updated the tracker", at: "2:26" },
            ],
            receipt: { duration: "2m 30s", cost: "$0.33", score: "9.5" },
          },
        },
      ],
    },
    {
      value: "hiring",
      label: "Hiring",
      title: "Hiring",
      sub: "Source, schedule and prepare, with a person signing every offer.",
      bubbles: [
        {
          from: "you",
          text: "Who did you find for the product designer role?",
        },
        {
          from: "agent",
          text: "A slate of 20, ranked by the rubric you wrote. The top 5 have portfolios linked in the dashboard.",
        },
      ],
      agents: [
        {
          name: "Candidate sourcer",
          initials: "CS",
          role: "Sources candidates for open roles",
          run: {
            job: "Candidate slate, product designer",
            request:
              "For each open role, source 20 candidates a week that match the rubric and rank them in a dashboard.",
            steps: [
              {
                text: "Searched for product designers matching the rubric",
                at: "6:30",
              },
              { text: "Ranked 20 candidates against 6 criteria", at: "17:44" },
              { text: "Built the slate as a dashboard", at: "22:18" },
            ],
            receipt: { duration: "22m 18s", cost: "$3.96", score: "9.2" },
          },
        },
        {
          name: "Interview scheduler",
          initials: "IS",
          role: "Schedules interviews across calendars",
          run: {
            job: "Interview scheduling",
            request:
              "When a candidate moves to the interview stage, find a slot that works for the panel and propose it.",
            steps: [
              { text: "Read 4 panel calendars", at: "0:20" },
              { text: "Found 3 slots that work for everyone", at: "1:02" },
              { text: "Drafted the invitation for approval", at: "1:40" },
            ],
            receipt: { duration: "1m 48s", cost: "$0.24", score: "9.4" },
          },
        },
        {
          name: "Offer drafter",
          initials: "OD",
          role: "Prepares offer letters for approval",
          run: {
            job: "Offer letter draft",
            request:
              "When a hire is approved, draft the offer letter from the template and the agreed terms. A person sends it.",
            steps: [
              { text: "Read the agreed terms in the thread", at: "0:14" },
              { text: "Filled the offer template", at: "1:20" },
              { text: "Held the letter for a person to send", at: "1:56" },
            ],
            receipt: { duration: "2m 04s", cost: "$0.27", score: "9.7" },
          },
        },
        {
          name: "Playbook keeper",
          initials: "PK",
          role: "Keeps the hiring playbook current",
          run: {
            job: "Hiring playbook update",
            request:
              "Every month, update the hiring playbook with what changed: roles, rubrics, and the steps that moved.",
            steps: [
              {
                text: "Compared the playbook with this month's threads",
                at: "2:14",
              },
              { text: "Found 5 steps that changed", at: "4:50" },
              { text: "Updated the document", at: "6:31" },
            ],
            receipt: { duration: "6m 45s", cost: "$0.92", score: "8.9" },
          },
        },
      ],
    },
    {
      value: "marketing",
      label: "Marketing",
      title: "Marketing",
      sub: "Briefs, pages and creative, built in your style and kept current.",
      bubbles: [
        { from: "you", text: "What moved in our market this week?" },
        {
          from: "agent",
          text: "Two launches and one pricing change. The brief is in the thread, with sources for each point.",
        },
      ],
      agents: [
        {
          name: "Signal briefer",
          initials: "SB",
          role: "Writes the weekly market signal brief",
          run: {
            job: "Market signal brief",
            request:
              "Every Monday at 8:00, read what our market published last week and write a one-page brief with sources.",
            steps: [
              {
                text: "Read 34 posts and pages from the watch list",
                at: "5:12",
              },
              { text: "Picked 6 signals that matter", at: "9:30" },
              { text: "Wrote the brief as a page", at: "11:47" },
            ],
            receipt: { duration: "11m 47s", cost: "$2.10", score: "8.9" },
          },
        },
        {
          name: "Page builder",
          initials: "PB",
          role: "Builds landing pages from a brief",
          run: {
            job: "Landing page, spring collection",
            request:
              "Build the landing page for the spring collection from the brief and the brand kit, and host it for review.",
            steps: [
              { text: "Read the brief and the brand kit", at: "0:40" },
              { text: "Built and hosted the page", at: "9:15" },
              { text: "Checked it on three screen sizes", at: "12:03" },
            ],
            receipt: { duration: "12m 30s", cost: "$2.84", score: "9.0" },
          },
        },
        {
          name: "Creative drafter",
          initials: "CD",
          role: "Drafts ad creative in the house style",
          run: {
            job: "Ad creative, three variants",
            request:
              "Draft three ad variants for the launch in our house style. Nothing is published until a person picks one.",
            steps: [
              { text: "Read the launch brief and past ads", at: "0:52" },
              { text: "Drafted 3 variants with copy", at: "6:20" },
              { text: "Held them for a person to choose", at: "7:10" },
            ],
            receipt: { duration: "7m 18s", cost: "$1.94", score: "8.8" },
          },
        },
        {
          name: "Content planner",
          initials: "CP",
          role: "Posts the week's content plan in Slack",
          run: {
            job: "Weekly content plan",
            request:
              "Every Monday morning, propose the week's content from the calendar and last week's numbers, and post it in #content.",
            steps: [
              { text: "Read the calendar and last week's numbers", at: "1:04" },
              { text: "Proposed 5 posts with a reason each", at: "3:48" },
              { text: "Posted the plan in #content", at: "4:20" },
            ],
            receipt: { duration: "4m 26s", cost: "$0.66", score: "9.1" },
          },
        },
      ],
    },
  ] satisfies Department[],
  bubbleSender: { you: "You", agent: "Agent" },
  runLabels: {
    request: "Request",
    receipt: "Receipt",
    score: "Judge",
  },
};

export const FORMATS = {
  id: "formats",
  heading: {
    title: "Work in every format.",
    sub: "Sites, video, decks, documents and dashboards, built and kept current as your world changes.",
  } satisfies Heading,
  examplesLabel: "For example",
  items: [
    {
      id: "websites",
      name: "Websites",
      body: "HTML that renders live, built and hosted, not pasted into a doc.",
      examples: [
        "Market signal briefs",
        "Candidate slates",
        "Comp analyses",
        "Landing pages",
      ],
    },
    {
      id: "video",
      name: "Video",
      body: "Product demos, listing tours and ad creative, ready to post.",
      examples: [
        "Product demos",
        "Listing tours",
        "Animated walkthroughs",
        "Ad creative",
      ],
    },
    {
      id: "slides",
      name: "Slides",
      body: "Decks in your house style, from first draft to final version.",
      examples: [
        "Pitch decks",
        "Hiring kickoffs",
        "Team reviews",
        "Board updates",
      ],
    },
    {
      id: "documents",
      name: "Documents",
      body: "Documents that stay current, watched by the agent as work moves.",
      examples: [
        "Strategy docs",
        "Research reports",
        "Hiring playbooks",
        "Briefs",
      ],
    },
    {
      id: "dashboards",
      name: "Dashboards",
      body: "Data with the context of what matters, refreshed on a schedule.",
      examples: ["Live metrics", "Pipeline views", "Scorecards", "Trackers"],
    },
  ] satisfies Format[],
};

export const RECEIPTS = {
  id: "receipts",
  heading: {
    title: "Every run comes with a receipt.",
    sub: "How long it took, what it cost, how a judge scored it, and what it is waiting on.",
  } satisfies Heading,
  columns: {
    time: "Time",
    agent: "Agent",
    job: "Job",
    duration: "Duration",
    cost: "Cost",
    score: "Score",
    state: "State",
  },
  states: { done: "Done", waiting: "Needs you", running: "Running" },
  rows: [
    {
      time: "07:00",
      agent: "Sales agent",
      job: "Weekly pipeline review",
      duration: "6m 12s",
      cost: "$0.84",
      score: "9.1",
      state: "waiting",
    },
    {
      time: "07:05",
      agent: "Finance agent",
      job: "Invoice reminders",
      duration: "3m 40s",
      cost: "$0.52",
      score: "9.6",
      state: "done",
    },
    {
      time: "07:10",
      agent: "Operations agent",
      job: "Late supplier confirmations",
      duration: "8m 05s",
      cost: "$1.17",
      score: "8.8",
      state: "done",
    },
    {
      time: "07:30",
      agent: "Hiring agent",
      job: "Candidate slate, product designer",
      duration: "22m 18s",
      cost: "$3.96",
      score: "9.2",
      state: "done",
    },
    {
      time: "08:00",
      agent: "Marketing agent",
      job: "Market signal brief",
      duration: "11m 47s",
      cost: "$2.10",
      score: "8.9",
      state: "done",
    },
    {
      time: "08:15",
      agent: "Operations agent",
      job: "Delivery risk check",
      duration: "2m 51s",
      cost: "$0.38",
      score: "",
      state: "running",
    },
  ] satisfies RunRow[],
  total: {
    label: "Six runs",
    duration: "54m 53s",
    cost: "$8.97",
    score: "9.1 average",
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
  id: "control",
  heading: {
    title: "It asks before anything that matters.",
    sub: "Decide what each agent may do on its own. Everything else waits for a person.",
  } satisfies Heading,
  items: [
    {
      title: "Ask first, or draw the line",
      body: "Choose per agent whether it acts or asks, and write the exceptions in plain words.",
      example: "Ask first. Hold any refund over $500.",
    },
    {
      title: "Logins stay out of its computer",
      body: "Connections use OAuth, and the tokens never enter the agent's sandbox.",
      example: "HubSpot connected. Token kept outside the sandbox.",
    },
    {
      title: "Read-only until you say so",
      body: "Scheduled runs read what they need and change nothing until someone approves.",
      example: "Unattended runs read. Writes wait for approval.",
    },
    {
      title: "A budget on every run",
      body: "Caps per agent and per run, and one shared bill for the team.",
      example: "Cap per run $5. Used this month $41.20 of $115.",
    },
  ] satisfies ControlItem[],
};

export const PRICING = {
  id: "pricing",
  heading: {
    title: "Plans from $20 a month.",
    sub: "Credit pays for what agents use: model tokens, browser minutes, searches and actions. Larger plans add bonus credit.",
  } satisfies Heading,
  unit: V1_PRICING.unit,
  plans: V1_PRICING.plans,
  more: V1_PRICING.more,
  faq: V1_PRICING.faq,
};

export const FOOTER = {
  groups: [
    {
      title: "Product",
      links: [
        { label: "Use cases", href: "#use-cases" },
        { label: "Formats", href: "#formats" },
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
