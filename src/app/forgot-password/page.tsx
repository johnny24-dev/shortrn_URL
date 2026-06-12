import Link from "next/link";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

type ForgotPasswordSearchParams = Promise<{
  url?: string | string[];
}>;

function readFirst(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: ForgotPasswordSearchParams;
}) {
  const resolved = await searchParams;
  const pendingUrl = readFirst(resolved.url);
  const loginHref = pendingUrl
    ? `/login?url=${encodeURIComponent(pendingUrl)}`
    : "/login";

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-10 px-6 py-16 sm:px-10">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
            Password recovery
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
            Forgot your password?
          </h1>
          <p className="max-w-xl text-lg leading-8 text-slate-600">
            Enter the email on your account and we will send a reset link.
          </p>
        </div>

        <div className="grid gap-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[1fr_auto] lg:items-start">
          <ForgotPasswordForm loginHref={loginHref} />
          <aside className="max-w-sm rounded-xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-600">
            <p className="font-medium text-slate-900">Remembered your password?</p>
            <p className="mt-2">
              Return to the login page once you are ready to sign in again.
            </p>
            <Link
              className="mt-4 inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:border-slate-400"
              href={loginHref}
            >
              Back to log in
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
