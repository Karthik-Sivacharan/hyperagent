import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

// hyperagent.com loads Geist + Geist Mono through next/font/google and its
// display face, Season Sans (variable, 300–900), through next/font/local.
// The woff2 in ./fonts is the one the site serves (docs/reference/fonts).
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
    // The dashboard is pinned to its dark, neutral palette (what the live
    // account renders). Drop `dark` from <html> or `palette-neutral` from
    // <body> to see the warm light / warm dark palettes the site also ships.
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${seasonSans.variable}`}
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <body className="palette-neutral antialiased">
        <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
