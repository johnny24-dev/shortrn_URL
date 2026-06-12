import { NextResponse } from "next/server";
import { z } from "zod";

import { UnauthorizedError, requireUserId } from "@/lib/auth";
import { deleteShortLink, updateShortLink } from "@/server/links/service";

const updateSchema = z.object({
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
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

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;
    const parsed = updateSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid link details" },
        { status: 400 },
      );
    }

    const link = await updateShortLink(id, userId, {
      title: parsed.data.title,
      description: parsed.data.description,
      isActive: parsed.data.isActive,
      expiresAt: parseOptionalDate(parsed.data.expiresAt),
    });

    return NextResponse.json({ link });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error instanceof Error && error.message === "Link not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (
      error instanceof Error &&
      error.message === "Invalid expiration date"
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    throw error;
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;

    await deleteShortLink(id, userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error instanceof Error && error.message === "Link not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    throw error;
  }
}
