# Agent setup

Everything an agent needs to work in this repo: what installs itself, what you
add once, and what nobody can install for you. `.claude/settings.json` and
`.mcp.json` are the machine-readable manifests; this file is the reasoning
behind them and the map from each skill to the part of the repo that uses it.

New agent, short version: open the repo, accept the install prompt, read
`AGENTS.md`, then `docs/clone-conventions.md` before touching UI.

## Installs itself

`.claude/settings.json` is committed, so Claude Code offers these on your first
session in the repo. Nothing installs silently — you are asked to trust the
marketplace first, and declining leaves you with a working repo and a thinner
toolbox.

| Plugin | Brings | Why this repo needs it |
|---|---|---|
| `superpowers@claude-plugins-official` | 14 skills (see the map below) | The workflow this repo was built with: plans, worktrees, parallel branches, gates, branch finishing |
| `frontend-design@claude-plugins-official` | `frontend-design` | The phase-2 re-skin — visual direction, typography, avoiding templated defaults |

### How superpowers maps onto this repo

This is not a generic recommendation; every row is a convention already written
into the repo.

| Skill | Where it shows up here |
|---|---|
| `writing-plans`, `executing-plans` | `docs/plans/2026-09-07-component-system-sweep.md` — phases, owners, per-task checkboxes |
| `using-git-worktrees` | `.claude/worktrees/<branch>`, one dev-server port per branch (`docs/clone-conventions.md` step 8) |
| `dispatching-parallel-agents`, `subagent-driven-development` | Phase-2 page branches run in parallel with disjoint file ownership and an orchestrator that commits by path |
| `verification-before-completion` | `docs/clone-conventions.md` step 6: `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm test`, plus the 1456×868 pixel proof |
| `finishing-a-development-branch` | Merge `--no-ff`, re-run the gates on `main`, remove the worktree and the branch |
| `test-driven-development` | `npm test` (vitest); `src/components/components.test.ts` locks the component-tier rules |
| `requesting-code-review`, `receiving-code-review` | Branch review before a merge |
| `systematic-debugging`, `brainstorming` | General; no repo-specific contract |
| `writing-skills`, `using-superpowers` | Meta — used to author skills, not part of the build |

## MCP servers

`.mcp.json` is committed with the two servers that need no local app: `shadcn`
(the primitive registry behind `src/components/ui`) and `next-devtools` (Next.js
16 docs and diagnostics; it expects the dev server on `http://localhost:3000`,
and reports a connection failure until one is running).

No browser is declared in `.mcp.json` — see the next section for why.

## Live-site access

`docs/clone-conventions.md` compares every page against
the live reference site (`docs/research/00-source.md`, git-ignored, has the
URL), so an agent working on UI needs a real browser
signed into the account. Which one depends on where you are running, so this is
a routing rule rather than a dependency. Take the first row that applies:

| Where you run | Use |
|---|---|
| A local machine (macOS, Linux, Windows) | **BrowserOS neo** — a desktop app that registers its own MCP server on `http://127.0.0.1:9010/mcp` and holds the live login |
| A cloud agent platform with a browser of its own, or an agentic browser you are already running inside | **That platform's browser.** It is already signed in and already sandboxed; do not install a second one |
| A cloud runtime or CI with no browser of its own | **A hosted session** — Browserbase, or Playwright/Chromium in the sandbox. You have to handle the login yourself, so prefer the row above |
| Nothing with a browser | **Do not guess at the live site.** `docs/reference/` holds a DOM dump per page, the compiled CSS and `overlays/` with every captured menu and dialog. Work from those, and say plainly in your report that the live check was skipped |

BrowserOS neo is deliberately absent from `.mcp.json`: a project entry would be
redundant for anyone who has the app and a failed connection every session for
everyone else, including every cloud runtime in the table above.

These rules hold whichever browser you end up with, and matter more than the
choice of tool:

- Open your **own** tab or session; never touch a tab you do not own.
- **Read-only on the live account** — do not send messages, create, edit,
  connect or delete anything.
- Screenshot at **1456×868**, light and dark, and compare against your build.
- Read computed styles when a value is unclear rather than eyeballing it.
- New menus, popovers and dialogs get saved into `docs/reference/overlays/` as
  `<kebab-name>.html`, matching the files already there.

## Add once, if you want them

None of these are required to build or verify the repo.

| Skill | Install | License |
|---|---|---|
| `impeccable` | `npx impeccable install`, or `npx impeccable install -y --providers=claude --scope=project` | Apache-2.0, `pbakaus/impeccable` |
| `shadcn` (skill, distinct from the MCP server) | `/plugin install vercel@claude-plugins-official` — brings 27 other Vercel skills, so prefer the MCP server unless you want them | — |
| `tailwind-design-system`, `nextjs-app-router-patterns` | `/plugin marketplace add wshobson/agents` then `/plugin install frontend-mobile-development@claude-code-workflows` | — |
| `humanizer` | `git clone https://github.com/blader/humanizer.git ~/.claude/skills/humanizer` | MIT, © Siqi Chen |

## Add by hand — not installable from this repo

| Skill | Why | What to do instead |
|---|---|---|
| `emil-design-engineering` | Paid, licensed per seat; the install URL carries personal credentials, so it cannot be committed or shared | Install it with your own licence — on a cloud agent platform, ask the platform agent to run the install so the credentials stay in your account and never in this repo. Without it, `frontend-design` and `impeccable` cover most of the same ground |
| `make-interfaces-feel-better`, `web-animation-design` | Vendored locally with no recorded source, licence or version — not redistributable on the strength of what is on disk | Treat as optional; `frontend-design` and `impeccable` overlap heavily |

## Project skills

`.claude/skills/` is committed (see `.gitignore`) and is the home for
repo-specific procedures — a skill there is discovered automatically by any
session opened in this repo, with nothing to install. None exist yet. The
obvious candidates are the procedures currently living as prose: the pixel-diff
fidelity proof, the "add a UI primitive" path through `docs/components.md`, and
the lucide-to-Tabler icon codemod.

Keep the split honest: `docs/` holds reference and ground truth, a skill holds a
procedure with a trigger. A skill should cite the doc rather than restate it.

## Provenance

Resolved from the local plugin catalogue and package metadata, not from memory:
the 14 workflow skills are one plugin (`superpowers@claude-plugins-official`),
`shadcn` ships in `vercel@claude-plugins-official`, `impeccable` is npm
`impeccable@4.1.0`, `humanizer` is `blader/humanizer`. Two skills
(`make-interfaces-feel-better`, `web-animation-design`) had no recoverable
source on the machine this repo was built on, which is why they are listed as
optional rather than declared.
