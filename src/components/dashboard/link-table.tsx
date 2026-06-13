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
    <div className="surface-panel overflow-hidden rounded-lg">
      <div className="flex items-center justify-between gap-4 border-b border-[#eee8df] px-5 py-4">
        <div>
          <h2 className="text-lg font-black tracking-tight text-[#111113]">Links</h2>
          <p className="mt-1 text-sm text-[#6d6a65]">
            Click a row to inspect analytics and manage the selected link.
          </p>
        </div>
        <span className="rounded-md bg-[#f1eee8] px-2.5 py-1 text-xs font-bold text-[#6d6a65]">
          {links.length}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] table-fixed text-left text-sm">
          <colgroup>
            <col className="w-[24%]" />
            <col className="w-[26%]" />
            <col className="w-[9%]" />
            <col className="w-[11%]" />
            <col className="w-[12%]" />
            <col className="w-[10%]" />
            <col className="w-[8%]" />
          </colgroup>
          <thead className="bg-[#fff9ef] text-xs font-bold uppercase tracking-[0.14em] text-[#77726c]">
            <tr>
              <th className="px-4 py-3">Link</th>
              <th className="px-4 py-3">Short URL</th>
              <th className="px-3 py-3">Clicks</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Expiration</th>
              <th className="px-3 py-3">Created</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0ebe4]">
            {links.map((link) => {
              const isSelected = selectedLinkId === link.id;

              return (
                <tr
                  key={link.id}
                  className={isSelected ? "bg-[#fff5e4]" : "hover:bg-[#fff9ef]"}
                >
                  <td className="px-4 py-4 align-top">
                    <Link
                      className="block min-w-0 font-bold text-[#111113] transition hover:text-[#0f63f6]"
                      href={buildHref(queryString, link.id)}
                    >
                      <span className="block truncate">
                        {link.title ?? link.slug}
                      </span>
                      <span className="block truncate text-xs font-medium text-[#77726c]">
                        {link.originalUrl}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex min-w-0 items-center gap-2">
                      <Link
                        className="min-w-0 flex-1 truncate font-mono text-xs font-bold text-[#0f63f6] underline decoration-[#b7cef8] underline-offset-2"
                        href={buildHref(queryString, link.id)}
                      >
                        {link.shortUrl}
                      </Link>
                      <button
                        className="rounded-md border border-[#e8e1d7] bg-white px-2 py-1 text-xs font-bold text-[#111113] transition hover:bg-[#fff4dc]"
                        type="button"
                        onClick={() => copyToClipboard(link.shortUrl, link.id)}
                      >
                        {copiedId === link.id ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-4 align-top font-bold text-[#111113]">
                    {link.clickCount}
                  </td>
                  <td className="px-3 py-4 align-top">
                    <span
                      className={
                        link.isActive
                          ? "rounded-md bg-[#def6e8] px-2.5 py-1 text-xs font-bold text-[#0f8f55]"
                          : "rounded-md bg-[#f1eee8] px-2.5 py-1 text-xs font-bold text-[#77726c]"
                      }
                    >
                      {link.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-3 py-4 align-top text-[#6d6a65]">
                    {link.expiresAt
                      ? new Date(link.expiresAt).toLocaleString()
                      : "Never"}
                  </td>
                  <td className="px-3 py-4 align-top text-[#6d6a65]">
                    {new Date(link.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-4 align-top">
                    <div className="flex flex-col gap-2">
                      <Link
                        className="rounded-md border border-[#e8e1d7] bg-white px-2 py-1.5 text-center text-xs font-bold text-[#111113] transition hover:bg-[#fff4dc]"
                        href={buildHref(queryString, link.id)}
                      >
                        View
                      </Link>
                      <Link
                        className="rounded-md border border-[#e8e1d7] bg-white px-2 py-1.5 text-center text-xs font-bold text-[#111113] transition hover:bg-[#fff4dc]"
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
