import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { buildPasswordResetEmail } from "@/server/mail/reset-email";
import { sendMail } from "@/server/mail/provider";
import { assertPasswordResetRequestAllowed, recordPasswordResetRequest } from "@/server/password-reset/rate-limit";
import { generateResetToken, hashResetToken, isResetTokenExpired } from "@/server/password-reset/token";
import type {
  ConfirmPasswordResetInput,
  RequestPasswordResetInput,
  RequestPasswordResetResult,
} from "@/server/password-reset/types";
import { env } from "@/lib/env";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function buildResetUrl(token: string) {
  return new URL(`/reset-password?token=${encodeURIComponent(token)}`, env.APP_BASE_URL).toString();
}

export async function requestPasswordReset(
  input: RequestPasswordResetInput,
): Promise<RequestPasswordResetResult> {
  const email = normalizeEmail(input.email);
  await assertPasswordResetRequestAllowed({ email, ipHash: input.ipHash });
  await recordPasswordResetRequest({ email, ipHash: input.ipHash });

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    return { sent: false };
  }

  const token = generateResetToken();
  const tokenHash = hashResetToken(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + RESET_TOKEN_TTL_MS);
  const resetUrl = buildResetUrl(token);
  const emailPayload = buildPasswordResetEmail({
    to: email,
    resetUrl,
  });

  await prisma.passwordResetToken.updateMany({
    where: {
      userId: user.id,
      usedAt: null,
      revokedAt: null,
    },
    data: {
      revokedAt: now,
    },
  });

  const createdToken = await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      requestedAt: now,
      expiresAt,
      requestIpHash: input.ipHash ?? null,
      requestUserAgent: input.userAgent ?? null,
    },
  });

  try {
    const response = await sendMail({
      to: email,
      subject: emailPayload.subject,
      text: emailPayload.text,
      html: emailPayload.html,
    });

    if (!response.ok) {
      throw new Error("Failed to send password reset email");
    }
  } catch (error) {
    await prisma.passwordResetToken.update({
      where: { id: createdToken.id },
      data: { revokedAt: new Date() },
    });

    throw error;
  }

  return { sent: true };
}

export async function confirmPasswordReset(input: ConfirmPasswordResetInput) {
  const tokenHash = hashResetToken(input.token);
  const now = new Date();
  const tokenRecord = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (
    !tokenRecord ||
    tokenRecord.usedAt ||
    tokenRecord.revokedAt ||
    isResetTokenExpired(tokenRecord.expiresAt, now)
  ) {
    throw new Error("Invalid or expired reset token");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: tokenRecord.userId },
      data: {
        passwordHash,
        passwordChangedAt: now,
      },
    });

    await tx.passwordResetToken.updateMany({
      where: {
        userId: tokenRecord.userId,
        usedAt: null,
        revokedAt: null,
      },
      data: {
        revokedAt: now,
      },
    });

    await tx.passwordResetToken.update({
      where: { id: tokenRecord.id },
      data: { usedAt: now },
    });
  });

  return { ok: true };
}
