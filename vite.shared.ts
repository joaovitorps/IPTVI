import { resolve } from "node:path";
import { AliasOptions } from "vite";

export const aliasSharedConfig: AliasOptions = {
  "@": resolve(__dirname, "src"),
  "@main": resolve(__dirname, "src/main"),
  "@preload": resolve(__dirname, "src/preload"),
  "@renderer": resolve(__dirname, "src/renderer"),
};
