import Link from "next/link";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";

type ResetPasswordSearchParams = Promise<{
  token?: string | string[];
}>;

function readFirst(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: ResetPasswordSearchParams;
}) {
  const resolved = await searchParams;
  const token = readFirst(resolved.token);

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
            Set a new password
          </h1>
          <p className="max-w-xl text-lg leading-8 text-[#6d6a65]">
            Choose a new password for your account to finish the reset flow.
          </p>
        </div>

        <div className="surface-panel grid gap-8 rounded-lg p-6 lg:grid-cols-[1fr_auto] lg:items-start">
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <div className="mx-auto grid w-full max-w-sm gap-4">
              <p className="text-sm text-red-600">
                The reset link is missing or expired.
              </p>
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#e8950c] px-5 text-base font-bold text-white transition hover:bg-[#c57504]"
                href="/forgot-password"
              >
                Request a new link
              </Link>
            </div>
          )}
          <aside className="max-w-sm rounded-lg border border-[#e8e1d7] bg-[#fff9ef] p-5 text-sm leading-6 text-[#6d6a65]">
            <p className="font-bold text-[#111113]">Need another link?</p>
            <p className="mt-2">
              Request a new password reset email if the current one has expired.
            </p>
            <Link
              className="mt-4 inline-flex rounded-md border border-[#e8e1d7] bg-white px-4 py-2 text-sm font-bold text-[#111113] transition hover:bg-[#fff4dc]"
              href="/forgot-password"
            >
              Forgot password
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
