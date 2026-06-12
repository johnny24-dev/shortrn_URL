"use client";

import { useState } from "react";
import Link from "next/link";

import type { DashboardLink } from "@/types/dashboard";

type LinkTableProps = {
  links: DashboardLink[];
  selectedLinkId: string | null;
  queryString: string;
};

function buildHref(queryString: string, linkId: string): string {
  const params = new URLSearchParams(queryString);
  params.set("link", linkId);
  const nextQuery = params.toString();
  return nextQuery ? `/dashboard?${nextQuery}` : `/dashboard?link=${linkId}`;
}

export function LinkTable({
  links,
  selectedLinkId,
  queryString,
}: LinkTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyToClipboard(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900">Links</h2>
        <p className="mt-1 text-sm text-slate-500">
          Click a row to inspect analytics and manage the selected link.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Link</th>
              <th className="px-5 py-3 font-medium">Short URL</th>
              <th className="px-5 py-3 font-medium">Clicks</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Expiration</th>
              <th className="px-5 py-3 font-medium">Created</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {links.map((link) => {
              const isSelected = selectedLinkId === link.id;

              return (
                <tr
                  key={link.id}
                  className={isSelected ? "bg-slate-50" : "hover:bg-slate-50/70"}
                >
                  <td className="px-5 py-4 align-top">
                    <Link
                      className="block max-w-[280px] font-medium text-slate-950 transition hover:text-slate-700"
                      href={buildHref(queryString, link.id)}
                    >
                      <span className="block truncate">
                        {link.title ?? link.slug}
                      </span>
                      <span className="block truncate text-xs font-normal text-slate-500">
                        {link.originalUrl}
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex min-w-[220px] items-center gap-2">
                      <Link
                        className="truncate font-mono text-xs text-slate-700 underline decoration-slate-300 underline-offset-2"
                        href={buildHref(queryString, link.id)}
                      >
                        {link.shortUrl}
                      </Link>
                      <button
                        className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                        type="button"
                        onClick={() => copyToClipboard(link.shortUrl, link.id)}
                      >
                        {copiedId === link.id ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top font-medium text-slate-900">
                    {link.clickCount}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <span
                      className={
                        link.isActive
                          ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                          : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                      }
                    >
                      {link.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-top text-slate-600">
                    {link.expiresAt
                      ? new Date(link.expiresAt).toLocaleString()
                      : "Never"}
                  </td>
                  <td className="px-5 py-4 align-top text-slate-600">
                    {new Date(link.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                        href={buildHref(queryString, link.id)}
                      >
                        View
                      </Link>
                      <Link
                        className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                        href={`/api/links/${link.id}/qr`}
                      >
                        QR
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
