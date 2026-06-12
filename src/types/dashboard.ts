export type DashboardMetric = {
  label: string;
  value: string;
};

export type DashboardLink = {
  id: string;
  originalUrl: string;
  shortUrl: string;
  slug: string;
  title: string | null;
  description: string | null;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  clickCount: number;
};

export type LinkInsight = {
  linkId: string;
  clicksByDay: Array<{ date: string; clicks: number }>;
  referrers: Array<{ label: string; clicks: number }>;
  countries: Array<{ label: string; clicks: number }>;
  devices: Array<{ label: string; clicks: number }>;
  browsers: Array<{ label: string; clicks: number }>;
  recentClicks: Array<{
    clickedAt: string;
    referrer: string | null;
    country: string | null;
    device: string | null;
    browser: string | null;
  }>;
};
