import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

export default defineConfig([
  globalIgnores([".vite"]),
  {
    basePath: "./",
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    linterOptions: {
      reportUnusedDisableDirectives: "warn",
      reportUnusedInlineConfigs: "warn",
    },
    rules: {
      "@typescript-eslint/array-type": "error",
    },
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],
]);
