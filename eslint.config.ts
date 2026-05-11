import * as js from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import * as pluginReact from "eslint-plugin-react";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores([
    "**/.vite/",
    "**/docs/*",
    "postcss.config.mjs",
    "**/*.js",
    "src/@types/*.d.ts",
    "**/.worktrees/",
  ]),
  {
    basePath: "./",
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...vitest.environments.env.globals,
      },
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
  tseslint.configs.eslintRecommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
]);
