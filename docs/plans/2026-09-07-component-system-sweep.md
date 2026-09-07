# Component system sweep: implementation plan

> **For agentic workers:** the orchestrator dispatches one agent per task below (subagent-driven). Every task states its file ownership; agents touch nothing outside it. Steps use checkbox syntax for tracking.

**Goal:** every piece of UI in the clone is built from one organised component system on the brand tokens, and every component the live hyperagent.com dashboard uses (including the ones that only appear after clicking through menus, dialogs, toggles and populated states) has a mapped local counterpart, with a test that keeps it that way.

**Architecture:** four tiers under `src/components/`: `ui/` (shadcn primitives on the brand tokens; the only place `radix-ui` and `cmdk` are imported), `patterns/` (shared composites built from primitives, used by two or more pages; today's `resources/`), `app/` + `composer/` (the shell), `<page>/` (page components built from the tiers above). Page files hold layout and data wiring, never a raw control. The duplicate prototype set `src/design/brand/ui/` is retired so there is one component set. A vitest file locks the rules and checks that every `data-slot` seen in the reference dumps has a local definition.

**Tech stack:** Next.js 16, Tailwind v4, shadcn (radix-nova, `radix-ui` + `cmdk`), `class-variance-authority`, `@tabler/icons-react`, vitest 4, BrowserOS neo for the live sweep, `scripts/dev/screenshot-pages.mjs` + pixelmatch for the pixel proof.

**Branch / worktree:** `component-system` at `.claude/worktrees/component-system`, dev server on port 3001. The user's server on :3000 serves `main`; leave it alone.

**Pixel contract:** the migration changes no pixels at 1456×868, light and dark, on the 17 routes, compared with the baseline captured from this worktree at `6fab9a4` before any edit. The only allowed differences are ones the audit names as a genuine inconsistency that the primitive fixes; each must be listed in the final report with its diff PNG.

**Read-only on the live account:** never send, create, edit, star, archive or delete anything on hyperagent.com. Menus, popovers, dialogs and toggles that only reveal UI may be opened; dismiss them with Escape.

---

## Phase 1: audit (parallel, read-only on the repo)

### Task A1: live sweep of hyperagent.com

**Owner:** one agent with BrowserOS neo (own tabs, own session).
**Writes:** `<scratchpad>/live-inventory.md`; new DOM dumps under `docs/reference/overlays/` in the worktree for anything not already captured there; screenshots under `<scratchpad>/live/`.

- [ ] Open `https://hyperagent.com/threads/new` in a new tab (1456×868). Record every `data-slot`, `role`, `data-radix-*` marker and every `<button>` / `<input>` / `<a>` control shape in the resting page.
- [ ] Click through every interactive surface, one at a time, Escape after each: sidebar collapse, the Starred / Agents / Recent threads / Resources group chevrons, the group hover menus, a thread's `…` menu and right-click context menu, "New agent", "View all", the account menu (Theme, Token usage, Help sub-panels), ⌘K search, the composer `+` menu and its sub-menus, the model picker, the Agent picker, the Execute/Plan pill, reasoning effort, thread settings, the mic tooltip, the "Set up your agent" chip popover, "More…", the list/grid toggle, "Show all", the star button on a thread card (hover only; do not toggle it), the project tag on the card.
- [ ] Visit `/threads`, `/thread/<the starred thread>`, `/inbox`, `/teams`, `/skills`, `/memories`, `/learning`, `/projects`, `/library`, `/marketplace`, `/agents`, `/settings`, `/settings/integrations`. On each, record the resting markers and open the page's own menus, selects, tabs, switches, checkboxes, dialogs. Populated states matter: the threads list and the thread detail now have real content.
- [ ] For each distinct component write one row: name, evidence (slot / role / structure), where seen, whether `docs/reference/overlays/*.html` or `docs/reference/pages/*.html` already captures it, and whether the local clone renders it (compare with `http://localhost:3000` in a second tab).
- [ ] Save `document.body.outerHTML` of every menu, popover or dialog not already in `docs/reference/overlays/` as `docs/reference/overlays/<kebab-name>.html` (same convention as the existing files), and a screenshot of each.
- [ ] List the UI the live site has grown since 2026-09-06 that the clone lacks (seen so far: the Starred sidebar group with a project-folder glyph, the star toggle and project tag on thread cards, Execute replacing Plan on the composer, the "Connect your integrations" chip gone).

### Task A2: local audit of the component system

**Owner:** one agent, read-only.
**Writes:** `<scratchpad>/local-audit.md`.

- [ ] Inventory `src/components/ui/*` (23 files): exported components, `data-slot` names, variants, sizes.
- [ ] Inventory `src/design/brand/ui/*` (23 prototype files, unimported): what they add over `src/components/ui` (accordion, checkbox, radio-group, progress, table, empty, call-button, progressive-blur, label, select are candidates).
- [ ] Union every `data-slot` in `docs/reference/pages/*.html` and `docs/reference/overlays/*.html`; mark each as defined locally (`ui/`, `resources/`, page file) or missing. Known missing today: `select`, `select-trigger`, `select-value`, `label`, `checkbox`; `icon-tile` and `overline` are defined ad hoc in page files.
- [ ] List every `radix-ui` / `cmdk` import outside `src/components/ui/` (known: `library/library-select.tsx` Select, `skills/discover-skills.tsx` Collapsible, `thread/thread-view.tsx` ScrollArea, `memories/memories-page.tsx` Checkbox) with what the file builds by hand.
- [ ] List every raw `<button`, `<input`, `<textarea`, `<select`, `<label` under `src/components/**` (outside `ui/`) and `src/app/**` with file:line, the class string, and which primitive + variant would render it identically (or the variant that must be added). Known counts: sidebar 9, message-actions 4, composer 3, thread-header 3, quick-actions 3, thread-settings-menu 3, and singles in search-palette, add-menu, learning-thread-row, memories-page, integrations-page, option-cards, thread-view, user-message.
- [ ] Find repeated class patterns used with the same intent in 2+ files that are not a primitive: the `rounded-3xl bg-card shadow-card` card/row shell (home/thread-card, threads/thread-card, learning-thread-row, skills-library, settings cards, marketplace cards), the `POPOVER_ITEM` / `PILL` / `GHOST_PILL` / `ACTION` module constants, the `data-slot="icon-tile"` tiles (composer, settings-link-card, listing-meta), the `data-slot="overline"` labels (settings page, account-menu, agent-picker), sidebar nav items, menu item shapes, chip rows.
- [ ] Propose the target: which primitives to add to `ui/` (via `npx shadcn@latest add`, then re-skinned; or hand-written when shadcn has none), which composites go to `patterns/`, which variants to add to existing primitives, and the migration list per file. Only extract what is used with the same intent 2+ times; do not invent abstractions for single uses.

---

## Phase 2: build (one worktree, disjoint ownership, no commits by agents)

The orchestrator turns the two audit reports into the exact task list below (filled in after Phase 1), starts `npm run dev -- --port 3001` in the worktree, and commits by path after each task.

### Task B1: primitives (`src/components/ui/**`, `src/lib/utils.ts` only if a new class group is needed)

- [ ] Add the missing shadcn primitives with `npx shadcn@latest add <names>`; convert every `lucide-react` import to Tabler per `docs/brand/icons.md`; re-skin each on the brand tokens following the existing files (pills, tints, hairlines, `duration-(--duration-fast) ease-out-quart`, no raw colours), keeping the phase-1 heights so nothing moves.
- [ ] Add the small brand-only primitives the audit names (`icon-tile`, `overline` / section label, and whatever else recurs), each with `data-slot`, a cva variant API where there are two or more looks, and `className` as the escape hatch.
- [ ] Add the variants existing primitives need so the raw buttons in the pages can become `<Button>` without changing a pixel (compare the raw class string with the variant output; the `aria-label`, `data-*` and event props pass through).
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run brand:lint-tokens`, `npm test` clean.

### Tasks B2–B4: migration (parallel after B1; each owns its directories)

- B2 shell: `src/components/app/**`, `src/components/composer/**`.
- B3 home / thread / threads: `src/components/home/**`, `src/components/thread/**`, `src/components/threads/**`.
- B4 resources and the rest: `src/components/{inbox,teams,skills,memories,learning,projects,library,marketplace,agents,settings}/**`, `src/components/resources/` → `src/components/patterns/` (rename plus the import updates in the page files the task owns), `src/app/(app)/**`.

Each:
- [ ] Replace every raw control with the primitive, every hand-built radix composition with the `ui/` component, every repeated shell with the pattern. Keep element trees, copy, icon sizes, `aria-*` and `data-*` attributes.
- [ ] Screenshot the owned routes on :3001 light and dark and pixelmatch against the baseline; zero differing pixels, or a named, justified exception.
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run brand:lint-tokens` clean for the tree.

### Task B5: docs and the lock (after B2–B4 are committed)

- [ ] Delete `src/design/brand/ui/`; update `src/design/brand/README.md`, `docs/brand/design.md` preamble, `HANDOFF.md`, `README.md`, `docs/clone-conventions.md`, `docs/brand/reskin-conventions.md` to the four tiers and the rules.
- [ ] Write `docs/components.md`: the tiers, the rules, the component map (live evidence → local file → variants → who uses it), the live UI grown since the capture that the clone still lacks.
- [ ] Write `src/components/components.test.ts` (vitest, node env, text scan like `icons.test.ts`): `radix-ui` / `cmdk` only under `ui/`; no raw `<button|input|textarea|select|label` JSX under `src/components` (outside `ui/`) or `src/app`; `src/design/brand/ui/` absent; every `data-slot` value found in `docs/reference/**/*.html` has a `data-slot="<same>"` under `src/components/ui/` or `src/components/patterns/`. Show each rule red against a deliberate break before green.

---

## Phase 3: gates, proof, merge (orchestrator)

- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm run brand:check-contrast`, `npm run brand:lint-tokens`, `npm test`.
- [ ] Screenshot all 17 routes light and dark on :3001; pixelmatch against the baseline; list every differing page with its pixel count and a diff PNG.
- [ ] Merge `component-system` into `main` with `--no-ff`, re-run the gates on `main`, remove the worktree and the branch. No push.
