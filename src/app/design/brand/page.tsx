import type { CSSProperties, ReactNode } from "react";
import { ThemeToggle } from "./_design/theme-toggle";

// Token swatch page for the scoped Brand copy, ported from brand/src/app/page.tsx.
// Verification only: every token is rendered from the CSS variable itself
// (`style={{ background: "var(--color-tangerine-500)" }}`) because Tailwind
// cannot generate utilities for names that are not in Hyperagent's main theme
// yet (phase 2). Tailwind classes here are layout only (grid, gap, padding)
// plus one "scoping check" row that deliberately uses stock utilities.

const v = (name: string) => `var(--${name})`;

const STEPS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];
const NEUTRAL_STEPS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "925", "950", "975"];

const RAMPS: { name: string; note: string; steps: string[] }[] = [
  { name: "neutral", note: "sand · hue 100 · C ≤ 0.010 · 925 / 975 are Brand's dark sand-3 / sand-2", steps: NEUTRAL_STEPS },
  { name: "tangerine", note: "brand · hue 42 · peak C 0.20 @ 500", steps: STEPS },
  { name: "red", note: "destructive · hue 25 · peak C 0.16", steps: STEPS },
  { name: "green", note: "success · hue 158 · peak C 0.16", steps: STEPS },
  { name: "amber", note: "warning · hue 70 · peak C 0.16", steps: STEPS },
  { name: "blue", note: "info · hue 252 · peak C 0.16", steps: STEPS },
];

const TINTS = ["5", "7", "10", "12", "15", "20", "25", "40"];

type Pair = { label: string; bg: string; fg: string; hint: string; extra?: CSSProperties };
const PAIRS: Pair[] = [
  { label: "background / foreground", bg: "background", fg: "foreground", hint: "canvas + ink", extra: { border: `1px solid ${v("border")}` } },
  { label: "card / card-foreground", bg: "card", fg: "card-foreground", hint: "cards sit on the canvas colour", extra: { boxShadow: v("shadow-card") } },
  { label: "popover", bg: "popover", fg: "popover-foreground", hint: "", extra: { boxShadow: v("shadow-xl") } },
  { label: "surface-secondary", bg: "surface-secondary", fg: "foreground", hint: "“Ask me about” card, nav pill · sunken in dark" },
  { label: "surface-elevated", bg: "surface-elevated", fg: "foreground", hint: "composer, popovers", extra: { boxShadow: v("shadow-lg") } },
  { label: "surface-raised", bg: "surface-raised", fg: "foreground", hint: "hero backdrop start · a whisper above the canvas" },
  { label: "primary", bg: "primary", fg: "primary-foreground", hint: "ink button, not orange" },
  { label: "secondary", bg: "secondary", fg: "secondary-foreground", hint: "" },
  { label: "muted / muted-foreground", bg: "muted", fg: "muted-foreground", hint: "fg-mid" },
  { label: "foreground-low on background", bg: "background", fg: "foreground-low", hint: "captions, placeholders", extra: { border: `1px solid ${v("border")}` } },
  { label: "accent", bg: "accent", fg: "accent-foreground", hint: "hover fill" },
  { label: "chip", bg: "chip", fg: "chip-foreground", hint: "category chips, tabs" },
  { label: "brand-accent (graphical)", bg: "brand-accent", fg: "background", hint: "ring, selection, icons · 3:1 gate" },
  { label: "brand / brand-foreground", bg: "brand", fg: "brand-foreground", hint: "CTA fill, AA with white" },
  { label: "brand-subtle", bg: "brand-subtle", fg: "brand-subtle-foreground", hint: "tinted brand surface" },
  { label: "chat-bubble-user", bg: "chat-bubble-user", fg: "chat-bubble-user-foreground", hint: "", extra: { borderRadius: v("radius-bubble") } },
  { label: "chat-bubble-assistant", bg: "chat-bubble-assistant", fg: "chat-bubble-assistant-foreground", hint: "", extra: { borderRadius: v("radius-bubble") } },
  { label: "destructive", bg: "destructive", fg: "destructive-foreground", hint: "" },
  { label: "success", bg: "success", fg: "success-foreground", hint: "" },
  { label: "warning", bg: "warning", fg: "warning-foreground", hint: "" },
  { label: "info", bg: "info", fg: "info-foreground", hint: "" },
  { label: "sidebar", bg: "sidebar", fg: "sidebar-foreground", hint: "", extra: { border: `1px solid ${v("sidebar-border")}` } },
  { label: "sidebar-primary", bg: "sidebar-primary", fg: "sidebar-primary-foreground", hint: "" },
  { label: "sidebar-accent", bg: "sidebar-accent", fg: "sidebar-accent-foreground", hint: "" },
];

const CHART = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "chart-6"];
const CHART_SEQ = ["chart-seq-1", "chart-seq-2", "chart-seq-3", "chart-seq-4", "chart-seq-5"];
const MIND = ["novice", "skilled", "expert", "master", "sage", "legendary", "eternal"];

// --text-* tokens carry paired line-height / tracking / (for headings) weight.
function text(name: string, weight = false): CSSProperties {
  const s: CSSProperties = {
    fontSize: v(`text-${name}`),
    lineHeight: v(`text-${name}--line-height`),
    letterSpacing: v(`text-${name}--letter-spacing`),
  };
  if (weight) s.fontWeight = v(`text-${name}--font-weight`);
  return s;
}
const heading: CSSProperties = { fontFamily: v("font-heading") };

const TYPE: { label: string; style?: CSSProperties; className?: string; sample: string }[] = [
  { label: "display · heading", style: { ...text("display", true), ...heading }, sample: "Nir Eyal" },
  { label: "5xl · heading", style: { ...text("5xl", true), ...heading }, sample: "Ask me anything" },
  { label: "4xl · heading", style: { ...text("4xl", true), ...heading }, sample: "Ask me anything" },
  { label: "3xl · heading", style: { ...text("3xl", true), ...heading }, sample: "Dr. Ellen Langer" },
  { label: "2xl · heading", style: { ...text("2xl", true), ...heading }, sample: "Dr. Ellen Langer" },
  { label: "xl · heading", style: text("xl", true), sample: "Ask me about" },
  { label: "heading-lg (class)", className: "text-heading-lg", sample: "Guy Kawasaki" },
  { label: "heading-display (class)", className: "text-heading-display", sample: "Token swatches" },
  { label: "lg · 400", style: text("lg"), sample: "I write about psychology, technology, and business and I teach and consult on behavior design." },
  { label: "base · 400", style: text("base"), sample: "How do I apply the Hook Model to my product or app?" },
  { label: "md · 400 (13px metadata)", style: { ...text("md"), color: v("foreground-low") }, sample: "Updated 2 hours ago · 3 collaborators" },
  { label: "sm · 500", style: { ...text("sm"), fontWeight: v("font-weight-medium") }, sample: "Productivity · Behavior design · Habits" },
  { label: "sm · book 450", style: { ...text("sm"), fontWeight: v("font-weight-book") }, sample: "Share profile" },
  { label: "xs · 400", style: { ...text("xs"), color: v("foreground-low") }, sample: "By using this service, you agree to the Terms of Service." },
  { label: "label-14 mono", className: "text-label-14-mono", sample: "npm run brand:check-contrast" },
  { label: "label-12 mono", className: "text-label-12-mono", sample: "oklch(0.6700 0.2022 42) · tangerine-500 · 1,234.56" },
  { label: "label-12 caps", className: "text-label-12-caps", sample: "Suggested questions" },
];

const FONTS: { label: string; token: string; sample: string; extra?: CSSProperties }[] = [
  { label: "font-sans · Geist", token: "font-sans", sample: "The quick brown fox jumps over the lazy dog · 0123456789" },
  { label: "font-heading · Geist at 450", token: "font-heading", sample: "The quick brown fox jumps over the lazy dog", extra: { fontWeight: 450 } },
  { label: "font-mono · Geist Mono", token: "font-mono", sample: "const brand = oklch(0.67 0.2022 42);" },
];
const WEIGHTS = ["normal", "book", "medium", "semibold", "bold"];

const RADII: { name: string; size: string }[] = [
  { name: "xs", size: "size-14" }, { name: "sm", size: "size-14" }, { name: "md", size: "size-14" }, { name: "lg", size: "size-14" },
  { name: "xl", size: "size-14" }, { name: "2xl", size: "size-14" }, { name: "3xl", size: "size-14" }, { name: "4xl", size: "size-14" },
  { name: "5xl", size: "size-20" }, { name: "bubble", size: "size-14" }, { name: "hero", size: "h-20 w-44" }, { name: "full", size: "size-14" },
];

const SHADOWS = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl", "edge", "card", "card-hover", "avatar", "rim", "hero"];

const DURATIONS: [string, string, string][] = [
  ["duration-exit", "90ms", "Brand --duration-exit · anything leaving"],
  ["duration-instant", "100ms", "toggles, press"],
  ["duration-enter", "140ms", "Brand --duration-enter · menus, popovers appearing"],
  ["duration-fast", "150ms", "buttons, inputs · ease-out-quart"],
  ["duration-normal", "200ms", "chips, tabs, dialog scrim · ease-out"],
  ["duration-move", "220ms", "Brand --duration-move · layout / position shifts"],
  ["duration-slow", "300ms", "hover shadows · product ceiling"],
  ["duration-reveal", "400ms", "icon / composer reveals · ease-out-expo"],
  ["duration-slide", "480ms", "large transform moves · ease-out-quint"],
  ["duration-entrance", "500ms", "staggered first-paint entrances · ease-out-expo"],
  ["duration-stagger", "80ms", "delay between staggered siblings"],
];

const EASINGS: [string, string, string][] = [
  ["ease", "ease", "hover, colour"],
  ["ease-out", "cubic-bezier(0, 0, 0.2, 1)", "chips, tiles, generic exit / enter"],
  ["ease-out-quart", "cubic-bezier(0.165, 0.84, 0.44, 1)", "buttons, inputs (150ms)"],
  ["ease-out-quint", "cubic-bezier(0.22, 1, 0.36, 1)", "large transform moves (480ms)"],
  ["ease-out-layout", "cubic-bezier(0.23, 1, 0.32, 1)", "composer padding / layout shifts (250ms)"],
  ["ease-out-expo", "cubic-bezier(0.16, 1, 0.3, 1)", "reveals + entrances (400–500ms)"],
  ["ease-in-out", "cubic-bezier(0.4, 0, 0.2, 1)", "on-screen movement"],
  ["ease-linear", "linear", "spinners, typing dots"],
];

const INTERACTION: [string, string, string][] = [
  ["scale-press", "0.98", ":active on buttons / chips"],
  ["scale-press-icon", "0.95", ":active on round icon buttons"],
  ["scale-enter", "0.95", "enter-from scale · never scale(0)"],
  ["translate-enter", "16px", "enter-from rise"],
];

const Z: [string, string, string][] = [
  ["z-sticky", "40", "fixed header, bottom nav pill"],
  ["z-scrim", "50", "dialog backdrop"],
  ["z-dropdown", "100", ""],
  ["z-modal", "200", ""],
  ["z-tooltip", "300", ""],
  ["z-toast", "400", ""],
];

const CONTAINERS: [string, string, string][] = [
  ["container-content", "42rem · 672px", "profile column"],
  ["container-wide", "47rem · 752px", "composer, hero backdrop, questions panel"],
  ["container-nav", "28rem · 448px", "bottom nav pill"],
];

const SPACING: [string, string, string][] = [
  ["spacing-group", "12px", "rows inside one block, chip rows"],
  ["spacing-stack", "24px", "between blocks inside an answer"],
  ["spacing-section", "40px", "between answer sections / turns"],
];

const label12: CSSProperties = { color: v("foreground-low") };
const hairline: CSSProperties = { borderColor: v("border-subtle") };

function SectionTitle({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-4 border-b pb-2" style={hairline}>
      <h2 style={text("xl", true)}>{children}</h2>
      {sub ? <span style={{ ...text("xs"), ...label12 }}>{sub}</span> : null}
    </div>
  );
}

function Row({ name, value, use }: { name: string; value: string; use: string }) {
  return (
    <li className="grid grid-cols-[11rem_minmax(5rem,auto)_1fr] gap-3 py-2">
      <span className="text-label-14-mono">{name}</span>
      <span className="text-label-14-mono" style={{ color: v("muted-foreground") }}>{value}</span>
      <span style={{ color: v("muted-foreground") }}>{use}</span>
    </li>
  );
}

export default function BrandTokensPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 pb-24 pt-12">
      <header className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="mb-2" style={{ ...text("sm"), fontWeight: v("font-weight-medium"), color: v("muted-foreground") }}>
            Brand · design tokens · scoped copy
          </p>
          <h1 style={{ ...text("display", true), ...heading, color: v("foreground") }}>Token swatches</h1>
          <p className="mt-3 max-w-2xl" style={{ ...text("lg"), color: v("muted-foreground") }}>
            Primitives, semantic pairs, type, radius, shadow, motion and layout. Source of truth is{" "}
            <code className="text-label-14-mono">src/design/brand/brand.css</code>, applied only inside{" "}
            <code className="text-label-14-mono">.theme-brand</code>.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <section className="mb-14">
        <SectionTitle sub="50 → 950 · one shared lightness ramp">Primitive ramps</SectionTitle>
        <div className="space-y-4">
          {RAMPS.map((ramp) => (
            <div key={ramp.name}>
              <div className="mb-1.5 flex items-baseline gap-3">
                <span style={{ ...text("sm"), fontWeight: v("font-weight-medium") }}>{ramp.name}</span>
                <span style={{ ...text("xs"), ...label12 }}>{ramp.note}</span>
              </div>
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${ramp.steps.length}, minmax(0, 1fr))` }}>
                {ramp.steps.map((step) => (
                  <div key={step} className="flex flex-col gap-1">
                    <div
                      className="h-10 border"
                      style={{ background: v(`color-${ramp.name}-${step}`), borderRadius: v("radius-md"), ...hairline }}
                    />
                    <span className="text-label-12-mono" style={label12}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div>
            <div className="mb-1.5 flex items-baseline gap-3">
              <span style={{ ...text("sm"), fontWeight: v("font-weight-medium") }}>tint</span>
              <span style={{ ...text("xs"), ...label12 }}>
                neutral-500 (light) / neutral-600 (dark) at 5–40% · the fill that works on both themes
              </span>
            </div>
            <div className="grid grid-cols-8 gap-1">
              {TINTS.map((pct) => (
                <div key={pct} className="flex flex-col gap-1">
                  <div className="h-10" style={{ background: v(`color-tint-${pct}`), borderRadius: v("radius-md") }} />
                  <span className="text-label-12-mono" style={label12}>tint-{pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-14">
        <SectionTitle sub="every pair passes WCAG AA · npm run brand:check-contrast">Semantic pairs</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PAIRS.map((p) => (
            <div
              key={p.label}
              className="flex min-h-24 flex-col justify-between p-4"
              style={{ background: v(p.bg), color: v(p.fg), borderRadius: v("radius-2xl"), ...p.extra }}
            >
              <span style={{ ...text("sm"), fontWeight: v("font-weight-medium") }}>{p.label}</span>
              <span className="opacity-80" style={text("xs")}>{p.hint || "Aa · The quick brown fox"}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3" style={{ ...text("sm"), color: v("muted-foreground") }}>
          <span className="rounded-full border px-3 py-1" style={{ borderColor: v("border") }}>border</span>
          <span className="rounded-full border px-3 py-1" style={{ borderColor: v("border-subtle") }}>border-subtle</span>
          <span className="rounded-full border px-3 py-1" style={{ borderColor: v("border-loud") }}>border-loud</span>
          <span className="rounded-full border px-3 py-1" style={{ borderColor: v("input") }}>input</span>
          <span className="rounded-full px-3 py-1" style={{ outline: `2px solid ${v("ring")}`, outlineOffset: 2 }}>ring</span>
          <span className="focus-ring rounded-full px-3 py-1" tabIndex={0} style={{ background: v("chip") }}>focus-ring (tab to me)</span>
          <span className="px-1" style={{ background: v("selection"), color: v("selection-foreground") }}>selection</span>
          <span className="rounded-full px-3 py-1" style={{ background: v("primary"), color: v("foreground-inverted") }}>
            foreground-inverted on primary
          </span>
          <span className="relative overflow-hidden rounded-full border px-3 py-1" style={hairline}>
            <i className="absolute inset-0" style={{ background: v("scrim") }} />
            <span className="relative rounded-full px-2" style={{ background: v("overlay"), color: v("foreground") }}>overlay on scrim</span>
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3" style={{ ...text("sm"), color: v("muted-foreground") }}>
          <span className="flex items-center gap-1.5">
            {CHART.map((c) => <i key={c} className="size-3 rounded-full" style={{ background: v(c) }} />)}
            chart-1…6
          </span>
          <span className="flex items-center gap-1.5">
            {CHART_SEQ.map((c) => <i key={c} className="h-3 w-5" style={{ background: v(c), borderRadius: v("radius-xs") }} />)}
            chart-seq-1…5
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-3 w-10 rounded-full" style={{ background: v("chart-track") }} />
            track
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-px w-10" style={{ background: v("chart-grid") }} />
            grid
          </span>
          <span className="flex items-center gap-1.5">
            <i className="w-10 border-t border-dashed" style={{ borderColor: v("chart-target") }} />
            target
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-3 w-10" style={{ background: v("chart-band") }} />
            band
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4" style={{ ...text("sm"), color: v("muted-foreground") }}>
          <span className="text-label-12-mono">mind score tiers</span>
          {MIND.map((tier) => (
            <span key={tier} className="flex items-center gap-1.5">
              <i className="size-3.5 rounded-full" style={{ background: v(`mind-${tier}`) }} />
              {tier}
            </span>
          ))}
          <span style={text("xs")}>graphic use only (icon beside the “31K Mind” label)</span>
        </div>
      </section>

      <section className="mb-14">
        <SectionTitle sub="Geist · Geist Mono · Vercel's published roles on the Tailwind names">Type scale</SectionTitle>
        <div className="divide-y" style={{ borderColor: v("border-subtle") }}>
          {TYPE.map((t) => (
            <div key={t.label} className="grid gap-2 py-4 sm:grid-cols-[11rem_1fr] sm:items-baseline" style={hairline}>
              <span className="text-label-12-mono" style={label12}>{t.label}</span>
              <p className={`text-balance ${t.className ?? ""}`} style={t.style}>{t.sample}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <SectionTitle sub="--font-sans · --font-heading (both Geist) · --font-mono · weights 400 / 450 / 500 / 600">Font families and weights</SectionTitle>
        <div className="divide-y" style={{ borderColor: v("border-subtle") }}>
          {FONTS.map((f) => (
            <div key={f.token} className="grid gap-2 py-4 sm:grid-cols-[14rem_1fr] sm:items-baseline" style={hairline}>
              <span className="text-label-12-mono" style={label12}>{f.label}</span>
              <p style={{ fontFamily: v(f.token), ...text("lg"), ...f.extra }}>{f.sample}</p>
            </div>
          ))}
          <div className="grid gap-2 py-4 sm:grid-cols-[14rem_1fr] sm:items-baseline" style={hairline}>
            <span className="text-label-12-mono" style={label12}>font-weight-*</span>
            <p className="flex flex-wrap gap-x-6 gap-y-1" style={text("lg")}>
              {WEIGHTS.map((w) => (
                <span key={w} style={{ fontWeight: v(`font-weight-${w}`) }}>{w}</span>
              ))}
            </p>
          </div>
        </div>
      </section>

      <section className="mb-14 grid gap-10 md:grid-cols-2">
        <div>
          <SectionTitle sub="--radius: 10px · multiplicative">Radius</SectionTitle>
          <div className="flex flex-wrap items-end gap-4">
            {RADII.map((r) => (
              <div key={r.name} className="flex flex-col items-center gap-1.5">
                <div className={r.size} style={{ background: v("chip"), borderRadius: v(`radius-${r.name}`) }} />
                <span className="text-label-12-mono" style={label12}>{r.name}</span>
              </div>
            ))}
            <div className="flex flex-col items-center gap-1.5">
              <div className="squircle size-20" style={{ background: v("chip") }} />
              <span className="text-label-12-mono" style={label12}>squircle</span>
            </div>
          </div>
        </div>
        <div>
          <SectionTitle sub="stacked umbra + inset highlight">Shadows</SectionTitle>
          <div className="grid grid-cols-3 gap-5 p-5" style={{ background: v("surface-secondary"), borderRadius: v("radius-3xl") }}>
            {SHADOWS.map((s) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <div
                  className="flex h-16 w-full items-center justify-center"
                  style={{ background: v("surface-elevated"), borderRadius: v("radius-2xl"), boxShadow: v(`shadow-${s}`) }}
                />
                <span className="text-label-12-mono" style={label12}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-14">
        <SectionTitle sub="product UI ≤ 300ms · reveals and entrances only above">Motion</SectionTitle>
        <div className="grid gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <ul className="divide-y" style={{ ...text("sm"), borderColor: v("border-subtle") }}>
              {DURATIONS.map(([name, value, use]) => <Row key={name} name={name} value={value} use={use} />)}
            </ul>
            <ul className="mt-6 divide-y" style={{ ...text("sm"), borderColor: v("border-subtle") }}>
              {EASINGS.map(([name, value, use]) => <Row key={name} name={name} value={value} use={use} />)}
            </ul>
            <ul className="mt-6 divide-y" style={{ ...text("sm"), borderColor: v("border-subtle") }}>
              {INTERACTION.map(([name, value, use]) => <Row key={name} name={name} value={value} use={use} />)}
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              className="h-10 rounded-(--radius-4xl) bg-(--primary) px-4 text-(--primary-foreground) transition-[background-color,transform] duration-(--duration-fast) ease-(--ease-out-quart) hover:bg-(--color-neutral-800) motion-safe:active:scale-(--scale-press) dark:hover:bg-(--color-neutral-200)"
              style={{ ...text("sm"), fontWeight: v("font-weight-medium") }}
            >
              Press me (150ms quart-out)
            </button>
            <button
              type="button"
              className="h-10 rounded-full bg-(--chip) px-4 text-(--chip-foreground) transition-[background-color,color,transform] duration-(--duration-normal) ease-(--ease-out) hover:bg-(--accent) hover:text-(--accent-foreground) motion-safe:active:scale-(--scale-press)"
              style={{ ...text("sm"), fontWeight: v("font-weight-medium") }}
            >
              Chip (200ms ease-out)
            </button>
            <button
              type="button"
              className="h-10 rounded-full bg-(--brand) px-4 text-(--brand-foreground) shadow-(--shadow-sm) transition-[box-shadow,transform] duration-(--duration-slow) ease-(--ease-out) hover:shadow-(--shadow-md) motion-safe:active:scale-(--scale-press)"
              style={{ ...text("sm"), fontWeight: v("font-weight-medium") }}
            >
              Ask (brand CTA)
            </button>
            <div className="flex items-center gap-1 self-center py-2" aria-label="typing indicator">
              {[0, 150, 300].map((delay) => (
                <i
                  key={delay}
                  className="size-1.5 rounded-full"
                  style={{ background: v("foreground"), animation: v("animate-typing-dot"), animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
            <div className="flex items-center gap-3 self-center">
              <div className="skeleton h-4 w-32" aria-label="skeleton" />
              <svg viewBox="0 0 40 40" className="size-10" aria-label="ring-draw">
                <circle cx="20" cy="20" r="16" fill="none" stroke={v("chart-track")} strokeWidth="4" />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke={v("brand-accent")}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="100.5"
                  transform="rotate(-90 20 20)"
                  style={{ "--ring-from": "100.5", "--ring-to": "28", animation: v("animate-ring-draw") } as CSSProperties}
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-14 grid gap-10 md:grid-cols-2">
        <div>
          <SectionTitle sub="--container-* · --spacing-* · --blur-glass">Layout and spacing</SectionTitle>
          <div className="space-y-2">
            {CONTAINERS.map(([name, value, use]) => (
              <div key={name}>
                <div className="h-3" style={{ maxWidth: v(name), background: v("color-tint-20"), borderRadius: v("radius-full") }} />
                <div className="mt-1 flex gap-3" style={{ ...text("xs"), ...label12 }}>
                  <span className="text-label-12-mono">{name}</span>
                  <span>{value} · {use}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-end gap-4">
            {SPACING.map(([name, value, use]) => (
              <div key={name} className="flex flex-col gap-1">
                <div className="w-14" style={{ height: v(name), background: v("brand-accent"), borderRadius: v("radius-xs") }} />
                <span className="text-label-12-mono" style={label12}>{name}</span>
                <span style={{ ...text("xs"), ...label12 }}>{value} · {use}</span>
              </div>
            ))}
          </div>
          <div className="relative mt-5 h-16 overflow-hidden" style={{ borderRadius: v("radius-2xl") }}>
            <div className="absolute inset-0 grid grid-cols-11">
              {STEPS.map((s) => <i key={s} style={{ background: v(`color-tangerine-${s}`) }} />)}
            </div>
            <div
              className="absolute inset-x-4 top-3 flex h-10 items-center px-4"
              style={{
                background: "color-mix(in oklab, var(--surface-elevated) 60%, transparent)",
                backdropFilter: `blur(${v("blur-glass")})`,
                borderRadius: v("radius-full"),
                boxShadow: v("shadow-xs"),
                ...text("sm"),
                fontWeight: v("font-weight-medium"),
              }}
            >
              blur-glass · 12px
            </div>
          </div>
        </div>
        <div>
          <SectionTitle sub="Brand's ladder, kept verbatim">Z-index</SectionTitle>
          <ul className="divide-y" style={{ ...text("sm"), borderColor: v("border-subtle") }}>
            {Z.map(([name, value, use]) => <Row key={name} name={name} value={value} use={use} />)}
          </ul>
          <div className="mt-6 genui-prose" style={{ maxWidth: v("container-content") }}>
            <h3>genui-prose</h3>
            <p>
              The unbubbled answer body: Geist at the published metrics, hairline dividers, <a href="#top">underlined links</a>,{" "}
              <code>inline code</code> on a tint and <strong>medium-weight emphasis</strong>.
            </p>
            <blockquote>Serif is reserved for display headings and pull quotes.</blockquote>
          </div>
        </div>
      </section>

      <section className="mb-14">
        <SectionTitle sub="stock Tailwind utilities re-themed by the scope · these should show sand, not gray">Scoping check</SectionTitle>
        <div className="grid grid-cols-11 gap-1">
          {["bg-neutral-50", "bg-neutral-100", "bg-neutral-200", "bg-neutral-300", "bg-neutral-400", "bg-neutral-500", "bg-neutral-600", "bg-neutral-700", "bg-neutral-800", "bg-neutral-900", "bg-neutral-950"].map((cls, i) => (
            <div key={cls} className="flex flex-col gap-1">
              <div className={`${cls} h-8 rounded-md border`} style={hairline} />
              <span className="text-label-12-mono" style={label12}>{STEPS[i]}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xl">
          text-xl via Tailwind → 20 / 26 / 450 / -0.02em inside the scope
        </p>
        <p className="mt-1 rounded-2xl bg-red-600 px-3 py-1 text-sm text-white">
          bg-red-600 rounded-2xl via Tailwind → Brand red-600 (#bc4441) at 18px
        </p>
      </section>
    </main>
  );
}
