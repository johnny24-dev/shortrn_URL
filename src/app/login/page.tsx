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

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-10 px-6 py-16 sm:px-10">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
            Welcome back
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
            Log in to manage your links.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-slate-600">
            Use your account to create, update, and track short links from one
            dashboard.
          </p>
        </div>

        <div className="grid gap-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[1fr_auto] lg:items-start">
          <AuthForm mode="login" redirectTo={redirectTo} />
          <aside className="max-w-sm rounded-xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-600">
            <p className="font-medium text-slate-900">Need an account?</p>
            <p className="mt-2">
              Create one to start shortening URLs and tracking click data.
            </p>
            <Link
              className="mt-4 inline-flex rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              href={pendingUrl ? `/register?url=${encodeURIComponent(pendingUrl)}` : "/register"}
            >
              Create account
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
