import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Other git worktrees (e.g. .worktrees/<branch>/) are separate working
    // trees with their own lint runs — never lint into them from here.
    ".worktrees/**",
  ]),
  // Must stay last: disables formatting-related rules Prettier owns.
  prettierConfig,
]);

export default eslintConfig;
