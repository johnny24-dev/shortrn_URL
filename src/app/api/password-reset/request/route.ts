import { NextResponse } from "next/server";
import { z } from "zod";

import { extractClickMetadata } from "@/server/analytics/parser";
import { requestPasswordReset } from "@/server/password-reset/service";
import { env } from "@/lib/env";

const requestSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request details" }, { status: 400 });
  }

  try {
    const metadata = extractClickMetadata(request.headers, env.IP_HASH_SECRET);

    await requestPasswordReset({
      email: parsed.data.email,
      ipHash: metadata.ipHash,
      userAgent: metadata.userAgent,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "Rate limit exceeded") {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }

    throw error;
  }
}
