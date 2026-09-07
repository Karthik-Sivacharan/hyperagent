"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

// Light/dark switch for the Brand token swatch page, ported from
// brand/src/app/_design/theme-toggle.tsx. The app themes itself through
// next-themes on <html>; this switch keeps a second, LOCAL theme for the
// swatch page so the sheet can be inspected in either mapping whatever the
// app-level choice: a `dark` class on the page wrapper (brand.css's `.dark`
// rule re-maps the tokens for that subtree, and `dark:` utilities follow
// through `@custom-variant dark (&:is(.dark *))`), remembered in
// localStorage, with the OS preference as the first-visit default.
//
// The store is read through useSyncExternalStore so the server snapshot
// ("light") survives hydration and the client value is applied in the very
// next render: no hydration mismatch, no setState inside an effect.

type Theme = "light" | "dark";
const STORAGE_KEY = "brand-theme";

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const media = window.matchMedia?.("(prefers-color-scheme: dark)");
  window.addEventListener("storage", onChange);
  media?.addEventListener("change", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
    media?.removeEventListener("change", onChange);
  };
}

function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // storage unavailable (private mode, blocked): fall through to the OS
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function writeTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // storage unavailable: the choice still applies for this page view
  }
  listeners.forEach((notify) => notify());
}

const serverTheme = (): Theme => "light";
const noop = () => () => {};

export function useBrandTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme, serverTheme);
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  return { theme, mounted, setTheme: writeTheme };
}

/** The swatch page wrapper: flips its own `dark` class and paints itself from
 *  the tokens (`bg-background text-foreground`) so the local theme shows even
 *  when <html> carries the other one. */
export function BrandThemeShell({ className, children }: { className?: string; children: ReactNode }) {
  const { theme } = useBrandTheme();
  return (
    <div className={[theme === "dark" ? "dark" : "", "bg-background text-foreground", className ?? ""].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}

// Renders a neutral placeholder label until mounted so the server and client
// markup agree (the theme is client-only). The control is the brand chip
// button at the 40px size with the swatch page's 16px padding; `aria-pressed`
// names the dark state for assistive tech, and the two resets keep the chip
// fill in that state (the chip variant would otherwise paint it as ink).
export function ThemeToggle() {
  const { theme, mounted, setTheme } = useBrandTheme();
  const isDark = mounted && theme === "dark";

  return (
    <Button
      type="button"
      variant="chip"
      size="lg"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
      className="px-4 hover:text-accent-foreground aria-pressed:bg-chip aria-pressed:text-chip-foreground"
    >
      <span aria-hidden className="size-2.5 rounded-full bg-(--brand-accent)" />
      {mounted ? (isDark ? "Dark" : "Light") : "Theme"}
    </Button>
  );
}
