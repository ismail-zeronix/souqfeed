import { defineConfig, configDefaults } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    // Other git worktrees (e.g. .worktrees/<branch>/) are separate working
    // trees with their own test runs — never run their tests from here.
    exclude: [...configDefaults.exclude, ".worktrees/**"],
  },
});
