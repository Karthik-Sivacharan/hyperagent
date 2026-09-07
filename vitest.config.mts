import { defineConfig } from "vitest/config";

// The suite reads the brand token sheet and the theme wiring as text and
// calls pure helpers; no DOM and no React, so the node environment is enough.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
