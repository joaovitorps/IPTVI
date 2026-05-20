import tsconfigPaths from "vite-tsconfig-paths";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    exclude: [...configDefaults.exclude, "**/.worktrees/**"],
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
  },
});
