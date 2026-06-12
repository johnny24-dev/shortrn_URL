import { createHash } from "node:crypto";

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  generateResetToken,
  hashResetToken,
  isResetTokenExpired,
} from "@/server/password-reset/token";
import {
  consumePasswordResetConfirmRateLimit,
  consumePasswordResetRequestRateLimit,
} from "@/server/password-reset/rate-limit";

const consumeRateLimit = vi.hoisted(() => vi.fn());

vi.mock("@/server/abuse/rate-limit", () => ({
  consumeRateLimit,
}));

describe("password reset token helpers", () => {
  beforeEach(() => {
    consumeRateLimit.mockReset();
  });

  it("generates a url-safe one-time token", () => {
    expect(generateResetToken()).toMatch(/^[A-Za-z0-9_-]{32,}$/);
  });

  it("hashes tokens with sha256", () => {
    const expected = createHash("sha256").update("abc123").digest("hex");

    expect(hashResetToken("abc123")).toBe(expected);
  });

  it("treats token expiry as inclusive", () => {
    expect(
      isResetTokenExpired(
        new Date("2026-06-12T10:00:00Z"),
        new Date("2026-06-12T10:00:00Z"),
      ),
    ).toBe(true);
  });
});

describe("password reset rate limit helpers", () => {
  beforeEach(() => {
    consumeRateLimit.mockReset();
    consumeRateLimit.mockResolvedValue({});
  });

  it("applies separate request limits for email and IP", async () => {
    await consumePasswordResetRequestRateLimit({
      email: "User@Example.com",
      ipHash: "ip-hash",
      now: new Date("2026-06-12T00:00:00.000Z"),
    });

    expect(consumeRateLimit).toHaveBeenCalledTimes(2);
    expect(consumeRateLimit).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        key: "user@example.com",
        scope: "password-reset-request-email",
      }),
    );
    expect(consumeRateLimit).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        key: "ip-hash",
        scope: "password-reset-request-ip",
      }),
    );
  });

  it("applies a confirm limit for IP", async () => {
    await consumePasswordResetConfirmRateLimit({
      ipHash: "ip-hash",
      now: new Date("2026-06-12T00:00:00.000Z"),
    });

    expect(consumeRateLimit).toHaveBeenCalledTimes(1);
    expect(consumeRateLimit).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "ip-hash",
        scope: "password-reset-confirm-ip",
      }),
    );
  });
});
