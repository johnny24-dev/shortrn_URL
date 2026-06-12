import { prisma } from "@/lib/prisma";

type ConsumeRateLimitInput = {
  key: string;
  scope: string;
  limit: number;
  windowMs: number;
  now?: Date;
};

export async function consumeRateLimit({
  key,
  scope,
  limit,
  windowMs,
  now = new Date(),
}: ConsumeRateLimitInput) {
  const existingLimit = await prisma.rateLimit.findUnique({
    where: {
      key_scope: {
        key,
        scope,
      },
    },
  });

  if (!existingLimit || existingLimit.expiresAt <= now) {
    const expiresAt = new Date(now.getTime() + windowMs);

    return prisma.rateLimit.upsert({
      where: {
        key_scope: {
          key,
          scope,
        },
      },
      create: {
        key,
        scope,
        count: 1,
        windowStart: now,
        expiresAt,
      },
      update: {
        count: 1,
        windowStart: now,
        expiresAt,
      },
    });
  }

  if (existingLimit.count >= limit) {
    throw new Error("Rate limit exceeded");
  }

  return prisma.rateLimit.update({
    where: {
      key_scope: {
        key,
        scope,
      },
    },
    data: {
      count: {
        increment: 1,
      },
    },
  });
}
