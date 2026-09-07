import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { brandFontClassName } from "@/design/brand/fonts";
import "./globals.css";
import "@/design/brand/brand.css";

// Fonts: Geist and Geist Mono (src/design/brand/fonts.ts) are the only faces
// the app loads. hyperagent.com's display face (Season Sans) is no longer
// shipped; the phase-1 comparison switch falls back to Geist for it.

export const metadata: Metadata = {
  title: "Hyperagent",
  description: "Hyperagent dashboard.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Phase 2: `theme-brand` on <body> re-themes the whole app with the brand
    // tokens (src/design/brand/brand.css). The brand is light-canonical;
    // next-themes puts `dark` on <html> for its dark mapping (chosen from the
    // account menu, remembered in localStorage, "system" follows the OS). The
    // Hyperagent palettes stay in globals.css for side-by-side comparison:
    // swap `theme-brand` for `palette-neutral` here to see the phase-1 clone.
    <html lang="en" className={brandFontClassName} suppressHydrationWarning>
      <body className="theme-brand antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
