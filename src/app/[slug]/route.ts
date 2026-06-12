import { NextResponse } from "next/server";

import { recordClickBestEffort } from "@/server/analytics/service";
import { resolveRedirect } from "@/server/redirect/service";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const resolution = await resolveRedirect(slug);

  if (resolution.status === "not_found") {
    return new NextResponse("Link not found", { status: 404 });
  }

  if (resolution.status === "inactive") {
    return new NextResponse("Link unavailable", { status: 410 });
  }

  if (resolution.status === "expired") {
    return new NextResponse("Link expired", { status: 410 });
  }

  void recordClickBestEffort(resolution.shortLinkId, request.headers);

  return NextResponse.redirect(resolution.destinationUrl, 302);
}
