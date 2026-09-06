"use client";

import * as React from "react";
import { Phone } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/design/brand/utils";

export type CallButtonProps = Omit<React.ComponentProps<typeof Button>, "children" | "size" | "variant" | "aria-label"> & {
  /** Who picks up — "Call Nir". The button is icon-only, so this is its whole accessible name. */
  "aria-label": string;
};

/**
 * Call — the brand site's own door to talking instead of typing, in the round
 * icon-only form its chat and train composers use (the /kian profile composer
 * wears the same green as a labelled pill). One look everywhere it appears
 * here: the coach rail beside the coach's name, the coach strip, and inside
 * the "Something else" composer of a coach question.
 *
 * Solid `bg-success` on purpose: the owner already knows what a green phone
 * button does, so the meaning is kept rather than re-taught in ink — and green
 * never competes with the ink primary or the brand CTA, since neither is a
 * phone. 44px (`size-11`) over the Button's 40px icon size for the touch
 * target. The glyph takes `success-foreground`: white on `green-700` in light,
 * near-ink on `green-500` in dark — the pair `scripts/check-contrast.mjs`
 * gates at AA.
 */
export function CallButton({ className, type = "button", ...props }: CallButtonProps) {
  return (
    <Button type={type} size="icon" data-slot="call-button" className={cn("size-11 bg-success text-success-foreground hover:bg-success/90", className)} {...props}>
      <Phone aria-hidden className="size-5" />
    </Button>
  );
}
