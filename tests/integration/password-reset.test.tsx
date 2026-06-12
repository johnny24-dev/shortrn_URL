import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import LoginPage from "@/app/login/page";
import { hashIp } from "@/server/analytics/parser";

const requestPasswordReset = vi.hoisted(() => vi.fn());
const confirmPasswordReset = vi.hoisted(() => vi.fn());
const consumePasswordResetConfirmRateLimit = vi.hoisted(() => vi.fn());

vi.mock("@/components/auth/auth-form", () => ({
  AuthForm: () => <div data-testid="auth-form" />,
}));

vi.mock("@/server/password-reset/service", () => ({
  confirmPasswordReset,
  requestPasswordReset,
}));

vi.mock("@/server/password-reset/rate-limit", () => ({
  consumePasswordResetConfirmRateLimit,
}));

describe("login page password reset link", () => {
  it("links to the forgot password page and preserves the pending url", async () => {
    const html = renderToStaticMarkup(
      await LoginPage({
        searchParams: Promise.resolve({
          url: "https://example.com/dashboard?tab=links",
        }),
      }),
    );

    expect(html).toContain("Forgot password?");
    expect(html).toContain(
      'href="/forgot-password?url=https%3A%2F%2Fexample.com%2Fdashboard%3Ftab%3Dlinks"',
    );
  });
});

describe("password reset api routes", () => {
  it("requests a reset email and forwards request metadata", async () => {
    const { POST } = await import("@/app/api/password-reset/request/route");
    requestPasswordReset.mockResolvedValue({ sent: true });

    const response = await POST(
      new Request("http://localhost/api/password-reset/request", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "user-agent": "Mozilla/5.0",
          "x-forwarded-for": "203.0.113.10",
        },
        body: JSON.stringify({
          email: "User@Example.com",
        }),
      }),
    );

    expect(requestPasswordReset).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "User@Example.com",
        ipHash: hashIp("203.0.113.10", "ip-secret-secret"),
        userAgent: "Mozilla/5.0",
      }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("confirms a reset token and revokes stale sessions", async () => {
    const { POST } = await import("@/app/api/password-reset/confirm/route");
    confirmPasswordReset.mockResolvedValue({ ok: true });
    consumePasswordResetConfirmRateLimit.mockResolvedValue(undefined);

    const response = await POST(
      new Request("http://localhost/api/password-reset/confirm", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "203.0.113.11",
        },
        body: JSON.stringify({
          token: "reset-token",
          password: "new-password-123",
        }),
      }),
    );

    expect(consumePasswordResetConfirmRateLimit).toHaveBeenCalledWith(
      expect.objectContaining({
        ipHash: hashIp("203.0.113.11", "ip-secret-secret"),
      }),
    );
    expect(confirmPasswordReset).toHaveBeenCalledWith({
      token: "reset-token",
      password: "new-password-123",
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
