# Voice and copy

The tone and copy rules for everything Hyperagent writes: the marketing pages and the app. Written 2026-09-15. The base is the landing copy v2 messaging foundation (2026-09-14), the latest research, plus the rules its test enforces on `feat/landing-v2`. Also folded in: the still-valid parts of `docs/brand/design.md` §11, the `/teams` plans and the landing research. Where those sources disagree, v2 wins.

**This file supersedes `docs/brand/design.md` §11.** That section described a first-person voice borrowed from the site the brand system came from, not Hyperagent's. Its button, caption and sentence-case rules survive in §8 below.

## 1. Scope

| Surface | Sections that apply |
|---|---|
| Marketing pages (the landing page and anything a prospect reads) | All of them |
| The app (dashboard, threads, settings, empty states, tooltips) | §2, §4, §6, §7 and §8. **Not §5.3 and §5.2's "on the page" column**: the app keeps its own nouns (thread, run, skill, memory, trigger) because they are the labels on its screens. |

## 2. Who we are talking to

**Primary reader:** the owner or operator of a small or mid-size business, such as a brokerage, a contractor, a marketplace, a property-services company or a studio. They are not technical and don't follow AI. They run the business from Slack, Gmail, a CRM and a few spreadsheets. They hire people for recurring work and know what a good junior hire looks like. This matches the company's published customers. Adoption follows company size and agility, not industry.

**Secondary reader:** the ops, marketing or finance person who sets the agents up and reads their reports. More hands-on, still not an engineer.

**Three things they must believe before they click:**

1. **This is a team, not a chatbot.** Several agents, each with a job, working at once, reporting where I already talk.
2. **They do finished work, not suggestions.** A reminder drafted, a digest posted, a report written, with a number on it.
3. **I stay in charge.** Nothing important happens without my yes, and I can see what each one did and what it cost.

## 3. The promise

**In one sentence** (the whole page in one line):
*Hyperagent gives your business a team of agents that does the weekly work, reports back where you already talk, and asks before anything that matters.*

**In two layers** (the plain explanation of how it works):
> On top, one shared workspace where you and your people talk to the agents like coworkers. Underneath, each agent has its own computer and its own job, and does the work. You see what it did and approve what matters.

**Positioning** (internal, never printed): for owners of small and mid-size businesses who run on Slack, email and a few apps, Hyperagent is where they set up a team of agents. Each agent has its own computer and its own job, so recurring work gets done without hiring for it. Unlike chat assistants, the work comes back finished, on a schedule, with a cost and a score, and nothing goes out until a person says so.

## 4. Voice

**Write like a smart friend explaining it.** Short sentences, verbs, and a number wherever a source gives one. Show the team idea through structure (a roster, a week of reports, a table of jobs), not adjectives. "You stay in charge" is a refrain the agents say themselves, not a section.

| # | Do | Don't |
|---|---|---|
| 1 | Name the job: "Invoice chaser", "Supplier chaser". | Name a capability: "Autonomous workflow engine". |
| 2 | Say what came back: "Drafted 7 reminders. Held for your OK." | Say what it can do: "Handles your accounts receivable". |
| 3 | Put schedules in human time: "Every Monday at 7:00". | Say "24/7", "always-on", "around the clock". |
| 4 | Let the agent say the control line: "Nothing goes out until you say so." | Write a security section full of "guardrails", "permissions", "audit". |
| 5 | Give one idea per sentence, ideally under 18 words. | Chain three clauses with "and" and a dash. |
| 6 | Use the owner's nouns: invoices, suppliers, candidates, the Monday meeting. | Use ours: threads, runs, triggers, invocations, sandbox. |
| 7 | Show honest flags: "Two suppliers are 3 days late." "No orders late today." | Show only wins. |
| 8 | Quote a published customer with the exact figure and a link. | Invent a customer, a quote, a logo or a rating. |
| 9 | Write in sentence case, second person, present tense. | Write in Title Case, or say "we" as the company. |
| 10 | Say "a second AI checks the work against standards you write". | Say "LLM-as-judge", "rubric", "eval", "model". |
| 11 | Pair every claim that an agent acts alone with the check on it. | Promise autonomy with no word on who approves. |
| 12 | Give numbers with units: "3m 40s", "$0.52", "7 invoices". | Use multipliers: "3x your output", "10x faster". |

**Agent lines** (reports, previews, notifications) are past tense, drop the subject, carry a number, and say what is held: "Drafted 7 reminders for invoices past 30 days. Held for your OK."

## 5. Words

### 5.1 Naming

- **The unit is "agent".** It is the company's own word and the word in the product's UI. Never "bot" (it carries spam baggage) and never "fleet" (it reads military to an owner).
- **The collective is "the team"** or "your team". Use "teammate" as the warmer synonym in ledes ("talk to them like coworkers").
- **Each agent is named by its job**, in two words and sentence case: Invoice chaser, Supplier chaser, Pipeline reporter, Candidate sourcer, Signal briefer, Spend watcher. Each gets a one-line job description written like a job ad ("Drafts reminders for invoices unpaid after 30 days"). Never a human name, never a mascot.
- **Keep names consistent.** An agent keeps the same name everywhere it appears on a page.
- **The refrain is "Nothing goes out until you say so."** It appears in the agents' own words, at least three times on a page. "Held for your OK" and "A person sends it" are allowed variants. It is never a heading, except the control section's title, "You call the shots."

### 5.2 Plain-words glossary

| Product term | On a marketing page | Allowed on the page at all? |
|---|---|---|
| agent | "agent" (the unit), "the team" (all of them), "teammate" in ledes | Yes, everywhere |
| run | "a job", "one job", "what it did" | "run" only as a verb |
| thread | "the record of what it did" | No |
| trigger / invocation | "starts from": you ask, Slack, Telegram, email, a schedule, a webhook, another agent | No (the list stands in) |
| webhook | "a webhook" | Only in the "starts from" list and one FAQ answer |
| schedule | "every Monday at 7:00", "on a schedule" | Yes |
| credit | "credit", always beside "pays for what the team actually does" | Yes, pricing only |
| judge score | "a score", "a second AI checks the work against standards you write" | "score" yes, "judge" no |
| sandbox / VM | "its own computer" | No |
| skill | "a method you teach once" | Only in one FAQ answer, as "skills" in quotes |
| memory | "it remembers the correction" | As a verb only |
| session | not needed | No |
| workspace | "one shared workspace" | Yes, once in the hero lede and once in the FAQ |
| read-only | "it can look but not change anything" | Only in the control tile's setting line |
| OAuth / token | "you sign in once; it never sees your password" | No |
| receipt | "what it took", "what it cost" | No (the company uses "receipt" for something else) |

### 5.3 Banned on marketing pages

leverage, seamless(ly), AI-powered, powerful, real (as filler), ship/shipping, supercharge, unlock, revolutionize, effortless(ly), fleet, bot(s), chatbot(s), sandbox, receipt(s), token(s), LLM, model(s), prompt(s), workflow(s), orchestrate/orchestration, autonomous, MCP, rubric(s), judge, thread(s), trigger(s), invocation(s), session(s).

### 5.4 Mechanics

- **Case and person:** sentence case everywhere except names and product names; second person, present tense.
- **Punctuation:** no em dashes, no middle dots (·) and no exclamation marks in anything displayed. Where a dot would separate facts, use a comma ("Karthik Sivacharan, Founder") or a new sentence.
- **Length:** sentences stay under 25 words and ideally under 18. Headline titles stay under 10 words, subheads under 19.
- **Two-tone headings:** the title carries the claim in ink, and the sub continues it in the muted tier ("Hand off the weekly work." / "Keep the final say."). Colours are in `docs/brand/design.md` §4.1.
- **Numbers:** always digits, with units and currency formatted as the product shows them ("$18,420", "3m 40s", "7:00").

## 6. Claims and proof

**May be claimed, with its source:**
- Each agent has its own computer in the cloud (site; docs: each session runs in an isolated VM).
- Agents can be reached in Slack, Telegram and email, on a schedule, by webhook, or by another agent (docs).
- A shared workspace with roles (company blog, 10 Sep 2026).
- Approvals before external writes, in the Inbox and on the phone (docs; changelog 20 Aug 2026; iOS app Sep 2026).
- Unattended jobs default to read-only (docs).
- Logins never enter the agent's computer (docs). Say it as "you sign in once; it never sees your password".
- A separate AI scores work against standards you write (docs). Say "scored against standards you write", never "every job is automatically scored".
- Cost per job and a cap per job (docs).
- The plan ladder: $20, $100, $500 and $2,000 with 0, 15, 25 and 35% bonus, up to $10,000 with 45% (docs, effective 26 Aug 2026). Plan credit does not roll over; credit blocks last 90 days.
- First-party connections: Slack, Gmail, Google Drive, HubSpot, Notion, Airtable (docs).
- The published customer stories on the company blog, quoted exactly and linked.

**Must never be claimed:**
- Company numbers: revenue, ARR, customer count, number of agents or workspaces.
- Enterprise logos, or any "42 agents" figure (that is a screenshot of one roster).
- Funding amount, or an employee count beyond the public 11–50 band.
- The "300,000 browser sessions" figure as a current number.
- Anything not in the public record: SOC 2, ISO, SSO, data residency, on-prem, a subprocessor list, an uptime SLA.

**Examples and stories:**
- Illustrative figures (a roster, a week of reports, a table of jobs) are labelled as examples in a caption and in their accessible name.
- A customer story names the company and the person's role, never the person's name, and links to the story. Story customers are named only inside the stories section.
- Never invent a customer, quote, logo, rating or figure.

## 7. Calls to action

- **Buttons name a verb and an object.** Never "OK" or "Submit".
- **Current labels:** "Start your team" (primary), "Log in", "Start this agent" (on a use case), "Read the story" (on a customer story). The closing heading is "Hire your first agent."
- **Keep the actions consistent.** The closing band repeats the hero's actions.
- **Say the price plainly** where it helps a decision ("Plans from $20 a month"). Never "Try for free": plans start at $20.

## 8. Copy in the app

- **Sentence case, verb and object on every button,** as in §7.
- **Captions, meta lines and disclaimers stay short** and use the text tiers in `docs/brand/design.md` §4.1.
- **Status is one line of words** saying what the work needs next (the caption rule, `docs/components.md` §2, "Teams fleet"). Glyphs, meters and counters don't carry progress on their own.
- **No middle dots in displayed text,** and tooltips use commas ("Karthik Sivacharan, Founder, online").
- **Accessible names keep every fact the visuals drop,** so a screen reader hears what a sighted user sees in a tooltip or on hover.
- **Suggested prompts** are written the way a person would type them.

## 9. How the rules are enforced

- **The landing copy test.** On `feat/landing-v2`, `src/components/landing-v2/a/content.test.ts` fails the build on: a banned word (§5.3); another company's name; a story customer named outside the stories; "webhook" outside its two places; em dashes, middle dots and exclamation marks; the length limits (§5.4); the refrain appearing fewer than three times; the CTA labels (§7); the plan ladder (§6); and example figures without an "example" label. A new marketing page should copy that test.
- **Other companies.** No other company or product is named in anything committed (code, comments, docs, commit messages). Describe the pattern instead. The product's own integrations are the exception.
- **Not yet ported:** the brand system's original copy lint, which flags AI-writing tells in displayed copy (`HANDOFF.md`).

## 10. Open decisions

These defaults come from the v2 messaging plan; the owner can change any of them.

1. **Customer stories on the page:** yes, four cards with exact figures and links; company names and roles only.
2. **Primary CTA:** "Start your team". "Start an agent" undersells the team; "Try for free" is untrue.
3. **"agent" as the unit noun:** yes. "Teammate" everywhere reads warmer but disagrees with the app the visitor lands in.
4. **"Receipt" dropped from visible copy:** yes.
5. **"A second AI checks the work"** instead of "judge": yes. If the product's term is preferred, allow "judge" where it appears and remove it from §5.3.
6. **The story from the former parent company's finance team:** included. Strike it if it reads as borrowed credibility.
7. **Nav:** Team, Use cases, A week, Stories, Pricing. Swap Stories for Control if decision 1 is struck.
