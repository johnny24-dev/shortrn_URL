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
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Email
        <input
          className="min-h-12 rounded-md border border-slate-200 px-4 text-base outline-none transition focus:border-slate-400"
          name="email"
          type="email"
          autoComplete="email"
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
        {isSubmitting ? "Sending..." : "Send reset link"}
      </button>
      <p className="text-sm text-slate-500">
        <Link
          className="font-medium text-slate-700 underline-offset-4 hover:underline"
          href={loginHref}
        >
          Back to log in
        </Link>
      </p>
    </form>
  );
}
