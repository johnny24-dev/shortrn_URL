import { describe, expect, it, vi } from "vitest";

import { createMailProvider } from "@/server/mail/provider";
import { buildPasswordResetEmail } from "@/server/mail/reset-email";

describe("buildPasswordResetEmail", () => {
  it("renders the reset url in text and html output", () => {
    const email = buildPasswordResetEmail({
      to: "user@example.com",
      resetUrl: "http://localhost:3000/reset-password?token=abc",
    });

    expect(email.subject).toContain("Reset your password");
    expect(email.text).toContain("http://localhost:3000/reset-password?token=abc");
    expect(email.html).toContain("http://localhost:3000/reset-password?token=abc");
  });
});

describe("createMailProvider", () => {
  it("sends reset email via Resend", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn(),
      text: vi.fn(),
    });

    const provider = createMailProvider({
      provider: "resend",
      apiKey: "resend-test-key",
      from: "Shortly <noreply@example.com>",
      fetchImpl,
    });

    await provider.send({
      to: "user@example.com",
      subject: "Reset your password",
      text: "Reset link",
      html: "<p>Reset link</p>",
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("sends reset email via Postmark", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn(),
      text: vi.fn(),
    });

    const provider = createMailProvider({
      provider: "postmark",
      apiKey: "postmark-test-token",
      from: "Shortly <noreply@example.com>",
      fetchImpl,
    });

    await provider.send({
      to: "user@example.com",
      subject: "Reset your password",
      text: "Reset link",
      html: "<p>Reset link</p>",
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.postmarkapp.com/email",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });
});
