"use client";

import { usePathname } from "next/navigation";
import { ThemeProvider, type ThemeProviderProps } from "next-themes";

import { forcedThemeFor } from "@/lib/theme-routes";

// next-themes for the whole app, plus one thing: a route whose design has a
// single theme (src/lib/theme-routes.ts) is forced into it while it is open.
// Forcing never writes the stored choice, so leaving the route brings the
// visitor's theme back. The force has to live on this root provider: a
// nested next-themes provider renders its children and ignores its props.
export function AppThemeProvider({ forcedTheme, ...props }: ThemeProviderProps) {
  const pathname = usePathname();
  return <ThemeProvider {...props} forcedTheme={forcedThemeFor(pathname) ?? forcedTheme} />;
}
