import { createHmac } from "node:crypto";

import { UAParser } from "ua-parser-js";

export type ClickMetadata = {
  referrer: string | null;
  country: string | null;
  device: string;
  browser: string | null;
  ipHash: string | null;
  userAgent: string | null;
};

export function hashIp(ip: string, secret: string): string {
  return createHmac("sha256", secret).update(ip).digest("hex");
}

export function extractClickMetadata(
  headers: Headers,
  ipHashSecret: string,
): ClickMetadata {
  const userAgent = headers.get("user-agent");
  const parsedUserAgent = userAgent ? UAParser(userAgent) : null;
  const ip = getClientIp(headers);

  return {
    referrer: headers.get("referer") ?? headers.get("referrer"),
    country: headers.get("x-vercel-ip-country"),
    device: parsedUserAgent?.device.type ?? "desktop",
    browser: parsedUserAgent?.browser.name ?? null,
    ipHash: ip ? hashIp(ip, ipHashSecret) : null,
    userAgent,
  };
}

function getClientIp(headers: Headers): string | null {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstForwardedIp = forwardedFor.split(",")[0]?.trim();
    if (firstForwardedIp) {
      return firstForwardedIp;
    }
  }

  return headers.get("x-real-ip");
}
