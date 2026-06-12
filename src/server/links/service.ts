import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { assertUrlAllowed } from "@/server/abuse/blocklist";
import { generateSlug, validateCustomSlug } from "@/server/links/slug";
import { normalizeDestinationUrl } from "@/server/links/url";

export type CreateShortLinkInput = {
  userId: string;
  originalUrl: string;
  customSlug?: string | null;
  title?: string | null;
  description?: string | null;
  expiresAt?: Date | null;
  skipPersistenceForTest?: boolean;
};

type CreateShortLinkDraft = {
  id: string;
  userId: string;
  originalUrl: string;
  slug: string;
  title: string | null;
  description: string | null;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function createShortLink(
  input: CreateShortLinkInput,
): Promise<CreateShortLinkDraft> {
  const originalUrl = normalizeDestinationUrl(input.originalUrl);
  assertUrlAllowed(originalUrl);
  const slug = input.customSlug
    ? validateCustomSlug(input.customSlug)
    : generateSlug();

  const data = {
    userId: input.userId,
    originalUrl,
    slug,
    title: input.title ?? null,
    description: input.description ?? null,
    expiresAt: input.expiresAt ?? null,
  };

  if (input.skipPersistenceForTest) {
    return {
      id: "test-link",
      userId: data.userId,
      originalUrl: data.originalUrl,
      slug: data.slug,
      title: data.title,
      description: data.description,
      isActive: true,
      expiresAt: data.expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  try {
    return await prisma.shortLink.create({
      data,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Slug already exists");
    }

    throw error;
  }
}

export async function listLinks(userId: string) {
  return prisma.shortLink.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { clicks: true },
      },
    },
  });
}

export async function updateShortLink(
  id: string,
  userId: string,
  data: {
    title?: string | null;
    description?: string | null;
    isActive?: boolean;
    expiresAt?: Date | null;
  },
) {
  const result = await prisma.shortLink.updateMany({
    where: { id, userId },
    data: {
      title: data.title,
      description: data.description,
      isActive: data.isActive,
      expiresAt: data.expiresAt,
    },
  });

  if (result.count === 0) {
    throw new Error("Link not found");
  }

  return prisma.shortLink.findFirstOrThrow({
    where: { id, userId },
  });
}

export async function deleteShortLink(id: string, userId: string) {
  const result = await prisma.shortLink.deleteMany({
    where: { id, userId },
  });

  if (result.count === 0) {
    throw new Error("Link not found");
  }
}
