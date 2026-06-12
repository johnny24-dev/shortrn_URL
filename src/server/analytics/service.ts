import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { extractClickMetadata } from "@/server/analytics/parser";

export async function recordClickBestEffort(
  shortLinkId: string,
  headers: Headers,
): Promise<void> {
  try {
    const metadata = extractClickMetadata(headers, env.IP_HASH_SECRET);

    await prisma.clickEvent.create({
      data: {
        shortLinkId,
        referrer: metadata.referrer,
        country: metadata.country,
        device: metadata.device,
        browser: metadata.browser,
        ipHash: metadata.ipHash,
        userAgent: metadata.userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to record click", error);
  }
}
