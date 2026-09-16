// Every word on landing v2, variant A, in one place. The components read
// their copy from here, so a copy edit never touches layout. Product facts
// (formats, integrations, plans, control rules) come from the product's own
// docs; every agent, job and figure in a product picture is an example and
// reads as one.
//
// Voice: a smart friend explaining it. Name the job, not its quality. Say
// what came back, with a number. Put the schedule in human time. Let the
// agent say the control line. Sentence case, second person, no invented
// customers or figures, no other company's name except the integrations
// and the customers in the product's own published stories.

import type { Plan } from "../../landing/content";

export { creditLine, formatUsd } from "../../landing/content";
export type { Plan } from "../../landing/content";

export type LandingLink = { label: string; href: string };

// A section heading in the cursor shape: the claim in the first text tier and
// an equal-size line under it in the second.
export type Heading = { title: string; sub: string };

export type Step = { text: string; at: string };

export type Receipt = { duration: string; cost: string; score: string };

// One job done by one agent, drawn as a conversation: the request, what the
// agent did, and the line at the end with time, cost and score.
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

// One format, as the showcase reads it: `name` is the tab and the accessible
// name of the panel's picture, `title` the claim in the panel, `body` the
// sentence under it, `request` the one line typed into the composer beside the
// work, `examples` the chips.
export type Format = {
  id: string;
  name: string;
  title: string;
  body: string;
  request: string;
  /**
   * Five is the hard maximum, locked by content.test.ts. Past five the row
   * wraps to a second line and stops reading as a quick aside. Four is the
   * house rhythm; only add a fifth when it earns the room.
   */
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

// One agent in a message list: its name, the department it works for, its
// last report, when, and whether that report waits on a person.
export type RosterItem = {
  name: string;
  department: string;
  preview: string;
  time: string;
  state: "done" | "waiting" | "running";
};

// One report from the week: when, who, what came back.
export type WeekItem = {
  time: string;
  agent: string;
  text: string;
  needsYou?: boolean;
};

export type WeekDay = { day: string; items: WeekItem[] };

export type Story = {
  figure: string;
  line: string;
  who: string;
  href: string;
};

export type Question = { question: string; answer: string };

export const LINKS = {
  home: { label: "Hyperagent", href: "/landing/a" },
  start: { label: "Start your team", href: "/signup" },
  logIn: { label: "Log in", href: "/threads/new" },
} satisfies Record<string, LandingLink>;

export const A11Y = {
  skip: "Skip to content",
  mainNav: "Main",
  departments: "Departments",
  agents: "Agents in this department",
  browser: "Browser window",
  computer: "The agent's computer",
  runs: "Example jobs from one Monday morning",
  working: "Working",
  roster: "Your team",
  week: "Example week",
  stories: "Customer stories",
};

export const NAV: LandingLink[] = [
  { label: "Team", href: "#team" },
  { label: "Use cases", href: "#use-cases" },
  { label: "A week", href: "#week" },
  { label: "Stories", href: "#stories" },
  { label: "Pricing", href: "#pricing" },
];

export const HERO = {
  title: "Meet your team of agents.",
  sub: "They do the weekly work. You approve what matters.",
  fine: "Plans from $20 a month. Credit pays for what the team actually does.",
  window: {
    url: "hyperagent.com/team/invoice-chaser",
    roster: {
      label: "Your team",
      items: [
        {
          name: "Invoice chaser",
          department: "Finance",
          preview: "Drafting Monday's reminders",
          time: "now",
          state: "running",
        },
        {
          name: "Supplier chaser",
          department: "Operations",
          preview: "4 chases drafted. Two suppliers are 3 days late.",
          time: "6:40",
          state: "waiting",
        },
        {
          name: "Pipeline reporter",
          department: "Sales",
          preview: "Digest posted in #sales. 9 deals need a nudge.",
          time: "7:05",
          state: "done",
        },
        {
          name: "Candidate sourcer",
          department: "Hiring",
          preview: "Slate of 20 ready. Top 5 have portfolios linked.",
          time: "Sun",
          state: "done",
        },
        {
          name: "Signal briefer",
          department: "Marketing",
          preview: "Brief posted. 6 signals, a source on each.",
          time: "Sun",
          state: "done",
        },
      ] satisfies RosterItem[],
    },
    thread: {
      title: "Invoice reminders",
      agent: "Invoice chaser",
      schedule: "Every Monday at 7:00",
      you: "You",
      request:
        "Every Monday at 7:00, find invoices unpaid after 30 days, draft a polite reminder for each, and post the list in #finance. Send nothing until I have seen it.",
      steps: [
        { text: "Opened the invoice list in Airtable", at: "0:09" },
        {
          text: "Found 7 invoices past 30 days, $18,420 in total",
          at: "0:40",
        },
        { text: "Drafted 7 reminders in our tone", at: "2:10" },
        { text: "Posted the list in #finance", at: "3:05" },
      ] satisfies Step[],
      ask: {
        label: "Needs you",
        body: "Send the 7 reminders? They are drafted and held. Nothing goes out until you say so.",
        approve: "Send them",
        edit: "Read them first",
      },
      receipt: {
        duration: "3m 40s",
        cost: "$0.52",
        score: "Score 9.6 / 10",
        waiting: "1 decision waiting",
      },
    },
    computer: {
      title: "Its computer",
      rows: [
        { label: "Browser", value: "Airtable, Invoices, unpaid after 30 days" },
        { label: "Drafts", value: "7 reminders, held" },
        { label: "Files", value: "reminders-week-37.pdf" },
      ],
    },
  },
  startsFrom: {
    label: "Starts from",
    items: [
      "You ask",
      "Slack",
      "Telegram",
      "Email",
      "A webhook",
      "A schedule",
      "Another agent",
    ],
  },
};

// The three stages of one assignment, one full-width card each: a two-tone
// heading (the muted line sets it up, the ink line lands it), the sentence
// under them, and a clip of the product doing that stage. `window` is the
// title on the mock's bar; `label` is what a screen reader hears in place of
// the clip, which carries nothing the heading and body do not already say.
export type BriefCard = {
  id: string;
  lead: string;
  claim: string;
  body: string;
  window: string;
  label: string;
};

export const BRIEF_CARDS = {
  id: "brief",
  heading: {
    title: "Brief once. They keep going.",
    sub: "Give your team a job. They research, build, deliver, and keep the work current.",
  } satisfies Heading,
  // Names the index beside the three stages, which is a landmark of its own.
  stagesLabel: "The three stages",
  items: [
    {
      id: "describe",
      lead: "Say what you need.",
      claim: "They take it from there.",
      body: "Write the job the way you would brief a new hire. Your agents research, draft, show you the work, and revise it.",
      window: "New job",
      label: "The app where you pick an agent and type the job you want done.",
    },
    {
      id: "build",
      lead: "Your team gets to work.",
      claim: "Each agent on a computer of its own.",
      body: "A browser, files, and the apps you connect. They search, decide, and build with what you would hand a new hire.",
      window: "Agent at work",
      label: "An agent at work on an example job, writing a brief.",
    },
    {
      id: "deliver",
      lead: "It lands where you already talk.",
      claim: "And it never goes stale.",
      // The card that claims delivery carries the check on it, per the voice
      // doc's rule 11: every claim that an agent acts alone is paired with
      // the line the agents say themselves.
      body: "Slack, your inbox, wherever you work. Your agents keep it up to date as your business changes. Nothing goes out until you say so.",
      window: "Slack",
      label: "An example report posted in Slack, where the team reads it.",
    },
  ] satisfies BriefCard[],
};

// The three-card band under the format showcase: one idea per card, each
// with a cropped picture of the product surface it describes. The pictures
// are examples, so every label says so.
export type TeamCard = { id: string; title: string; body: string };

export const TEAM_CARDS = {
  id: "team-cards",
  heading: {
    title: "See your team at work.",
    sub: "Each agent has its own computer, learns from your corrections, and reaches you where you talk.",
  } satisfies Heading,
  items: [
    {
      id: "computer",
      title: "Its own computer, already on.",
      body: "Every agent works on a computer of its own. It is on before you ask, so the first job starts right away.",
    },
    {
      id: "open",
      title: "Watch the work as it happens.",
      body: "You see every step, the searches, the files, the choices it makes. Correct it once and it remembers the correction. Nothing goes out until you say so.",
    },
    {
      id: "reach",
      title: "It reaches you where you talk.",
      body: "Mention an agent in Slack, message it on Telegram, or give it a job for Monday at 7:00. The work comes back where you asked for it.",
    },
  ] satisfies TeamCard[],
  // One picture per card, in the order the cards run. The labels carry what
  // the picture shows, since the pictures themselves are screens of the
  // product and a reader who cannot see them still gets the point.
  shots: [
    {
      id: "roster",
      label: "Example roster of agents, each on a computer of its own.",
    },
    {
      id: "run",
      label: "Example job in progress, with every step it has taken so far.",
    },
    {
      id: "thread",
      label: "Example message from an agent, with your reply under it.",
    },
  ],
};

export const TEAM = {
  id: "team",
  heading: {
    title: "One team. Each agent has a job.",
    sub: "Talk to them like coworkers, in one shared workspace. They report back with what they did.",
  } satisfies Heading,
  items: [
    {
      name: "Invoice chaser",
      department: "Finance",
      preview:
        "Drafted 7 reminders for invoices past 30 days. Held for your OK.",
      time: "7:04",
      state: "waiting",
    },
    {
      name: "Pipeline reporter",
      department: "Sales",
      preview: "Posted the pipeline digest in #sales. 9 deals need a nudge.",
      time: "7:05",
      state: "done",
    },
    {
      name: "Supplier chaser",
      department: "Operations",
      preview: "No orders late today. Nothing to chase.",
      time: "7:10",
      state: "done",
    },
    {
      name: "Candidate sourcer",
      department: "Hiring",
      preview:
        "Slate of 20 for the product designer role. Top 5 have portfolios linked.",
      time: "Sun 22:18",
      state: "done",
    },
    {
      name: "Signal briefer",
      department: "Marketing",
      preview: "This week's brief is up. Two launches, one price change.",
      time: "Mon 8:00",
      state: "done",
    },
    {
      name: "Spend watcher",
      department: "Finance",
      preview: "Checked 312 card charges. Flagged 5 for a person.",
      time: "Wed 8:04",
      state: "done",
    },
  ] satisfies RosterItem[],
  states: { done: "Done", waiting: "Needs you", running: "Working" },
  caption: "Example agents. Yours get the names and jobs you give them.",
};

export const WEEK = {
  id: "week",
  heading: {
    title: "What a week looks like.",
    sub: "The team reports where you already talk. Most days, the only thing left for you is a yes.",
  } satisfies Heading,
  needsYou: "Needs you",
  days: [
    {
      day: "Monday",
      items: [
        {
          time: "7:04",
          agent: "Invoice chaser",
          text: "Drafted 7 reminders for invoices past 30 days. Held for your OK.",
          needsYou: true,
        },
        {
          time: "7:05",
          agent: "Pipeline reporter",
          text: "Posted the pipeline digest in #sales. 9 deals have gone quiet for 14 days.",
        },
      ],
    },
    {
      day: "Tuesday",
      items: [
        {
          time: "6:30",
          agent: "Account researcher",
          text: "Wrote a one-page note on each of the 12 accounts added yesterday.",
        },
      ],
    },
    {
      day: "Wednesday",
      items: [
        {
          time: "8:04",
          agent: "Spend watcher",
          text: "Checked 312 card charges against the policy. Flagged 5 for a person.",
        },
      ],
    },
    {
      day: "Thursday",
      items: [
        {
          time: "16:00",
          agent: "Interview scheduler",
          text: "Found 3 slots that work for the whole panel. Invitation drafted.",
          needsYou: true,
        },
      ],
    },
    {
      day: "Friday",
      items: [
        {
          time: "15:00",
          agent: "Ops reporter",
          text: "Wrote the weekly operations report. 4 late orders, down from 9.",
        },
        {
          time: "16:00",
          agent: "Payout reconciler",
          text: "Matched 146 of 148 payouts. Two are off by more than $5.",
        },
      ],
    },
  ] satisfies WeekDay[],
  caption: "Example week. Times and figures are illustrations.",
};

export const USE_CASES = {
  id: "use-cases",
  heading: {
    title: "Every part of the business gets a few.",
    sub: "Pick a department to see its agents and one of their jobs.",
  } satisfies Heading,
  action: { label: "Start this agent", href: "/signup" } satisfies LandingLink,
  departments: [
    {
      value: "finance",
      label: "Finance",
      title: "Finance",
      sub: "Chase, reconcile and close without the Friday scramble.",
      bubbles: [
        {
          from: "you",
          text: "@Invoice chaser, which invoices are past 30 days?",
        },
        {
          from: "agent",
          text: "Seven, $18,420 in total. Reminders are drafted and held. Nothing goes out until you say so.",
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
              { text: "Wrote the reconciliation note", at: "4:10" },
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
              "Every Monday at 7:00, find invoices unpaid after 30 days and draft a reminder for each. Send nothing until I have seen it.",
            steps: [
              { text: "Found 7 invoices past 30 days", at: "0:40" },
              { text: "Drafted 7 reminders in our tone", at: "2:10" },
              { text: "Held all 7 for your OK", at: "3:40" },
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
              "On the last working day of each month, prepare the close checklist with an owner on each item and what is still open.",
            steps: [
              {
                text: "Listed 23 items from last month's checklist",
                at: "0:15",
              },
              {
                text: "Marked 19 done and 4 open from the shared drive",
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
          role: "Flags card spend outside the policy",
          run: {
            job: "Card spend check",
            request:
              "Every Wednesday, check last week's card spend against the policy and flag anything outside it.",
            steps: [
              { text: "Pulled 312 card charges", at: "0:27" },
              { text: "Checked each against the spend policy", at: "2:36" },
              { text: "Flagged 5 for a person to look at", at: "3:58" },
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
        { from: "you", text: "Which deals went quiet?" },
        {
          from: "agent",
          text: "Nine with no activity in 14 days. The digest is in #sales with an owner on each.",
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
              "Every night, research the accounts added to HubSpot that day: what they do, who runs it, and one reason to call.",
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
          role: "Updates HubSpot after every call",
          run: {
            job: "Post-call CRM update",
            request:
              "After every sales call, read the notes and update the deal stage, next step and close date in HubSpot.",
            steps: [
              { text: "Read the notes from 3 calls today", at: "0:09" },
              { text: "Drafted 3 deal updates", at: "1:14" },
              { text: "Held the changes for your OK", at: "1:50" },
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
              { text: "Flagged 9 deals quiet since 1 September", at: "2:15" },
              { text: "Posted the digest: 9 deals, 3 owners", at: "5:30" },
            ],
            receipt: { duration: "6m 12s", cost: "$0.84", score: "9.1" },
          },
        },
        {
          name: "Price watcher",
          initials: "PW",
          role: "Keeps the competitor comparison current",
          run: {
            job: "Price comparison refresh",
            request:
              "Every two weeks, refresh the competitor comparison: their pricing pages, plan names and anything new they announced.",
            steps: [
              { text: "Opened 6 pricing pages in its browser", at: "1:05" },
              { text: "Found 2 plan changes since last time", at: "4:22" },
              { text: "Updated the comparison document", at: "8:47" },
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
          text: "Three orders. Two wait on a supplier, one is short on stock. The tracker has the details.",
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
              { text: "Held them for your OK", at: "8:05" },
            ],
            receipt: { duration: "8m 05s", cost: "$1.17", score: "8.8" },
          },
        },
        {
          name: "Delivery-risk flagger",
          initials: "DR",
          role: "Flags orders that may miss their date",
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
      sub: "Source, schedule and prepare. A person signs every offer.",
      bubbles: [
        {
          from: "you",
          text: "Who did you find for the product designer role?",
        },
        {
          from: "agent",
          text: "A slate of 20, ranked the way you asked. The top 5 have portfolios linked in the dashboard.",
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
              "For each open role, find 20 candidates a week who match what we asked for and rank them in a dashboard.",
            steps: [
              { text: "Searched for product designers who match", at: "6:30" },
              { text: "Ranked 20 candidates against 6 points", at: "17:44" },
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
              { text: "Drafted the invitation for your OK", at: "1:40" },
            ],
            receipt: { duration: "1m 48s", cost: "$0.24", score: "9.4" },
          },
        },
        {
          name: "Offer drafter",
          initials: "OD",
          role: "Prepares offer letters for a person to send",
          run: {
            job: "Offer letter draft",
            request:
              "When a hire is approved, draft the offer letter from the template and the agreed terms. A person sends it.",
            steps: [
              { text: "Read the agreed terms", at: "0:14" },
              { text: "Filled in the offer template", at: "1:20" },
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
              "Every month, update the hiring playbook with what changed: roles, questions, and the steps that moved.",
            steps: [
              {
                text: "Compared the playbook with this month's hires",
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
      sub: "Briefs, pages and ads in your style, kept current.",
      bubbles: [
        { from: "you", text: "What moved in our market this week?" },
        {
          from: "agent",
          text: "Two launches and one price change. The brief is posted in #marketing, with a source on each point.",
        },
      ],
      agents: [
        {
          name: "Signal briefer",
          initials: "SB",
          role: "Writes the weekly market brief",
          run: {
            job: "Market brief",
            request:
              "Every Monday at 8:00, read what our market published last week and write a one-page brief with sources.",
            steps: [
              {
                text: "Read 34 posts and pages from the watch list",
                at: "5:12",
              },
              { text: "Picked 6 signals that matter", at: "9:30" },
              { text: "Posted the brief as a page", at: "11:47" },
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
          name: "Ad drafter",
          initials: "AD",
          role: "Drafts ad variants in the house style",
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
              "Every Monday morning, propose the week's posts from the calendar and last week's numbers, and post the plan in #content.",
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
    receipt: "Job",
    score: "Score",
  },
};

export const FORMATS = {
  id: "formats",
  heading: {
    title: "Real work in every format.",
    sub: "Apps, sites, decks, docs, video, whatever you get into next.",
  } satisfies Heading,
  examplesLabel: "For example",
  tabsLabel: "Formats",
  // Read after the format's name, on the panel's picture of the work.
  assetLabel: "example work, with the request that asked for it",
  previous: "Previous",
  next: "Next",
  // Apps leads, so the tabs read in the order the subhead says them and the
  // panel opens on the one thing the subhead promises that a page, a deck or
  // a document does not.
  items: [
    {
      id: "apps",
      name: "Apps",
      title: "Build an app your team can use",
      body: "A working tool with a login, not a picture of one.",
      request: "Build an app where the team files expenses and I approve them.",
      examples: [
        "Internal tools",
        "Request forms",
        "Client portals",
        "Booking apps",
      ],
    },
    {
      id: "websites",
      name: "Websites",
      title: "Publish a live page",
      body: "A page that is live and hosted, not a draft in a document.",
      request: "Build a page comparing our plans with the two we lose to.",
      examples: [
        "Market briefs",
        "Candidate slates",
        "Price comparisons",
        "Landing pages",
      ],
    },
    {
      id: "video",
      name: "Video",
      title: "Cut a demo ready to post",
      body: "Product demos, listing tours and ads, ready to post.",
      request: "Make a two minute demo of the new booking flow.",
      examples: [
        "Product demos",
        "Listing tours",
        "Walkthroughs",
        "Ad creative",
      ],
    },
    {
      id: "slides",
      name: "Slides",
      title: "Take a deck to final",
      body: "Decks in your house style, from first draft to final.",
      request: "Turn last quarter's numbers into a board deck.",
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
      title: "Draft and revise documents",
      body: "A piece an agent keeps up to date as the work moves.",
      request: "Write a research brief on the market we are moving into.",
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
      title: "See where the numbers stand",
      body: "Numbers with the context of what matters, refreshed on a schedule.",
      request: "Track pipeline by stage and tell me what moved this week.",
      examples: ["Live metrics", "Pipeline views", "Scorecards", "Trackers"],
    },
  ] satisfies Format[],
};

// The export keeps its name so receipts.tsx reads it unchanged; the visible
// copy never says "receipt".
export const RECEIPTS = {
  id: "cost",
  heading: {
    title: "Every job shows what it took.",
    sub: "How long, what it cost, how it scored, and what it is waiting on.",
  } satisfies Heading,
  columns: {
    time: "Time",
    agent: "Agent",
    job: "Job",
    duration: "Took",
    cost: "Cost",
    score: "Score",
    state: "State",
  },
  states: { done: "Done", waiting: "Needs you", running: "Working" },
  rows: [
    {
      time: "07:00",
      agent: "Invoice chaser",
      job: "Invoice reminders",
      duration: "3m 40s",
      cost: "$0.52",
      score: "9.6",
      state: "waiting",
    },
    {
      time: "07:05",
      agent: "Pipeline reporter",
      job: "Weekly pipeline review",
      duration: "6m 12s",
      cost: "$0.84",
      score: "9.1",
      state: "done",
    },
    {
      time: "07:10",
      agent: "Supplier chaser",
      job: "Late supplier confirmations",
      duration: "8m 05s",
      cost: "$1.17",
      score: "8.8",
      state: "done",
    },
    {
      time: "07:30",
      agent: "Candidate sourcer",
      job: "Candidate slate, product designer",
      duration: "22m 18s",
      cost: "$3.96",
      score: "9.2",
      state: "done",
    },
    {
      time: "08:00",
      agent: "Signal briefer",
      job: "Market brief",
      duration: "11m 47s",
      cost: "$2.10",
      score: "8.9",
      state: "done",
    },
    {
      time: "08:15",
      agent: "Delivery-risk flagger",
      job: "Delivery risk check",
      duration: "2m 51s",
      cost: "$0.38",
      score: "",
      state: "running",
    },
  ] satisfies RunRow[],
  total: {
    label: "Six jobs",
    duration: "54m 53s",
    cost: "$8.97",
    score: "9.1 average",
  },
  notes: [
    {
      title: "Checked by a second AI",
      body: "A separate AI scores each job against standards you write, so quality is a number you can watch week to week.",
    },
    {
      title: "Priced per job",
      body: "Credit pays for what the team actually does, so every job shows its cost. You can cap what one job may spend.",
    },
  ],
};

export const CONTROL = {
  id: "control",
  heading: {
    title: "You call the shots.",
    sub: "Each agent does only what you allow. Everything else waits for a yes.",
  } satisfies Heading,
  items: [
    {
      title: "Ask first, or let it run",
      body: "Choose per agent whether it acts or asks, and write the exceptions in plain words.",
      example: "Ask first. Hold any refund over $500.",
    },
    {
      title: "Your logins stay yours",
      body: "You sign in once. The agent uses the connection and never sees your password.",
      example: "HubSpot connected. Password never shared.",
    },
    {
      title: "Looks but does not touch, until you say so",
      body: "A job that runs while you are away can read your apps but change nothing until you loosen it.",
      example: "Runs while you are away: read-only.",
    },
    {
      title: "A cap on every job",
      body: "Set what one job may spend. The team never runs up a bill you did not expect.",
      example: "Cap per job $5. Used this month $41.20 of $115.",
    },
  ] satisfies ControlItem[],
};

// The product's own published customer stories, quoted as written. Figures
// and names come from hyperagent.com/blog and appear nowhere else on the page.
export const STORIES = {
  id: "stories",
  heading: {
    title: "What teams got done.",
    sub: "From the customer stories Hyperagent publishes. Figures are theirs, quoted as written.",
  } satisfies Heading,
  linkLabel: "Read the story",
  items: [
    {
      figure: "10 minutes",
      line: "“Four-hour manual tasks completed in 10 minutes.”",
      who: "Summit Cover, a 40-person insurance brokerage",
      href: "https://www.hyperagent.com/blog/summit-cover/",
    },
    {
      figure: "7 hours a week",
      line: "“7 hours saved weekly for one employee” and “+48% jobs approved.”",
      who: "Appell Striping & Seal Coating, a parking-lot striping company",
      href: "https://www.hyperagent.com/blog/customer-stories/customer-stories-appell-striping-agents-personalized-outreach/",
    },
    {
      figure: "27 markets in a day",
      line: "“800 opportunities surfaced in one day.”",
      who: "HelloPackage, package rooms for 200 buildings",
      href: "https://www.hyperagent.com/blog/customer-stories/hellopackage-agent-team-sales/",
    },
    {
      figure: "5 hours a week",
      line: "“An AI agent produces our weekly numbers in 2 minutes.” Saves the finance team 5 hours each week.",
      who: "Airtable's finance team",
      href: "https://www.hyperagent.com/blog/finance-agent/",
    },
  ] satisfies Story[],
};

export const PRICING = {
  id: "pricing",
  heading: {
    title: "Plans from $20 a month.",
    sub: "Credit pays for what the team actually does. Bigger plans add bonus credit.",
  } satisfies Heading,
  unit: "a month",
  plans: [
    { price: 20, bonus: 0, fit: "One agent on one weekly job." },
    { price: 100, bonus: 15, fit: "A few agents across the business." },
    { price: 500, bonus: 25, fit: "A department that runs every day." },
    { price: 2000, bonus: 35, fit: "Several departments, every day." },
  ] satisfies Plan[],
  more: "Plans continue up to $10,000 a month, with a 45% bonus at the top. Plan credit resets each month.",
  faq: {
    id: "faq",
    heading: "Questions",
    items: [
      {
        question: "Do I need to be technical?",
        answer:
          "No. You write the job the way you would brief a new hire, in plain words. The agent asks when something is unclear.",
      },
      {
        question: "Will it do things without asking?",
        answer:
          "Only where you allow it. Agents set to ask first stop before they act. A job that runs while you are away can read your apps but changes nothing until you say so.",
      },
      {
        question: "Where does the work show up?",
        answer:
          "In Slack, Telegram or your inbox, and in one shared workspace where your whole team can see every job. Jobs can also start from a schedule or a webhook.",
      },
      {
        question: "What does a week cost?",
        answer:
          "It depends on the jobs. The example week on this page comes to about $9 for six jobs. Every job shows its cost, and you can cap what one job may spend.",
      },
      {
        question: "What if it gets something wrong?",
        answer:
          "You see every step it took and can stop a job at any time. Correct it once and it remembers. A second AI scores each job against standards you write, so a drop shows up early.",
      },
      {
        question: "Will it work with our apps?",
        answer:
          "Slack, Gmail, Google Drive, HubSpot, Notion and Airtable connect in a few clicks. You sign in once. The agent never sees your password.",
      },
    ] satisfies Question[],
  },
};

export const CLOSING = {
  heading: "Hire your first agent today.",
  fine: "Plans from $20 a month. Nothing goes out until you say so.",
};

export const FOOTER = {
  groups: [
    {
      title: "Product",
      links: [
        { label: "Team", href: "#team" },
        { label: "A week", href: "#week" },
        { label: "Use cases", href: "#use-cases" },
        { label: "Formats", href: "#formats" },
        { label: "Cost and quality", href: "#cost" },
        { label: "Control", href: "#control" },
      ],
    },
    {
      title: "Plans",
      links: [
        { label: "Pricing", href: "#pricing" },
        { label: "Questions", href: "#faq" },
        { label: "Stories", href: "#stories" },
      ],
    },
    {
      title: "Account",
      links: [LINKS.logIn, LINKS.start],
    },
  ] satisfies { title: string; links: LandingLink[] }[],
};
