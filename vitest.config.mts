import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// The suite reads the brand token sheet and the theme wiring as text and
// calls pure helpers; no DOM and no React, so the node environment is enough.
//
// `@/` resolves the way tsconfig's `paths` and Next resolve it. Without it a
// module under test may only import its neighbours by relative path, which is
// a rule nothing states and nothing enforces: the file typechecks, builds and
// runs, and only the suite fails, on the first source file a test reaches that
// imports the way the rest of the codebase does.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
