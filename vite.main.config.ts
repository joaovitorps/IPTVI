import { defineConfig } from "vite";

import { resolve } from "node:path";

import { aliasSharedConfig } from "./vite.shared";

export default defineConfig({
  resolve: {
    alias: aliasSharedConfig,
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/main/main.ts"),
      // Output ESM so main.js is valid with package.json "type": "module"
      fileName: () => "main.js",
      formats: ["es"],
    },
  },
});
