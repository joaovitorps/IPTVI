import { defineConfig } from "vite";
import { resolve } from "node:path";
import { sharedConfig } from "./vite.config";
// https://vitejs.dev/config
// Renderer is an app build with index.html as entry (Electron Forge Vite plugin)
export default defineConfig({
  root: resolve(__dirname, "src/renderer"),
  resolve: sharedConfig,
});
