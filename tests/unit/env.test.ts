import { describe, expect, it } from "vitest";
import { parseEnv } from "@/lib/env";

describe("parseEnv", () => {
  it("accepts required app environment", () => {
    const env = parseEnv({
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/shorten_url",
      NEXTAUTH_URL: "http://localhost:3000",
      NEXTAUTH_SECRET: "secret-secret-secret",
      APP_BASE_URL: "http://localhost:3000",
      IP_HASH_SECRET: "ip-secret-secret",
      EMAIL_PROVIDER: "resend",
      MAIL_FROM: "Shortly <noreply@example.com>",
      RESEND_API_KEY: "re_test_key",
    });

    expect(env.EMAIL_PROVIDER).toBe("resend");
    expect(env.APP_BASE_URL).toBe("http://localhost:3000");
  });

  it("accepts postmark mail configuration", () => {
    const env = parseEnv({
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/shorten_url",
      NEXTAUTH_URL: "http://localhost:3000",
      NEXTAUTH_SECRET: "secret-secret-secret",
      APP_BASE_URL: "http://localhost:3000",
      IP_HASH_SECRET: "ip-secret-secret",
      EMAIL_PROVIDER: "postmark",
      MAIL_FROM: "Shortly <noreply@example.com>",
      POSTMARK_API_TOKEN: "postmark-test-token",
    });

    expect(env.EMAIL_PROVIDER).toBe("postmark");
  });

  it("rejects missing required values", () => {
    expect(() => parseEnv({})).toThrow();
  });
});
