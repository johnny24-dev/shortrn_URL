import { NextResponse } from "next/server";

import { UnauthorizedError, requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shortUrlForSlug } from "@/lib/paths";
import { generateQrPngBuffer } from "@/server/qr/service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;

    const link = await prisma.shortLink.findFirst({
      where: { id, userId },
      select: { slug: true },
    });

    if (!link) {
      return new NextResponse("Not found", { status: 404 });
    }

    const png = await generateQrPngBuffer(shortUrlForSlug(link.slug));

    return new NextResponse(new Uint8Array(png), {
      headers: {
        "Content-Disposition": `attachment; filename="${link.slug}.png"`,
        "Content-Type": "image/png",
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    throw error;
  }
}
