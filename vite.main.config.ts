import { defineConfig } from "vite";
import { resolve } from "node:path";

import { sharedConfig } from "./vite.config";

// https://vitejs.dev/config
// Output ESM so main.js is valid with package.json "type": "module"
export default defineConfig({
  resolve: sharedConfig,
  build: {
    lib: {
      entry: resolve(__dirname, "src/main/main.ts"),
      fileName: () => "main.js",
      formats: ["es"],
    },
  },
});
