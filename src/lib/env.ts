import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(16),
  APP_BASE_URL: z.string().url(),
  IP_HASH_SECRET: z.string().min(16),
  EMAIL_PROVIDER: z.enum(["resend", "postmark"]).optional(),
  MAIL_FROM: z.string().min(3).optional(),
  RESEND_API_KEY: z.string().optional(),
  POSTMARK_API_TOKEN: z.string().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

export function parseEnv(
  input: NodeJS.ProcessEnv | Record<string, unknown>,
): AppEnv {
  return envSchema.parse(input);
}

export const env = parseEnv(process.env);
