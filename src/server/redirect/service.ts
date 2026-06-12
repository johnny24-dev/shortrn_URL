import { prisma } from "@/lib/prisma";

export type RedirectResolution =
  | { status: "not_found" }
  | { status: "inactive" }
  | { status: "expired" }
  | { status: "ok"; destinationUrl: string; shortLinkId: string };

export function isExpired(expiresAt: Date | null, now = new Date()): boolean {
  return expiresAt !== null && expiresAt.getTime() <= now.getTime();
}

type RedirectRecord = {
  id: string;
  originalUrl: string;
  isActive: boolean;
  expiresAt: Date | null;
};

export function resolveRedirectFromRecord(
  link: RedirectRecord,
  now = new Date(),
): RedirectResolution {
  if (!link.isActive) {
    return { status: "inactive" };
  }

  if (isExpired(link.expiresAt, now)) {
    return { status: "expired" };
  }

  return {
    status: "ok",
    destinationUrl: link.originalUrl,
    shortLinkId: link.id,
  };
}

export async function resolveRedirect(
  slug: string,
  now = new Date(),
): Promise<RedirectResolution> {
  const link = await prisma.shortLink.findUnique({
    where: { slug },
    select: {
      id: true,
      originalUrl: true,
      isActive: true,
      expiresAt: true,
    },
  });

  if (!link) {
    return { status: "not_found" };
  }

  return resolveRedirectFromRecord(link, now);
}
