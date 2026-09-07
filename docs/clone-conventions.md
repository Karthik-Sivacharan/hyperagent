# Cloning hyperagent.com: conventions for every page branch

Phase 1 of this repo is a pixel-faithful clone of the hyperagent.com dashboard
(every page reachable from the left sidebar). Phase 2 re-skinned it with the
Brand design language; its contract is `docs/brand/reskin-conventions.md`,
which keeps rule 1's path ownership and the verification steps below and
replaces the "copy classes verbatim" strategy with the brand tokens. These
rules keep the parallel branches mergeable and the clone honest.

## Ground truth

- **DOM dumps:** `docs/reference/pages/<page>.html` is `document.body.outerHTML`
  of the live page (dark theme, neutral palette, viewport 1456×868, captured
  2026-09-06) with Tailwind classes intact. Copy class strings verbatim. This is
  the pixel strategy: the site is Next.js + Tailwind v4 + shadcn (radix) + lucide,
  our stack apart from the icon set, so its classes compile unchanged here.
- **Compiled CSS:** `docs/reference/css/*.css` (grep it when a class in a dump is
  not a stock Tailwind utility). Site-specific utilities already ported to
  `src/app/globals.css`: `text-logo`, `font-ui/display/body`, `glass*`,
  `safe-area-*`, `h-dvh-below-banners`, `bg-glass-gradient`, `scrollbar-hide`,
  `animate-shimmer`, `animate-card-enter`, `prose-message`, and the keyframes.
  Add a missing one to globals.css only if you must, in its own small commit.
- **Live site:** use BrowserOS neo (MCP `browseros-neo`) to look at
  https://hyperagent.com/<your page> next to your build. Open your OWN tab
  (`tabs` action `new`), never touch tabs you do not own, and stay read-only on
  the account: do not send messages, create, edit, connect, or delete anything.
  Screenshot both at 1456×868 and compare; use `evaluate` to read computed
  styles when a value is unclear.
- **Icons:** the dump's `lucide-<name>` class still tells you which icon the
  site uses, but the component you write is the Tabler equivalent from
  `@tabler/icons-react` (`lucide-square-pen` is `IconEdit`,
  `lucide-chevron-right` is `IconChevronRight`); the naming rule and the
  lucide-to-Tabler table are in `docs/brand/icons.md`. Non-icon SVGs (logos,
  brand marks) are copied verbatim into a component under
  `src/components/<page>/` or `src/components/app/brand-icons.tsx`.
- **Images:** download remote images the page shows into `public/img/<page>/`
  (curl; they are public CDN assets) and reference them locally. Signed S3 URLs
  expire; grab them from the live tab if the dump's have expired.

## Where things go

| What | Path |
|---|---|
| Route | `src/app/(app)/<route>/page.tsx` (a placeholder already exists; replace it) |
| Page-specific components | `src/components/<page>/` (e.g. `src/components/skills/skill-card.tsx`) |
| Mock data for the page | `src/lib/mock/<page>.ts` |
| Shared shell (sidebar, frame, composer) | `src/components/app/`, `src/components/composer/` (foundation-owned) |
| shadcn primitives | `src/components/ui/` (foundation-owned; add new ones with `npx shadcn@latest add <name>`, do not edit existing ones) |

Pages own everything inside `<main>`: their own scroll container, header,
padding. The shell gives you the sidebar and the frame only. Reuse
`<Composer>` from `src/components/composer/composer.tsx` where the page has one.

## Rules of engagement

1. Touch only your page's paths plus new files under `src/components/<page>/`,
   `src/lib/mock/<page>.ts`, `public/img/<page>/`. Do not edit the shell,
   `globals.css`, `layout.tsx`, `button.tsx`, or another page's files. If the
   shell is wrong for your page, note it in your report instead of patching it.
2. Static data only. Everything is mock data in `src/lib/mock/`; no fetching,
   no auth, no real API. Interactive bits (dropdowns, tabs, toggles, dialogs)
   should open and switch with local state so the page feels alive, but they
   need not persist.
3. Match the dump structurally: same element tree, same classes, same copy,
   same icon sizes. Then verify visually against the live page. Where the live
   page is an empty state (Inbox, Teams, Projects…), clone that empty state,
   not an imagined populated one.
4. Keep hover, focus and disabled states from the dump (`hover:bg-accent`,
   `focus-visible:ring-*`, `disabled:opacity-50`).
5. Responsive classes in the dump (`md:`, `max-sm:`, `@container`) are kept;
   only the desktop 1456-wide layout has to be verified.
6. Verification before you report: `npx tsc --noEmit`, `npm run lint`, and
   `npm run build` all clean; your page screenshotted next to the live one at
   1456×868 with no visible layout difference.
7. Commit small, conventional commits on your branch: `feat(<page>): ...`.
   Never merge, rebase onto main, or push. Use
   `-c user.name="Karthik Sivacharan" -c user.email="karthicksivacharan@gmail.com"`
   and end every message with
   `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>` and
   `Claude-Session: https://claude.ai/code/session_01NSEBJjUSUQkexCoK1qcXEU`.
8. Dev server: each worktree runs its own `npm run dev -- --port <your port>`
   (ports are assigned in your brief). `npm install` first; node_modules do not
   travel with worktrees. Stop the server when you finish.
