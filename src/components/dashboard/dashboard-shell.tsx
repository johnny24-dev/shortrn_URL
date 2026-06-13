import Link from "next/link";

import { CreateLinkSheet } from "@/components/dashboard/create-link-sheet";
import { LinkInsights } from "@/components/dashboard/link-insights";
import { LinkTable } from "@/components/dashboard/link-table";
import { MetricStrip } from "@/components/dashboard/metric-strip";
import type { DashboardLink, DashboardMetric, LinkInsight } from "@/types/dashboard";

type DashboardShellProps = {
  metrics: DashboardMetric[];
  links: DashboardLink[];
  selectedLink: DashboardLink | null;
  insight: LinkInsight | null;
  searchQuery: string;
  statusFilter: string;
  initialUrl: string;
};

export function DashboardShell({
  metrics,
  links,
  selectedLink,
  insight,
  searchQuery,
  statusFilter,
  initialUrl,
}: DashboardShellProps) {
  const queryString = new URLSearchParams();
  if (searchQuery) {
    queryString.set("q", searchQuery);
  }
  if (statusFilter && statusFilter !== "all") {
    queryString.set("status", statusFilter);
  }

  return (
    <main className="min-h-screen bg-[#fffdf8] text-[#111113]">
      <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-5 py-5 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4 border-b border-[#eee8df] pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#e8950c]">
              Shortly
            </p>
            <h1 className="text-3xl font-black tracking-tight text-black">
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              className="rounded-md border border-[#e8e1d7] bg-white px-4 py-2 text-sm font-bold text-[#111113] transition hover:bg-[#fff4dc]"
              href="/login"
            >
              Account
            </Link>
            <CreateLinkSheet
              mode="create"
              triggerLabel="Create link"
              initialOpen={Boolean(initialUrl)}
              initialUrl={initialUrl}
            />
          </div>
        </header>

        <MetricStrip metrics={metrics} />

        <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="grid content-start gap-6">
            <form className="surface-panel grid self-start rounded-lg p-3 sm:grid-cols-[minmax(0,1fr)_180px_auto] sm:items-end">
              <label className="grid gap-1.5 text-sm font-bold text-[#111113]">
                Search
                <input
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="Search title, URL, or slug"
                  className="focus-ring min-h-11 rounded-md border border-[#e8e1d7] bg-white px-3 text-sm font-medium text-[#111113] transition placeholder:text-[#9b948c]"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-bold text-[#111113]">
                Status
                <select
                  name="status"
                  defaultValue={statusFilter}
                  className="focus-ring min-h-11 rounded-md border border-[#e8e1d7] bg-white px-3 text-sm font-bold text-[#111113] transition"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                </select>
              </label>
              <div className="flex gap-2 pt-3 sm:pt-0">
                <button
                  className="focus-ring inline-flex min-h-11 flex-1 items-center justify-center rounded-md bg-[#e8950c] px-5 py-2 text-sm font-bold text-white shadow-[0_10px_20px_rgb(232_149_12/0.16)] transition hover:bg-[#c57504] sm:flex-none"
                  type="submit"
                >
                  Filter
                </button>
                <Link
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-[#e8e1d7] bg-white px-5 py-2 text-sm font-bold text-[#111113] transition hover:bg-[#fff4dc] sm:flex-none"
                  href="/dashboard"
                >
                  Reset
                </Link>
              </div>
            </form>

            <LinkTable
              links={links}
              selectedLinkId={selectedLink?.id ?? null}
              queryString={queryString.toString()}
            />
          </div>

          <LinkInsights link={selectedLink} insight={insight} />
        </section>
      </div>
    </main>
  );
}
