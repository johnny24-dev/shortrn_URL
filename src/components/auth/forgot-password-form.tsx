"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";

type ForgotPasswordFormProps = {
  loginHref: string;
};

export function ForgotPasswordForm({ loginHref }: ForgotPasswordFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");

    try {
      const response = await fetch("/api/password-reset/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(payload?.error ?? "Unable to send reset link.");
        return;
      }

      setMessage("If that email exists, we sent a reset link.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mx-auto grid w-full max-w-sm gap-4" onSubmit={handleSubmit}>
      <label className="grid gap-2 text-sm font-bold text-[#111113]">
        Email
        <input
          className="focus-ring min-h-12 rounded-md border border-[#e8e1d7] bg-white px-4 text-base text-[#111113] transition"
          name="email"
          type="email"
          autoComplete="email"
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
        {isSubmitting ? "Sending..." : "Send reset link"}
      </button>
      <p className="text-sm text-[#6d6a65]">
        <Link
          className="font-bold text-[#111113] underline-offset-4 hover:underline"
          href={loginHref}
        >
          Back to log in
        </Link>
      </p>
    </form>
  );
}
