import { describe, expect, it } from "vitest";
import { cn } from "./utils";

// The brand's `cn()`: tailwind-merge extended with the `font-strong` weight,
// with the typography role classes registered as their own group, and with
// the brand's named shadows and radii in the stock `shadow` / `rounded` groups.

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

  it("treats the brand shadows as shadows, so the later one wins either way", () => {
    expect(cn("shadow-edge", "shadow-md")).toBe("shadow-md");
    expect(cn("shadow-md", "shadow-edge")).toBe("shadow-edge");
    expect(cn("shadow-card", "shadow-none")).toBe("shadow-none");
    expect(cn("shadow-card", "shadow-card-hover")).toBe("shadow-card-hover");
  });

  it("keeps a brand shadow under a different modifier", () => {
    expect(cn("shadow-card", "hover:shadow-card-hover", "max-sm:shadow-none")).toBe(
      "shadow-card hover:shadow-card-hover max-sm:shadow-none",
    );
  });

  it("treats the brand radii as radii, so the later one wins either way", () => {
    expect(cn("rounded-bubble", "rounded-lg")).toBe("rounded-lg");
    expect(cn("rounded-lg", "rounded-bubble")).toBe("rounded-bubble");
    expect(cn("rounded-3xl", "rounded-hero")).toBe("rounded-hero");
  });
});
