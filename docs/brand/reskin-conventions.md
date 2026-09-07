# Re-skinning with the brand: conventions for every phase-2 page branch

Phase 1 cloned the hyperagent.com dashboard pixel for pixel. Phase 2 keeps
that layout and re-skins it with the brand design language. The shell is
done and merged on `main`: the token bridge (`src/app/globals.css`), the
primitives (`src/components/ui/*`), the sidebar, the composer, the menus, the
command palette and the theme switch. Page branches do the rest, one page
group each, in parallel worktrees. These rules keep the branches mergeable
and the re-skin coherent. Read them with `docs/clone-conventions.md` (the
phase-1 contract, still in force for structure and data) and
`docs/brand/design.md` (the brand language; §1, §3.2, §4.1, §5, §6, §8, §12
are the parts that matter here).

## The one sentence

**Keep the layout, change the skin.** Same element tree, same copy, same icon
sizes, same spacing and heights as the phase-1 clone; only colours, radii,
borders, shadows, type and motion change. Where Hyperagent's skin and the
brand disagree (8px nav corners vs pills, 14px cards vs 22px, a navy accent
vs tangerine, grey borders vs tints), the brand wins.

## The brand in ten lines

1. **Canvas:** paper white in light, warm charcoal in dark. Both must work;
   screenshot both. `bg-background` is the page, `bg-card` / `bg-surface-elevated`
   a card, `bg-surface-secondary` a sunken grouping section, `bg-surface-raised`
   a whisper above the canvas.
2. **Text has three tiers:** `text-foreground` for titles and the voice,
   `text-muted-foreground` for running copy, `text-foreground-low` for labels,
   meta, placeholders and provenance. A group label is `text-label-12-caps
   text-foreground-low`, never sentence-case grey.
3. **One accent, rarely solid.** Tangerine marks at most one action per view
   (`<Button variant="brand">`, `bg-brand text-brand-foreground`); rings,
   icons and graphics use `text-brand-accent` / `bg-brand-accent`; a tinted
   brand surface is `bg-brand-subtle text-brand-subtle-foreground`. The
   default button is ink. Never use tangerine or a status hue as decoration.
4. **Fills are tints.** `bg-tint-10` at rest, `hover:bg-tint-15`, `bg-tint-5`
   pressed, `bg-tint-20` for an active fill or a loud outline. They need no
   `dark:` variants.
5. **Separation is hairline.** `border-border-subtle` (or `shadow-edge`) for
   dividers and card edges, `border-border-loud` / `border-input` for inputs,
   `shadow-card` on a resting card, `shadow-card-hover` on hover; `shadow-lg`
   (the glass composer shadow) only for popovers, the composer and tiles.
6. **Everything soft.** `rounded-full` on chips, tabs, avatars, icon buttons and
   pill controls; `rounded-md` (8) on menu items and small inputs;
   `rounded-xl` (14) popovers and small cards; `rounded-3xl` (22) cards and
   list rows; `rounded-4xl` (26) large buttons and dialogs; `rounded-5xl` (32)
   the composer and section cards. Never `rounded-[Npx]`.
7. **Type:** Geist everywhere, Geist Mono only for identifiers. `text-xl`
   and up are heading roles: they carry Vercel's tracking and the 450
   heading weight automatically, so write `font-heading text-2xl` and no
   weight class. Weights: `font-normal` (body), `font-book` (450, the
   heading weight), `font-medium` (labels, chips, tabs, buttons); never
   `font-semibold` on a heading. `text-md` is the 13px metadata role.
8. **Status is quiet.** Success / warning / info / destructive appear as a
   small dot or a tinted chip (`<Badge variant="success">`, `bg-success/10
   text-success`), never as a large fill. Selected checks in menus are
   `text-brand-accent`.
9. **Motion is quick.** `transition-[color,background-color] duration-(--duration-fast)
   ease-out-quart` on controls, `duration-(--duration-normal) ease-out` on
   chips and tabs, `duration-(--duration-slow)` on hover shadows, press
   feedback as `motion-safe:active:scale-(--scale-press)`. Never
   `transition-all`; always list the properties.
10. **Imagery keeps its colours.** Logos, brand marks, agent orbs, cover
    images and their overlay gradients (`from-black/80`, `bg-white/60`) are
    not tokens and stay as they are.

## What already exists (use it, do not edit it)

- `src/components/ui/button.tsx`: `variant` default (ink) · brand · secondary ·
  outline (hairline) · ghost · chip · destructive · link; `size` default · xs ·
  sm · lg · icon · icon-xs · icon-sm · icon-lg. All pills.
- `badge.tsx`: default · secondary · outline · ghost · link · brand · success ·
  warning · info · destructive. `card.tsx`: 22px, `shadow-card`, serif title.
  `input.tsx`, `textarea.tsx`, `input-group.tsx` (a pill field). `tabs.tsx`
  (pill track; `variant="line"` for the underline). `switch.tsx` (ink when
  on). `toggle.tsx` / `toggle-group.tsx` (pill track when joined).
  `tooltip.tsx`, `dropdown-menu.tsx`, `context-menu.tsx`, `popover.tsx`,
  `dialog.tsx`, `sheet.tsx`, `command.tsx`, `kbd.tsx`, `separator.tsx`,
  `skeleton.tsx`, `avatar.tsx`, `scroll-area.tsx`.
- The shell: `src/components/app/*`, `src/components/composer/*`,
  `src/app/layout.tsx`, `src/app/globals.css`, `src/design/brand/*`,
  `src/lib/utils.ts`. Frozen on page branches. If a primitive or the shell
  is missing something your page needs, work around it locally and say so in
  your report instead of patching it.
- Every brand-only token has a utility: `bg-tangerine-500`, `bg-tint-10`,
  `text-foreground-low`, `border-border-subtle`, `bg-chip`, `bg-chat-bubble-user`,
  `font-book`, `text-md`, `text-display`, `rounded-5xl`, `rounded-bubble`,
  `shadow-card`, `shadow-edge`, `max-w-content`, `gap-group`, `ease-out-quart`,
  `animate-skeleton` … (`src/app/globals.css`, "PHASE 2 BRIDGE"). Durations
  and scales are plain variables: `duration-(--duration-fast)`,
  `scale-(--scale-press)`.

## Rules of engagement

1. **Paths.** Touch only your group's paths (listed in your brief) plus new
   files under those directories. Do not edit the shell, the primitives,
   `globals.css`, `brand.css`, `layout.tsx`, mock data, or another group's
   files.
2. **No raw colours or ad-hoc shapes.** No hex, `rgb()`, `oklch()` literals; no
   stock palette classes (`bg-blue-500`, `text-zinc-400`, `border-purple-…`);
   no `rounded-[Npx]`; no `transition-all`. `npm run brand:lint-tokens` is
   the gate and must pass for your files before you report (artwork files
   are allow-listed inside the script). `oklch(from var(--token) …)` and
   `white` / `black` alpha over imagery are allowed.
3. **Static data, same interactions.** Everything stays mock data from
   `src/lib/mock/`; menus, tabs, toggles and dialogs keep working exactly as
   before.
4. **Both themes.** Every page in your group is screenshotted at 1456×868 in
   light and dark and reviewed by you: no invisible text, no hard-coded
   backgrounds, no cream or navy left over from phase 1.
5. **Verification before you report:** `npx tsc --noEmit`, `npm run lint`,
   `npm run build` and `npm run brand:lint-tokens` all clean.
6. **Commits.** Small conventional commits on your branch: `feat(<page>): …`.
   Never merge, rebase onto main, or push. Use
   `-c user.name="Karthik Sivacharan" -c user.email="karthicksivacharan@gmail.com"`
   and end every message with
   `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>` and
   `Claude-Session: https://claude.ai/code/session_01LozFJZiGqmzcowQqxGbx84`.
7. **Dev server.** Each worktree runs its own: `npm install`, then
   `npm run dev -- --port <your port>` (the port is in your brief). Stop it
   when you finish.
8. **Naming.** The token system is called **brand** everywhere inside this
   repo: identifiers, comments, commit messages. Never write the source
   system's name.

## Screenshots

```sh
node scripts/dev/screenshot-pages.mjs <outDir> http://localhost:<port>
ONLY=home,thread node scripts/dev/screenshot-pages.mjs <outDir> http://localhost:<port>
node scripts/dev/contact-sheet.mjs <outDir>/light <outDir>/sheet-light.png "<title>"
```

`screenshot-pages.mjs` drives Google Chrome headlessly over the DevTools
protocol and writes `<outDir>/light/<page>.png` and `<outDir>/dark/<page>.png`
(dark toggles the `dark` class on `<html>`, exactly what the theme switch
does). Route names: home, threads, thread, inbox, teams, skills, memories,
learning, projects, library, marketplace, agents, settings,
settings-integrations, settings-profile, import-openclaw, design-brand.
BrowserOS neo (MCP `browseros-neo`) is available for interactive checks
(menus, hover, focus); open your own tab and stay read-only on any live
account.

## Report

When you finish, report: the files you changed and the brand decision behind
each visible change; anything you left as it was and why; the results of the
four verification commands; the screenshot directory. Keep it under a page.
