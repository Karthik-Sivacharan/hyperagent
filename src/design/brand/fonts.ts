import { Geist_Mono, Newsreader } from "next/font/google";
import localFont from "next/font/local";

// Mirrors the loaders in brand/src/app/layout.tsx. Brand ships InterVariable
// (body, OFL — self-hosted because Google Fonts' Inter build ignores the `cv11`
// alternate the system enables, which made every text run ~0.5% narrower than
// the brand site), PythiaType SemiBold (serif display, proprietary — the file in
// ./fonts is Brand's own, used only for the Brand work-trial prototype; do
// not redistribute) and Geist Mono. Newsreader remains the serif fallback face;
// see docs/brand/design.md §4.
//
// Each loader exposes a CSS variable that brand.css's font stacks consume
// (--font-inter, --font-pythia, --font-newsreader, --font-geist-mono). Put
// `brandFontClassName` on the same element as `theme-brand` so the variables
// are defined where the stacks read them.

export const brandInter = localFont({
  src: [
    { path: "./fonts/InterVariable.woff2", style: "normal" },
    { path: "./fonts/InterVariable-Italic.woff2", style: "italic" },
  ],
  weight: "100 900",
  variable: "--font-inter",
  display: "swap",
  adjustFontFallback: "Arial",
});

export const brandNewsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  style: ["normal", "italic"],
  axes: ["opsz"],
});

export const brandPythia = localFont({
  src: "./fonts/PythiaType-SemiBold.woff2",
  variable: "--font-pythia",
  weight: "600",
  style: "normal",
  display: "swap",
  fallback: ["Newsreader", "ui-serif", "Georgia", "serif"],
});

export const brandGeistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

/** All four `.variable` classes, in Brand's `<html className>` order. */
export const brandFontClassName = [
  brandInter.variable,
  brandPythia.variable,
  brandNewsreader.variable,
  brandGeistMono.variable,
].join(" ");
