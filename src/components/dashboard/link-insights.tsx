"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { CreateLinkSheet } from "@/components/dashboard/create-link-sheet";
import { Button } from "@/components/ui/button";
import type { DashboardLink, LinkInsight } from "@/types/dashboard";

type LinkInsightsProps = {
  link: DashboardLink | null;
  insight: LinkInsight | null;
};

function countMax(points: Array<{ clicks: number }>): number {
  return points.reduce((max, point) => Math.max(max, point.clicks), 0);
}

export function LinkInsights({ link, insight }: LinkInsightsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function updateLink(nextData: Partial<DashboardLink>) {
    if (!link) {
      return;
    }

    setError(null);
    const response = await fetch(`/api/links/${link.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nextData),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(payload?.error ?? "Unable to update link.");
      if (response.status === 401) {
        router.push("/login");
      }
      return;
    }

    router.refresh();
  }

  async function deleteLink() {
    if (!link) {
      return;
    }

    const confirmed = window.confirm("Delete this short link?");
    if (!confirmed) {
      return;
    }

    setError(null);
    const response = await fetch(`/api/links/${link.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(payload?.error ?? "Unable to delete link.");
      if (response.status === 401) {
        router.push("/login");
      }
      return;
    }

    router.refresh();
  }

  if (!link) {
    return (
      <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Selected link</h2>
        <p className="mt-2 text-sm text-slate-500">
          Choose a link from the table to inspect its analytics and manage it.
        </p>
      </aside>
    );
  }

  const maxClicks = countMax(insight?.clicksByDay ?? []);

  return (
    <aside className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Selected link</h2>
          <p className="mt-1 max-w-[260px] truncate text-sm text-slate-500">
            {link.title ?? link.originalUrl}
          </p>
        </div>
        <div className="flex gap-2">
          <CreateLinkSheet
            key={link.id}
            mode="edit"
            triggerLabel="Edit"
            link={link}
          />
        </div>
      </div>

      <div className="grid gap-2 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500">Short URL</span>
          <span className="truncate font-mono text-xs text-slate-900">
            {link.shortUrl}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500">Destination</span>
          <span className="max-w-[180px] truncate text-slate-900">
            {link.originalUrl}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500">Status</span>
          <span className="font-medium text-slate-900">
            {link.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500">Expiration</span>
          <span className="font-medium text-slate-900">
            {link.expiresAt ? new Date(link.expiresAt).toLocaleString() : "Never"}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Clicks by day</h3>
          <span className="text-xs text-slate-500">
            {insight?.recentClicks.length ?? 0} recent clicks
          </span>
        </div>
        <div className="mt-4 grid gap-2">
          {(insight?.clicksByDay ?? []).map((point) => {
            const width = maxClicks > 0 ? Math.max((point.clicks / maxClicks) * 100, 6) : 6;
            return (
              <div key={point.date} className="grid gap-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{point.date}</span>
                  <span>{point.clicks}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-slate-950"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InsightList title="Referrers" items={insight?.referrers ?? []} />
        <InsightList title="Countries" items={insight?.countries ?? []} />
        <InsightList title="Devices" items={insight?.devices ?? []} />
        <InsightList title="Browsers" items={insight?.browsers ?? []} />
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900">Recent clicks</h3>
          <span className="text-xs text-slate-500">
            {insight?.recentClicks.length ?? 0}
          </span>
        </div>
        <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-100">
          {(insight?.recentClicks ?? []).length === 0 ? (
            <p className="p-4 text-sm text-slate-500">No clicks yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {insight?.recentClicks.map((click) => (
                <li key={click.clickedAt} className="grid gap-1 px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-slate-900">
                      {click.browser ?? "Unknown browser"}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(click.clickedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="truncate text-slate-500">
                    {click.referrer ?? "Direct"} · {click.country ?? "Unknown"} ·{" "}
                    {click.device ?? "Unknown"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          className="bg-slate-100 text-slate-900 hover:bg-slate-200"
          onClick={() => updateLink({ isActive: !link.isActive })}
        >
          {link.isActive ? "Disable" : "Enable"}
        </Button>
        <Button
          type="button"
          className="bg-rose-600 hover:bg-rose-700"
          onClick={deleteLink}
        >
          Delete
        </Button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </aside>
  );
}

function InsightList({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; clicks: number }>;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <div className="mt-3 grid gap-2">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">No data yet.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="truncate text-slate-700">{item.label}</span>
              <span className="font-medium text-slate-900">{item.clicks}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
