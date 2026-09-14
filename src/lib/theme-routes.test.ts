import { describe, expect, it } from "vitest";

import { forcedThemeFor } from "./theme-routes";

describe("forcedThemeFor", () => {
  it("forces light on the landing page", () => {
    expect(forcedThemeFor("/landing")).toBe("light");
  });

  it("forces light on anything below the landing page", () => {
    expect(forcedThemeFor("/landing/anything")).toBe("light");
  });

  it("leaves every other route to the visitor's choice", () => {
    for (const pathname of ["/", "/threads/new", "/teams", "/signup", "/landingpage"]) {
      expect(forcedThemeFor(pathname)).toBeUndefined();
    }
  });

  it("forces nothing before the pathname is known", () => {
    expect(forcedThemeFor(null)).toBeUndefined();
  });
});
