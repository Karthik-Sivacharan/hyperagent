import { Geist, Geist_Mono } from "next/font/google";

// The brand runs on Geist: Geist Sans for prose, headings, labels and
// controls, Geist Mono only for code, commands, paths and short identifiers
// (Vercel's published typography system, docs/brand/design.md §4). Both come
// from next/font/google at module scope; each loader exposes the variable
// that brand.css's font stacks consume (--font-geist-sans, --font-geist-mono).
// Put `brandFontClassName` on <html> so the variables are defined where the
// stacks read them.

export const brandGeistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

export const brandGeistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

/** Both `.variable` classes, for <html>. */
export const brandFontClassName = [brandGeistSans.variable, brandGeistMono.variable].join(" ");
