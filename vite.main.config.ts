import { resolve } from "node:path";
import { defineConfig } from "vite";

import { aliasSharedConfig } from "./vite.shared";

export default defineConfig({
  resolve: {
    alias: aliasSharedConfig,
  },
  build: {
    lib: {
      entry: {
        main: resolve(__dirname, "src/main/main.ts"),
        streamParser: resolve(__dirname, "src/main/stream-parser.ts"),
      },
      // Output ESM so main.js is valid with package.json "type": "module"
      fileName: (_format, entryName) => `${entryName}.js`,
      formats: ["es"],
    },
    rollupOptions: {
      // Ensure external dependencies aren't bundled into the JS
      external: [
        "electron",
        "node:child_process",
        "electron-store",
        "ffmpeg-static",
        "@ffprobe-installer/ffprobe",
      ],
    },
  },
});
