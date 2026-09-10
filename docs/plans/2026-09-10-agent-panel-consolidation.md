# Agent panel consolidation: what following Gumloop costs

> **Status:** audit. No code changed. The decision — the right-hand panel opens
> by default, flat and tabbed, and becomes the one place the agent is
> configured — is already taken (`src/lib/mock/agent-config.ts:19-24`). This
> document says what that costs, what has to move, and in what order.

**The problem.** hyperagent.com puts the same configuration in three places:
the composer's `+` menu, the composer's thread-settings pill, and the right
panel at `?panel=settings`. The panel is COLLAPSED on arrival and closed again
on every visit; the menus are one click from the text box. The menus win, so
the configuration that should be seen whole is only ever seen in slices — and
because the panel loses that race, the menus keep growing (the 2026-09-07 live
re-sweep found the `+` menu had grown an Integrations sub-menu of its own,
`docs/components.md:93`). Gumloop's agent page does the opposite: ~550px open
by default, tabs "Agent / Settings", Save top-right, every section flat and
always visible with its own `+ Add` and its own "AI managed" toggle.

**What this repo has already built toward it.** `src/lib/mock/agent-config.ts`
is the panel's data and its header comment (lines 1-29) records both live
references. Nothing imports it yet.

---

## 1. Inventory

Every distinct setting reachable from the composer's `+` menu and its
thread-settings pill today. "Panel" means the panel owns it and the composer
loses it; "Shared" means both surfaces show it and the duplication is paid for;
"Composer" means it stays where it is.

### The `+` menu (`src/components/composer/add-menu.tsx`)

| Setting | Where it lives | What it is | Verdict |
|---|---|---|---|
| Upload files… | `add-menu.tsx:126-129`; hidden `input[type=file]` at `composer.tsx:100` | Attach a file to this message | **Composer** |
| Skills (searchable picker, 15 items) | `add-menu.tsx:131-137`, data `:41-57`; dump `composer-add-menu-skills.html` | Reach for one skill on this turn — but the same list is what "installed skills" means | **Shared** (panel owns the installed set; composer keeps attach) |
| Memories (picker, empty) | `add-menu.tsx:139-145`; dump `composer-add-menu-memories.html` | Attach a remembered fact to this message | **Composer** |
| Assets (picker, empty) | `add-menu.tsx:147-153`; dump `composer-add-menu-assets.html` | Attach something the agent made earlier | **Composer** |
| Output as… (Image, Video, Audio, Webpage, Slides, Table, Map, Doc) | `add-menu.tsx:155-168`, data `:59-68`; dump `composer-add-menu-output-as.html` | The shape of *this* answer | **Composer** |
| Add to a project | `add-menu.tsx:170-183`; dump `composer-add-menu-add-to-project.html` | Files the *thread*, not the message and not the agent | **Neither** — belongs to the thread title menu, which already has it (`thread-title-menu-move-to-project.html`) |
| Integrations (GitHub, "Add other integrations") | live only; dump `composer-add-menu-integrations.html`, listed as a clone gap at `docs/components.md:93` | Connect a tool | **Panel** (Connectors, `agent-config.ts:94-99`) |

### The thread-settings pill (`thread-settings-menu.tsx`, `tools-menu.tsx`)

| Setting | Where it lives | What it is | Verdict |
|---|---|---|---|
| Model (8 models, "Latest models" + 4 provider sub-menus) | `thread-settings-menu.tsx:129-180`, data `:33-47`, providers `:59-64`; state lifted to `composer.tsx:72`; dumps `composer-thread-settings-menu.html`, `composer-model-picker.html` | Which model answers | **Shared** — the one deliberate exception; see §2 |
| "Latest" badge + its tooltip | `thread-settings-menu.tsx:137-142`, `:147-160` | The family-tracking explainer | **Panel** (`AGENT_CONFIG.modelTag`, `agent-config.ts:85`) |
| Reasoning effort (Low / Medium / High / Extra high / Max) | `thread-settings-menu.tsx:182-204`, data `:49-55`; state at `composer.tsx:73`; dump `composer-reasoning-effort.html` | How hard the model thinks | **Panel** (`AGENT_CONFIG.reasoningEffort`, `agent-config.ts:87`) |
| Fast inference (switch, "billed at 2x token cost") | `thread-settings-menu.tsx:206-222`; state `:115` | A price/latency trade | **Panel** owns the default; today the state is menu-local and dies on unmount, so nothing is lost by moving it |
| Tools — the roster of 18, 17 on by default | `tools-menu.tsx:68-87`, `useTools` `:98-116`, submenu `thread-settings-menu.tsx:226-242`; dump `composer-thread-settings-tools.html` | What the agent is allowed to do | **Panel** (the live panel already calls this "Capabilities (17 active)") |
| — the count on the row (`17`) | `thread-settings-menu.tsx:230`, `tools-menu.tsx:104` | Derived; follows wherever the roster goes | **Panel** |
| — group headers (Research / Browser / Data / Interactive / Media) | `tools-menu.tsx:66`, `:152-158` | Taxonomy | **Panel** |
| — Search provider (Standard / Exa) | `tools-menu.tsx:89-90`, `:164-188` | A setting *of the Search tool*, not of the message | **Panel** |
| — "Turn all on / Turn all off" | `tools-menu.tsx:136-150` | Bulk edit of a roster | **Panel** |
| Integrations — scope selector ("Any") | `thread-settings-menu.tsx:245-259` | Which connectors this thread may reach | **Panel** |
| Integrations — the connectable list (Airtable, Gmail, Google Calendar, Google Drive, Slack, GitHub, "Add other integrations") with Connect buttons and switches | live only; dump `composer-thread-settings-integrations.html`, clone gap at `docs/components.md:93` | Connecting an account | **Panel** (Connectors) |
| "Open full settings" → `/settings` | `thread-settings-menu.tsx:262-265` | An escape hatch out of a menu that could not hold the thing | **Delete** — the panel is the escape hatch |

### Adjacent, for completeness

These are not in either menu but sit on the same pill row and are affected.

| Control | Where | Verdict |
|---|---|---|
| Execution mode: Plan first / Execute › Auto / Ask first | `plan-menu.tsx:21-33`, `:48-93`; state `composer.tsx:74`; dumps `composer-plan-menu.html`, `composer-plan-menu-execute.html` | **Shared** — panel owns the default under Autonomy & safety (`agent-config.ts:160-163`), composer keeps the per-message override. This is the setting people genuinely change mid-sentence |
| Agent picker | `agent-picker.tsx:22-72`; dump `composer-agent-picker.html` | **Composer** — it chooses the subject the panel describes; it is not itself a setting |
| Integrations footer strip ("Connect your integrations") | `composer.tsx:215-232`, prop `:31-32` | **Delete** — Connectors replaces it; the live site already removed the equivalent home chip (`docs/components.md:93`) |
| Dictate, Send | `composer.tsx:181-211` | **Composer** |

### The gap in `PANEL_SECTIONS`

`PANEL_SECTIONS` (`agent-config.ts:121-158`) is Model & compute, Skills,
Connectors, Knowledge sources, Subagents, Triggers, Autonomy & safety. **There
is no Tools / Capabilities section.** The 18-tool roster is the single largest
thing this consolidation moves and it currently has nowhere to land. Either add
a section or fold Tools into Connectors — but decide before the panel is built,
because it changes the section order and therefore the panel's silhouette.

---

## 2. The rule

> **The composer owns the message. The panel owns the agent.** If you would set
> it differently for the next sentence you type, it stays in the composer; if
> you would have to set it again on every message, it belongs in the panel.

The reasoning is that the two surfaces have different lifetimes and the current
design ignores that. A menu hanging off the text box is a per-turn instrument:
it opens, you pick, it closes, the choice applies to what you are about to
send. A panel is a description of a standing thing. Putting the tool roster in
a menu says "choose your eighteen tools for this message", which nobody does —
the proof is in the data: the default is 17 of 18 on (`tools-menu.tsx:94`) and
it stays there. Putting attachments in a panel would say the opposite, and be
just as wrong.

The test that decides the awkward cases is *would re-setting this every message
feel like work or like intent?* Output-as is intent. The Search provider is
work.

**Model is genuinely contested, and it gets the one exception.**

The case for the panel: Gumloop puts it in Agent Preferences; our own
`AGENT_CONFIG.model` is the record's first field and `PANEL_SECTIONS[0]` is
"Model & compute"; and the panel is the only surface that can show the model
next to the reasoning effort, the 2x cost multiplier and the instructions that
were written with that model in mind. A model chosen in a menu, alone, is
chosen with none of that visible.

The case for the composer: the pill is *labelled* with the model
(`composer.tsx:139`) — it is the pill's identity, not a row inside it — and
switching to something cheap for one throwaway question is a real, frequent,
per-message act. Demoting it to a panel row costs a click and a context switch
on the most-used control in the menu.

**Resolution: the panel owns it, the composer keeps a thread-scoped override,
and the duplication is paid for by making the override visible in the panel.**
The pill and its picker survive; what changes is what they write to. Changing
the model from the composer sets an override on this thread, and the panel's
Model & compute section says so and offers a reset. That is the only
justification for two copies of a setting: the second copy is a temporary
divergence from the first, and the first admits it. The live product's own
label — "Capabilities (17 active · 1 overriding agent)" — shows it already
thinks in these terms.

Everything else in the inventory follows the rule with no argument.

---

## 3. What breaks

### Components that lose their reason to exist

- **`src/components/composer/tools-menu.tsx` as a menu.** This is the real
  cost, and it should be counted honestly: the Tools panel shipped 2026-09-09
  from `feat/tools-menu-redesign` (`HANDOFF.md:69-81`), it replaced a stub
  reading "17 tools enabled", it produced three designed alternatives compared
  side by side as real menus at `/design/tools`, and two primitive changes came
  out of it — the `indicator` prop on `DropdownMenuCheckboxItem` /
  `DropdownMenuRadioItem` and the pointer/keyboard close split on
  `DropdownMenuContent` (`docs/components.md:41`). All six gates passed at the
  merge. It is nine days old.

  What survives the move: `TOOLS`, `TOOL_GROUPS`, the `Tool` type, `useTools`
  (`:68-116`) and the visual decision that on/off is carried by fill, text tier
  and a check rather than by hue. What does not: every row is a
  `DropdownMenuCheckboxItem` (`:196-211`, `:249-266`), `BulkAction` is a
  `DropdownMenuItem` so the keyboard can reach it (`:136-150`), `GroupLabel` is
  a `DropdownMenuLabel` (`:152-158`), and the "the row is the control, the
  switch is only its picture" inversion (`:208-210`) is a menu idiom. Outside a
  `role="menu"` there is no roving focus to join, so **none of the
  accessibility work transfers for free** — in a panel each row must become a
  real labelled `Switch`, and the trick that hid the switch from the
  accessibility tree becomes exactly backwards.

- **`/design/tools` (`src/app/design/tools/page.tsx:9`).** It renders the three
  variants as real dropdown menus, which is the comparison it exists to make.
  Once the roster lives in a panel, that comparison is about a surface the
  product no longer has. Re-point it at the panel section or retire it — but
  not silently; it is the only place the presets variant (`tools-menu.tsx:304-352`)
  is visible, and presets are the obvious answer to "17 quiet on-states in a
  flat panel".

- **`thread-settings-menu.tsx` as a *thread-settings* menu.** Strip Reasoning
  effort, Fast inference, Tools, Integrations and "Open full settings" and what
  is left is a model picker. The file name, the pill's
  `aria-label="Thread settings"` and its `IconAdjustmentsHorizontal`
  (`composer.tsx:136-137`) all become wrong at that point.

- **The integrations footer strip** (`composer.tsx:215-232`) and its
  `showIntegrationsFooter` prop (`:31-32`), which has two callers passing
  `false` (`signup/chat-step.tsx:234`) and two relying on the default
  (`app/(app)/threads/new/page.tsx:22`, `thread/thread-view.tsx:159`).

### Reference dumps that stop matching the clone

`docs/clone-conventions.md` rule 3 is "match the dump structurally: same
element tree, same classes, same copy". Four dumps stop being things the clone
is trying to match:

- `composer-thread-settings-menu.html` — loses four of its six rows
- `composer-thread-settings-tools.html` — the whole submenu goes
- `composer-thread-settings-integrations.html` — never cloned, and now never will be
- `composer-add-menu-integrations.html` — same

and `composer-add-menu.html` diverges by one row if "Add to a project" moves to
the thread menu. `threads-new.html` still matches: the pill row keeps its
shape, only the model pill's label and icon change.

These must be listed somewhere as *deliberately diverged*, not deleted.
`docs/components.md` §4 (line 85) is the existing list of "live UI the clone
does not render"; this is its mirror and belongs beside it. Delete the dumps
instead and the repo loses the only record of what it walked away from — and
the next agent re-clones the menus from the live site in good faith.

### The seven `npm test` gates (`src/components/components.test.ts`)

Verified against the current tree.

| # | Gate | Lines | Risk |
|---|---|---|---|
| 1 | finds the sources, the primitives, the patterns and the dumps | `:86-91` | **Safe.** Asserts `primitives.length > 20` (29 today) and `patterns.length > 0`. Only a deletion under `ui/` threatens it |
| 2 | imports `radix-ui` and `cmdk` only under `src/components/ui/` | `:93-100` | **At risk.** A tabbed, sticky-header, 550px panel invites a direct Radix import in `src/components/thread/`. `Tabs` already exists in `ui/`; `RadioGroup` and `Progress` do not (`docs/components.md:87`) |
| 3 | renders no raw `button` / `input` / `textarea` / `select` / `label` outside `ui/` | `:102-121` | **At risk, and the likeliest failure.** A panel is mostly form: seven section headers with `+ Add` buttons, "AI managed" toggles, a Save, field labels. The only legal raw element is the rendered child of an `asChild` primitive (`:72-83`) |
| 4 | keeps the prototype copies retired | `:123-129` | **Safe**, unless someone resurrects `src/design/brand/ui/accordion.tsx` for the panel. They should not need to: Gumloop's sections are flat, so the consolidation *removes* the need for an accordion primitive that `ui/` has never had |
| 5 | reads the slots the live site emits (`seen.size > 50`) | `:142-144` | **Safe.** The union across `docs/reference/pages` and `overlays` is 58, and **zero `data-slot` values are unique to the seven `composer-*.html` dumps** — deleting them all would leave `seen` at 58. Gate-safe; still a bad idea, per the divergence note above |
| 6 | defines every `data-slot` in the dumps under `ui/` or `patterns/` | `:146-149` | **Safe, and worth stating plainly because it is the obvious worry:** removing a composer menu cannot break this lock. `seen` is read from the dumps (unchanged) and `defined` from `src/components/ui/**` and `src/components/patterns/**` — `src/components/composer/` is in neither set. `dropdown-menu-*`, `switch`, `overline` and `tooltip-*` keep their definitions in `ui/` whether or not the composer still renders them. It breaks only if a *primitive* is deleted as newly-unused; `Switch` and `Overline` both have other callers (`patterns/show-archived-switch.tsx`, the settings headings), so neither is |
| 7 | gives every primitive under `ui/` a `data-slot` | `:151-154` | **At risk only through carelessness** — any new panel primitive must name its slot |

Two more things `npm test` runs that the panel work touches:
`src/components/icons.test.ts` (no `lucide-react`, every Tabler name must exist
in the installed package — a panel is icon-dense) and nothing else relevant.

### Gates outside `npm test`

- `npm run brand:lint-tokens` — no raw hex, no stock palette classes. A 550px
  panel wants a divider, a header tint and an "AI managed: ON" pill; all three
  must come from tokens.
- `npm run brand:check-contrast` — the panel adds a surface the 64 pairs have
  not been checked against.
- **The 1456×868 pixel proof fails by definition at the last step.** An
  open-by-default 550px panel moves every pixel of the thread column. That has
  to be *declared* as a new baseline with the reason, the way the sweep
  declared its one deliberate pixel change (`docs/components.md:101-107`), not
  diffed and explained away.

---

## 4. Staged migration

Each stage is landable and verifiable alone. A stage never deletes a menu
before the panel section that replaces it exists in the same commit.

- [ ] **Stage 0 — write the divergence note.** Add to `docs/components.md` §4 a
      list of dumps the clone deliberately no longer matches, with the reason
      and a pointer to this file. Doc only.
      *Gate:* `npm test` unchanged (proves the change is doc-only); a reviewer.

- [ ] **Stage 1a — primitives first.** Whatever the panel needs that `ui/` does
      not have goes in via `npx shadcn@latest add`, re-skinned per
      `docs/components.md` §3, each naming its `data-slot`. Nothing else.
      *Gate:* gates 2 and 7, `brand:lint-tokens`, `npx tsc --noEmit`.

- [ ] **Stage 1b — decide the Tools section and amend `PANEL_SECTIONS`.**
      `agent-config.ts:121-158` has no home for the roster. Add one, or fold it
      into Connectors. Data only.
      *Gate:* `npx tsc --noEmit`.

- [ ] **Stage 1c — build the panel, additive.** `src/components/thread/` renders
      `agent-config.ts` as the flat tabbed panel, **closed by default**, on one
      route. The composer is untouched; every setting now exists twice on
      purpose and temporarily.
      *Gate:* gates 2, 3 and 7; `brand:lint-tokens`; `brand:check-contrast`;
      pixel diff at 1456×868 with the panel closed shows zero change.

- [ ] **Stage 2 — move Tools.** The panel section renders `TOOLS` as labelled
      `Switch` rows; the submenu (`thread-settings-menu.tsx:226-242`) is deleted
      in the same commit. `useTools` moves out of the menu file. Decide
      `/design/tools` here.
      *Gate:* gate 3 (the rows must be `Switch`, not raw), `npx tsc --noEmit`,
      and a keyboard pass — the menu's roving focus is gone and nothing
      replaces it automatically; every row must be tabbable and announce its
      checked state.

- [ ] **Stage 3 — move Integrations.** The Connectors section
      (`agent-config.ts:94-99`) replaces both the scope row
      (`thread-settings-menu.tsx:245-259`) and the never-cloned live
      sub-menus. Delete the footer strip (`composer.tsx:215-232`) and the
      `showIntegrationsFooter` prop in the same commit.
      *Gate:* `npx tsc --noEmit` catches all four `<Composer>` call sites;
      `npm test`.

- [ ] **Stage 4 — move Reasoning effort and Fast inference.**
      `thread-settings-menu.tsx:182-222` goes; `AGENT_CONFIG.reasoningEffort`
      becomes the source; `effort` / `onEffortChange` leave the menu's props
      (`:100-104`) and `composer.tsx:73`. Fast inference's state is menu-local
      today (`:115`), so nothing observable is lost.
      *Gate:* `npx tsc --noEmit`; `npm test`.

- [ ] **Stage 5 — the model exception.** Rename `thread-settings-menu.tsx` to
      `model-menu.tsx`, keep only the picker (`:129-180`), give the pill the
      provider mark and `aria-label="Model"` in place of
      `IconAdjustmentsHorizontal` (`composer.tsx:136-137`), and add the
      "Overridden for this thread · Reset" row to the panel's Model & compute.
      *Gate:* `npm test`; pixel diff at 1456×868 light and dark with the panel
      closed — the pill row must not move.

- [ ] **Stage 6 — trim the `+` menu.** Keep Upload files, Memories, Assets,
      Output as. Resolve Skills per the open question below. Move "Add to a
      project" to the thread title menu.
      *Gate:* `npm test`; add `composer-add-menu.html` to the Stage 0 list.

- [ ] **Stage 7 — open by default.** The only stage that changes the resting
      layout, and the only one that cannot be proved by a diff.
      *Gate:* a declared new baseline — all routes with a thread, 1456×868,
      light and dark — plus `brand:check-contrast`, plus the full six gates
      re-run.

---

## 5. Open questions for the design owner

1. **Is the panel per-agent or per-thread?** `AGENT_CONFIG` is one static
   record, but the live panel's "17 active · 1 overriding agent" implies a
   thread can override an agent. If per-thread overrides exist for *any*
   section, every section needs an "overridden here" state — and the model
   exception in §2 stops being an exception, which would dissolve the rule.
   This is the question everything else depends on.

2. **Does the panel Save, or apply immediately?** Gumloop has a Save top-right;
   menus apply on click. A Save introduces a dirty state, an unsaved-changes
   guard and a discard — a surface this repo has never built. Auto-apply keeps
   the current semantics and drops a button that is on the reference.

3. **Skills: one place or two?** Gumloop has no per-message skill attach;
   hyperagent's `+` menu does, over the same fifteen names
   (`add-menu.tsx:41-57`). The panel owning installation is clear. Whether the
   composer keeps an attach-for-this-turn picker is a product call, and it is
   the only row in the inventory the rule does not settle on its own.

4. **Which routes get the panel?** The thread page obviously. `/threads/new`
   has a composer and no thread — 550px describing an agent nobody has picked
   yet. And `signup/chat-step.tsx` embeds the composer in a flow that is not
   the app shell at all.

5. **Does `?panel=settings` survive?** If open is the default, is the closed
   state the parameterised one? This affects deep links and
   `scripts/dev/screenshot-pages.mjs`, which is what the pixel proof runs on.

6. **What happens below ~900px?** 550px cannot sit beside a thread column on a
   laptop in a split, let alone a phone. A `Sheet` exists in `ui/`. There is
   **no dump of the live panel at any width** — `docs/reference/overlays/` has
   captures of every composer menu and none of `?panel=settings`. Either
   capture one before Stage 1c, or accept that the panel is invented UI in a
   clone repo, the way `/signup` is (`HANDOFF.md`, "The signup flow"), and say
   so in `docs/components.md`.

7. **Does the roster stay 18 items with 17 on?** In a menu that is a dense
   grid; in a flat always-visible panel it is seventeen quiet on-states and one
   off. The presets variant (`tools-menu.tsx:304-352`) was built for exactly
   this and never shipped. Reviving it here would give the retiring
   `/design/tools` work a second life.

8. **What do the "AI managed" toggles do?** `SectionMeta.aiManaged`
   (`agent-config.ts:64-72`) is on for Skills, Connectors and Triggers. In a
   static clone they toggle nothing. Shipping three switches with no behaviour
   is the kind of thing this repo has otherwise refused to do.
