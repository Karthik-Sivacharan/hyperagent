# Frontend practices for this stack

This file is for an AI coding agent writing prototype UI in this repo. It is a rules
sheet, not a tutorial: every entry is an instruction, a one-line reason, and where
possible a wrong/right pair. It covers the general stack only — Next 16, React 19,
TypeScript, Tailwind v4, Radix, Motion, Vitest. It does **not** restate this repo's own
conventions; those live in [`docs/components.md`](./components.md) (the four component
tiers, the primitive/pattern rules, the token rules) and
[`docs/brand/icons.md`](./brand/icons.md) (icons). Where a general practice is overridden
by a repo rule, this file says so and points at the file that owns it.

Written **2026-09-15**. Re-verify against the bundled docs if the versions below have moved.

| Package | Version | Notes |
|---|---|---|
| `next` | 16.3.4 | App Router, Turbopack by default |
| `react` / `react-dom` | 19.2.8 | but see [§1.1](#11-the-react-that-actually-runs-is-not-the-one-in-packagejson) |
| `@types/react` | 19.2.18 | |
| `typescript` | 5.9.3 | `strict: true`, `moduleResolution: "bundler"` |
| `tailwindcss` | 4.3.3 | via `@tailwindcss/postcss`, CSS-first config |
| `radix-ui` | 1.6.7 | the single unified package |
| `motion` | 13.2.0 | imported as `motion/react` |
| `class-variance-authority` | 0.7.1 | |
| `tailwind-merge` | 3.6.0 | extended in `src/lib/utils.ts` |
| `vitest` | 4.1.11 | `environment: "node"` |
| shadcn-style components | vendored | source lives in `src/components/ui/`, not a dependency |

**Source precedence.** The bundled Next docs at `node_modules/next/dist/docs/` are
version-exact ground truth and win over anything on the web, including nextjs.org. Where
this file contradicts a web source, the bundled path is cited. Claims verified by running
code against this repo's `node_modules` are marked **(verified locally)**.

---

## 1. Changed recently — verify before you trust your memory

This is the section that matters most. Everything below is something a model trained on
older material will get wrong, in code that often still compiles.

| Area | What you probably remember | What is true at these versions | Source |
|---|---|---|---|
| Tailwind config | `tailwind.config.js` with `theme.extend` | No JS config. Theme is CSS: `@theme { --color-*: … }`. A JS config only loads if a file explicitly writes `@config "…"` | [tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme) |
| Tailwind entry | `@tailwind base; @tailwind components; @tailwind utilities;` | `@import "tailwindcss";` | [functions-and-directives](https://tailwindcss.com/docs/functions-and-directives) |
| Tailwind transforms | `scale-105` compiles to `transform: scale(…)` | It compiles to the standalone CSS `scale` property. Same for `rotate-*` and `translate-*`. See [§7.3](#73-the-transform-trap) | **(verified locally)** |
| Next dynamic APIs | `params.slug`, `cookies().get()` are sync | Async-only. The Next 15 sync compatibility shim was **removed** in 16 | `01-app/02-guides/upgrading/version-16.md` |
| Next error boundary | `error.tsx` receives `reset` | It receives **`retry`** (stable in 16.3.0). `reset` still exists but is the narrow case | `01-app/03-api-reference/03-file-conventions/error.md` |
| `next/image` | `priority` for the LCP image | `priority` is **deprecated** in 16; use `preload`, or `loading="eager"` / `fetchPriority="high"` | `01-app/03-api-reference/02-components/image.md` |
| Next middleware | `middleware.ts` exporting `middleware` | Deprecated and renamed to `proxy.ts` exporting `proxy`; Node runtime only | `01-app/03-api-reference/03-file-conventions/proxy.md` |
| React refs | wrap in `forwardRef` | `ref` is an ordinary prop on function components. `forwardRef` is legacy | [react.dev/reference/react/forwardRef](https://react.dev/reference/react/forwardRef) |
| React context | `<Ctx.Provider value={…}>` | `<Ctx value={…}>`. `.Provider` works but is slated for deprecation | [React 19 blog](https://react.dev/blog/2024/12/05/react-19) |
| Form state hook | `useFormState` from `react-dom` | `useActionState` from `react` | [React 19 blog](https://react.dev/blog/2024/12/05/react-19) |
| `useEffectEvent` | experimental, behind a flag | **Stable.** Exported unprefixed and typed in `@types/react/index.d.ts` | **(verified locally)** |
| `<Activity>` | doesn't exist / experimental | **Stable** in 19.2, typed in `index.d.ts` | **(verified locally)** |
| Radix imports | `@radix-ui/react-dialog` etc., one package per primitive | One package: `import { Dialog } from "radix-ui"` | **(verified locally)** |
| Motion | `import { motion } from "framer-motion"` | `import { motion } from "motion/react"` | **(verified locally)** |
| Next linting | `next lint`, `eslint` key in `next.config` | Both **removed**. Run `eslint` directly; `next build` does not lint | `version-16.md` |
| Bundler | opt in with `--turbopack` | Turbopack is the default for `next dev` **and** `next build` | `version-16.md` |
| `revalidateTag` | `revalidateTag('posts')` | Requires a second `cacheLife` argument: `revalidateTag('posts', 'max')`. One-arg form is deprecated and is a TS error | `01-app/03-api-reference/04-functions/revalidateTag.md` |
| Vitest projects | `vitest.workspace.ts` + `defineWorkspace()` | **Removed** in 4. Use `test.projects` in the root config | [vitest.dev/guide/migration](https://vitest.dev/guide/migration/) |
| Vitest pools | `test.poolOptions.threads.singleThread` | `poolOptions` **removed**; options are flat on `test`. `maxThreads`/`maxForks` → `maxWorkers`; `singleThread` → `maxWorkers: 1, isolate: false` | [vitest.dev/blog/vitest-4](https://vitest.dev/blog/vitest-4) |
| Vitest mocks | `vi.restoreAllMocks()` resets everything | It now restores **only** `vi.spyOn` mocks, not `vi.fn()` or `vi.mock()` automocks | [vitest.dev/guide/migration](https://vitest.dev/guide/migration/) |

### 1.1 The React that actually runs is not the one in `package.json`

`package.json` pins `react@19.2.8`, but Next aliases bare `react` / `react-dom` imports to
its own bundled copy (`next/dist/compiled/react`). In this install that copy is
**`19.3.0-canary-cbb046ab-20260731`** (verified locally, and see
`node_modules/next/dist/build/create-compiler-aliases.js`, which sets `react$` →
`next/dist/compiled/react…`). The bundled upgrade guide states this plainly:

> The App Router in **Next.js 16** uses the latest React [Canary release]
> — `01-app/02-guides/upgrading/version-16.md`

Consequences to internalise:

- **Types can lag runtime.** `@types/react@19.2.18` types what 19.2 shipped. Canary-only
  APIs exist at runtime but do not typecheck.
- Concrete case, verified locally: `import { ViewTransition } from "react"` **runs** but
  fails `tsc` with `TS2724: '"react"' has no exported member named 'ViewTransition'`.
  Adding `/// <reference types="react/canary" />` makes it clean. `Activity` and
  `useEffectEvent` need no such reference — they are in `index.d.ts`.
- Do not "fix" a canary API by installing `react@canary`. Next supplies it.

### 1.2 Async request APIs are not optional any more

Next 15 let you read `params` synchronously with a deprecation warning. **Next 16 removed
that.** Every one of `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()` is a
promise.

```tsx
// wrong — Next 15 era, throws in 16
export default function Page({ params }: { params: { slug: string } }) {
  return <h1>{params.slug}</h1>
}

// right
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <h1>{slug}</h1>
}

// righter — the generated helper types the route for you
export default async function Page(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params
  return <h1>{slug}</h1>
}
```

**Why:** the promise is what lets Next start rendering the static shell before the request
is known. `PageProps` / `LayoutProps` / `RouteContext` are global — no import — and are
generated by `next dev`, `next build` or `next typegen`
(`01-app/01-getting-started/03-layouts-and-pages.md`).

It spread further in 16: the `Image` function in `opengraph-image` / `icon` / `apple-icon`
now receives `params` **and** `id` as promises, and `sitemap` receives `id` as a promise.

### 1.3 `error.tsx` takes `retry`

```tsx
// wrong — the prop is not called reset any more
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return <button onClick={reset}>Try again</button>
}

// right
'use client'
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return <button onClick={() => retry()}>Try again</button>
}
```

**Why:** `retry()` re-fetches and re-renders the boundary's children; the old `reset()` only
cleared error state and re-rendered with the same data. `reset` still exists for that
narrower case. `retry` became stable in 16.3.0
(`01-app/03-api-reference/03-file-conventions/error.md`).

Also new: `catchError` from `next/error` builds a component-level error boundary you can
wrap around any subtree, without a route file.

### 1.4 Tailwind v4 renames that silently change the look

These compile fine and render differently. Verified locally against `tailwindcss@4.3.3`:

| v3 | v4 | What breaks if you use the v3 name |
|---|---|---|
| `shadow-sm` | `shadow-xs` | v4's `shadow-sm` is v3's `shadow` — one step heavier than intended |
| `shadow` | `shadow-sm` | (bare `shadow` still resolves, to the same as `shadow-sm`) |
| `rounded-sm` | `rounded-xs` | v4's `rounded-sm` reads `--radius-sm` |
| `rounded` | `rounded-sm` | bare `rounded` is a hard-coded `0.25rem`, outside the token scale |
| `outline-none` | `outline-hidden` | v4's `outline-none` now really means `outline-style: none`, killing the forced-colors fallback |
| `ring` | `ring-3` | v4's `ring` is **1px**, not 3px, and `currentColor`, not blue-500 |
| `blur` / `blur-sm` | `blur-sm` / `blur-xs` | same one-step shift |
| `bg-opacity-50` | `bg-black/50` | the `*-opacity-*` utilities were removed outright |
| `flex-shrink-0` | `shrink-0` | |
| `overflow-ellipsis` | `text-ellipsis` | |

Plus three behaviour changes with no rename to warn you:

- **Default border colour is `currentColor`**, not `gray-200`. A bare `border` now draws in
  the text colour. Always pair it with a colour.
- **Default placeholder colour** is the current text colour at 50%, not `gray-400`.
- **Variant stacking reads left to right.** v3's `first:*:pt-0` is v4's `*:first:pt-0`.
- **`!important` moved to the end**: `flex!`, not `!flex`.
- **Arbitrary CSS variables use parens**: `bg-(--brand)`, not `bg-[--brand]`.

Source: [tailwindcss.com/docs/upgrade-guide](https://tailwindcss.com/docs/upgrade-guide).

### 1.5 Smaller things that have moved

- **`next lint` is gone**, as is the `eslint` key in `next.config`. `next build` no longer
  lints. This repo's `npm run lint` calls `eslint` directly — correct for 16.
- **`serverRuntimeConfig` / `publicRuntimeConfig` removed.** Use env vars;
  `NEXT_PUBLIC_*` for anything the client reads.
- **`experimental.dynamicIO` / `experimental.useCache` removed**, folded into top-level
  `cacheComponents`. Turning `cacheComponents` on is not a rename — it changes the
  rendering model and will error on uncached data outside `<Suspense>`.
- **`experimental.ppr` and the `experimental_ppr` segment export are gone.**
- **Parallel-route slots now require an explicit `default.js`** or the build fails.
- **`scroll-behavior: smooth` is no longer overridden** on navigation unless `<html>` has
  `data-scroll-behavior="smooth"`.
- **`next dev` writes to `.next/dev`**, so dev and build can run concurrently; a lockfile
  stops two `next dev` instances on one project.
- **`size` and `First Load JS` were dropped from `next build` output** as inaccurate under
  RSC. Measure with Lighthouse instead.
- **React 19 removals:** `propTypes`, `defaultProps` on function components, legacy
  context, string refs, `ReactDOM.render`/`hydrate`, `findDOMNode`, `react-dom/test-utils`
  (`act` moved to the `react` package). Verified locally: `react-dom.findDOMNode` and
  `react-dom.render` are `undefined`.
- **Edge runtime is deprecated.** Don't add `export const runtime = 'edge'`.

---

## 2. Next.js 16 App Router

### 2.1 The server/client boundary

**Default to a Server Component. Add `"use client"` only at the leaf that needs the
browser.** Why: `"use client"` is not a per-component switch, it is a *module graph*
boundary — everything that file imports, transitively, lands in the client bundle.

```tsx
// wrong — the whole page and everything it imports ships to the browser
// app/(app)/settings/page.tsx
'use client'
import { useState } from 'react'
import { HeavyChart } from '@/components/heavy-chart'

// right — the page stays a Server Component; only the toggle is client code
// app/(app)/settings/page.tsx
import { SettingsToggle } from '@/components/settings/settings-toggle'
export default function Page() {
  return <SettingsToggle />
}
// components/settings/settings-toggle.tsx
'use client'
import { useState } from 'react'
```

Reach for a Client Component when you need state, event handlers, effects, browser APIs,
or a custom hook. Everything else stays on the server
(`01-app/01-getting-started/05-server-and-client-components.md`).

**Pass Server Components through `children`, don't import them into client files.** A
rendered element is serialisable data and crosses the boundary; the component's *code* does
not.

```tsx
// right — Modal is a Client Component, Cart stays on the server
export default function Page() {
  return (
    <Modal>
      <Cart />
    </Modal>
  )
}
```

**Why:** the RSC payload carries `Cart`'s rendered output, so `Modal` never imports it and
`Cart`'s code never ships.

Other boundary rules:

- **Props must be serialisable.** Functions can't cross. The one exception is a Server
  Function (`"use server"`), which crosses as a reference. The Next TypeScript plugin only
  allows a function-typed prop on a Client Component when the prop is named `action` or
  ends in `Action` — follow that naming, it is load-bearing
  (`01-app/02-guides/server-and-client-boundary.md`).
- **Compound components break across the boundary.** A Server Component importing a Client
  Component gets a client *reference*, so `Menu.Item` is `undefined` and React throws
  "Element type is invalid." Export the parts as named exports instead of static
  properties.
- **Render providers as deep as you can**, wrapping `{children}` rather than the whole
  document, so Next can keep more of the tree static.
- **Wrap third-party client-only components** in your own one-line `"use client"` re-export
  rather than marking your page client.

### 2.2 Routing and files

| File | What it is | Gotcha |
|---|---|---|
| `page.tsx` | the route's UI | only `page` receives `searchParams` |
| `layout.tsx` | shared UI; preserves state across navigation, does not re-render | root layout must render `<html>` and `<body>` |
| `template.tsx` | like a layout but remounts on navigation | use only when you *want* state reset |
| `loading.tsx` | wraps the segment in `<Suspense>` | enables partial prefetch of dynamic routes |
| `error.tsx` | error boundary, must be `"use client"` | prop is `retry` ([§1.3](#13-errortsx-takes-retry)) |
| `not-found.tsx` | UI for `notFound()` in that segment | `global-not-found.js` handles unmatched routes app-wide |
| `default.tsx` | parallel-route fallback | **required** in 16; build fails without it |
| `(group)/` | route group — not in the URL | two groups resolving to the same path is an error |

**Add `loading.tsx` to any dynamic route.** Why: without it Next skips prefetching the
route entirely, so the click blocks on the server and the app reads as frozen. With it,
the shell and skeleton are prefetched and navigation is immediate
(`01-app/01-getting-started/04-linking-and-navigating.md`).

**Add `generateStaticParams` to a dynamic segment that could be prerendered.** Why: without
it the route falls back to per-request rendering even when the set of pages is known.

### 2.3 `next/link`

**Use `<Link>`, never a bare `<a>`, for in-app routes.** Why: `<Link>` prefetches on
viewport entry and hover, and does a client-side transition that keeps layouts mounted and
interactive. A raw `<a>` does a full page load.

No child `<a>` since v13. `className`, `target` and other anchor attributes pass straight
through. In App Router the props are `href`, `replace`, `scroll`, `prefetch`
(boolean | `"auto"` | null), `onNavigate`, and `transitionTypes` (16.2+).

For immediate feedback on a slow network, `useLinkStatus()` from `next/link` gives you
`{ pending }` inside a client descendant of the link.

If a sticky header covers the target after navigation, fix it with CSS
`scroll-padding-top`, not JS.

### 2.4 `next/image`

**Always set `width`/`height`, or `fill`.** Why: it reserves the aspect ratio and prevents
layout shift. Static imports supply both automatically.

**Use `preload`, not `priority`.** `priority` is deprecated in 16.

```tsx
// wrong
<Image src={hero} alt="" priority />

// right — and in most cases the docs prefer the plain HTML hints
<Image src={hero} alt="" loading="eager" fetchPriority="high" />
```

Next 16 defaults that will surprise you: `qualities` is `[75]` only (any other `quality`
prop is coerced to the nearest allowed value), `minimumCacheTTL` is 4 hours, `16` was
dropped from `imageSizes`, remote redirects cap at 3, and local IPs are blocked unless you
set `dangerouslyAllowLocalIP`. `images.domains` is deprecated — use `remotePatterns`.
`alt=""` for decorative images, always present.

### 2.5 `next/font`

Call the font function at **module scope**, never inside a component. Why: it is a build-time
transform; calling it per render defeats it.

```tsx
// right
import { Geist } from 'next/font/google'
const geist = Geist({ subsets: ['latin'] })
export default function Layout({ children }) {
  return <html lang="en" className={geist.className}>…</html>
}
```

Fonts self-host automatically — no request to Google at runtime, no layout shift. A font
called in the root layout preloads on every route; called in a page, only that route.
`@next/font` has not existed since 13.2; it is `next/font`.

### 2.6 Metadata

`metadata` and `generateMetadata` are **Server Component only**. Static object when it
doesn't depend on data, `generateMetadata` when it does.

**Wrap a data function shared between `generateMetadata` and the page in React's `cache()`.**
Why: otherwise you fetch the same thing twice per request.

```ts
import { cache } from 'react'
export const getPost = cache(async (slug: string) => db.posts.find(slug))
```

`themeColor`, `colorScheme` and `viewport` inside `metadata` have been deprecated since 14
— use the separate `viewport` export / `generateViewport`.

### 2.7 Data fetching and caching

For this repo — a prototype clone driven by mock data in `src/lib/mock/` — most of this is
inert. The short version:

- `fetch` is memoised per server render, so the same request in two components is one call.
- To stream server data into a Client Component, start the fetch in a Server Component,
  pass the **unawaited promise** as a prop, and read it with `use()` inside a `<Suspense>`
  boundary (`01-app/01-getting-started/06-fetching-data.md`).
- `cacheComponents: true` turns on the `use cache` model. It is **off** here and turning it
  on is a migration, not a flag. Don't.
- Client-side fetching in a prototype: prefer passing mock data down as props. If you truly
  need a client fetch, SWR or TanStack Query, not a hand-rolled `useEffect`.

### 2.8 Interaction patterns worth copying

From `01-app/02-guides/interactive-apps.md`:

**Pair `useOptimistic` with `useTransition` for anything that mutates.** Why: the UI updates
on the click frame instead of waiting for the server, and reverts automatically if the
transition fails.

```tsx
const [optimisticPriority, setOptimisticPriority] = useOptimistic(priority)
const [, startTransition] = useTransition()

function handlePriority() {
  startTransition(async () => {
    setOptimisticPriority(PRIORITY_CYCLE[optimisticPriority])   // read optimistic, not the prop
    await cyclePriority(id)
  })
}
```

Note it reads `optimisticPriority`, not `priority` — reading the prop makes a rapid
double-click use a stale closure value.

**Expose pending state as a `data-` attribute and style it with `:has()`.** Why: ancestors
can react to a descendant's pending state with no state lifting or coordination.

```tsx
<div data-pending={isPending ? '' : undefined}>…</div>
// ancestor: class="group has-data-pending:opacity-50"
```

The docs' own caveat: `:has()` is re-evaluated over the anchored subtree on every toggle.
Fine for a filter that toggles twice; use client state instead for drag or scroll.

---

## 3. React 19

### 3.1 Derive, don't store

**If a value can be computed from props or state, compute it during render.** Why: a
`useState` + `useEffect` pair adds a render, can go stale, and gives you two sources of
truth.

```tsx
// wrong
const [fullName, setFullName] = useState('')
useEffect(() => { setFullName(first + ' ' + last) }, [first, last])

// right
const fullName = first + ' ' + last
```

Reach for `useMemo` only when the computation is genuinely expensive **and** you have
measured it. A `.filter()` over twenty mock rows is not expensive.

### 3.2 When `useEffect` is legitimate

Legitimate: synchronising with something outside React — a subscription, a DOM measurement,
an imperative animation handle, an analytics ping tied to the component being *displayed*.
The test from react.dev: *"Use Effects only for code that should run because the component
was displayed to the user."*

The wrong uses, each with its replacement
([react.dev/learn/you-might-not-need-an-effect](https://react.dev/learn/you-might-not-need-an-effect)):

| Wrong | Right |
|---|---|
| effect that sets state from props | compute during render |
| effect that resets state when a prop changes | `key` on the component |
| effect that runs on a user action | put it in the event handler |
| chain of effects each triggering the next | one handler that computes the whole next state |
| effect that tells the parent state changed | call `onChange` in the same handler that called `setState` |
| effect that subscribes to an external store | `useSyncExternalStore` |
| effect that initialises the app on mount | module scope, or a `didInit` guard (effects run twice in dev StrictMode) |

```tsx
// wrong — resetting state with an effect
useEffect(() => { setComment('') }, [userId])

// right
<Profile userId={userId} key={userId} />
```

If you must fetch in an effect, guard the race:

```tsx
useEffect(() => {
  let ignore = false
  fetchResults(query).then((json) => { if (!ignore) setResults(json) })
  return () => { ignore = true }
}, [query])
```

**`useEffectEvent` is stable** (verified locally — unprefixed export, typed in
`@types/react/index.d.ts`). Use it to read a changing value from an Effect without making
the Effect re-run.

```tsx
// wrong — the effect reconnects whenever theme changes
useEffect(() => {
  const c = createConnection(roomId)
  c.on('connected', () => showToast('Connected!', theme))
  c.connect()
  return () => c.disconnect()
}, [roomId, theme])

// right
const onConnected = useEffectEvent(() => showToast('Connected!', theme))
useEffect(() => {
  const c = createConnection(roomId)
  c.on('connected', onConnected)
  c.connect()
  return () => c.disconnect()
}, [roomId])
```

Rules: only call it inside an Effect, only at the top level of a component or hook, never
pass it to a child, and **never put it in a dependency array** — its identity is
deliberately unstable.

### 3.3 Keys

**Key by stable identity, never by index, whenever the list can reorder, splice or filter.**
Why: React tracks state by position, so an index key hands item 3's DOM node and state to
whatever slides into slot 3.

```tsx
// wrong
{items.map((item, i) => <Row key={i} item={item} />)}

// right
{items.map((item) => <Row key={item.id} item={item} />)}
```

Never `key={Math.random()}` — it remounts everything every render and destroys any input
state inside. Keys are unique among siblings only, are not passed as props (pass the id
again if the child needs it), and must be stable across renders.

**Change a key deliberately to reset a subtree.** That is the idiomatic state reset.

### 3.4 Controlled vs uncontrolled

**Default to uncontrolled.** Why: fewer renders, less wiring, and the browser already does
the work. Go controlled only when you need per-keystroke behaviour — live validation,
formatting, mirroring the value elsewhere, conditionally disabling submit.

```tsx
// uncontrolled — read it at submit
<input name="title" defaultValue={post.title} />

// controlled — needs a synchronous onChange
<input value={title} onChange={(e) => setTitle(e.target.value)} />
```

Hard rules from [react.dev](https://react.dev/reference/react-dom/components/input): an
input cannot be both, and cannot switch between them over its lifetime. Normalise a
possibly-null value up front — `value={v ?? ''}` — so it never flips from `undefined` to a
string. Checkboxes read `e.target.checked`, not `.value`. A debounced or async `onChange`
breaks a controlled input.

### 3.5 Composition over prop explosion

**Give a component a slot before you give it another boolean.** Why: a `children`/slot prop
covers every future case; each boolean covers one and multiplies with the others.

```tsx
// wrong
<Card bordered padded elevated showHeader headerTitle="Agents" showAction actionLabel="New" />

// right
<Card>
  <CardHeader>
    <CardTitle>Agents</CardTitle>
    <Button size="sm">New</Button>
  </CardHeader>
</Card>
```

Where a real variant axis exists (visual look, size), model it as a cva variant with a
string union, not booleans — see [§4.3](#43-unions-over-boolean-flags). This repo's
primitives already do this; read `docs/components.md` §3 before adding one.

### 3.6 Context vs prop drilling

**Keep passing props.** Prop drilling is explicit and cheap, and even several levels of it
is not a problem worth solving. When the intermediate components don't use the data at all,
the fix is usually **composition** — extract a component and pass JSX as `children` — which
collapses the layers rather than routing around them
([kentcdodds.com/blog/prop-drilling](https://kentcdodds.com/blog/prop-drilling)).

Context earns its place for genuinely cross-cutting values: theme, current user, i18n, a
reducer several unrelated branches need. react.dev is blunt: *"Just because you need to pass
some props several levels deep doesn't mean you should put that information into context."*

Cost: every consumer below re-renders when the value changes. Only worth optimising when
the value changes often, has many consumers, and you have measured a problem — then split
state and dispatch into two contexts so dispatch-only consumers don't re-render.

In the App Router, a provider must be a Client Component that takes `children`, and should
wrap `{children}` as deep as possible, not `<html>`.

### 3.7 What React 19 added that you should actually use here

- **`ref` as a prop.** Write `function Input({ ref, ...props })`. No `forwardRef` in new code.
- **Ref cleanup functions.** A ref callback may return a cleanup. If it does, React stops
  calling it with `null` on unmount. This makes `ref={(el) => (instance = el)}` a type
  error — the implicit return is now meaningful.
- **`<Ctx value={…}>`** instead of `<Ctx.Provider value={…}>`.
- **`use()`** reads a promise or a context, and — unlike every other hook — may be called
  conditionally and after an early return. It cannot take a promise created during the same
  render.
- **`useActionState` / `useOptimistic` / `useFormStatus`.** `useFormStatus` lives in
  `react-dom` (verified locally), the other two in `react`.
- **Document metadata hoisting.** `<title>`, `<meta>`, `<link>` rendered anywhere get
  hoisted into `<head>`. In the App Router prefer the `metadata` export; this matters for
  client-rendered widgets.
- **`react-dom`'s `preload` / `preinit` / `preconnect` / `prefetchDNS`** for moving resource
  discovery earlier.
- **`useDeferredValue(value, initialValue)`** — the second argument is new.
- **`<Activity mode="hidden">`** keeps a subtree mounted with state intact while unmounting
  its effects and deferring its updates. Good for a tab or panel that should keep scroll
  position and form state. Stable in 19.2 (verified locally).
- **`<ViewTransition>`** is available at runtime via Next's bundled canary; see
  [§1.1](#11-the-react-that-actually-runs-is-not-the-one-in-packagejson) for the types
  caveat. It is activated by Transitions, `<Suspense>` and `useDeferredValue` — a plain
  `setState` does not trigger it, but a route navigation does.
- **StrictMode** now reuses the first render's `useMemo`/`useCallback` results on the
  double render, and double-invokes ref callbacks on mount.

---

## 4. TypeScript for components

### 4.1 Derive props from the element, don't retype them

**Use `React.ComponentProps<"tag">` (or `ComponentProps<typeof X>`) and extend it.** Why:
you get every native attribute, `ref`, `className`, `aria-*` and event handler for free, and
they stay correct when React's types change.

```tsx
// wrong — loses ref, aria-*, type, form, disabled, every data-* …
type ButtonProps = { className?: string; onClick?: () => void; children: ReactNode }

// right
import type { ComponentProps } from 'react'
type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants> & {
  asChild?: boolean
}
```

With React 19, `ComponentProps<'button'>` already includes `ref` — you do not need
`ComponentPropsWithRef`, and `ComponentPropsWithoutRef` is only for the rare case where you
want to exclude it.

To extend a Radix part, derive from the part itself:

```tsx
type DialogContentProps = ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}
```

### 4.2 Annotate boundaries, infer bodies

**Annotate what crosses a boundary — props, exported function signatures, module-level
constants that feed a type. Let everything inside infer.** Why: annotations at the edges
catch real mistakes; annotations on locals just go stale.

```tsx
// wrong — noise, and now two things to keep in sync
const items: Array<{ id: string; label: string }> = AGENTS.map(
  (a): { id: string; label: string } => ({ id: a.id, label: a.name }),
)

// right
const items = AGENTS.map((a) => ({ id: a.id, label: a.name }))
```

One exception worth making: annotate a function's **return type** when it is exported and
non-obvious, so a change inside the body surfaces at the call site rather than rippling.

### 4.3 Unions over boolean flags

**Model mutually exclusive states as a string union.** Why: booleans multiply into
impossible combinations that the type system will happily accept.

```tsx
// wrong — what does primary + destructive + ghost mean?
type Props = { primary?: boolean; destructive?: boolean; ghost?: boolean }

// right
type Props = { variant?: 'primary' | 'destructive' | 'ghost' }
```

For genuinely coupled props, use a discriminated union so the compiler enforces the pairing:

```tsx
type Props =
  | { as: 'link'; href: string }
  | { as: 'button'; onClick: () => void }
```

### 4.4 `VariantProps` with cva

`cva` gives you the runtime and the type from one definition. **Export the variants object
so both the component and its consumers can reach it.**

```tsx
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva('inline-flex items-center rounded-full', {
  variants: {
    variant: { default: 'bg-primary text-primary-foreground', outline: 'border' },
    size: { sm: 'h-5 px-2 text-xs', md: 'h-6 px-2.5 text-sm' },
  },
  defaultVariants: { variant: 'default', size: 'md' },
})

type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants>
```

`VariantProps` makes every variant key optional and typed to its literal keys. Note that a
variant with a `defaultVariants` entry is still typed optional — if a variant is genuinely
required, model it outside cva.

`compoundVariants` entries use `class` (or `className`) and apply only when **all** their
listed keys match.

### 4.5 `as const`

**Use `as const` on literal data you want narrowed.** Why: without it, `'sm'` widens to
`string` and stops matching a union.

```tsx
// wrong — SIZES[number] is string
const SIZES = ['sm', 'md', 'lg']

// right — SIZES[number] is 'sm' | 'md' | 'lg'
const SIZES = ['sm', 'md', 'lg'] as const
type Size = (typeof SIZES)[number]
```

This is the cheapest way to keep a mock-data table and its type in one place — common in
this repo's `src/lib/mock/`.

### 4.6 Avoiding `any`

`strict: true` is on. `any` disables checking at every call site the value reaches, so:

- **`unknown`** for a value whose shape you genuinely don't know — it forces a narrowing
  before use.
- **A generic** when the type flows through rather than being inspected.
- **`satisfies`** to check a literal against a type while keeping its narrow inferred type:
  ```ts
  const ROUTES = { home: '/', inbox: '/inbox' } satisfies Record<string, `/${string}`>
  // ROUTES.home is '/' not string
  ```
- **`never`** in a `default:` branch to make a non-exhaustive switch a compile error.

Casts (`as`) are assertions, not conversions. If you need one, add a comment saying why it
is safe.

---

## 5. Tailwind v4

Read `docs/components.md` for this repo's token rules and
`src/app/globals.css` / `src/design/brand/brand.css` for the actual theme. This section is
the general practice only.

### 5.1 CSS-first config

There is no `tailwind.config.js` and adding one will do nothing unless a stylesheet writes
`@config`. The theme is CSS:

```css
@import "tailwindcss";

@theme {
  --color-brand-500: oklch(0.72 0.11 178);
  --radius-bubble: 1.25rem;
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
}
```

**A `@theme` entry does two things**: it generates utilities in that namespace
(`bg-brand-500`, `rounded-bubble`, `ease-out-quart`) *and* emits the variable on `:root` so
you can use it in arbitrary values and inline styles.

| Namespace | Generates |
|---|---|
| `--color-*` | `bg-*`, `text-*`, `border-*`, `fill-*`, `ring-*`, … |
| `--font-*` | `font-*` (family) |
| `--text-*` | `text-*` (size) |
| `--font-weight-*` | `font-*` (weight) |
| `--tracking-*` / `--leading-*` | `tracking-*` / `leading-*` |
| `--radius-*` | `rounded-*` |
| `--shadow-*` | `shadow-*` |
| `--breakpoint-*` | `sm:` / `md:` / … |
| `--spacing` / `--spacing-*` | the whole spacing and sizing scale |
| `--ease-*` | `ease-*` |
| `--animate-*` | `animate-*` |

Reset a namespace with `--color-*: initial;`.

**`@theme inline` when the value is itself a variable that must resolve at use-site.** Why:
a plain `@theme` tries to resolve the value where it is declared; `inline` emits the
reference literally. This is exactly why `next/font` variables need it — they only exist on
`<html>`:

```css
@theme inline {
  --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
}
```

This repo also uses `@theme inline reference`, which pulls variables in for `@apply` and
variants without re-emitting them.

Other directives: `@utility` for a custom utility (it registers as a real utility, so every
variant works on it — unlike hand-written `@layer utilities` CSS); `@custom-variant` for a
new named variant; `@variant` to apply one inside a custom rule; `@plugin` for a legacy JS
plugin; `@source` to point the scanner at files it would otherwise skip.

### 5.2 Content detection

Detection is automatic and skips `.gitignore`d paths, `node_modules` and binaries. It
**fails on constructed class names** because it scans source as plain text:

```tsx
// wrong — Tailwind never sees "bg-red-500", the class does not exist in the CSS
<div className={`bg-${color}-500`} />

// right — full class strings, statically visible
const TONE = { error: 'bg-red-500', ok: 'bg-green-500' } as const
<div className={TONE[tone]} />
```

If you genuinely must generate names, `@source inline("…")` safelists them.

### 5.3 Semantic tokens over primitives

**Components consume semantic names (`bg-surface`, `text-foreground-low`), never primitives
(`bg-neutral-800`).** Why: the semantic layer is the only place a rebrand or a dark-mode
mapping has to change. This repo enforces it with `npm run brand:lint-tokens`; the token
sheet is `src/design/brand/brand.css`, light on `:root` and dark on `.dark`.

Dark mode in v4 defaults to `prefers-color-scheme`. Class-based toggling needs an explicit
variant — this repo declares `@custom-variant dark (&:is(.dark *));` in `globals.css` and
drives `.dark` with `next-themes`.

### 5.4 `cn()` and custom class groups

`cn()` is `twMerge(clsx(inputs))`. **Put the caller's `className` last.** Why: twMerge is
last-wins, so a `className` that isn't last cannot override the component's own classes.

```tsx
// wrong — caller's p-3 loses to the component's px-4 py-2
<button className={cn(className, buttonVariants({ variant }))} />

// right
<button className={cn(buttonVariants({ variant }), className)} />
```

**Register every custom utility that shares a Tailwind prefix as a class group.** This is a
bug this repo actually hit. twMerge only knows Tailwind's own class tables, so a custom
`@utility shadow-card` is invisible to it: `cn("shadow-card", "shadow-md")` kept *both*
classes and left the winner to stylesheet order. Worse, `text-label-12-caps` was read as a
*text colour*, so any following `text-foreground-low` silently deleted the typography role.

The fix, in `src/lib/utils.ts`:

```ts
const twMerge = extendTailwindMerge<"text-role">({
  extend: {
    classGroups: {
      "font-weight": ["font-strong"],
      "text-role": ["text-heading-lg", "text-label-12-caps", /* … */],
      shadow: ["shadow-edge", "shadow-card", "shadow-card-hover", /* … */],
      rounded: ["rounded-bubble", "rounded-hero", "rounded-squircle"],
    },
  },
})
```

Rules that fall out of it:

- Adding a custom `shadow-*` / `rounded-*` / `text-*` utility to the CSS is **half** the
  job. Register it in `src/lib/utils.ts` and add a case to `src/lib/utils.test.ts`.
- `extend` adds to Tailwind's defaults; `override` replaces them. Use `extend` unless you
  mean to discard Tailwind's own definitions.
- A utility that is not a colour but starts with `text-` needs its **own** group
  (`"text-role"` above), not the `text-color` group, or it will fight with colours.
- `conflictingClassGroups` expresses asymmetric cross-group conflicts (`{ px: ['pr','pl'] }`).
- Build the merge function **once at module scope**. `extendTailwindMerge` precomputes a
  large structure; calling it per render is a real cost. The resulting `twMerge` has a
  500-entry LRU cache and is fine to call per render.
- tailwind-merge 3.x targets Tailwind v4 class tables. *Flagged:* the compatibility note I
  found says v3 supports Tailwind 4.0–4.3, which covers 4.3.3, but I could not find a
  statement pinning 3.6.0 to 4.3.3 exactly. The repo's `utils.test.ts` is the real check.

### 5.5 Arbitrary values

**Arbitrary values are for one-offs. If the same one appears twice, promote it to `@theme`.**
Why: arbitrary values are literals baked into markup — no token pressure, no theming
indirection, a new generated rule per distinct value, and twMerge can only dedupe them
*within* one class group.

```tsx
// wrong — a magic number, twice, that dark mode cannot retarget
<div className="bg-[#1a1a1a] p-[13px]" />

// right
<div className="bg-surface p-3" />
```

Syntax notes: CSS variables use parens now (`bg-(--brand)`, `duration-(--duration-fast)`);
spaces inside arbitrary values are underscores (`grid-cols-[max-content_auto]`).

### 5.6 Breakpoints

**Style the small screen unmodified, add breakpoints upward.** Why: `sm:` means "at 640px
and wider", so an unprefixed utility is the mobile base, not a desktop default.

```tsx
// wrong — sm: does not mean "on small screens"
<div className="sm:flex-col flex-row" />

// right
<div className="flex-col sm:flex-row" />
```

Container queries are built in: `@container` on the parent, `@sm:` / `@max-md:` on children,
with named containers (`@container/main`, `@sm/main:…`). Prefer them when a component's
layout depends on its own box rather than the viewport.

Browser floor for v4: Chrome 111, Safari 16.4, Firefox 128 — it relies on cascade layers,
`@property` and `color-mix()`.

---

## 6. Radix and shadcn-style components

### 6.1 The unified package

```tsx
// wrong — the old one-package-per-primitive layout
import * as DialogPrimitive from '@radix-ui/react-dialog'

// right — verified locally against radix-ui@1.6.7
import { Dialog as DialogPrimitive } from 'radix-ui'
```

**Repo rule, stricter than the general one:** only files under `src/components/ui/` may
import `radix-ui` (also `cmdk` and `@xyflow/react`). A page that needs a Radix part gets it
through a primitive; if none wraps it, add one. Locked by
`src/components/components.test.ts`. See `docs/components.md` §1.

### 6.2 `asChild` and Slot

`asChild` tells a Radix part to render its child instead of its own element, merging props,
event handlers, refs and `className` onto it. Use it whenever the semantics of the element
should change — a trigger that is really a link, a card that is really a button.

```tsx
// wrong — a button inside a button
<Button><Link href="/inbox">Inbox</Link></Button>

// right — one <a> carrying the button's classes and behaviour
<Button asChild><Link href="/inbox">Inbox</Link></Button>
```

The implementation in a vendored primitive:

```tsx
import { Slot } from 'radix-ui'
const Comp = asChild ? Slot.Root : 'button'
```

How props merge: anything starting with `on` is **composed** (the child's handler runs, then
the slot's); everything else — `className`, `style`, `aria-*` — is merged onto the child,
with the child's own value winning.

Failure modes to avoid:

- **Exactly one child element.** A fragment or two siblings breaks prop distribution. If the
  primitive needs decorative siblings around the real child, wrap the real one:
  ```tsx
  <Comp {...props}>
    {leftIcon}
    <Slot.Slottable>{children}</Slot.Slottable>
    {rightIcon}
  </Comp>
  ```
- **A child that swallows props.** If the target component doesn't spread what it's given,
  Radix's injected handlers, ARIA attributes and ref never reach the DOM — and it fails
  silently, with no error, taking the accessibility with it.

With React 19's ref-as-prop, a plain function component that reads `ref` from its props
works as a Slot child — no `forwardRef`. `radix-ui@1.6.7` bundles `@radix-ui/react-slot@1.3.3`,
which reads `ref` from props first and only falls back to `element.ref`; earlier versions
threw *"Accessing element.ref was removed in React 19."* Radix's published examples still
show `forwardRef`, so they read older than the shipped code.

**Repo rule:** raw `<button>`, `<input>`, `<textarea>`, `<select>` and `<label>` are banned
outside `src/components/ui/`, with one exception — the direct child of an `asChild`
primitive. `components.test.ts` encodes exactly that shape.

### 6.3 Controlled vs uncontrolled Radix parts

**Leave a Radix part uncontrolled unless something outside it needs to read or set the
state.** Why: uncontrolled is one prop instead of three and cannot desync.

```tsx
// uncontrolled
<Dialog defaultOpen={false}>…</Dialog>

// controlled — only when a sibling, a URL param or a keyboard shortcut drives it
<Dialog open={open} onOpenChange={setOpen}>…</Dialog>
```

The pattern is consistent across parts: `value`/`defaultValue`/`onValueChange`,
`open`/`defaultOpen`/`onOpenChange`, `checked`/`defaultChecked`/`onCheckedChange`. Passing
both `value` and `defaultValue` is a bug.

### 6.4 What Radix gives you and what it doesn't

Free: focus management and focus trapping, escape and outside-click dismissal, roving
tabindex, `aria-expanded`/`aria-controls` wiring, portalling, scroll locking, typeahead in
menus, RTL.

Still yours:

- **`DialogTitle` is required.** Radix warns at runtime without one. If the design has no
  visible title, wrap it in `VisuallyHidden`, don't drop it.
- A `DialogDescription`, or `aria-describedby={undefined}` on `Content` to silence the
  warning deliberately.
- Accessible names for icon-only triggers ([§8](#8-accessibility-defaults)).
- Anything the design adds on top: your own focus-visible ring, your own motion.

### 6.5 Why vendoring beats installing

The components in `src/components/ui/` are source, not a dependency. That is the point:

- **The design system is the diff.** Restyling a primitive is an edit, not a theme-override
  fight with a library's specificity.
- **No version wall.** A Radix or React upgrade is a local fix, not a wait for a maintainer.
- **Readable.** An agent can read the whole component before changing it, which is why
  `docs/components.md` can enumerate every primitive and its slots.
- **Cost:** no upstream fixes arrive for free, so the repo carries the tests instead —
  `components.test.ts` is what keeps 29 hand-maintained primitives consistent.

The `shadcn` CLI can still scaffold a component, but treat its output as a draft: it emits
`lucide-react` imports, which this repo bans (`docs/brand/icons.md`, `icons.test.ts`).

---

## 7. Motion 13

### 7.1 Import shape and the client boundary

```tsx
// wrong
import { motion, AnimatePresence } from 'framer-motion'

// right — verified locally against motion@13.2.0
import { motion, AnimatePresence } from 'motion/react'
```

`motion` is the vanilla entry, `motion/react` the React one, `motion/react-m` the lighter
`m`-component entry used with `LazyMotion`, `motion/react-client` a server-safe entry.

Worth knowing so you don't chase a phantom bug: `motion/react` is literally a re-export of
`framer-motion` (the published `motion@13.2.0/dist/es/react.mjs` is `export * from
'framer-motion'` plus explicit `motion`/`m` bindings). So a stray `framer-motion` import is
the same runtime code, not a broken one — but it is off the documented path and has no
`/react` subpath. Write `motion/react` in new code and swap old imports when you touch them.

**Any file importing `motion/react` needs `"use client"`.** Why: the components use state,
effects and DOM measurement. Put the directive on the smallest leaf that animates, not on
the page — see [§2.1](#21-the-serverclient-boundary). If you only need `<motion.div>` markup
with no hooks, `import * as motion from "motion/react-client"` keeps the file a Server
Component.

**Bundle size, if it ever matters:** `LazyMotion` + the `m` components load features lazily
— `domAnimation` (~15kb: animations, variants, exit, hover/tap/focus) or `domMax` (~25kb:
adds drag and layout). `<LazyMotion strict>` throws if a full `motion.*` component slips in.
Only reach for this when the bundle is a measured problem; `motion.*` is simpler.

### 7.2 Animate cheap properties

**Animate `opacity` and transforms. Treat `width`, `height`, `top`, `left`, `margin` and
`padding` as off-limits.** Why: transforms and opacity are composited on the GPU without
touching layout; the others force layout and paint on every frame, for the animated element
*and* everything after it in flow.

```tsx
// wrong — layout thrash every frame
<motion.div animate={{ height: open ? 320 : 0 }} />

// right — transform only
<motion.div animate={{ scaleY: open ? 1 : 0 }} style={{ originY: 0 }} />
```

Motion writes `x`, `y`, `scale`, `rotate` as independent values and composes them into a
single `transform`, so you can animate them separately without fighting over one property.

### 7.3 The transform trap

This one has already shipped in this repo. Read it before writing any arbitrary
`transition-[…]`.

**Tailwind v4 compiles `scale-*`, `rotate-*` and `translate-*` to the standalone CSS
properties of the same name, not to `transform`.** Verified locally by compiling with
`tailwindcss@4.3.3`:

```css
/* scale-105 */
.scale-105    { --tw-scale-x: 105%; --tw-scale-y: 105%; scale: var(--tw-scale-x) var(--tw-scale-y); }
/* rotate-3 */
.rotate-3     { rotate: 3deg; }
/* translate-x-2 */
.translate-x-2 { --tw-translate-x: calc(var(--spacing) * 2); translate: var(--tw-translate-x) var(--tw-translate-y); }
/* skew-x-3 — this one DOES use transform */
.skew-x-3     { --tw-skew-x: skewX(3deg); transform: var(--tw-rotate-x,) … var(--tw-skew-x,) …; }
```

So a transition list that names `transform` animates **nothing** when the thing that moves
is a `scale-*` / `rotate-*` / `translate-*` utility. The element teleports, silently, with a
class list that reads as if it were animating.

```tsx
// wrong — transitions nothing; the panel teleports
<div className="translate-x-full transition-[transform,box-shadow] duration-300" />

// right — name the property that actually moves
<div className="translate-x-full transition-[translate,box-shadow] duration-300" />

// also right — the named utility already covers all four
<div className="translate-x-full transition-transform duration-300" />
```

The named utility is safe because Tailwind expands it (verified locally):

```css
.transition-transform { transition-property: transform, translate, scale, rotate; }
.transition-\[transform\] { transition-property: transform; }   /* ← the trap */
```

This repo found five shipped instances of the bug in an audit on 2026-09-10 and now has a
test for it: `src/components/components.test.ts`, `describe("transition property lists")`.
Read that test before writing an arbitrary `transition-[…]`; its comment is the fullest
account of the failure. Its known blind spot is a class string in one file overriding a
primitive's transition list defined in another.

Motion itself is unaffected — it writes `transform` directly — but the two can collide: a
Tailwind `scale-*` class and a Motion `scale` animation set *different* CSS properties on the
same element, and both apply. Pick one owner per element.

### 7.4 Transitions

Physical properties (`x`, `y`, `scale`, `rotate`) default to a **spring**; visual ones
(`opacity`, colours) default to a **tween** at 0.3s. Specify a spring by feel rather than by
physics:

```tsx
// readable: "settles in 0.4s with a small overshoot"
transition={{ type: 'spring', visualDuration: 0.4, bounce: 0.2 }}
```

`visualDuration` is time-to-settle before the bounce phase; `bounce` is ignored the moment
you set `stiffness`/`damping`/`mass`, so pick one vocabulary and stay in it. For a tween,
`ease-out` for entrances and anything the user triggered, `ease-in` for exits.

### 7.5 `AnimatePresence`

**Every direct child needs a stable, unique `key`, and the child must be the thing that
unmounts.** Why: `AnimatePresence` tracks children by key to know what left.

```tsx
<AnimatePresence mode="wait">
  {open && (
    <motion.div key="panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
  )}
</AnimatePresence>
```

`mode="sync"` (the default) runs enter and exit together; `mode="wait"` finishes the exit
first — right for a swap where both occupy the same slot; `mode="popLayout"` pops the
exiting element out of flow so siblings reflow immediately. Add `initial={false}` when
content present on first render should not animate in.

**The conditional must be inside `AnimatePresence`, not around it.** Why: if
`AnimatePresence` itself unmounts, there is nothing left to run the exit animation.

```tsx
// wrong — exit never plays
{open && <AnimatePresence><motion.div exit={{ opacity: 0 }} /></AnimatePresence>}

// right
<AnimatePresence>{open && <motion.div key="p" exit={{ opacity: 0 }} />}</AnimatePresence>
```

### 7.6 Layout animation costs

`layout` and `layoutId` are the most expensive things in the library: Motion measures the
element before and after, then FLIPs it with a scale correction. That means:

- **Children of a `layout` element need `layout` too**, or the parent's scale correction
  distorts them.
- **`layout="position"`** animates position only and skips the size distortion — usually
  what you want for text.
- **Border radius and box shadow distort** under scale correction unless animated as
  motion values.
- **`layoutDependency={value}`** skips the re-measure unless `value` changed. Use it when a
  `layout` element re-renders often for unrelated reasons.
- **`layoutScroll`** is needed on a scrollable ancestor, or measurements are taken against
  the wrong origin.
- Do not put `layout` on many elements at once, or on anything that changes every frame.

Cheap substitutes for expensive properties: `filter: drop-shadow()` instead of animating
`boxShadow`, `clipPath: inset()` instead of animating `borderRadius`, `scaleY` with a set
`originY` instead of `height`.

Prefer `layoutId` for one shared element morphing between two places. For everything else,
a plain transform animation is cheaper and more predictable. If the morph is across a route
navigation, React's `<ViewTransition>` may be the better tool
([§2](#2-nextjs-16-app-router), and `01-app/02-guides/view-transitions.md`).

### 7.7 Reduced motion

**Honour `prefers-reduced-motion`. It is not optional.** Why: vestibular disorders make
large motion genuinely painful, and the OS setting is the user telling you.

```tsx
// library-wide, in a client provider
<MotionConfig reducedMotion="user">{children}</MotionConfig>

// per component, when you need a different layout rather than no motion
const shouldReduce = useReducedMotion()
```

`reducedMotion="user"` disables transform and layout animations while keeping opacity and
colour, which is usually the right trade. In plain CSS the equivalent is Tailwind's
`motion-safe:` variant — this repo's press feedback is
`motion-safe:active:scale-(--scale-press)`, which is the pattern to copy.

### 7.8 Perf traps

- **Use a `MotionValue` for anything that changes every frame** (scroll, pointer). Motion
  writes it straight to the DOM without a React render. Putting scroll position in `useState`
  re-renders the tree 60 times a second.
- `useScroll` + `useTransform` for scroll-linked effects; `whileInView` with
  `viewport={{ once: true }}` for entrances, so they don't re-fire.
- Don't animate dozens of elements at once. Stagger a visible handful.
- Let Motion manage `will-change`. Setting it permanently on many elements costs memory and
  can disable subpixel text rendering.

---

## 8. Accessibility defaults

**Use the element that means what you mean.** Why: semantics carry keyboard behaviour,
focus order and screen-reader roles for free, and every ARIA workaround is a thing that can
drift.

```tsx
// wrong
<div onClick={submit}>Save</div>

// right
<button type="button" onClick={submit}>Save</button>
```

`<button>` for an action, `<a>`/`<Link>` for navigation, `<nav>`/`<main>`/`<aside>` for
regions, one `<h1>` and no skipped heading levels.

**Always set `type` on a `<button>` inside a form.** The default is `submit`.

**Give every icon-only control an accessible name, and hide the icon.** Why: without it a
screen reader announces "button" and nothing else.

```tsx
// wrong
<Button size="icon"><IconTrash /></Button>

// right
<Button size="icon" aria-label="Delete thread">
  <IconTrash aria-hidden="true" />
</Button>
```

Tabler does **not** add `aria-hidden` for you the way lucide did — you must write it. See
`docs/brand/icons.md`.

**Label every input.** A visible `<label htmlFor>` is best; `aria-label` when the design has
no visible label; `aria-labelledby` when existing text serves.

**Use `:focus-visible`, never `outline: none` alone.** Why: removing the outline without a
replacement makes the UI unusable by keyboard.

```tsx
// wrong
className="outline-none"

// right
className="outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
```

In Tailwind v4, `outline-hidden` (not `outline-none`) is the utility that suppresses the
outline while preserving the forced-colors fallback.

**Never let colour be the only signal.** Add an icon, a label, a shape or text weight
alongside it. A red dot and a green dot are the same dot to ~8% of men.

Other defaults: `alt=""` on decorative images and a real description otherwise;
`aria-live="polite"` on a region that announces async results; `lang` on `<html>`; visible
target of at least 24×24 CSS px, 44×44 for anything primarily touched; don't remove the
focus ring for mouse users by styling `:focus` instead of `:focus-visible`.

---

## 9. Performance

**Measure first.** `next build` no longer prints `size` / `First Load JS` — the docs say
those numbers were inaccurate under RSC and point at Lighthouse and real Core Web Vitals
instead (`01-app/02-guides/upgrading/version-16.md`). React 19.2 also adds two Chrome
DevTools performance tracks (Scheduler ⚛ and Components ⚛). In a prototype, the honest
answer is usually "this is not slow, move on."

In rough order of what actually matters here:

1. **Client bundle size, via the `"use client"` boundary.** The single biggest lever. One
   directive at the top of a page can pull the entire page's import graph into the browser.
2. **Layout shift.** Free to avoid, expensive to retrofit. Set `width`/`height` on images,
   reserve space for anything async, use skeletons that match the final size, and never
   animate layout properties ([§7.2](#72-animate-cheap-properties)).
3. **Prefetch and streaming.** `<Link>` prefetches automatically; a `loading.tsx` on a
   dynamic route is what makes that prefetch useful.
4. **Render-frequency bugs.** Scroll or pointer position in `useState`; a context value
   changing every keystroke with many consumers; an effect chain that renders three times
   per interaction. These are correctness problems that look like performance problems.
5. **Memoisation.** Last, and only with a measurement. `useMemo`/`useCallback` have a cost
   and React 19's compiler support (`reactCompiler: true`, stable but off by default in 16)
   is the proper answer if it becomes a real problem.

Free wins already in place: `next/font` self-hosts with no layout shift;
`optimizePackageImports` rewrites barrel imports per-icon and already lists
`@tabler/icons-react` by default (verified locally in
`node_modules/next/dist/server/config.js`), so `import { IconSearch } from "@tabler/icons-react"`
does not pull the whole set.

---

## 10. Testing with Vitest

`vitest.config.mts` runs `environment: "node"` over `src/**/*.test.ts`. There is no jsdom,
no React Testing Library, and no component rendering. That is a deliberate fit for a
prototype-heavy repo, not a gap.

### 10.1 What is worth testing here

**Test the things a screenshot can't catch and a type can't express:**

- **Pure helpers** — `cn()`, theme-route resolution, colour maths in `src/design/brand/`.
- **Content tables** — the mock data and copy that pages render, so a rename fails a test
  instead of shipping a blank panel.
- **Architecture rules** — see below.

**Don't** write component render tests for prototype UI. The proof for a clone is the
1456×868 pixel diff (`docs/clone-conventions.md`), not a DOM assertion that restates the
markup and breaks on every restyle.

### 10.2 The architecture-test pattern this repo uses

The distinctive pattern here: **read the source tree as text and assert rules about it.**
Seven such tests gate `npm test`. The shape:

```ts
import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const sources = read(walk(join(repo, 'src'), isSource))

it('imports radix-ui only under src/components/ui/', () => {
  const offenders = sources
    .filter(({ path, text }) => !inUi(path) && specifier('radix-ui').test(text))
    .map(({ path }) => path)
  expect(offenders).toEqual([])
})
```

**Why this works:** it encodes a convention that no type or linter expresses, it fails with
the offending file path, and it costs milliseconds. It is the only reason a rule like "no
raw `<button>` outside `ui/`" survives across dozens of pages and many agent sessions.

Conventions that make these tests good rather than annoying:

- **Collect offenders into an array and assert `toEqual([])`.** Why: the failure output
  names every violation at once, instead of stopping at the first.
- **Pass a message to `expect`** — `expect(offenders, offenders.join('\n')).toEqual([])` —
  so the failure explains the rule and the fix, not just the mismatch.
- **Strip comments before matching.** A rule that fires on prose in a comment trains people
  to delete the prose. `components.test.ts` has a `stripComments` that preserves line
  numbers so the message can cite one.
- **Add a sanity assertion** that the walk found files at all. Otherwise a broken glob makes
  every rule pass vacuously.
- **Write the "why" as a comment above the `describe`**, with the date and the incident.
  The transition-property test is the model: it explains the bug, the generated CSS, why the
  named utility is safe, and what the rule deliberately does *not* ban.
- **Allow-list by exact path, with a reason.** `components.test.ts` allows three raw buttons
  in the brand swatch page because they are motion specimens, and says so.

For globbing the source tree, Node's own `fs.globSync` is enough at this repo's size and
adds no dependency; `fast-glob` is measurably faster but only matters on a large tree. If
hand-rolled regex rules ever outgrow themselves,
[ArchUnitTS](https://github.com/LukasNiessen/ArchUnitTS) is the purpose-built version of
this pattern with Vitest support — worth knowing about, not worth adding today.

### 10.3 Mechanics, and what Vitest 4 changed

`describe` / `it` / `expect` are imported from `vitest`, not global. `npm test` is
`vitest run` (single pass); `npm run test:watch` watches. Resolve paths from the test file
with `new URL('./thing.css', import.meta.url)` rather than `process.cwd()`, so the test does
not depend on where it was invoked.

Vitest 4 changes that a stale recollection gets wrong:

- **`vitest.workspace.ts` and `defineWorkspace()` are gone.** Multi-project config moved to
  `test.projects` in the root config.
- **`poolOptions` is gone.** Pool settings are flat on `test`. `maxThreads`/`maxForks`
  became a single `maxWorkers`; `singleThread`/`singleFork` became
  `maxWorkers: 1, isolate: false`.
- **`vi.restoreAllMocks()` only restores `vi.spyOn` mocks now** — not `vi.fn()`, not
  `vi.mock()` automocks. Code that relied on it as a blanket reset will silently leak state
  between tests.
- **`mock.invocationCallOrder` starts at 1**, matching Jest.
- **Coverage**: `coverage.all` and `coverage.ignoreEmptyLines` removed; AST-aware V8
  remapping is now the only mode, not an experimental opt-in.
- **Reporters**: the `basic` reporter was removed (use `default` with `summary: false`);
  there is a new `tree` reporter.
- **Browser mode** graduated and its context import moved to `vitest/browser`; providers
  (`@vitest/browser-playwright` etc.) and coverage providers are separate packages pinned to
  the exact Vitest version.
- **`jsdom` and `happy-dom` are optional peers, not bundled.** Switching `environment` away
  from `node` means installing one.

Sources: [vitest.dev/blog/vitest-4](https://vitest.dev/blog/vitest-4),
[vitest.dev/guide/migration](https://vitest.dev/guide/migration/), plus the published
`vitest@4.1.11` peer-dependency metadata.

---

## Where the repo overrides the general practice

| General practice | This repo's rule | Owner |
|---|---|---|
| Import Radix wherever you need it | Only `src/components/ui/` may import `radix-ui`, `cmdk`, `@xyflow/react` | `docs/components.md` §1 |
| Use `<button>` / `<input>` freely | Banned outside `ui/`, except as the direct child of an `asChild` primitive | `docs/components.md` §1 |
| Any icon set | `@tabler/icons-react` only; `stroke`, not `strokeWidth`; explicit `aria-hidden` | `docs/brand/icons.md` |
| Tailwind colours as you like | No raw colours; semantic brand tokens only, checked by `npm run brand:lint-tokens` | `docs/components.md` §1 |
| Add a custom utility in CSS | Also register it as a tailwind-merge class group and test it | `src/lib/utils.ts`, `src/lib/utils.test.ts` |
| Invent styles | Copy Tailwind classes from the DOM dumps in `docs/reference/` | `docs/clone-conventions.md` |

---

## Things I could not verify

Listed so you check rather than act confidently on them.

- **tailwind-merge 3.6.0 ↔ tailwindcss 4.3.3 exact compatibility** — the published note
  covers Tailwind 4.0–4.3 as a range; nothing pins the patch versions. `src/lib/utils.test.ts`
  is the real check.
- **cva 0.7.1 vs the 1.0 beta feature diff** — 0.7.1 has no slots and no built-in
  tailwind-merge integration, which is why `cn()` exists; I could not get a quoted changelog.
- **Motion 12 → 13 behavioural changes** — the import shape and every export named here are
  verified locally against the installed package, but I did not read a v13 upgrade guide.
  Likewise, the spring-for-transforms default is confirmed as current behaviour, not traced
  to the release that introduced it.
- **`LayoutGroup`'s exact prop surface** — its existence and purpose are confirmed, the API
  page was not read. Check [motion.dev](https://motion.dev/docs/react) before relying on a
  specific prop.
- **`@radix-ui/react-slot` 1.3.3's React-19 ref fix** — corroborated from the issue and PR,
  not from the changelog text. The peer range (`^19.0`) and the bundled version are verified.
- **The exact default Tailwind colour ramp shift from v3's hex to v4's OKLCH** — the
  mechanism is documented, a per-colour diff is not.
- **React 19.3** exists (react.dev blog, 2026-09-09) and is newer than the 19.2.8 pinned
  here, while Next bundles a 19.3 canary. Nothing in this file is written against it.
