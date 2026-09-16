// Every word on the landing page, in one place. The section components read
// their copy from here, so a copy edit never touches layout, and
// content.test.ts holds the voice rules, the link targets and the pricing
// maths.
//
// Voice: name the job, not its quality; pair every autonomy claim with its
// check; numbers carry units; one idea per block; sentence case; no invented
// customers, quotes or figures.

export type LandingLink = { label: string; href: string };

// A picture of the product that v1 does not draw yet. `label` is the
// placeholder's accessible name; `brief` says what the finished asset shows,
// for the phase that builds it.
export type LandingAsset = { id: string; label: string; brief: string };

// A heading in two tones: `lead` in the first text tier, `rest` in the second.
export type TwoTone = { lead: string; rest?: string };

export type SectionCopy = {
  id: string;
  eyebrow: string;
  heading: TwoTone;
  intro?: string;
};

export type Feature = { title: string; body: string; asset?: LandingAsset };

export type Department = { value: string; label: string; jobs: string[] };

export type Plan = { price: number; bonus: number; fit: string };

export type Question = { question: string; answer: string };

export const LINKS = {
  home: { label: "Hyperagent", href: "/landing" },
  start: { label: "Start an agent", href: "/signup" },
  logIn: { label: "Log in", href: "/threads/new" },
  tour: { label: "See how a job runs", href: "#how-it-works" },
} satisfies Record<string, LandingLink>;

export const A11Y = {
  skip: "Skip to content",
  mainNav: "Main",
  departments: "Departments",
};

export const NAV: LandingLink[] = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Receipts", href: "#receipts" },
  { label: "Security", href: "#security" },
  { label: "Pricing", href: "#pricing" },
];

export const HERO = {
  heading: {
    lead: "Hand off the weekly work.",
    rest: "Keep the final say.",
  } satisfies TwoTone,
  lede: "Each recurring job gets an agent with its own computer. It signs into your tools, works overnight, reports in Slack, and holds anything risky until you approve it.",
  fine: "Plans from $20 a month. Credit pays for what your agents use.",
  asset: {
    id: "hero-run",
    label:
      "Placeholder for the product demo: an agent takes a job from Slack, works on its own computer and asks before it acts",
    brief:
      "A scripted replay rebuilt in HTML, not a video. A person asks an agent for a weekly job in a Slack thread. The agent lists its steps with elapsed times while a small panel names the page or command its computer is on. A receipt lands with steps, duration, cost and judge score, then a Needs you card, the only tangerine on screen, asks for one decision. It loops only while on screen, and reduced motion shows the finished state.",
  } satisfies LandingAsset,
  proof: {
    label: "Customer stories",
    logos: {
      id: "customer-logos",
      label: "Placeholder for the logos of customers with published stories",
      brief:
        "Four or five logos of customers whose stories are published, in one ink tone at the height of the text beside them. Take the names from published customer stories only.",
    } satisfies LandingAsset,
    figure: "300,000+",
    caption: "browser sessions run by agents since April",
  },
};

export const HOW_IT_WORKS = {
  section: {
    id: "how-it-works",
    eyebrow: "How a job runs",
    heading: { lead: "Brief it once.", rest: "It runs every Monday." },
    intro:
      "Write the job the way you would hand it to a new hire. The agent does it on its own computer, reports where your team already talks, and keeps what you teach it.",
  } satisfies SectionCopy,
  steps: [
    {
      title: "Brief it once",
      body: "A few sentences is enough. Add a schedule, an inbox or a webhook and it starts on its own.",
      asset: {
        id: "step-brief",
        label:
          "Placeholder for a job brief: a schedule over a few plain sentences",
        brief:
          "A brief as the agent receives it: a schedule chip (every Monday at 7:00) over three plain sentences describing a weekly job, ending with a limit such as not sending anything before a person has seen it.",
      },
    },
    {
      title: "It works on its own computer",
      body: "A browser, a shell and files for every run, so it uses your tools instead of describing them.",
      asset: {
        id: "step-computer",
        label:
          "Placeholder for the agent's computer: a command and the page its browser is on",
        brief:
          "A fragment of the agent's computer: the address its browser is on, and the last command it ran with a one-line result, set in mono.",
      },
    },
    {
      title: "It reports in Slack",
      body: "Results arrive in the channel with a receipt. Anything past your limits waits for you.",
      asset: {
        id: "step-report",
        label:
          "Placeholder for a Slack report: the result, its receipt and one decision waiting",
        brief:
          "One Slack message from the agent: a one-sentence result, a receipt line with duration and cost, and a Needs you marker on the part that waits for a person.",
      },
    },
    {
      title: "It keeps what you teach it",
      body: "Corrections become memories and skills that every agent on the team can use.",
      asset: {
        id: "step-memory",
        label:
          "Placeholder for a saved memory: a correction the agent keeps for next time",
        brief:
          "A memory card: a plain-language correction a person gave, what kind of job it applies to, and who taught it.",
      },
    },
  ] satisfies Feature[],
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

export const TEAM = {
  section: {
    id: "team",
    eyebrow: "The team",
    heading: { lead: "A team with names,", rest: "jobs and schedules." },
    intro:
      "Give each recurring job its own agent. Each one has a role, the tools it may touch, and a schedule anyone on the team can read.",
  } satisfies SectionCopy,
  departments: [
    {
      value: "finance",
      label: "Finance",
      jobs: [
        "Reconcile the week's payouts against the books",
        "Draft reminders for invoices unpaid after 30 days",
        "Prepare the month-end close checklist",
      ],
    },
    {
      value: "sales",
      label: "Sales",
      jobs: [
        "Research new accounts overnight",
        "Update the CRM after every call",
        "Post the pipeline digest before the Monday meeting",
      ],
    },
    {
      value: "operations",
      label: "Operations",
      jobs: [
        "Chase suppliers for late confirmations",
        "Flag orders at risk of missing their delivery date",
        "Write the weekly operations report",
      ],
    },
    {
      value: "hiring",
      label: "Hiring",
      jobs: [
        "Source candidates for open roles",
        "Schedule interviews across calendars",
        "Prepare offer letters for approval",
      ],
    },
  ] satisfies Department[],
  quote: {
    id: "team-quote",
    label: "Placeholder for a quote from a published customer story",
    brief:
      "One or two sentences from a published customer story, with the person's role and the size of their business, set beside the claim it supports. Never invent one.",
  } satisfies LandingAsset,
  roster: {
    id: "team-roster",
    label:
      "Placeholder for the team roster: each agent with its role, schedule, last run and state",
    brief:
      "The selected department's agents as rows: an ink rounded-square avatar with an initial, name over role, schedule, the last run's duration and cost, and one state (running, done, or needs you in tangerine). It follows the selected tab.",
  } satisfies LandingAsset,
};

export const RECEIPTS = {
  section: {
    id: "receipts",
    eyebrow: "Cost and quality",
    heading: { lead: "Every run comes with", rest: "a receipt." },
    intro:
      "See how long each job took, what it cost, how an independent judge scored it against your rubric, and what it is waiting on.",
  } satisfies SectionCopy,
  ledger: {
    id: "receipts-ledger",
    label:
      "Placeholder for the run ledger: a night of runs with duration, cost, score and state",
    brief:
      "A ledger of one night's runs: time, agent and job, duration, cost, judge score and state, with a total row. Figures in tabular numerals; one row waits on a person.",
  } satisfies LandingAsset,
  notes: [
    {
      title: "Scored by a judge",
      body: "A separate model scores every run against rubrics you write, so quality is a number you can watch week to week.",
      asset: {
        id: "receipts-score-trend",
        label: "Placeholder for a judge score trend over eight weeks",
        brief:
          "A small line of the average judge score over eight weeks, rising, with the latest value labelled at its end.",
      },
    },
    {
      title: "Priced per run",
      body: "Credit pays for model tokens, browser minutes, searches and actions, so every run shows what it cost.",
    },
  ] satisfies Feature[],
};

export const CONTROL = {
  section: {
    id: "security",
    eyebrow: "Control",
    heading: { lead: "It asks before", rest: "anything that matters." },
    intro:
      "Decide what each agent may do on its own. Everything else waits for a person.",
  } satisfies SectionCopy,
  items: [
    {
      title: "Ask first, or draw the line",
      body: "Choose per agent whether it acts or asks, and write the exceptions in plain words.",
      asset: {
        id: "control-autonomy",
        label:
          "Placeholder for the autonomy setting: act on its own or ask first, with one exception",
        brief:
          "A two-option switch set to Ask first and, under it, one rule in plain words, such as holding any refund over $500.",
      },
    },
    {
      title: "Logins stay out of its computer",
      body: "Connections use OAuth, and the tokens never enter the agent's sandbox.",
      asset: {
        id: "control-connections",
        label:
          "Placeholder for a connection: the account is connected and its token is kept outside",
        brief:
          "Three key and value rows: the connected account, where its token is kept (outside the sandbox), and a line saying the agent's computer holds no passwords.",
      },
    },
    {
      title: "Read-only until you say so",
      body: "Scheduled runs read what they need and change nothing until someone approves.",
      asset: {
        id: "control-read-only",
        label:
          "Placeholder for run permissions: unattended runs only read, writes wait for approval",
        brief:
          "Three key and value rows: unattended runs are read-only, writes happen after approval, and one change is pending.",
      },
    },
    {
      title: "A budget on every run",
      body: "Caps per agent and per run, and one shared bill for the team.",
      asset: {
        id: "control-budget",
        label:
          "Placeholder for a budget: a cap per run, the plan and the credit used",
        brief:
          "Three key and value rows: the cap on each run, the monthly plan, and the credit used so far this month.",
      },
    },
  ] satisfies Feature[],
};

export const LEARNING = {
  section: {
    id: "learning",
    eyebrow: "Learning",
    heading: { lead: "Week eight knows", rest: "what week one didn't." },
    intro:
      "Corrections become memories. Methods that repeat become skills. The judge's score shows whether it is working.",
  } satisfies SectionCopy,
  items: [
    {
      title: "Memories",
      body: "Correct an agent once and it keeps the correction for the next run.",
    },
    {
      title: "Skills",
      body: "A method that works is written down as a skill, so the next run starts from it.",
    },
    {
      title: "Shared across the team",
      body: "Memories and skills can belong to one person, one agent or the whole team.",
    },
  ] satisfies Feature[],
  asset: {
    id: "learning-weeks",
    label:
      "Placeholder for one agent in week one beside the same agent in week eight",
    brief:
      "Two cards for the same agent, week one and week eight: counts of skills and memories and the judge score, each with three short examples of what it learned. Week eight shows more of each and a higher score.",
  } satisfies LandingAsset,
};

export const PRICING = {
  section: {
    id: "pricing",
    eyebrow: "Pricing",
    heading: { lead: "Plans from $20 a month." },
    intro:
      "Credit pays for what agents use: model tokens, browser minutes, searches and actions. Larger plans add bonus credit.",
  } satisfies SectionCopy,
  unit: "a month",
  plans: [
    { price: 20, bonus: 0, fit: "One agent on a weekly job." },
    { price: 100, bonus: 15, fit: "A few agents across a team." },
    { price: 500, bonus: 25, fit: "A department that runs daily." },
    { price: 2000, bonus: 35, fit: "Several departments, every day." },
  ] satisfies Plan[],
  more: "Plans continue up to $10,000 a month, with a 45% bonus at the top.",
  faq: {
    id: "faq",
    heading: "Questions",
    items: [
      {
        question: "Will it do things without asking?",
        answer:
          "Only agents set to Auto. Ask-first agents stop before they act, and unattended runs can stay read-only until someone approves a change.",
      },
      {
        question: "What happens when credit runs out?",
        answer:
          "Runs pause. Buy a credit block, which lasts 90 days, or turn on auto-recharge. Plan credit resets each month.",
      },
      {
        question: "Will it work with our tools?",
        answer:
          "First-party connections cover Slack, Gmail, Google Drive, HubSpot, Notion, Airtable and more, plus any remote MCP server.",
      },
    ] satisfies Question[],
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
        { label: "How a job runs", href: "#how-it-works" },
        { label: "The team", href: "#team" },
        { label: "Receipts", href: "#receipts" },
        { label: "Learning", href: "#learning" },
      ],
    },
    {
      title: "Plans",
      links: [
        { label: "Pricing", href: "#pricing" },
        { label: "Questions", href: "#faq" },
        { label: "Security", href: "#security" },
      ],
    },
    {
      title: "Account",
      links: [LINKS.logIn, LINKS.start],
    },
  ] satisfies { title: string; links: LandingLink[] }[],
};

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatUsd(amount: number): string {
  return USD.format(amount);
}

// A plan's monthly credit is its price plus its bonus.
export function creditLine(plan: Plan): string {
  const credit = formatUsd((plan.price * (100 + plan.bonus)) / 100);
  return plan.bonus === 0
    ? `${credit} in credit`
    : `${credit} in credit, ${plan.bonus}% bonus`;
}
