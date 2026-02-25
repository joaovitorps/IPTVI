import path from "node:path";

export const sharedConfig = {
  alias: {
    "@": path.resolve(__dirname, "src"),
    "@main": path.resolve(__dirname, "src/main"),
    "@preload": path.resolve(__dirname, "src/preload"),
    "@renderer": path.resolve(__dirname, "src/renderer"),
  },
};
