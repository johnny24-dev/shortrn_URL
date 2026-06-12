import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { extractClickMetadata } from "@/server/analytics/parser";
import type { DashboardMetric, LinkInsight } from "@/types/dashboard";

export async function recordClickBestEffort(
  shortLinkId: string,
  headers: Headers,
): Promise<void> {
  try {
    const metadata = extractClickMetadata(headers, env.IP_HASH_SECRET);

    await prisma.clickEvent.create({
      data: {
        shortLinkId,
        referrer: metadata.referrer,
        country: metadata.country,
        device: metadata.device,
        browser: metadata.browser,
        ipHash: metadata.ipHash,
        userAgent: metadata.userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to record click", error);
  }
}

function startOfDay(daysAgo = 0): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

function toLabel(value: string | null | undefined, fallback = "Unknown"): string {
  return value?.trim() || fallback;
}

function topCounts(values: Array<string | null | undefined>, limit = 5) {
  const counts = new Map<string, number>();

  for (const value of values) {
    const label = toLabel(value);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, clicks]) => ({ label, clicks }));
}

function buildDailySeries(
  records: Array<{ clickedAt: Date }>,
  days = 14,
): Array<{ date: string; clicks: number }> {
  const counts = new Map<string, number>();

  for (const record of records) {
    const key = record.clickedAt.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from({ length: days }, (_, index) => {
    const date = startOfDay(days - index - 1);
    const key = date.toISOString().slice(0, 10);
    return {
      date: key,
      clicks: counts.get(key) ?? 0,
    };
  });
}

export async function getDashboardMetrics(
  userId: string,
): Promise<DashboardMetric[]> {
  const [totalLinks, activeLinks, clicksToday, referrerRows] = await Promise.all([
    prisma.shortLink.count({ where: { userId } }),
    prisma.shortLink.count({ where: { userId, isActive: true } }),
    prisma.clickEvent.count({
      where: {
        shortLink: { userId },
        clickedAt: { gte: startOfDay() },
      },
    }),
    prisma.clickEvent.findMany({
      where: {
        shortLink: { userId },
      },
      select: {
        referrer: true,
      },
    }),
  ]);

  const topReferrer = topCounts(referrerRows.map((row) => row.referrer), 1)[0];

  return [
    { label: "Total links", value: String(totalLinks) },
    { label: "Active links", value: String(activeLinks) },
    { label: "Clicks today", value: String(clicksToday) },
    { label: "Top referrer", value: topReferrer?.label ?? "None" },
  ];
}

export async function getLinkInsights(linkId: string): Promise<LinkInsight> {
  const clicks = await prisma.clickEvent.findMany({
    where: { shortLinkId: linkId },
    orderBy: { clickedAt: "desc" },
    select: {
      clickedAt: true,
      referrer: true,
      country: true,
      device: true,
      browser: true,
    },
    take: 1000,
  });

  return {
    linkId,
    clicksByDay: buildDailySeries(clicks),
    referrers: topCounts(clicks.map((click) => click.referrer)),
    countries: topCounts(clicks.map((click) => click.country)),
    devices: topCounts(clicks.map((click) => click.device)),
    browsers: topCounts(clicks.map((click) => click.browser)),
    recentClicks: clicks.slice(0, 10).map((click) => ({
      clickedAt: click.clickedAt.toISOString(),
      referrer: click.referrer,
      country: click.country,
      device: click.device,
      browser: click.browser,
    })),
  };
}
