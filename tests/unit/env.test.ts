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
    });

    expect(env.APP_BASE_URL).toBe("http://localhost:3000");
  });

  it("rejects missing required values", () => {
    expect(() => parseEnv({})).toThrow();
  });
});
