import "dotenv/config";
import z from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  STORE_ENCRYPTION_KEY: z.string(),
});

const envParse = envSchema.safeParse(process.env);

if (!envParse.success) {
  const message = "❌ Environment variables incorrectly set!";
  console.error(message, z.treeifyError(envParse.error));
  throw new Error(message);
}

export const env = envParse.data;
