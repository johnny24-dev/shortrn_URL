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
    <main className="flex min-h-screen flex-col bg-[#fffdf8] text-[#111113]">
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-10 px-6 py-16 sm:px-10">
        <div className="max-w-2xl space-y-4">
          <Link className="text-2xl font-black tracking-tight text-black" href="/">
            Shortly
          </Link>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#e8950c]">
            Password recovery
          </p>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-black sm:text-5xl">
            Forgot your password?
          </h1>
          <p className="max-w-xl text-lg leading-8 text-[#6d6a65]">
            Enter the email on your account and we will send a reset link.
          </p>
        </div>

        <div className="surface-panel grid gap-8 rounded-lg p-6 lg:grid-cols-[1fr_auto] lg:items-start">
          <ForgotPasswordForm loginHref={loginHref} />
          <aside className="max-w-sm rounded-lg border border-[#e8e1d7] bg-[#fff9ef] p-5 text-sm leading-6 text-[#6d6a65]">
            <p className="font-bold text-[#111113]">Remembered your password?</p>
            <p className="mt-2">
              Return to the login page once you are ready to sign in again.
            </p>
            <Link
              className="mt-4 inline-flex rounded-md border border-[#e8e1d7] bg-white px-4 py-2 text-sm font-bold text-[#111113] transition hover:bg-[#fff4dc]"
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
