import path from "node:path";

import { AliasOptions } from "vite";

export const aliasSharedConfig: AliasOptions = {
  "@": path.resolve(__dirname, "src"),
  "@main": path.resolve(__dirname, "src/main"),
  "@preload": path.resolve(__dirname, "src/preload"),
  "@renderer": path.resolve(__dirname, "src/renderer"),
};
