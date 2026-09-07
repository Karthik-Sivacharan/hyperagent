import { describe, expect, it } from "vitest";
import { cn } from "./utils";

// The brand's `cn()`: tailwind-merge extended with the `font-strong` weight and
// with the typography role classes registered as their own group.

describe("cn()", () => {
  it("lets the later stock utility win a conflict", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("treats font-strong as a weight, so it conflicts with the stock weights", () => {
    expect(cn("font-medium", "font-strong")).toBe("font-strong");
    expect(cn("font-strong", "font-semibold")).toBe("font-semibold");
  });

  it("keeps a typography role class next to a text colour", () => {
    expect(cn("text-label-12-caps", "text-foreground-low")).toBe("text-label-12-caps text-foreground-low");
  });

  it("lets one typography role replace another", () => {
    expect(cn("text-heading-lg", "text-label-12-caps")).toBe("text-label-12-caps");
  });
});
