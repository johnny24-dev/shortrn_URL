import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-100 text-slate-950">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 sm:px-10">
        <Link className="text-sm font-semibold uppercase tracking-[0.22em]" href="/">
          Shortly
        </Link>
        <div className="flex items-center gap-3">
          <Link
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
            href="/login"
          >
            Log in
          </Link>
          <Link
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            href="/register"
          >
            Create account
          </Link>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-10 px-6 py-16 sm:px-10">
        <div className="max-w-3xl space-y-5">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
            URL shortener
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-slate-950 sm:text-6xl">
            Short links that stay easy to manage.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            Create custom slugs, share QR codes, and track useful click
            analytics from one focused dashboard.
          </p>
        </div>

        <form
          action="/register"
          method="GET"
          className="flex w-full max-w-2xl flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row"
        >
          <label className="sr-only" htmlFor="url">
            Destination URL
          </label>
          <input
            id="url"
            name="url"
            type="url"
            placeholder="https://example.com/long-url"
            className="min-h-12 flex-1 rounded-md border border-slate-200 px-4 text-base outline-none transition focus:border-slate-400"
          />
          <button
            type="submit"
            className="min-h-12 rounded-md bg-slate-950 px-5 text-base font-medium text-white transition hover:bg-slate-800"
          >
            Continue
          </button>
        </form>

        <div className="flex flex-wrap gap-3">
          <Link
            className="rounded-md bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            href="/register"
          >
            Create account
          </Link>
          <Link
            className="rounded-md border border-slate-300 px-5 py-3 text-sm font-medium text-slate-800 transition hover:border-slate-400"
            href="/login"
          >
            Log in
          </Link>
        </div>
      </section>
    </main>
  );
}
