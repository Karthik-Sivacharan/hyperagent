import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/design/brand/brand.css";
import { brandFontClassName } from "@/design/brand/fonts";
import { BrandThemeShell } from "./_design/theme-toggle";

// The only place the scoped Brand sheet is imported (phase 1). Everything
// under /design/brand renders inside a `.theme-brand` wrapper that also
// carries the next/font variable classes the token stacks read.

export const metadata: Metadata = {
  title: "Brand tokens",
  description: "Scoped copy of the Brand design tokens: every ramp, semantic pair, type style, radius, shadow and motion token.",
};

export default function BrandDesignLayout({ children }: { children: ReactNode }) {
  return (
    <BrandThemeShell className={`${brandFontClassName} flex min-h-full flex-1 flex-col`}>
      {children}
    </BrandThemeShell>
  );
}
