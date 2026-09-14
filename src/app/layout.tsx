import type { Metadata } from "next";
import { AppThemeProvider } from "@/components/app/theme-provider";
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
    //
    // The app DEFAULTS TO DARK: someone with no stored choice gets `.dark`,
    // whatever their OS prefers. `defaultTheme` outranks the OS here — only
    // the menu's explicit "System" item follows it — so `enableSystem` stays
    // on to keep that third choice working. This is the app's default only;
    // `:root` is still the light mapping and `.dark` still only re-maps it.
    //
    // One exception: a route listed in src/lib/theme-routes.ts (the
    // /landing marketing page) is forced light while it is open, through
    // AppThemeProvider, without touching the stored choice.
    <html lang="en" className={brandFontClassName} suppressHydrationWarning>
      <body className="antialiased">
        <AppThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}
