import { defineConfig } from "vite";

import { aliasSharedConfig } from "./vite.shared";

export default defineConfig({
  resolve: {
    alias: aliasSharedConfig,
  },
});
