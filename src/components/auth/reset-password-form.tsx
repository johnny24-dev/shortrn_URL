"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/password-reset/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(payload?.error ?? "Unable to reset password.");
        return;
      }

      setMessage("Password updated. You can now log in with the new password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mx-auto grid w-full max-w-sm gap-4" onSubmit={handleSubmit}>
      <input name="token" type="hidden" value={token} />
      <label className="grid gap-2 text-sm font-bold text-[#111113]">
        New password
        <input
          className="focus-ring min-h-12 rounded-md border border-[#e8e1d7] bg-white px-4 text-base text-[#111113] transition"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-[#111113]">
        Confirm password
        <input
          className="focus-ring min-h-12 rounded-md border border-[#e8e1d7] bg-white px-4 text-base text-[#111113] transition"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      <button
        className="focus-ring min-h-12 rounded-md bg-[#e8950c] px-5 text-base font-bold text-white shadow-[0_14px_28px_rgb(232_149_12/0.22)] transition hover:bg-[#c57504] disabled:cursor-not-allowed disabled:bg-[#cfc7bb] disabled:shadow-none"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Updating..." : "Update password"}
      </button>
      <p className="text-sm text-[#6d6a65]">
        <Link
          className="font-bold text-[#111113] underline-offset-4 hover:underline"
          href="/login"
        >
          Back to log in
        </Link>
      </p>
    </form>
  );
}
