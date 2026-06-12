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
};

export function DashboardShell({
  metrics,
  links,
  selectedLink,
  insight,
  searchQuery,
  statusFilter,
}: DashboardShellProps) {
  const queryString = new URLSearchParams();
  if (searchQuery) {
    queryString.set("q", searchQuery);
  }
  if (statusFilter && statusFilter !== "all") {
    queryString.set("status", statusFilter);
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
              Shortly
            </p>
            <h1 className="text-2xl font-semibold text-slate-950">
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
              href="/login"
            >
              Account
            </Link>
            <CreateLinkSheet mode="create" triggerLabel="Create link" />
          </div>
        </header>

        <MetricStrip metrics={metrics} />

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="grid gap-6">
            <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_180px_auto] sm:items-end">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Search
                <input
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="Search title, URL, or slug"
                  className="min-h-11 rounded-md border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Status
                <select
                  name="status"
                  defaultValue={statusFilter}
                  className="min-h-11 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                </select>
              </label>
              <div className="flex gap-2">
                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                  type="submit"
                >
                  Filter
                </button>
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
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
