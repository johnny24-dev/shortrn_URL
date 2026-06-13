"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type AuthFormProps = {
  mode: "login" | "register";
  redirectTo?: string;
};

export function AuthForm({ mode, redirectTo }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      if (mode === "register") {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          setError(payload?.error ?? "Unable to create account.");
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }

      router.push(redirectTo ?? "/dashboard");
      router.refresh();
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
      <label className="grid gap-2 text-sm font-bold text-[#111113]">
        Password
        <input
          className="focus-ring min-h-12 rounded-md border border-[#e8e1d7] bg-white px-4 text-base text-[#111113] transition"
          name="password"
          type="password"
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          minLength={8}
          required
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        className="focus-ring min-h-12 rounded-md bg-[#e8950c] px-5 text-base font-bold text-white shadow-[0_14px_28px_rgb(232_149_12/0.22)] transition hover:bg-[#c57504] disabled:cursor-not-allowed disabled:bg-[#cfc7bb] disabled:shadow-none"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? "Working..."
          : mode === "register"
            ? "Create account"
            : "Log in"}
      </button>
    </form>
  );
}
