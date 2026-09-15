import type { ComponentProps } from "react";

import type { HANDOFF_THREAD } from "@/components/signup/app-handoff";
import type { Workspace } from "@/components/workspace/workspace";
import type { AgentScript, StreamRow } from "@/lib/mock/agent-stream";
import type { WorkspaceDocument } from "@/lib/mock/workspace";

// The six agents the landing page's app window can show. Each one is a finished
// piece of work, drawn with the same parts as the signup flow's last screen:
// the thread bar, the request, the agent's rows and prose, and a document open
// on its computer.
//
// Every import is a type, so this file stays data and the node test suite can
// load it without pulling in a single component.
//
// One business runs through all six, so the team reads as a team: booking
// software for clinics, a Waitlist feature launching on 6 October, and 12
// clinics already using it early. Rows only ever carry count receipts, never
// logo stacks, because the page names no tool brands. No em dashes, middots or
// exclamation marks anywhere a reader sees.

export type DemoAgentId =
  "engineering" | "marketing" | "copywriting" | "support" | "sales" | "data";

type DemoWorkspace = Pick<
  ComponentProps<typeof Workspace>,
  "artifacts" | "activeId"
>;

export interface DemoAgent {
  id: DemoAgentId;
  /** The sidebar label. */
  label: string;
  /** The thread bar's title; `thread.title` is the same string. */
  threadTitle: string;
  thread: typeof HANDOFF_THREAD;
  /** What the person asked: the UserMessage bubble above the turn. */
  brief: string;
  /**
   * The agent's finished turn for AgentTurn: rows, then prose. It asks no
   * question, so `question` is empty and the stream sets `questionShown: false`.
   */
  script: AgentScript;
  /** The computer panel, spread as `<Workspace {...workspace} />`: artifacts plus the one in focus. */
  workspace: DemoWorkspace;
}

// Everything but the title matches HANDOFF_THREAD. The bar never draws
// `model`, and the demo names none.
function threadFor(id: DemoAgentId, title: string): DemoAgent["thread"] {
  return {
    id: `demo-${id}`,
    title,
    summary: "",
    updatedLabel: "just now",
    updatedShortLabel: "now",
    updatedAt: new Date(0).toISOString(),
    messageCount: 1,
    starred: false,
    model: "",
  };
}

// Two documents per computer, the first in focus, like the signup end state's
// two cards. Both belong to this job, so neither wears the project badge.
function computerFor(
  id: DemoAgentId,
  main: WorkspaceDocument,
  second: WorkspaceDocument,
): DemoWorkspace {
  const card = (suffix: string, document: WorkspaceDocument) => ({
    kind: "document" as const,
    id: `${id}-${suffix}`,
    title: document.title,
    tileLabel: `${document.title}, document`,
    scope: "thread" as const,
    document,
  });
  return {
    artifacts: [card("main", main), card("second", second)],
    activeId: `${id}-main`,
  };
}

function row(
  id: string,
  label: string,
  detail: string,
  icon: StreamRow["icon"],
  count?: string,
): StreamRow {
  return count
    ? { id, label, detail, icon, receipt: { kind: "count", text: count } }
    : { id, label, detail, icon };
}

function agent(fields: Omit<DemoAgent, "thread">): DemoAgent {
  return { ...fields, thread: threadFor(fields.id, fields.threadTitle) };
}

// ===== ENGINEERING =========================================================

const ENGINEERING = agent({
  id: "engineering",
  label: "Engineering",
  threadTitle: "Booking tests failing",
  brief:
    "The booking tests have failed since last night. Find out what broke, explain it in plain words, and draft a fix. Do not merge anything until I have looked.",
  script: {
    agentName: "Engineering",
    rows: [
      row(
        "results",
        "Reading the test results",
        "booking tests",
        "reading",
        "3 failing",
      ),
      row(
        "changes",
        "Searching the repo",
        "changes in the last 3 days",
        "reading",
        "12 changes",
      ),
      row("fix", "Writing the fix", "reminder times", "pencil"),
      row(
        "tests",
        "Running the tests",
        "booking tests",
        "puzzle",
        "149 passing",
      ),
    ],
    prose: [
      [
        { text: "Found it. " },
        {
          text: "Yesterday's change to reminder settings dropped the clinic's time zone",
          strong: true,
        },
        {
          text: ", so reminders for appointments after 5 PM were set for the next day.",
        },
      ],
      [
        {
          text: "The fix is two lines plus a new test, and all 149 booking tests pass. It is a draft pull request, waiting for your review. Nothing is merged until you say so.",
        },
      ],
    ],
    question: "",
  },
  workspace: computerFor(
    "engineering",
    {
      icon: "🧪",
      title: "Booking tests failing",
      description:
        "What broke, who it affects, and the fix waiting for your review.",
      sections: [
        {
          heading: "What broke",
          blocks: [
            {
              kind: "paragraph",
              text: "Yesterday's change to reminder settings saved reminder times without the clinic's time zone. Reminders for appointments after 5 PM were set for the next day. **3 booking tests** caught it.",
            },
          ],
        },
        {
          heading: "Who it affects",
          blocks: [
            {
              kind: "paragraph",
              text: "No one yet. The change never went live, because the tests failed first.",
            },
          ],
        },
        {
          heading: "The fix",
          blocks: [
            {
              kind: "list",
              items: [
                "Save reminder times with the clinic's time zone.",
                "Add a test for appointments after 5 PM.",
                "Opened as a draft pull request. **Not merged.**",
              ],
            },
          ],
        },
        {
          heading: "How it was checked",
          blocks: [
            {
              kind: "list",
              items: [
                "All **149** booking tests pass, including the new one.",
                "The 3 tests that failed pass 10 times in a row.",
              ],
            },
          ],
        },
        {
          heading: "Waiting on you",
          blocks: [
            {
              kind: "list",
              items: [
                "Review the draft pull request.",
                "Merge it, or tell me what to change.",
              ],
            },
          ],
        },
      ],
    },
    {
      icon: "📋",
      title: "Test results",
      description: "Booking tests, before and after the fix.",
      sections: [
        {
          heading: "Before the fix",
          blocks: [
            {
              kind: "list",
              items: [
                "145 of 148 pass.",
                "Failing: evening reminders, weekend reminders and moved appointments.",
              ],
            },
          ],
        },
        {
          heading: "After the fix",
          blocks: [
            {
              kind: "list",
              items: [
                "149 of 149 pass, including a new test for evening appointments.",
              ],
            },
          ],
        },
      ],
    },
  ),
});

// ===== MARKETING ===========================================================

const MARKETING = agent({
  id: "marketing",
  label: "Marketing",
  threadTitle: "Waitlist launch plan",
  brief:
    "Waitlist launches on 6 October. Put together a launch plan: who it is for, what we say, which channels, and a week-by-week schedule. Use the March launch report as a guide.",
  script: {
    agentName: "Marketing",
    rows: [
      row(
        "report",
        "Reading the March launch report",
        "the shared drive",
        "reading",
        "4 channels",
      ),
      row(
        "requests",
        "Searching customer requests",
        "the help desk, last 90 days",
        "reading",
        "86 requests",
      ),
      row(
        "calendar",
        "Checking the content calendar",
        "October",
        "reading",
        "2 open weeks",
      ),
      row("plan", "Writing the launch plan", "Waitlist, 6 October", "pencil"),
    ],
    prose: [
      [
        { text: "The plan is ready. " },
        { text: "Email to current clinics leads", strong: true },
        {
          text: ", because in March it brought 3 times the signups of paid ads. Ads get a small test in week two.",
        },
      ],
      [
        {
          text: "86 help desk requests asked for a waitlist, so the messaging uses their words. The ads budget and dates need your OK before anything is booked.",
        },
      ],
    ],
    question: "",
  },
  workspace: computerFor(
    "marketing",
    {
      icon: "📣",
      title: "Waitlist launch plan",
      description: "Launch plan for Waitlist, live on 6 October.",
      sections: [
        {
          heading: "Goal",
          blocks: [
            {
              kind: "paragraph",
              text: "**150 clinics** turn on Waitlist by 31 October. 12 clinics already use it early.",
            },
          ],
        },
        {
          heading: "Who it is for",
          blocks: [
            {
              kind: "paragraph",
              text: "Front desks that fill cancelled appointments by phone today. 86 help desk requests in 90 days asked for this.",
            },
          ],
        },
        {
          heading: "What we say",
          blocks: [
            {
              kind: "paragraph",
              text: "**Fill cancelled appointments without picking up the phone.** When a slot opens, the next patient on the waitlist gets a text.",
            },
          ],
        },
        {
          heading: "Channels",
          blocks: [
            {
              kind: "list",
              items: [
                "**Email to current clinics**, 3 sends. The best channel in March.",
                "**In-app banner** for front-desk staff.",
                "**Two customer stories** from the early clinics.",
                "**Paid ads**, a $2,000 test in week two.",
              ],
            },
          ],
        },
        {
          heading: "Schedule",
          blocks: [
            {
              kind: "list",
              items: [
                "**Week of 28 Sep:** stories and emails drafted.",
                "**6 Oct:** launch email and in-app banner.",
                "**Week of 12 Oct:** ads test and the second story.",
                "**Week of 26 Oct:** results against the goal.",
              ],
            },
          ],
        },
        {
          heading: "Needs your OK",
          blocks: [
            {
              kind: "list",
              items: ["The $2,000 ads test.", "Launch day, 6 October."],
            },
          ],
        },
      ],
    },
    {
      icon: "📋",
      title: "What clinics asked for",
      description: "86 help desk requests from the last 90 days.",
      sections: [
        {
          heading: "Words they used most",
          blocks: [
            {
              kind: "list",
              items: [
                "“Cancellations”, in 51 requests.",
                "“Calling down the list”, in 23.",
                "“Empty slots”, in 19.",
              ],
            },
          ],
        },
      ],
    },
  ),
});

// ===== COPYWRITING =========================================================

const COPYWRITING = agent({
  id: "copywriting",
  label: "Copywriting",
  threadTitle: "Waitlist landing page",
  brief:
    "Write the Waitlist landing page in our brand voice. A short headline, three benefits and one customer quote we have permission to use. Give me two headline options.",
  script: {
    agentName: "Copywriting",
    rows: [
      row(
        "voice",
        "Reading the brand voice guide",
        "the shared drive",
        "reading",
        "12 rules",
      ),
      row("plan", "Reading the launch plan", "Waitlist launch plan", "reading"),
      row(
        "quotes",
        "Searching approved quotes",
        "early Waitlist clinics",
        "reading",
        "3 approved",
      ),
      row("draft", "Writing the page", "Waitlist landing page", "pencil"),
    ],
    prose: [
      [
        { text: "The draft is ready, with " },
        { text: "two headline options", strong: true },
        {
          text: " at the top. It follows the voice guide: short sentences, plain words, written for the front desk.",
        },
      ],
      [
        {
          text: "The quote is from Dr. Lena Ortiz, who approved it in writing on 2 September. Nothing is published until you pick a headline.",
        },
      ],
    ],
    question: "",
  },
  workspace: computerFor(
    "copywriting",
    {
      icon: "✍️",
      title: "Waitlist landing page",
      description:
        "Draft for review. Pick a headline and it is ready for design.",
      sections: [
        {
          heading: "Headline options",
          blocks: [
            {
              kind: "list",
              items: [
                "**A.** Fill cancelled appointments before the phone rings.",
                "**B.** Someone is already waiting for that empty slot.",
              ],
            },
          ],
        },
        {
          heading: "Subhead",
          blocks: [
            {
              kind: "paragraph",
              text: "When an appointment is cancelled, Waitlist texts the next patient in line. The first to reply gets the slot.",
            },
          ],
        },
        {
          heading: "Benefits",
          blocks: [
            {
              kind: "list",
              items: [
                "**Fewer empty slots.** Cancelled appointments go to patients who asked for an earlier time.",
                "**No phone tag.** The front desk stops calling down a list.",
                "**Patients get in sooner.** They ask once and hear back by text.",
              ],
            },
          ],
        },
        {
          heading: "Customer quote",
          blocks: [
            {
              kind: "paragraph",
              text: "“We used to spend the morning calling patients about cancellations. Now the waitlist does it.” Dr. Lena Ortiz, clinic owner. Approved 2 September.",
            },
          ],
        },
        {
          heading: "Voice check",
          blocks: [
            {
              kind: "list",
              items: [
                "Every sentence is under 15 words.",
                "Written to the front desk, as the guide asks.",
              ],
            },
          ],
        },
      ],
    },
    {
      icon: "📋",
      title: "Launch email draft",
      description: "For current clinics. The first of 3 sends.",
      sections: [
        {
          heading: "Subject line",
          blocks: [
            {
              kind: "paragraph",
              text: "Your cancelled appointments, filled by text",
            },
          ],
        },
        {
          heading: "Opening",
          blocks: [
            {
              kind: "paragraph",
              text: "Cancellations leave gaps in your day. From 6 October, Waitlist fills them for you.",
            },
          ],
        },
      ],
    },
  ),
});

// ===== CUSTOMER SUPPORT ====================================================

const SUPPORT = agent({
  id: "support",
  label: "Customer Support",
  threadTitle: "Overnight support queue",
  brief:
    "Go through the tickets that came in overnight. Sort them by how urgent they are, draft replies for the ones you can answer, and hold every reply for my OK.",
  script: {
    agentName: "Customer Support",
    rows: [
      row(
        "tickets",
        "Reading new tickets",
        "the help desk, since 6 PM",
        "reading",
        "23 tickets",
      ),
      row(
        "articles",
        "Searching the help center",
        "matching articles",
        "reading",
        "9 matched",
      ),
      row(
        "urgent",
        "Tagging urgent tickets",
        "the help desk",
        "pencil",
        "3 urgent",
      ),
      row(
        "drafts",
        "Drafting replies",
        "held for your OK",
        "pencil",
        "17 drafts",
      ),
    ],
    prose: [
      [
        { text: "23 tickets came in overnight. " },
        { text: "3 are urgent", strong: true },
        {
          text: ": a clinic locked out, a booking page that will not load, and a double charge. They are at the top of the doc.",
        },
      ],
      [
        {
          text: "I drafted 17 replies from help center articles. The other 3 need a person to decide. Every reply is held, and nothing goes out until you say so.",
        },
      ],
    ],
    question: "",
  },
  workspace: computerFor(
    "support",
    {
      icon: "💬",
      title: "Overnight support queue",
      description:
        "23 tickets since 6 PM, sorted by urgency. Replies held for your OK.",
      sections: [
        {
          heading: "Urgent",
          blocks: [
            {
              kind: "list",
              items: [
                "**Front desk locked out.** One clinic, 9 staff, opens at 8 AM.",
                "**Booking page will not load.** One clinic, since 5 AM.",
                "**Charged twice for September.** One clinic, $240 to refund.",
              ],
            },
          ],
        },
        {
          heading: "Needs a person",
          blocks: [
            {
              kind: "list",
              items: [
                "A clinic asking to cancel its plan.",
                "A request to delete a patient's records.",
                "A discount request for 3 new locations.",
              ],
            },
          ],
        },
        {
          heading: "Replies drafted and held",
          blocks: [
            {
              kind: "list",
              items: [
                "8 on resetting a password.",
                "5 on changing reminder times.",
                "3 on billing dates.",
                "1 on exporting appointments.",
              ],
            },
          ],
        },
        {
          heading: "Worth knowing",
          blocks: [
            {
              kind: "paragraph",
              text: "8 password tickets overnight, up from 3 the night before. Most mention the new sign-in page.",
            },
          ],
        },
      ],
    },
    {
      icon: "📋",
      title: "Reply drafts",
      description: "17 replies, held for your OK.",
      sections: [
        {
          heading: "Resetting a password",
          blocks: [
            {
              kind: "paragraph",
              text: "Hi Maya, sorry for the trouble. Reset links last 30 minutes, so here is a fresh one. If it still fails, reply here and we will check your account.",
            },
          ],
        },
        {
          heading: "Changing reminder times",
          blocks: [
            {
              kind: "paragraph",
              text: "Hi Tom, you can change reminder times under Settings, then Reminders. This two-minute guide shows each step.",
            },
          ],
        },
      ],
    },
  ),
});

// ===== SALES ===============================================================

const SALES = agent({
  id: "sales",
  label: "Sales",
  threadTitle: "Harbour Street Physio research",
  brief:
    "Research Harbour Street Physio before we reach out. Who runs it, how they book today, and who decides on software. Then draft a short intro email to each decision maker. Send nothing.",
  script: {
    agentName: "Sales",
    rows: [
      row(
        "site",
        "Reading their website",
        "clinics, team and careers",
        "reading",
        "6 clinics",
      ),
      row(
        "crm",
        "Checking the CRM",
        "Harbour Street Physio",
        "plug",
        "2 contacts",
      ),
      row(
        "news",
        "Searching local news",
        "last 6 months",
        "reading",
        "3 articles",
      ),
      row(
        "emails",
        "Drafting intro emails",
        "held for your OK",
        "pencil",
        "2 drafts",
      ),
    ],
    prose: [
      [
        { text: "Harbour Street Physio has " },
        { text: "6 clinics and books by phone", strong: true },
        {
          text: ". The newest opened in August, and they are hiring two front-desk staff.",
        },
      ],
      [
        {
          text: "The CRM shows a demo in March with Sam Reyes, their operations manager, that went quiet. Both intro emails are drafted and held for your OK.",
        },
      ],
    ],
    question: "",
  },
  workspace: computerFor(
    "sales",
    {
      icon: "🤝",
      title: "Harbour Street Physio",
      description: "Account research and intro emails, held for your OK.",
      sections: [
        {
          heading: "The account",
          blocks: [
            {
              kind: "paragraph",
              text: "**6 clinics**, the newest opened in August. About 40 physios. Patients book by phone or a web form.",
            },
          ],
        },
        {
          heading: "Who decides",
          blocks: [
            {
              kind: "list",
              items: [
                "**Sam Reyes**, operations manager. Saw a demo in March, then went quiet.",
                "**Dr. Ana Brooks**, founder. Signs off on software, per the March call notes.",
              ],
            },
          ],
        },
        {
          heading: "Why now",
          blocks: [
            {
              kind: "list",
              items: [
                "A sixth clinic opened in August.",
                "Two front-desk jobs posted this month.",
                "Recent reviews mention long waits on the phone.",
              ],
            },
          ],
        },
        {
          heading: "Our angle",
          blocks: [
            {
              kind: "paragraph",
              text: "Waitlist launches 6 October. Cancelled appointments go out by text, so the front desk spends less time on the phone.",
            },
          ],
        },
        {
          heading: "Sources",
          blocks: [
            {
              kind: "list",
              items: [
                "Their website: clinics, team and careers pages.",
                "The CRM: notes from the March demo.",
                "Local news: the August opening.",
              ],
            },
          ],
        },
      ],
    },
    {
      icon: "📋",
      title: "Intro email drafts",
      description: "2 drafts, held for your OK.",
      sections: [
        {
          heading: "To Sam Reyes",
          blocks: [
            {
              kind: "paragraph",
              text: "Hi Sam, congratulations on the new clinic. In March, cancellations were the headache. On 6 October we launch a waitlist that fills them by text. Worth 20 minutes?",
            },
          ],
        },
        {
          heading: "To Dr. Ana Brooks",
          blocks: [
            {
              kind: "paragraph",
              text: "Hi Dr. Brooks, six clinics means a lot of calls about cancelled appointments. Our new waitlist texts the next patient instead. Could I show you how in 20 minutes?",
            },
          ],
        },
      ],
    },
  ),
});

// ===== DATA & ANALYTICS ====================================================

const DATA = agent({
  id: "data",
  label: "Data & Analytics",
  threadTitle: "Weekly metrics report",
  brief:
    "Write this week's metrics report for the Monday meeting. Bookings, empty slots, new clinics and revenue against last week. Explain anything that moved more than 10%.",
  script: {
    agentName: "Data & Analytics",
    rows: [
      row(
        "pull",
        "Pulling this week's numbers",
        "bookings, billing, CRM",
        "download",
        "3 sources",
      ),
      row(
        "compare",
        "Comparing with last week",
        "4 numbers",
        "reading",
        "2 moved over 10%",
      ),
      row("deals", "Checking the CRM", "deals set to close", "plug", "2 moved"),
      row("report", "Writing the report", "Monday meeting", "pencil"),
    ],
    prose: [
      [
        { text: "The report is ready. " },
        { text: "Bookings rose 6%", strong: true },
        {
          text: " to 41,380, and revenue rose 3%. Two numbers moved more than 10%, and the doc explains both.",
        },
      ],
      [
        { text: "Empty slots fell 14%", strong: true },
        { text: ", mostly at the 12 clinics using Waitlist early. " },
        { text: "New clinics fell 18%", strong: true },
        { text: ", from 11 to 9, because two deals moved to next week." },
      ],
    ],
    question: "",
  },
  workspace: computerFor(
    "data",
    {
      icon: "📊",
      title: "Weekly metrics",
      description:
        "7 to 13 September, against the week before. For the Monday meeting.",
      sections: [
        {
          heading: "Summary",
          blocks: [
            {
              kind: "paragraph",
              text: "Bookings and revenue are up, and empty slots fell. New clinics dipped because two deals moved to next week.",
            },
          ],
        },
        {
          heading: "The numbers",
          blocks: [
            {
              kind: "list",
              items: [
                "**Bookings:** 41,380, up 6% from 39,030.",
                "**Empty slots:** 2,150, down 14% from 2,500.",
                "**New clinics:** 9, down 18% from 11.",
                "**Revenue:** $184,200, up 3% from $178,900.",
              ],
            },
          ],
        },
        {
          heading: "What moved more than 10%",
          blocks: [
            {
              kind: "list",
              items: [
                "**Empty slots, down 14%.** At the 12 early Waitlist clinics they fell from 480 to 190. Everywhere else, from 2,020 to 1,960.",
                "**New clinics, down 18%.** Two deals set to close this week moved to 18 September in the CRM.",
              ],
            },
          ],
        },
        {
          heading: "Where the numbers come from",
          blocks: [
            {
              kind: "list",
              items: [
                "Bookings and empty slots: the booking database, Monday to Sunday.",
                "Revenue: billing, invoices paid this week.",
                "New clinics: the CRM, deals marked won.",
              ],
            },
          ],
        },
      ],
    },
    {
      icon: "📋",
      title: "Last 4 weeks",
      description: "Weekly totals from the booking database.",
      sections: [
        {
          heading: "Bookings",
          blocks: [
            {
              kind: "list",
              items: [
                "17 to 23 Aug: 38,200",
                "24 to 30 Aug: 38,650",
                "31 Aug to 6 Sep: 39,030",
                "7 to 13 Sep: 41,380",
              ],
            },
          ],
        },
        {
          heading: "Empty slots",
          blocks: [
            {
              kind: "list",
              items: [
                "17 to 23 Aug: 2,610",
                "24 to 30 Aug: 2,540",
                "31 Aug to 6 Sep: 2,500",
                "7 to 13 Sep: 2,150",
              ],
            },
          ],
        },
      ],
    },
  ),
});

/** Sidebar order; the first is the one selected by default. */
export const DEMO_AGENTS: readonly DemoAgent[] = [
  ENGINEERING,
  MARKETING,
  COPYWRITING,
  SUPPORT,
  SALES,
  DATA,
];
