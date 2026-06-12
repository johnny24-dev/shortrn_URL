import { NextResponse } from "next/server";
import { z } from "zod";

import { UnauthorizedError, requireUserId } from "@/lib/auth";
import { consumeRateLimit } from "@/server/abuse/rate-limit";
import { createShortLink, listLinks } from "@/server/links/service";

const createSchema = z.object({
  originalUrl: z.string().min(1),
  customSlug: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
});

function parseOptionalDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid expiration date");
  }

  return date;
}

export async function GET() {
  try {
    const userId = await requireUserId();
    const links = await listLinks(userId);

    return NextResponse.json({ links });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const parsed = createSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid link details" },
        { status: 400 },
      );
    }

    await consumeRateLimit({
      key: userId,
      scope: "link-create",
      limit: 20,
      windowMs: 60 * 60 * 1000,
    });

    const link = await createShortLink({
      userId,
      originalUrl: parsed.data.originalUrl,
      customSlug: parsed.data.customSlug,
      title: parsed.data.title,
      description: parsed.data.description,
      expiresAt: parseOptionalDate(parsed.data.expiresAt),
    });

    return NextResponse.json({ link }, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error instanceof Error && error.message === "Slug already exists") {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (error instanceof Error && error.message === "Rate limit exceeded") {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }

    if (
      error instanceof Error &&
      (error.message === "URL must include http:// or https://" ||
        error.message === "URL is invalid" ||
        error.message === "Only http and https URLs are allowed" ||
        error.message === "Destination URL is blocked" ||
        error.message ===
          "Slug can only contain letters, numbers, hyphens, and underscores" ||
        error.message === "Invalid expiration date")
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    throw error;
  }
}
