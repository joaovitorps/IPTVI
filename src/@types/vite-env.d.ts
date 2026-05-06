/// <reference types="vite/client" />

interface ViteTypeOptions {
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_APP_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
