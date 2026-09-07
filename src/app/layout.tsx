import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { brandFontClassName } from "@/design/brand/fonts";
import "./globals.css";
import "@/design/brand/brand.css";

// Fonts: Geist and Geist Mono (src/design/brand/fonts.ts) are the only faces
// the app loads. hyperagent.com's display face (Season Sans) is not shipped;
// `font-display` and `text-logo` resolve to Geist (src/app/globals.css).

export const metadata: Metadata = {
  title: "Hyperagent",
  description: "Hyperagent dashboard.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The brand tokens (src/design/brand/brand.css) are the app's only
    // palette: light on `:root`, the dark mapping on `.dark`, which
    // next-themes puts on <html> (chosen from the account menu, remembered in
    // localStorage, "system" follows the OS).
    <html lang="en" className={brandFontClassName} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
