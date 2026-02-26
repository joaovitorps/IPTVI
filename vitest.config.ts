import { defineConfig } from "vitest/config";

import { aliasSharedConfig } from "./vite.shared";

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: aliasSharedConfig,
  },
});
