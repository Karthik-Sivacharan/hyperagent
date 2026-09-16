// The roster band's copy: five business functions, eight agents in each.
//
// The band answers the one question the hero leaves open. The hero says "a
// team of agents"; this says who is on it. Five tabs name the functions an
// owner already staffs, and each one holds eight agents named the way
// docs/brand/voice-and-copy.md §5.1 asks — by the job, in two words, sentence
// case, with a one-line description written like a job ad. Five of the forty
// are the names that document uses as its own examples (Invoice chaser,
// Supplier chaser, Pipeline reporter, Candidate sourcer, Spend watcher), so
// the page and the rulebook say the same words.
//
// EIGHT, not four, because of what the grid does with them: four across from
// `xl`, so a function arrives as two rows rather than one thin strip, and a
// reader gets a department rather than a sample of one. Eight is also about
// as far as a tab can go before the band stops being scannable, which is why
// there is a "See more agents" under it instead of a ninth card.
//
// Every one of these is an EXAMPLE. §6 asks for that to be said in a caption
// and in the accessible name; the design owner took the caption off the page
// on 2026-09-15, so `listLabel` is the only place the word survives and a
// sighted reader is not told. Putting a caption back is one line here and one
// in `agent-roster.tsx`.
//
// Two of the forty carry the check on their own claim in their own words, and
// they are the two that would put something in front of somebody outside the
// company: the posts that go up and the chase that goes out. They sit in
// different tabs, so the line never reads twice in one view. The band no
// longer states the refrain in full; the page still does, in the brief cards,
// the team cards and the closing band.
//
// `toolIds` are the settings catalogue's own slugs, resolved by
// `src/components/signup/tool-icon-row.tsx` against the inline marks in
// `src/components/settings/integration-logos.tsx` and the artwork manifest in
// `src/lib/mock/tool-logos.ts`. Every id here is in the catalogue, which is the
// cloned integrations page: naming a tool on a marketing page is a claim that
// the product connects to it, so the manifest-only ids (Figma, Exa, LinkedIn,
// the App Store) stay off this band even though the artwork exists, and
// Salesforce stays off because `a/content.test.ts` bans that name outright.
// Counts run 3 to 5 so the row's `+N` fold is exercised rather than decorative,
// and no tab leans on one mark: a function's eight cards should show the shape
// of the department's week, which is several apps, not one.

import { LINKS } from "./content";

export type RosterAgent = {
  id: string;
  /** Two words, sentence case, named by the job (voice-and-copy §5.1). */
  name: string;
  /** One line, job-ad style, cut to two lines at the card's measure. */
  description: string;
  /** Settings-catalogue slugs. Three to five; the row shows three plus `+N`. */
  toolIds: string[];
};

export type RosterCategory = {
  id: string;
  name: string;
  /** The grid's accessible name. Says "example", as §6 requires. */
  listLabel: string;
  agents: RosterAgent[];
};

export const ROSTER = {
  id: "agents",
  heading: {
    title: "Agents for every function",
    sub: "and every recurring job.",
  },
  tabsLabel: "Functions",
  action: { label: "See more agents", href: LINKS.start.href },
  categories: [
    {
      id: "marketing",
      name: "Marketing",
      listLabel: "Example marketing agents",
      agents: [
        {
          id: "campaign-reporter",
          name: "Campaign reporter",
          description: "Turns last week's ad numbers into a note the team reads.",
          toolIds: ["google-analytics", "meta-ads", "google-sheets", "slack"],
        },
        {
          id: "content-briefer",
          name: "Content briefer",
          description: "Researches the topic and writes the brief for each post.",
          toolIds: ["notion", "google-docs", "google-drive"],
        },
        {
          id: "social-scheduler",
          name: "Social scheduler",
          description: "Drafts the week of posts. Held for your OK.",
          toolIds: ["instagram", "twitter-x", "youtube", "slack"],
        },
        {
          id: "ad-watcher",
          name: "Ad watcher",
          description: "Checks what each ad costs and flags the ones slipping.",
          toolIds: [
            "meta-ads",
            "tiktok-ads",
            "google-analytics",
            "google-sheets",
            "slack",
          ],
        },
        {
          id: "newsletter-writer",
          name: "Newsletter writer",
          description: "Drafts the newsletter from what changed this week.",
          toolIds: ["resend", "notion", "google-docs", "slack"],
        },
        {
          id: "mention-watcher",
          name: "Mention watcher",
          description: "Collects every mention of you this week, in one note.",
          toolIds: ["twitter-x", "instagram", "notion", "slack"],
        },
        {
          id: "clip-cutter",
          name: "Clip cutter",
          description: "Cuts the long video into clips that are ready to post.",
          toolIds: ["youtube", "instagram", "google-drive", "tiktok-ads"],
        },
        {
          id: "survey-reader",
          name: "Survey reader",
          description: "Turns the week's form answers into themes you can use.",
          toolIds: ["tally", "google-sheets", "notion", "slack"],
        },
      ],
    },
    {
      id: "sales",
      name: "Sales",
      listLabel: "Example sales agents",
      agents: [
        {
          id: "pipeline-reporter",
          name: "Pipeline reporter",
          description: "Reports what moved this week and what went quiet.",
          toolIds: ["hubspot", "google-sheets", "slack"],
        },
        {
          id: "lead-researcher",
          name: "Lead researcher",
          description: "Reads up on every new lead before your first call.",
          toolIds: ["hubspot", "gmail", "attio", "google-sheets"],
        },
        {
          id: "follow-up-writer",
          name: "Follow-up writer",
          description: "Drafts the follow-up after every call, in your words.",
          toolIds: ["gong", "gmail", "hubspot", "slack"],
        },
        {
          id: "call-summarizer",
          name: "Call summarizer",
          description: "Turns each recorded call into notes and the next step.",
          toolIds: ["gong", "granola", "google-docs", "hubspot", "slack"],
        },
        {
          id: "quote-builder",
          name: "Quote builder",
          description: "Builds the quote from the call and the price list.",
          toolIds: ["hubspot", "google-sheets", "google-docs", "gmail"],
        },
        {
          id: "deal-briefer",
          name: "Deal briefer",
          description: "Puts one page in front of you before a deal review.",
          toolIds: ["hubspot", "gong", "google-slides", "slack"],
        },
        {
          id: "renewal-watcher",
          name: "Renewal watcher",
          description: "Flags every contract up for renewal, 60 days out.",
          toolIds: ["hubspot", "google-calendar", "gmail", "slack"],
        },
        {
          id: "churn-spotter",
          name: "Churn spotter",
          description: "Spots the accounts going quiet before they leave.",
          toolIds: ["hubspot", "gong", "google-sheets", "slack"],
        },
      ],
    },
    {
      id: "recruiting",
      name: "Recruiting",
      listLabel: "Example recruiting agents",
      agents: [
        {
          id: "candidate-sourcer",
          name: "Candidate sourcer",
          description: "Finds people who match the role and lines them up.",
          toolIds: ["attio", "gmail", "google-contacts", "google-sheets"],
        },
        {
          id: "application-reader",
          name: "Application reader",
          description: "Ranks every application against the bar you wrote.",
          toolIds: ["gmail", "google-sheets", "notion", "slack"],
        },
        {
          id: "interview-scheduler",
          name: "Interview scheduler",
          description: "Books interviews around the hours your team is free.",
          toolIds: ["google-calendar", "google-meet", "gmail", "slack"],
        },
        {
          id: "role-writer",
          name: "Role writer",
          description: "Writes the job post from the notes of your kickoff call.",
          toolIds: ["granola", "google-docs", "notion"],
        },
        {
          id: "panel-briefer",
          name: "Panel briefer",
          description: "Briefs every interviewer before they walk in.",
          toolIds: ["google-calendar", "notion", "granola", "slack"],
        },
        {
          id: "reference-chaser",
          name: "Reference chaser",
          description: "Drafts the chase for each reference. Held for your OK.",
          toolIds: ["gmail", "attio", "google-docs", "slack"],
        },
        {
          id: "offer-drafter",
          name: "Offer drafter",
          description: "Drafts the offer from the band and the notes on file.",
          toolIds: ["google-docs", "notion", "gmail", "attio"],
        },
        {
          id: "onboarding-planner",
          name: "Onboarding planner",
          description: "Builds the first week for every person who signs.",
          toolIds: ["notion", "google-calendar", "google-tasks", "slack"],
        },
      ],
    },
    {
      id: "finance",
      name: "Finance",
      listLabel: "Example finance agents",
      agents: [
        {
          id: "invoice-chaser",
          name: "Invoice chaser",
          description: "Drafts reminders for invoices past 30 days.",
          toolIds: ["gmail", "google-sheets", "slack"],
        },
        {
          id: "supplier-chaser",
          name: "Supplier chaser",
          description: "Tracks late orders and drafts the chase for each one.",
          toolIds: ["gmail", "airtable", "google-sheets", "telegram"],
        },
        {
          id: "spend-watcher",
          name: "Spend watcher",
          description: "Watches what leaves the account and flags what is new.",
          toolIds: ["google-sheets", "airtable", "gmail", "slack"],
        },
        {
          id: "month-closer",
          name: "Month closer",
          description: "Gathers the month's numbers and builds the close pack.",
          toolIds: ["google-sheets", "google-drive", "airtable", "slack"],
        },
        {
          id: "expense-sorter",
          name: "Expense sorter",
          description: "Sorts every expense into the right category each week.",
          toolIds: ["gmail", "google-sheets", "airtable", "slack"],
        },
        {
          id: "budget-checker",
          name: "Budget checker",
          description: "Checks each team against its budget and flags the gaps.",
          toolIds: ["google-sheets", "airtable", "slack"],
        },
        {
          id: "payment-matcher",
          name: "Payment matcher",
          description: "Matches the payments that came in to the invoices.",
          toolIds: ["google-sheets", "airtable", "gmail"],
        },
        {
          id: "forecast-builder",
          name: "Forecast builder",
          description: "Builds next quarter's forecast from what happened.",
          toolIds: ["google-sheets", "hubspot", "google-slides", "slack"],
        },
      ],
    },
    {
      id: "operations",
      name: "Operations",
      listLabel: "Example operations agents",
      agents: [
        {
          id: "order-tracker",
          name: "Order tracker",
          description: "Follows every order and says which ones are late.",
          toolIds: ["airtable", "google-sheets", "slack"],
        },
        {
          id: "ticket-sorter",
          name: "Ticket sorter",
          description: "Sorts the week's support email into themes, worst first.",
          toolIds: ["gmail", "notion", "google-sheets", "slack"],
        },
        {
          id: "note-taker",
          name: "Note taker",
          description: "Turns every meeting into notes and a list of next steps.",
          toolIds: ["granola", "google-meet", "notion", "slack"],
        },
        {
          id: "monday-briefer",
          name: "Monday briefer",
          description: "Puts one brief in your inbox every Monday at 7:00.",
          toolIds: ["google-calendar", "gmail", "notion", "slack"],
        },
        {
          id: "stock-checker",
          name: "Stock checker",
          description: "Checks what is running low and drafts the reorder.",
          toolIds: ["airtable", "google-sheets", "gmail", "slack"],
        },
        {
          id: "shift-planner",
          name: "Shift planner",
          description: "Builds next week's schedule around who is available.",
          toolIds: ["google-calendar", "google-sheets", "telegram", "slack"],
        },
        {
          id: "vendor-reviewer",
          name: "Vendor reviewer",
          description: "Reads each vendor's month and says who slipped.",
          toolIds: ["airtable", "google-sheets", "gmail", "slack"],
        },
        {
          id: "handover-writer",
          name: "Handover writer",
          description: "Writes the handover note at the end of every shift.",
          toolIds: ["notion", "granola", "google-tasks", "slack"],
        },
      ],
    },
  ] satisfies RosterCategory[],
};
