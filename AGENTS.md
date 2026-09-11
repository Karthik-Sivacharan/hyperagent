<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project rules

This repo clones the hyperagent.com dashboard pixel for pixel, then re-skins it
with the Brand design language. Before changing UI, read
`docs/clone-conventions.md` (ground truth, file layout, verification, commit
rules) and `README.md`. Reference material for every page is in
`docs/reference/`; copy Tailwind classes from the DOM dumps rather than
inventing styles.

Icons come from `@tabler/icons-react` only, never `lucide-react` or another
set. Read `docs/brand/icons.md` before adding an icon: it has the import
shape, the props, the accessibility rules and the table that turns a dump's
`lucide-<name>` class into the Tabler name.

UI is built from the primitives in `src/components/ui` and the composites in
`src/components/patterns`; page, shell and route files compose them and never
contain a raw `<button>`, `<input>`, `<textarea>`, `<select>` or `<label>`,
and only `ui/` imports `radix-ui`, `cmdk` or `@xyflow/react`. Read `docs/components.md` before
adding UI (the map, the rules, how to add a primitive); `npm test` locks the
rules.

# Agent tooling

The skills this repo was built with are declared in `.claude/settings.json`, so
Claude Code offers to install them on your first session here; the MCP servers
that need no local app are in `.mcp.json`. `superpowers` carries the workflow
this repo runs on — `writing-plans` and `executing-plans` (the plan lives in
`docs/plans/`), `using-git-worktrees` and `dispatching-parallel-agents` (one
worktree and one dev-server port per page branch),
`verification-before-completion` (the `npm test` gates above plus the 1456×868
pixel proof) and `finishing-a-development-branch` (merge `--no-ff`, re-run the
gates, drop the worktree). `frontend-design` covers the phase-2 re-skin.

No browser is declared, because the right one depends on where you run: BrowserOS
neo on a local machine, the platform's own browser on a cloud agent (Hyperagent,
Comet and the like), a hosted session such as Browserbase otherwise, and
`docs/reference/` alone when you have none. Whichever it is, work in your own tab
and stay read-only on the live account. `docs/agent-setup.md` has that routing
rule, the full map from skill to convention, the optional extras with their exact
install commands, and the skills you must add by hand.
