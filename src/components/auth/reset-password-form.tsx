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
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        New password
        <input
          className="min-h-12 rounded-md border border-slate-200 px-4 text-base outline-none transition focus:border-slate-400"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Confirm password
        <input
          className="min-h-12 rounded-md border border-slate-200 px-4 text-base outline-none transition focus:border-slate-400"
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
        className="min-h-12 rounded-md bg-slate-950 px-5 text-base font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Updating..." : "Update password"}
      </button>
      <p className="text-sm text-slate-500">
        <Link
          className="font-medium text-slate-700 underline-offset-4 hover:underline"
          href="/login"
        >
          Back to log in
        </Link>
      </p>
    </form>
  );
}
