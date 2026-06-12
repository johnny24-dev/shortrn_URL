import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { shortUrlForSlug } from "@/lib/paths";
import { getDashboardMetrics, getLinkInsights } from "@/server/analytics/service";
import { listLinks } from "@/server/links/service";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { DashboardLink } from "@/types/dashboard";

type DashboardSearchParams = Promise<{
  link?: string | string[];
  q?: string | string[];
  status?: string | string[];
  url?: string | string[];
}>;

function readFirst(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function filterLinks(
  links: Array<Awaited<ReturnType<typeof listLinks>>[number]>,
  searchQuery: string,
  statusFilter: string,
  now = new Date(),
) {
  const query = searchQuery.trim().toLowerCase();

  return links.filter((link) => {
    const isExpired = link.expiresAt !== null && link.expiresAt <= now;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && link.isActive && !isExpired) ||
      (statusFilter === "inactive" && !link.isActive) ||
      (statusFilter === "expired" && isExpired);

    if (!matchesStatus) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [link.title, link.description, link.originalUrl, link.slug]
      .filter(Boolean)
      .some((value) => value?.toLowerCase().includes(query));
  });
}

function toDashboardLink(
  link: Awaited<ReturnType<typeof listLinks>>[number],
): DashboardLink {
  return {
    id: link.id,
    originalUrl: link.originalUrl,
    shortUrl: shortUrlForSlug(link.slug),
    slug: link.slug,
    title: link.title,
    description: link.description,
    isActive: link.isActive,
    expiresAt: link.expiresAt?.toISOString() ?? null,
    createdAt: link.createdAt.toISOString(),
    clickCount: link._count.clicks,
  };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: DashboardSearchParams;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const searchQuery = readFirst(resolvedSearchParams.q);
  const statusFilter = readFirst(resolvedSearchParams.status) || "all";
  const selectedLinkId = readFirst(resolvedSearchParams.link) || null;
  const initialUrl = readFirst(resolvedSearchParams.url);

  const [metrics, rawLinks] = await Promise.all([
    getDashboardMetrics(session.user.id),
    listLinks(session.user.id),
  ]);

  const filteredLinks = filterLinks(rawLinks, searchQuery, statusFilter);
  const selectedLinkRecord =
    filteredLinks.find((link) => link.id === selectedLinkId) ?? filteredLinks[0] ?? null;

  const selectedLink = selectedLinkRecord ? toDashboardLink(selectedLinkRecord) : null;
  const insight = selectedLink ? await getLinkInsights(selectedLink.id) : null;
  const links = filteredLinks.map(toDashboardLink);

  return (
    <DashboardShell
      metrics={metrics}
      links={links}
      selectedLink={selectedLink}
      insight={insight}
      searchQuery={searchQuery}
      statusFilter={statusFilter}
      initialUrl={initialUrl}
    />
  );
}
