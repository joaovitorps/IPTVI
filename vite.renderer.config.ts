import { defineConfig } from "vite";
import { resolve } from "node:path";

// https://vitejs.dev/config
export default defineConfig({
  root: resolve(__dirname, "src/renderer"),
});
