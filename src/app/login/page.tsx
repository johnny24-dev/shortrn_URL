import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";

type AuthSearchParams = Promise<{
  url?: string | string[];
}>;

function readFirst(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: AuthSearchParams;
}) {
  const resolved = await searchParams;
  const pendingUrl = readFirst(resolved.url);
  const redirectTo = pendingUrl
    ? `/dashboard?url=${encodeURIComponent(pendingUrl)}`
    : "/dashboard";
  const forgotPasswordHref = pendingUrl
    ? `/forgot-password?url=${encodeURIComponent(pendingUrl)}`
    : "/forgot-password";

  return (
    <main className="flex min-h-screen flex-col bg-[#fffdf8] text-[#111113]">
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-10 px-6 py-16 sm:px-10">
        <div className="max-w-2xl space-y-4">
          <Link className="text-2xl font-black tracking-tight text-black" href="/">
            Shortly
          </Link>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#e8950c]">
            Welcome back
          </p>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-black sm:text-5xl">
            Log in to manage your links.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-[#6d6a65]">
            Use your account to create, update, and track short links from one
            dashboard.
          </p>
        </div>

        <div className="surface-panel grid gap-8 rounded-lg p-6 lg:grid-cols-[1fr_auto] lg:items-start">
          <AuthForm mode="login" redirectTo={redirectTo} />
          <aside className="max-w-sm rounded-lg border border-[#e8e1d7] bg-[#fff9ef] p-5 text-sm leading-6 text-[#6d6a65]">
            <p className="font-bold text-[#111113]">Need an account?</p>
            <p className="mt-2">
              Create one to start shortening URLs and tracking click data.
            </p>
            <Link
              className="mt-4 inline-flex rounded-md bg-[#e8950c] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#c57504]"
              href={pendingUrl ? `/register?url=${encodeURIComponent(pendingUrl)}` : "/register"}
            >
              Create account
            </Link>
            <p className="mt-4 text-sm text-[#6d6a65]">
              <Link
                className="font-bold text-[#111113] underline-offset-4 hover:underline"
                href={forgotPasswordHref}
              >
                Forgot password?
              </Link>
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
