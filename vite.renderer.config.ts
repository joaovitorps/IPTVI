import { resolve } from "node:path";
import { defineConfig } from "vite";

import { aliasSharedConfig } from "./vite.shared";

export default defineConfig({
  root: resolve(__dirname, "src/renderer"),
  resolve: {
    alias: aliasSharedConfig,
  },
});
