import Link from "next/link";
import Image from "next/image";

const recentLinks = [
  {
    label: "Launch announcement",
    short: "shortly.link/launch-desk",
    created: "2m ago",
    clicks: "1,842",
    status: "Active",
  },
  {
    label: "Product tour video",
    short: "shortly.link/tour",
    created: "1d ago",
    clicks: "932",
    status: "Active",
  },
  {
    label: "Pricing page",
    short: "shortly.link/pricing",
    created: "3d ago",
    clicks: "412",
    status: "Active",
  },
  {
    label: "Help center",
    short: "shortly.link/help",
    created: "5d ago",
    clicks: "128",
    status: "Inactive",
  },
];

const stats = [
  ["120M+", "Links created"],
  ["2.6B+", "Total clicks tracked"],
  ["195+", "Countries reached"],
  ["300K+", "Happy users"],
];

const features = [
  ["Powerful analytics", "Track clicks, referrers, locations, and devices with real-time insights."],
  ["Branded and custom links", "Use custom slugs and your own domain to build trust and recognition."],
  ["Share everywhere", "Generate QR codes and share your links across any channel."],
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fffdf8] text-[#111113]">
      <header className="mx-auto flex w-full max-w-[1360px] items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link className="flex items-center gap-3 text-2xl font-bold tracking-tight" href="/">
          <span className="grid size-8 place-items-center rounded-md bg-[#fff4dc] text-[#e8950c]">
            S
          </span>
          Shortly
        </Link>
        <nav className="hidden items-center gap-10 text-[15px] font-medium text-[#111113] md:flex">
          <Link href="/dashboard">Product</Link>
          <Link href="/register">Pricing</Link>
          <Link href="/dashboard">Developers</Link>
          <Link href="/forgot-password">Resources</Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            className="rounded-md px-4 py-2 text-sm font-semibold text-[#111113] transition hover:bg-black/[0.04]"
            href="/login"
          >
            Log in
          </Link>
          <Link
            className="rounded-md bg-[#e8950c] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgb(232_149_12/0.24)] transition hover:bg-[#c57504]"
            href="/register"
          >
            Sign up free
          </Link>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-[1360px] gap-10 px-5 pb-12 pt-10 sm:px-8 lg:grid-cols-[0.86fr_1.14fr] lg:px-10 lg:pb-16 lg:pt-20">
        <div className="flex flex-col justify-center">
          <div className="max-w-[560px]">
            <h1 className="text-6xl font-black leading-[0.92] tracking-tight text-black sm:text-7xl lg:text-[112px]">
              Shortly
            </h1>
            <p className="mt-5 text-2xl font-semibold text-[#68645f] sm:text-[28px]">
              Short links. Big impact.
            </p>
            <p className="mt-5 max-w-xl text-[17px] leading-8 text-[#6d6a65]">
              Create short links, share anywhere, and track what matters.
              Powerful analytics, custom domains, and QR codes included.
            </p>
          </div>

          <form
            action="/register"
            method="GET"
            className="surface-panel mt-8 grid w-full max-w-[500px] gap-5 rounded-lg p-5"
          >
            <label className="grid gap-2 text-[15px] font-semibold text-[#111113]">
              Destination URL
              <input
                name="url"
                type="url"
                placeholder="https://www.example.com/launch?ref=homepage"
                className="focus-ring min-h-12 rounded-md border border-[#e8e1d7] bg-white px-4 text-[15px] text-[#111113] transition placeholder:text-[#9b948c]"
              />
            </label>
            <label className="grid gap-2 text-[15px] font-semibold text-[#111113]">
              Custom slug <span className="font-normal text-[#77726c]">(optional)</span>
              <div className="grid gap-2 sm:grid-cols-[132px_1fr]">
                <select className="focus-ring min-h-12 rounded-md border border-[#e8e1d7] bg-white px-3 text-[15px] text-[#111113]">
                  <option>shortly.link/</option>
                </select>
                <input
                  name="slug"
                  placeholder="launch-desk"
                  className="focus-ring min-h-12 rounded-md border border-[#e8e1d7] bg-white px-4 text-[15px] text-[#111113] transition placeholder:text-[#9b948c]"
                />
              </div>
            </label>
            <p className="-mt-2 text-sm text-[#77726c]">
              Letters, numbers, and hyphens only. 3-32 characters.
            </p>
            <button
              type="submit"
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md bg-[#e8950c] px-5 text-base font-bold text-white shadow-[0_14px_28px_rgb(232_149_12/0.24)] transition hover:bg-[#c57504]"
            >
              Shorten link
              <span className="ml-3" aria-hidden="true">
                →
              </span>
            </button>
            <p className="text-xs leading-5 text-[#77726c]">
              By creating a link, you agree to our{" "}
              <Link className="underline underline-offset-4" href="/register">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link className="underline underline-offset-4" href="/register">
                Privacy Policy
              </Link>
              .
            </p>
          </form>
        </div>

        <div className="surface-panel rounded-lg p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#111113]">Recent links</h2>
              <span className="rounded-md bg-[#f1eee8] px-2 py-1 text-xs font-bold text-[#6d6a65]">
                12
              </span>
            </div>
            <Link className="text-sm font-bold text-[#0f63f6]" href="/dashboard">
              View all links →
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto rounded-lg border border-[#e8e1d7] bg-white">
            <div className="min-w-[620px]">
              <div className="grid grid-cols-[1fr_110px_90px_92px] border-b border-[#eee8df] px-4 py-3 text-xs font-bold text-[#57534d]">
                <span>Link</span>
                <span>Created</span>
                <span>Clicks</span>
                <span>Status</span>
              </div>
              {recentLinks.map((link) => (
                <div
                  key={link.short}
                  className="grid grid-cols-[1fr_110px_90px_92px] items-center border-b border-[#f0ebe4] px-4 py-4 text-sm last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#111113]">{link.label}</p>
                    <p className="truncate font-bold text-[#0f63f6]">{link.short}</p>
                  </div>
                  <span className="text-[#57534d]">{link.created}</span>
                  <span className="font-semibold text-[#111113]">{link.clicks}</span>
                  <span
                    className={
                      link.status === "Active"
                        ? "w-fit rounded-md bg-[#def6e8] px-2 py-1 text-xs font-bold text-[#0f8f55]"
                        : "w-fit rounded-md bg-[#f1eee8] px-2 py-1 text-xs font-bold text-[#77726c]"
                    }
                  >
                    {link.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_292px]">
            <div className="rounded-lg border border-[#e8e1d7] bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-[#111113]">Clicks</p>
                <select className="focus-ring rounded-md border border-[#e8e1d7] bg-white px-3 py-2 text-sm font-medium">
                  <option>Last 7 days</option>
                </select>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight">3,314</p>
              <div className="mt-5 flex h-32 items-end gap-3 border-b border-l border-[#eee8df] px-3 pb-1">
                {[36, 68, 48, 62, 86, 42, 90].map((height, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-t-md bg-[#0f63f6]/85"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-[#e8e1d7] bg-white p-4">
              <p className="text-sm font-bold text-[#111113]">QR code</p>
              <div className="mt-4 flex items-center gap-4">
                <Image
                  alt="QR code preview"
                  className="size-28 rounded-md border border-[#e8e1d7]"
                  height={112}
                  src="/assets/qr-preview.png"
                  width={112}
                />
                <div>
                  <p className="font-bold leading-6 text-[#111113]">
                    shortly.link/
                    <br />
                    launch-desk
                  </p>
                  <Link
                    href="/register"
                    className="mt-4 inline-flex rounded-md border border-[#e8e1d7] px-4 py-2 text-sm font-bold text-[#111113] transition hover:bg-[#fff7e8]"
                  >
                    Download
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-1 rounded-lg border border-[#dcefe3] bg-[#f3fbf6] px-4 py-3 text-sm font-bold text-[#0f8f55] sm:flex-row sm:items-center sm:justify-between">
            <span>All systems operational</span>
            <span>99.99% uptime</span>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1360px] px-5 pb-14 sm:px-8 lg:px-10">
        <div className="surface-panel grid rounded-lg md:grid-cols-4">
          {stats.map(([value, label]) => (
            <div
              key={label}
              className="border-b border-[#e8e1d7] p-6 md:border-b-0 md:border-r md:last:border-r-0"
            >
              <p className="text-3xl font-black tracking-tight text-black">{value}</p>
              <p className="mt-1 text-sm text-[#6d6a65]">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {features.map(([title, copy]) => (
            <article key={title} className="grid gap-3">
              <div className="h-1 w-16 rounded-full bg-[#e8950c]" />
              <h2 className="text-xl font-bold tracking-tight text-black">{title}</h2>
              <p className="max-w-sm text-[15px] leading-7 text-[#6d6a65]">{copy}</p>
              <Link className="text-sm font-bold text-[#0f63f6]" href="/register">
                Learn more →
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
