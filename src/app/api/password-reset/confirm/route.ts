import { NextResponse } from "next/server";
import { z } from "zod";

import { hashIp } from "@/server/analytics/parser";
import { consumePasswordResetConfirmRateLimit } from "@/server/password-reset/rate-limit";
import { confirmPasswordReset } from "@/server/password-reset/service";
import { env } from "@/lib/env";

const confirmSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const parsed = confirmSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid reset details" },
      { status: 400 },
    );
  }

  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp =
      forwardedFor?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip");

    if (!clientIp) {
      return NextResponse.json({ error: "Missing client IP" }, { status: 400 });
    }

    await consumePasswordResetConfirmRateLimit({
      ipHash: hashIp(clientIp, env.IP_HASH_SECRET),
    });
    await confirmPasswordReset(parsed.data);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "Rate limit exceeded") {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }

    if (
      error instanceof Error &&
      error.message === "Invalid or expired reset token"
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    throw error;
  }
}
