import { prisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/server/abuse/rate-limit";

const PASSWORD_RESET_LIMIT = 3;
const PASSWORD_RESET_WINDOW_MS = 60 * 60 * 1000;
const PASSWORD_RESET_REQUEST_EMAIL_SCOPE = "password-reset-request-email";
const PASSWORD_RESET_REQUEST_IP_SCOPE = "password-reset-request-ip";
const PASSWORD_RESET_CONFIRM_IP_SCOPE = "password-reset-confirm-ip";

function normalizeRateLimitKey(value: string) {
  return value.trim().toLowerCase();
}

async function ensureNotRateLimited(key: string, scope: string) {
  const now = new Date();
  const current = await prisma.rateLimit.findUnique({
    where: {
      key_scope: {
        key,
        scope,
      },
    },
  });

  if (!current || current.expiresAt <= now) {
    return;
  }

  if (current.count >= PASSWORD_RESET_LIMIT) {
    throw new Error("Rate limit exceeded");
  }
}

export async function assertPasswordResetRequestAllowed(input: {
  email: string;
  ipHash?: string | null;
}) {
  const emailKey = normalizeRateLimitKey(input.email);
  await ensureNotRateLimited(emailKey, "password-reset:email");

  if (input.ipHash) {
    await ensureNotRateLimited(input.ipHash, "password-reset:ip");
  }
}

export async function recordPasswordResetRequest(input: {
  email: string;
  ipHash?: string | null;
}) {
  const emailKey = normalizeRateLimitKey(input.email);
  await consumeRateLimit({
    key: emailKey,
    scope: "password-reset:email",
    limit: PASSWORD_RESET_LIMIT,
    windowMs: PASSWORD_RESET_WINDOW_MS,
  });

  if (input.ipHash) {
    await consumeRateLimit({
      key: input.ipHash,
      scope: "password-reset:ip",
      limit: PASSWORD_RESET_LIMIT,
      windowMs: PASSWORD_RESET_WINDOW_MS,
    });
  }
}

export async function consumePasswordResetRequestRateLimit(input: {
  email: string;
  ipHash: string;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const emailKey = normalizeRateLimitKey(input.email);

  await Promise.all([
    consumeRateLimit({
      key: emailKey,
      scope: PASSWORD_RESET_REQUEST_EMAIL_SCOPE,
      limit: PASSWORD_RESET_LIMIT,
      windowMs: PASSWORD_RESET_WINDOW_MS,
      now,
    }),
    consumeRateLimit({
      key: input.ipHash,
      scope: PASSWORD_RESET_REQUEST_IP_SCOPE,
      limit: PASSWORD_RESET_LIMIT,
      windowMs: PASSWORD_RESET_WINDOW_MS,
      now,
    }),
  ]);
}

export async function consumePasswordResetConfirmRateLimit(input: {
  ipHash: string;
  now?: Date;
}) {
  await consumeRateLimit({
    key: input.ipHash,
    scope: PASSWORD_RESET_CONFIRM_IP_SCOPE,
    limit: PASSWORD_RESET_LIMIT,
    windowMs: PASSWORD_RESET_WINDOW_MS,
    now: input.now ?? new Date(),
  });
}
