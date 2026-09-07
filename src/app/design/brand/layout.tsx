import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BrandThemeShell } from "./_design/theme-toggle";

// brand.css is imported once, by the root layout, and its tokens are the
// app's `:root` (dark mapping on `.dark`). This layout only adds the swatch
// page's own light/dark wrapper, which flips a local `dark` class so the
// sheet can be inspected in either mapping regardless of the app-level theme.

export const metadata: Metadata = {
  title: "Brand tokens",
  description: "The Brand design tokens the app runs on: every ramp, semantic pair, type style, radius, shadow and motion token.",
};

export default function BrandDesignLayout({ children }: { children: ReactNode }) {
  return (
    <BrandThemeShell className="flex min-h-full flex-1 flex-col">
      {children}
    </BrandThemeShell>
  );
}
