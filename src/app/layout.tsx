import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { TooltipProvider } from "@/components/ui/tooltip";
import { brandFontClassName } from "@/design/brand/fonts";
import "./globals.css";
import "@/design/brand/brand.css";

// hyperagent.com loads Geist + Geist Mono through next/font/google and its
// display face, Season Sans (variable, 300–900), through next/font/local.
// The woff2 in ./fonts is the one the site serves (docs/reference/fonts).
// Phase 2 adds the brand faces (Inter, PythiaType, Newsreader, Geist Mono)
// through `brandFontClassName`; both sets stay loaded while the two skins
// coexist.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const seasonSans = localFont({
  src: "./fonts/SeasonSansVF.woff2",
  variable: "--font-season-sans",
  weight: "300 900",
  display: "swap",
  adjustFontFallback: "Arial",
});

export const metadata: Metadata = {
  title: "Hyperagent",
  description: "Hyperagent dashboard.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Phase 2: `theme-brand` on <body> re-themes the whole app with the brand
    // tokens (src/design/brand/brand.css); the brand is light-canonical, and
    // `dark` on <html> switches to its dark mapping. The Hyperagent palettes
    // stay in globals.css for side-by-side comparison: swap `theme-brand` for
    // `palette-neutral` here and add `dark` to <html> to see the phase-1 clone.
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${seasonSans.variable} ${brandFontClassName}`}
      suppressHydrationWarning
    >
      <body className="theme-brand antialiased">
        <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
